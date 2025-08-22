import React, { useState, useCallback } from 'react';
import { PredictiveSearchBar } from '../components/PredictiveSearchBar';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PokemonChip } from '../components/PokemonChip';
import { fetchPokemonForBattle } from '../services/pokeapi';
import { generateTeamSuggestionStream } from '../services/geminiService';
import { PokemonListItem, BattlePokemon, Move, PresetPokemon, Nature } from '../types';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { PRESET_TRAINERS, BATTLE_ITEMS } from '../constants';
import { calculateStats } from '../utils/statCalculator';

interface TeamSelectionViewProps {
  allPokemon: PokemonListItem[];
  onTeamsSelected: (playerTeam: BattlePokemon[], opponentTeam: BattlePokemon[]) => void;
  onApiError: (message: string) => void;
}

type TeamType = 'player' | 'opponent';
type TrainerName = keyof typeof PRESET_TRAINERS;

export const TeamSelectionView: React.FC<TeamSelectionViewProps> = ({ allPokemon, onTeamsSelected, onApiError }) => {
  const [playerTeam, setPlayerTeam] = useState<BattlePokemon[]>([]);
  const [opponentTeam, setOpponentTeam] = useState<BattlePokemon[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<TeamType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddPokemon = useCallback(async (name: string, teamType: TeamType) => {
    const currentTeam = teamType === 'player' ? playerTeam : opponentTeam;
    if (currentTeam.length >= 6) return;
    if (currentTeam.some(p => p.name.toLowerCase() === name.toLowerCase())) return;

    setIsLoading(true);
    setError(null);
    try {
      const pokemonData = await fetchPokemonForBattle(name);
      const battlePokemon: BattlePokemon = {
        ...pokemonData,
        currentHp: pokemonData.maxHp,
        selectedMoves: pokemonData.moveList.slice(0, 4), 
      };

      if (teamType === 'player') {
        setPlayerTeam(prev => [...prev, battlePokemon]);
      } else {
        setOpponentTeam(prev => [...prev, battlePokemon]);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [playerTeam, opponentTeam]);
  
  const handleRemovePokemon = (id: number, teamType: TeamType) => {
    if (teamType === 'player') {
        setPlayerTeam(prev => prev.filter(p => p.id !== id));
    } else {
        setOpponentTeam(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleAutoGenerate = async (teamType: TeamType) => {
    setIsGenerating(teamType);
    setError(null);
    if (teamType === 'player') setPlayerTeam([]);
    else setOpponentTeam([]);

    try {
        const stream = generateTeamSuggestionStream();
        let jsonStr = '';
        for await (const chunk of stream) {
            jsonStr += chunk.text;
        }
        
        const names = JSON.parse(jsonStr);
        if(!Array.isArray(names) || names.length === 0) {
            throw new Error("AI returned an invalid team format.");
        }
        
        await fetchAndSetTeam(names.slice(0, 6).map((name: string) => ({ name })), teamType);

    } catch (e: any) {
        onApiError(e instanceof Error ? e.message : 'An unknown error occurred.');
        setError("AI failed to generate a team. Please try again or use a preset trainer.");
    } finally {
        setIsGenerating(null);
    }
  }

  const fetchAndSetTeam = async (presets: Partial<PresetPokemon>[], teamType: TeamType) => {
    let successfulFetches: BattlePokemon[] = [];
    let failedNames: string[] = [];

    await Promise.all(presets.map(async (preset) => {
        try {
            const pokemonData = await fetchPokemonForBattle(preset.name!);
            
            const selectedItem = BATTLE_ITEMS.find(item => item.name.toLowerCase() === preset.item?.toLowerCase()) || null;

            const baseConfig = {
                ...pokemonData,
                item: selectedItem,
                nature: preset.nature || 'Serious',
                evs: preset.evs || { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 },
            }

            const calculatedStats = calculateStats(baseConfig);
            const finalMaxHp = calculatedStats.hp;

            const battlePokemon: BattlePokemon = {
                ...baseConfig,
                calculatedStats,
                maxHp: finalMaxHp,
                currentHp: finalMaxHp,
                selectedMoves: preset.moves ? preset.moves
                    .map(moveName => {
                        const foundMove = pokemonData.moveList.find(m => m.name.toLowerCase() === moveName.toLowerCase());
                        return foundMove ? { ...foundMove, maxPp: foundMove.pp } : null;
                    })
                    .filter(Boolean) as Move[] : pokemonData.moveList.slice(0,4).map(m => ({...m, maxPp: m.pp})),
            };
            successfulFetches.push(battlePokemon);
        } catch (fetchError) {
            console.warn(`Could not fetch preset Pokémon "${preset.name}":`, fetchError);
            failedNames.push(preset.name!);
        }
    }));

    if (failedNames.length > 0) {
        setError(`Could not find the following Pokémon: ${failedNames.join(', ')}. The rest of the team was added.`);
    }

    if (teamType === 'player') setPlayerTeam(successfulFetches);
    else setOpponentTeam(successfulFetches);
  };
  
  const handleSelectTrainer = async (trainer: TrainerName) => {
    if (!trainer) {
        setOpponentTeam([]);
        return;
    }
    setIsGenerating('opponent');
    setError(null);
    setOpponentTeam([]);
    try {
      const teamPresets = PRESET_TRAINERS[trainer];
      await fetchAndSetTeam(teamPresets, 'opponent');
    } catch(e: any) {
      setError("Failed to generate trainer team.");
    } finally {
      setIsGenerating(null);
    }
  };

  const TeamPanel: React.FC<{ teamType: TeamType }> = ({ teamType }) => {
    const team = teamType === 'player' ? playerTeam : opponentTeam;
    const title = teamType === 'player' ? 'Your Team' : 'Opponent Team';
    
    return (
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 w-full">
        <h3 className="text-2xl font-bold text-center mb-4">{title} ({team.length}/6)</h3>
        <div className="grid grid-cols-3 md:grid-cols-3 gap-2 mb-4 min-h-[140px]">
          {team.map(p => <PokemonChip key={p.id} pokemon={p} onRemove={(id) => handleRemovePokemon(id, teamType)} />)}
          {isGenerating === teamType && <div className="col-span-3 flex justify-center pt-8"><LoadingSpinner /></div>}
        </div>
        <PredictiveSearchBar
            pokemonList={allPokemon}
            onSearch={(name) => handleAddPokemon(name, teamType)}
            isLoading={isLoading}
            placeholder="Add Pokémon to roster..."
        />
        <button
            onClick={() => handleAutoGenerate(teamType)}
            disabled={!!isGenerating}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-lg hover:from-teal-600 hover:to-cyan-600 disabled:from-gray-600 disabled:cursor-not-allowed transition-all"
        >
            <SparklesIcon /> {isGenerating === teamType ? 'Generating...' : 'Auto-Generate Team'}
        </button>
      </div>
    );
  };

  return (
    <div>
        {error && <ErrorMessage message={error} />}
        <div className="flex flex-col md:flex-row gap-8 items-start">
            <TeamPanel teamType="player" />
            <TeamPanel teamType="opponent" />
        </div>
        
        <div className="mt-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700 text-center">
            <h3 className="text-xl font-bold text-gray-300 mb-3">Or, Fight a Famous Trainer</h3>
            <select
                onChange={(e) => handleSelectTrainer(e.target.value as TrainerName)}
                disabled={!!isGenerating}
                className="w-full max-w-xs mx-auto bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition duration-200"
            >
                <option value="">Select a Trainer...</option>
                {Object.keys(PRESET_TRAINERS).map(trainer => (
                    <option key={trainer} value={trainer}>{trainer}</option>
                ))}
            </select>
        </div>

        {playerTeam.length > 0 && opponentTeam.length > 0 && (
             <div className="text-center mt-8">
                 <button 
                    onClick={() => onTeamsSelected(playerTeam, opponentTeam)}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-lime-500 text-white font-bold text-xl rounded-lg hover:from-green-600 hover:to-lime-600 transition-all transform hover:scale-105 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed"
                    disabled={playerTeam.length === 0 || opponentTeam.length === 0}
                >
                    Proceed to Battle Prep &rarr;
                </button>
             </div>
        )}
    </div>
  );
};