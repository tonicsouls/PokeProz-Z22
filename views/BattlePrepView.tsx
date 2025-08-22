import React, { useState } from 'react';
import { BattlePokemon, Nature, EV, BattleItem, Move } from '../types';
import { PokemonConfigModal } from '../components/PokemonConfigModal';
import { generateConfigurationForTeamStream, generateCounterConfigurationForTeamStream } from '../services/geminiService';
import { BATTLE_ITEMS } from '../constants';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface BattlePrepViewProps {
  playerTeam: BattlePokemon[];
  opponentTeam: BattlePokemon[];
  onStartBattle: (engine: 'ai' | 'game') => void;
  onTeamUpdate: (updatedTeam: BattlePokemon[], teamType: 'player' | 'opponent') => void;
  onApiError: (message: string) => void;
}

const TeamSlot: React.FC<{ pokemon: BattlePokemon, onClick: () => void, isPlayer: boolean }> = ({ pokemon, onClick, isPlayer }) => (
    <div className="relative">
        <button
            onClick={onClick}
            className={`w-full h-full bg-gray-800 rounded-xl p-3 border border-gray-700 text-center group transition-all duration-300 flex flex-col justify-between ${isPlayer ? 'hover:border-purple-500' : 'hover:border-yellow-500'} hover:scale-105 cursor-pointer`}
        >
            <div>
                <img src={pokemon.spriteUrl} alt={pokemon.name} className="w-24 h-24 mx-auto transition-transform group-hover:scale-110" />
                <p className="font-bold capitalize mt-2 truncate">{pokemon.name}</p>
            </div>
            <div className="text-xs mt-2 text-gray-400 min-h-[3rem] flex flex-col items-center justify-end">
                 <p className="capitalize">{pokemon.nature} Nature</p>
                 {pokemon.item && (
                     <div className="flex items-center justify-center gap-1 mt-1">
                        <img src={pokemon.item.spriteUrl} alt={pokemon.item.name} className="w-4 h-4" />
                        <span>{pokemon.item.name}</span>
                     </div>
                 )}
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white font-bold">{isPlayer ? 'Configure' : 'Inspect'}</span>
            </div>
        </button>
    </div>
);

export const BattlePrepView: React.FC<BattlePrepViewProps> = ({ playerTeam, opponentTeam, onStartBattle, onTeamUpdate, onApiError }) => {
    const [configuringPokemon, setConfiguringPokemon] = useState<BattlePokemon | null>(null);
    const [isAutoConfiguring, setIsAutoConfiguring] = useState(false);
    const [autoConfigureStatus, setAutoConfigureStatus] = useState<string>('');

    const handleSaveConfig = (updatedPokemon: BattlePokemon) => {
        const isPlayer = playerTeam.some(p => p.id === updatedPokemon.id);
        if (isPlayer) {
            const updatedTeam = playerTeam.map(p => p.id === updatedPokemon.id ? updatedPokemon : p);
            onTeamUpdate(updatedTeam, 'player');
        }
        setConfiguringPokemon(null);
    }
    
    const applyConfiguration = (team: BattlePokemon[], configurations: any[]): BattlePokemon[] => {
        return team.map(p => {
            const config = configurations.find((c: any) => c.pokemonName.toLowerCase() === p.name.toLowerCase());
            if (config) {
                const selectedItem = BATTLE_ITEMS.find(item => item.name.toLowerCase() === config.item.toLowerCase()) || null;
                const newConfiguredPokemon = {
                    ...p,
                    selectedMoves: config.moves
                        .map((moveName: string) => p.moveList.find(m => m.name.toLowerCase() === moveName.toLowerCase()))
                        .filter(Boolean) as Move[],
                    evs: config.evs as EV,
                    nature: config.nature as Nature,
                    item: selectedItem,
                };
                return newConfiguredPokemon;
            }
            return p;
        });
    };

    const handleAutoConfigure = async () => {
        setIsAutoConfiguring(true);
        try {
            setAutoConfigureStatus("Configuring your team...");
            const playerStream = generateConfigurationForTeamStream(playerTeam);
            let playerJsonString = "";
            for await (const chunk of playerStream) {
                playerJsonString += chunk.text;
            }
            const playerResult = JSON.parse(playerJsonString);
            const newPlayerTeam = applyConfiguration(playerTeam, playerResult.configurations);
            onTeamUpdate(newPlayerTeam, 'player');

            setAutoConfigureStatus("Configuring opponent's counter-strategy...");
            const opponentStream = generateCounterConfigurationForTeamStream(opponentTeam, newPlayerTeam);
            let opponentJsonString = "";
            for await (const chunk of opponentStream) {
                opponentJsonString += chunk.text;
            }
            const opponentResult = JSON.parse(opponentJsonString);
            const newOpponentTeam = applyConfiguration(opponentTeam, opponentResult.configurations);
            onTeamUpdate(newOpponentTeam, 'opponent');
            
        } catch (error: any) {
            onApiError(error.message);
            setAutoConfigureStatus("An error occurred during AI configuration.");
        } finally {
            setIsAutoConfiguring(false);
            setAutoConfigureStatus('');
        }
    }

    const TeamDisplay: React.FC<{ team: BattlePokemon[], title: string, isPlayer: boolean }> = ({ team, title, isPlayer }) => (
        <div>
            <h2 className="text-3xl font-bold text-center mb-4">{title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {team.map(p => (
                   <TeamSlot key={p.id} pokemon={p} onClick={() => setConfiguringPokemon(p)} isPlayer={isPlayer} />
                ))}
            </div>
        </div>
    );
    
    const isPlayerConfiguring = playerTeam.some(p => p.id === configuringPokemon?.id);

  return (
    <div className="w-full">
        {configuringPokemon && (
            <PokemonConfigModal
                pokemon={configuringPokemon}
                onClose={() => setConfiguringPokemon(null)}
                onSave={handleSaveConfig}
                isReadOnly={!isPlayerConfiguring}
            />
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-12 items-start">
            <TeamDisplay team={playerTeam} title="Your Team" isPlayer={true} />
            <TeamDisplay team={opponentTeam} title="Opponent's Team" isPlayer={false}/>
        </div>
        
        <div className="text-center my-8 p-4 bg-gray-900/50 rounded-lg max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-yellow-400">Battle Imminent!</h3>
            <p className="text-gray-300">Click a Pokémon to configure it, or use the AI to do it for you.</p>
            <div className="mt-4">
                <button
                    onClick={handleAutoConfigure}
                    disabled={isAutoConfiguring}
                    className="w-full max-w-xs flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-lg hover:from-teal-600 hover:to-cyan-600 disabled:from-gray-600 disabled:cursor-not-allowed transition-all mx-auto"
                >
                    {isAutoConfiguring ? <><LoadingSpinner /> {autoConfigureStatus}</> : <><SparklesIcon /> Auto-Configure Team</>}
                </button>
            </div>
        </div>
        
        <div className="text-center mt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
                onClick={() => onStartBattle('game')}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-sky-500 text-white font-bold text-xl rounded-lg hover:from-blue-600 hover:to-sky-600 transition-all transform hover:scale-105 shadow-lg w-full sm:w-auto"
            >
                Start Engine Battle
            </button>
            <button
                onClick={() => onStartBattle('ai')}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold text-xl rounded-lg hover:from-red-700 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg w-full sm:w-auto"
            >
                Start AI Battle
            </button>
        </div>
    </div>
  );
};