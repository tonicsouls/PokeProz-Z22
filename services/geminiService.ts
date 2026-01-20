import { GoogleGenAI, Type } from "@google/genai";
import type { BattlePokemon, AiAction } from '../types';
import { BATTLE_ITEMS } from "../constants";

// A simplified Pokemon type for the analysis prompt
interface AnalysisPokemon {
  id: number;
  name: string;
  types: string[];
  abilities: string[];
}

// It's recommended to handle API keys via environment variables
// In this context, we assume process.env.API_KEY is available.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set. Please ensure it is configured.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const buildAnalysisPrompt = (pokemon: AnalysisPokemon): string => {
  return `
You are a world-class Pokémon professor, known for your creative and insightful analyses.
Based on the following data for "${pokemon.name}", provide a professional analysis.
Your analysis must be in markdown format and include these four sections:
### Biological Profile
A detailed description of its physical characteristics and unique biological traits.
### Natural Habitat
An evocative description of the environment this Pokémon lives in.
### Behavioral Analysis
Insights into its temperament and typical behaviors.
### Combat Strategy
Expert advice on how to effectively use this Pokémon in battles.
`;
};

const buildTeamSuggestionPrompt = (): string => {
  return `
You are an expert Pokémon strategist. Your task is to generate a competitively viable and synergistic team of six Pokémon.
The team should have good type coverage and a mix of offensive and defensive roles.
Do not provide any explanation or commentary.
Your response MUST be a JSON array containing the lowercase, hyphenated names of the six Pokémon.

Example format: ["pikachu", "charizard", "blastoise", "venusaur", "snorlax", "gengar"]
`;
};

const buildTeamConfigurationPrompt = (team: BattlePokemon[], isCounterTeam: boolean = false, playerTeamForContext?: BattlePokemon[]): string => {
  const teamInfo = team.map(p => ({
    name: p.name,
    types: p.types,
    abilities: p.abilities,
    baseStats: p.stats.reduce((acc, stat) => ({ ...acc, [stat.name.toLowerCase().replace('. ', '')]: stat.value }), {}),
    allMoves: p.moveList.map(m => m.name)
  }));

  const availableItems = BATTLE_ITEMS.map(item => item.name);

  const counterInstructions = isCounterTeam && playerTeamForContext ? `
**Counter-Strategy Objective:**
Your primary goal is to configure this team to effectively counter the provided "Player's Team". Analyze the Player's Team for weaknesses (types, common strategies, defensive gaps) and exploit them with your move, item, and stat choices. For example, if the player's team is slow, prioritize fast attackers. If it's weak to a certain type, ensure your team has strong coverage of that type.

**Player's Team (for context):**
\`\`\`json
${JSON.stringify(playerTeamForContext.map(p => ({ name: p.name, types: p.types, item: p.item?.name, moves: p.selectedMoves.map(m => m.name) })), null, 2)}
\`\`\`
` : '';


  return `
You are a world-class competitive Pokémon coach. Your task is to create an optimal, synergistic configuration for the provided team of six Pokémon.
${counterInstructions}
For each Pokémon, you must provide a full competitive build, including a moveset, an EV spread, a nature, and a held item.

**Rules & Constraints:**
1.  **Response Format:** Your response MUST be a valid JSON object. Do not include any text, markdown, or code block syntax outside of the main JSON object. The root of the object should be a key named "configurations" which is an array of objects.
2.  **Completeness:** You must provide a configuration for every Pokémon in the input team.
3.  **Moveset:** Select exactly four moves from the Pokémon's "allMoves" list. The moves should work well together and fit the Pokémon's intended role.
4.  **EVs:** Assign Effort Values (EVs). The total EVs for a Pokémon cannot exceed 510. The EVs for a single stat cannot exceed 252. EVs should typically be assigned in multiples of 4. Focus on optimizing the Pokémon's key stats.
5.  **Nature:** Choose a nature that complements the Pokémon's role and EV spread (e.g., 'Adamant' for a physical attacker, 'Timid' for a fast special attacker).
6.  **Item:** Select a single, competitively viable held item from the provided "availableItems" list. Do not select an item not on the list.

**Team to Configure:**
\`\`\`json
${JSON.stringify(teamInfo, null, 2)}
\`\`\`

**Available Items:**
\`\`\`json
${JSON.stringify(availableItems, null, 2)}
\`\`\`

Now, generate the optimal configurations in the specified JSON format.
`;
};

const buildAiActionPrompt = (aiPokemon: BattlePokemon, playerPokemon: BattlePokemon, aiTeam: BattlePokemon[], aiLastAction: 'move' | 'switch' | null): string => {
  const aiTeamState = aiTeam.map(p => ({ name: p.name, hp: p.currentHp, status: p.status, types: p.types }));

  const switchConstraint = aiLastAction === 'switch'
    ? "**IMPORTANT RULE: Your last action was 'switch'. You are FORBIDDEN from choosing 'switch' again this turn. You MUST choose a move.**"
    : "";

  return `
You are a highly intelligent and strategic Pokémon battle AI. Your only goal is to win.
Your response MUST be a valid JSON object representing your chosen action. Do not include any other text or markdown.
${switchConstraint}

**Your Current Pokémon (You):**
- Name: ${aiPokemon.name}
- HP: ${aiPokemon.currentHp}/${aiPokemon.maxHp}
- Types: ${aiPokemon.types.join(', ')}
- Moves: ${aiPokemon.selectedMoves.map(m => `"${m.name}" (Power: ${m.power || 'N/A'}, Type: ${m.type})`).join(', ')}

**Opponent's Pokémon:**
- Name: ${playerPokemon.name}
- HP: ${playerPokemon.currentHp}/${playerPokemon.maxHp}
- Types: ${playerPokemon.types.join(', ')}
- Potential Moves: ${playerPokemon.selectedMoves.map(m => `"${m.name}" (Type: ${m.type})`).join(', ')}

**Your Team's Status:**
${JSON.stringify(aiTeamState, null, 2)}

**Strategic Decision:**
Based on the situation, choose the best action. Your primary goal is to deal more damage than you take.

1.  **Use a Move (Primary Action):** This is your main course of action. Analyze the type matchup, the opponent's potential moves, and your own move effectiveness. Choose the move that provides the best tactical advantage.
    - Response format: \`{"action": "move", "move": "MoveName"}\`

2.  **Switch Pokémon (High-Risk Action):** Switching is a defensive maneuver that GIVES THE OPPONENT A FREE ATTACK on your incoming Pokémon. It is often a bad trade.
    - **ONLY switch if:**
      a) Your current Pokémon is in immediate danger of being knocked out by the opponent's likely attack.
      b) You have another Pokémon on your team that has a significant type advantage and can safely absorb a hit from the opponent.
    - **DO NOT** switch back and forth repeatedly. Make a decision and commit. If you switch, pick a Pokémon that can immediately threaten the opponent.
    - Response format: \`{"action": "switch", "to": "PokemonName"}\`

Choose your action logically to maximize your chances of winning.
`;
};

async function* runStream(prompt: string, schema?: any) {
  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt,
      ...(schema && {
        config: {
          responseMimeType: "application/json",
          responseSchema: schema
        }
      })
    });

    for await (const chunk of response) {
      yield chunk;
    }
  } catch (error) {
    console.error("Error generating content from Gemini API:", error);
    throw new Error("The AI model failed to generate a response. This could be a temporary issue with the API.");
  }
}

export function generatePokemonAnalysisStream(pokemon: AnalysisPokemon) {
  const prompt = buildAnalysisPrompt(pokemon);
  return runStream(prompt);
}

export function generateTeamSuggestionStream() {
  const prompt = buildTeamSuggestionPrompt();
  const schema = {
    type: Type.ARRAY,
    items: { type: Type.STRING }
  };
  return runStream(prompt, schema);
}

const buildTeamAnalysisPrompt = (teamJson: string): string => {
  return `
You are an expert Pokémon battle strategist and team analyst. Analyze the following team and provide insights.

**Team Data:**
\`\`\`json
${teamJson}
\`\`\`

**Your Analysis Must Include:**
1. **strengths**: An array of 2-3 key strengths of this team (type coverage, synergy, etc.)
2. **weaknesses**: An array of 2-3 vulnerabilities or gaps (shared weaknesses, lack of coverage, etc.)
3. **suggestions**: An array of 2-3 actionable recommendations to improve the team
4. **rating**: A number from 1-10 rating the team's competitive viability

**Response Format:** Your response MUST be a valid JSON object with exactly these fields: strengths, weaknesses, suggestions, rating.
Do not include any text outside the JSON object.
`;
};

export function generateTeamAnalysisStream(teamJson: string) {
  const prompt = buildTeamAnalysisPrompt(teamJson);
  const schema = {
    type: Type.OBJECT,
    properties: {
      strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
      weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
      suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
      rating: { type: Type.NUMBER }
    },
    required: ["strengths", "weaknesses", "suggestions", "rating"]
  };
  return runStream(prompt, schema);
}

const getConfigSchema = () => {
  const evSchema = {
    type: Type.OBJECT,
    properties: {
      hp: { type: Type.NUMBER }, attack: { type: Type.NUMBER }, defense: { type: Type.NUMBER },
      spAtk: { type: Type.NUMBER }, spDef: { type: Type.NUMBER }, speed: { type: Type.NUMBER }
    },
    required: ["hp", "attack", "defense", "spAtk", "spDef", "speed"]
  };
  const configSchema = {
    type: Type.OBJECT,
    properties: {
      pokemonName: { type: Type.STRING },
      moves: { type: Type.ARRAY, items: { type: Type.STRING } },
      evs: evSchema,
      nature: { type: Type.STRING },
      item: { type: Type.STRING }
    },
    required: ["pokemonName", "moves", "evs", "nature", "item"]
  };
  return {
    type: Type.OBJECT,
    properties: {
      configurations: {
        type: Type.ARRAY,
        items: configSchema
      }
    },
    required: ["configurations"]
  };
};

export function generateConfigurationForTeamStream(team: BattlePokemon[]) {
  const prompt = buildTeamConfigurationPrompt(team);
  return runStream(prompt, getConfigSchema());
}

export function generateCounterConfigurationForTeamStream(opponentTeam: BattlePokemon[], playerTeam: BattlePokemon[]) {
  const prompt = buildTeamConfigurationPrompt(opponentTeam, true, playerTeam);
  return runStream(prompt, getConfigSchema());
}

export const generateAiAction = async (aiPokemon: BattlePokemon, playerPokemon: BattlePokemon, aiTeam: BattlePokemon[], aiLastAction: 'move' | 'switch' | null): Promise<AiAction> => {
  const prompt = buildAiActionPrompt(aiPokemon, playerPokemon, aiTeam, aiLastAction);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING, enum: ["move", "switch"] },
            move: { type: Type.STRING, nullable: true },
            to: { type: Type.STRING, nullable: true },
          },
          required: ["action"]
        }
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    // Basic validation
    if (result.action === 'move' && result.move) {
      return { action: 'move', move: result.move };
    }
    if (result.action === 'switch' && result.to) {
      // Second layer of defense against consecutive switches, just in case AI ignores prompt
      if (aiLastAction === 'switch') {
        console.warn("AI ignored instruction and tried to switch twice. Falling back to move.");
        return { action: 'move', move: aiPokemon.selectedMoves[0].name };
      }
      return { action: 'switch', to: result.to };
    }
    throw new Error("AI returned an incomplete action.");

  } catch (e) {
    console.error("Error processing AI action:", e);
    // Fallback to a simple action if AI fails
    return { action: 'move', move: aiPokemon.selectedMoves[0].name };
  }
};
