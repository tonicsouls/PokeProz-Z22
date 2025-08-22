import { BattlePokemon, AiAction } from "../types";

// A simple, deterministic AI for the "Game Engine" mode
export const generateEngineAction = (enginePokemon: BattlePokemon, playerPokemon: BattlePokemon): AiAction => {
    const availableMoves = enginePokemon.selectedMoves.filter(m => m.pp && m.pp > 0);

    if (availableMoves.length === 0) {
        // This is the move "Struggle"
        return { action: 'move', move: 'Struggle' }; 
    }

    const weightedMoves: { move: string; weight: number }[] = [];

    for (const move of availableMoves) {
        if (!move.type || !move.power) {
            // Give status moves a baseline weight
            weightedMoves.push({ move: move.name, weight: 1 });
            continue;
        }

        const effectiveness = playerPokemon.typeEffectiveness[move.type] ?? 1;

        if (effectiveness >= 2) {
            weightedMoves.push({ move: move.name, weight: 10 }); // Super-effective moves are highly prioritized
        } else if (effectiveness >= 1) {
            weightedMoves.push({ move: move.name, weight: 3 }); // Normally effective moves
        } else if (effectiveness > 0) {
            weightedMoves.push({ move: move.name, weight: 1 }); // Not very effective moves are last resort
        }
        // Moves with 0 effectiveness are not added, so they won't be chosen unless it's the only option
    }
    
    // If no moves have any effectiveness, just use all available moves with equal weight
    if (weightedMoves.length === 0) {
        availableMoves.forEach(m => weightedMoves.push({ move: m.name, weight: 1 }));
    }


    // Weighted random selection
    const totalWeight = weightedMoves.reduce((sum, move) => sum + move.weight, 0);
    let random = Math.random() * totalWeight;

    for (const move of weightedMoves) {
        random -= move.weight;
        if (random <= 0) {
            return { action: 'move', move: move.move };
        }
    }

    // Fallback to the first available move if something goes wrong
    return { action: 'move', move: availableMoves[0].name };
};