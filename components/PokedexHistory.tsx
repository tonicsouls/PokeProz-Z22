import React from 'react';
import { DetailedPokemon } from '../types';

interface PokedexHistoryProps {
  history: DetailedPokemon[];
  onSelect: (name: string) => void;
}

export const PokedexHistory: React.FC<PokedexHistoryProps> = ({ history, onSelect }) => {
  if (history.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
        <h3 className="text-lg font-semibold text-gray-300 mb-2">Search History</h3>
        <p className="text-sm text-gray-500">Your recent Pokémon will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <h3 className="text-lg font-semibold text-gray-300 mb-4 text-center">Search History</h3>
      <ul className="space-y-2 max-h-96 overflow-y-auto">
        {history.map((pokemon) => (
          <li key={pokemon.id}>
            <button
              onClick={() => onSelect(pokemon.name)}
              className="w-full flex items-center gap-3 p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors duration-200 text-left"
            >
              <img 
                src={pokemon.spriteUrl} 
                alt={pokemon.name} 
                className="w-10 h-10"
              />
              <span className="font-semibold capitalize text-gray-200">{pokemon.name}</span>
              <span className="ml-auto text-xs text-gray-500">#{String(pokemon.id).padStart(3, '0')}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
