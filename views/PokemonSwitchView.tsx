import React from 'react';
import { BattlePokemon } from '../types';

interface PokemonSwitchViewProps {
    team: BattlePokemon[];
    activeIndex: number;
    onSelect: (pokemonIndex: number) => void;
    onCancel: () => void;
    isForced: boolean;
}

export const PokemonSwitchView: React.FC<PokemonSwitchViewProps> = ({ team, activeIndex, onSelect, onCancel, isForced }) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center">
        <h2 className="text-2xl font-bold text-yellow-300 mb-4">{isForced ? "Choose your next Pokémon!" : "Switch Pokémon"}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {team.map((pokemon, index) => (
                <button
                    key={pokemon.id}
                    onClick={() => onSelect(index)}
                    disabled={pokemon.status === 'fainted' || pokemon.currentHp === 0 || index === activeIndex}
                    className="flex flex-col items-center p-3 rounded-lg bg-gray-700 hover:bg-purple-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                    <img src={pokemon.spriteUrl} alt={pokemon.name} className="w-16 h-16 group-hover:scale-110 transition-transform" />
                    <p className="font-semibold capitalize mt-2">{pokemon.name}</p>
                    <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                         <div
                            className={`${pokemon.currentHp < pokemon.maxHp * 0.2 ? 'bg-red-500' : pokemon.currentHp < pokemon.maxHp * 0.5 ? 'bg-yellow-500' : 'bg-green-500'} h-2 rounded-full`}
                            style={{ width: `${(pokemon.currentHp / pokemon.maxHp) * 100}%` }}
                        ></div>
                    </div>
                     <p className="text-xs mt-1">{pokemon.currentHp} / {pokemon.maxHp}</p>
                </button>
            ))}
        </div>
        {!isForced && (
            <button
                onClick={onCancel}
                className="mt-6 px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg"
            >
                Cancel
            </button>
        )}
    </div>
  );
};