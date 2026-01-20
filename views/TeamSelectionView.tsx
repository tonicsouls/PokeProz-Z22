import React, { useState, useCallback } from 'react';
import { PredictiveSearchBar } from '../components/PredictiveSearchBar';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PokemonChip } from '../components/PokemonChip';
import { fetchPokemonForBattle } from '../services/pokeapi';
import { generateTeamSuggestionStream } from '../services/geminiService';
import { PokemonListItem, BattlePokemon, Move, PresetPokemon } from '../types';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { PRESET_TRAINERS, BATTLE_ITEMS } from '../constants';
import { calculateStats } from '../utils/statCalculator';
import { SavedTeamsManager } from '../components/SavedTeamsManager';
import { TeamStrategist } from '../components/TeamStrategist';

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
        selectedMoves: pokemonData.moveList.slice(0, 4).map(m => ({ ...m, maxPp: m.pp || 0 })),
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
      if (!Array.isArray(names) || names.length === 0) {
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
              return foundMove ? { ...foundMove, maxPp: foundMove.pp || 0 } : null;
            })
            .filter(Boolean) as Move[] : pokemonData.moveList.slice(0, 4).map(m => ({ ...m, maxPp: m.pp || 0 })),
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
    } catch (e: any) {
      setError("Failed to generate trainer team.");
    } finally {
      setIsGenerating(null);
    }
  };

  const TeamPanel: React.FC<{ teamType: TeamType }> = ({ teamType }) => {
    const team = teamType === 'player' ? playerTeam : opponentTeam;
    const title = teamType === 'player' ? 'Your Team' : 'Opponent Team';

    return (
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 w-full flex flex-col h-full">
        <h3 className="text-2xl font-bold text-center mb-4">{title} ({team.length}/6)</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-4 min-h-[140px] flex-grow">
          {team.map(p => <PokemonChip key={p.id} pokemon={p} onRemove={(id) => handleRemovePokemon(id, teamType)} />)}
          {isGenerating === teamType && <div className="col-span-full flex justify-center py-8"><LoadingSpinner /></div>}
        </div>

        <div className="mt-auto space-y-3">
          <PredictiveSearchBar
            pokemonList={allPokemon}
            onSearch={(name) => handleAddPokemon(name, teamType)}
            isLoading={isLoading}
            placeholder={`Search for a Pokémon...`}
          />
          <button
            onClick={() => handleAutoGenerate(teamType)}
            disabled={!!isGenerating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-lg hover:from-teal-600 hover:to-cyan-600 disabled:from-gray-600 disabled:cursor-not-allowed transition-all"
          >
            <SparklesIcon /> {isGenerating === teamType ? 'Generating...' : 'AI Auto-Generate'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 text-center mb-8">
        Battle Team Selection
      </h2>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <TeamPanel teamType="player" />
          <TeamStrategist team={playerTeam} onApiError={onApiError} />
          <SavedTeamsManager currentTeam={playerTeam} onLoadTeam={setPlayerTeam} />
        </div>

        <div className="space-y-6">
          <TeamPanel teamType="opponent" />

          <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 text-center">
            <h3 className="text-xl font-bold text-gray-300 mb-4">Challenge a Legendary Trainer</h3>
            <div className="relative">
              <select
                onChange={(e) => handleSelectTrainer(e.target.value as TrainerName)}
                disabled={!!isGenerating}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white font-bold focus:ring-2 focus:ring-purple-500 outline-none transition appearance-none cursor-pointer"
              >
                <option value="">Select an Opponent...</option>
                {Object.keys(PRESET_TRAINERS).map(trainer => (
                  <option key={trainer} value={trainer}>{trainer}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Selecting a trainer will replace the current opponent roster with their signature team.
            </p>
          </div>
        </div>
      </div>

      {playerTeam.length > 0 && opponentTeam.length > 0 && (
        <div className="flex justify-center mt-12 pb-12">
          <button
            onClick={() => onTeamsSelected(playerTeam, opponentTeam)}
            className="group relative px-12 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-extrabold text-2xl rounded-2xl shadow-xl hover:shadow-green-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <span className="flex items-center gap-2">
              Enter Battle Arena <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
            <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      )}
    </div>
  );
};