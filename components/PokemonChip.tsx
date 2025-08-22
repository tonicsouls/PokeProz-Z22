import React from 'react';
import { BattlePokemon } from '../types';

interface PokemonChipProps {
  pokemon: BattlePokemon;
  onRemove: (id: number) => void;
}

export const PokemonChip: React.FC<PokemonChipProps> = ({ pokemon, onRemove }) => {
  return (
    <div className="relative p-2 bg-gray-700 rounded-lg group">
        <img 
          src={pokemon.spriteUrl} 
          alt={pokemon.name} 
          className="w-16 h-16 mx-auto"
        />
       <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-xs font-bold text-white capitalize">{pokemon.name}</p>
       </div>
      <button 
        onClick={() => onRemove(pokemon.id)}
        className="absolute -top-1 -right-1 text-xs w-5 h-5 flex items-center justify-center bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors font-bold opacity-0 group-hover:opacity-100"
        aria-label={`Remove ${pokemon.name}`}
      >
        &times;
      </button>
    </div>
  );
};