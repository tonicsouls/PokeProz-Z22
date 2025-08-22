import React from 'react';
import { BattlePokemon } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface PokemonCardProps {
  pokemon: BattlePokemon;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

const typeColorMap: { [key: string]: string } = {
  normal: 'bg-gray-400',
  fire: 'bg-red-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-teal-300 text-gray-800',
  fighting: 'bg-orange-700',
  poison: 'bg-purple-600',
  ground: 'bg-yellow-600',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-lime-500',
  rock: 'bg-yellow-700',
  ghost: 'bg-indigo-800',
  dragon: 'bg-purple-800',
  dark: 'bg-gray-800',
  steel: 'bg-gray-500',
  fairy: 'bg-pink-300 text-gray-800',
};

const statColorMap: { [key: string]: string } = {
  hp: 'bg-red-500',
  attack: 'bg-orange-500',
  defense: 'bg-yellow-500',
  'sp. atk': 'bg-blue-500',
  'sp. def': 'bg-green-500',
  speed: 'bg-pink-500',
};

const StatBar: React.FC<{ name: string; value: number }> = ({ name, value }) => (
    <div className="w-full">
        <div className="flex justify-between mb-1 text-sm text-gray-300">
            <span className="font-bold capitalize">{name}</span>
            <span>{value}</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2.5">
            <div
                className={`${statColorMap[name.toLowerCase()] || 'bg-gray-400'} h-2.5 rounded-full`}
                style={{ width: `${(value / 255) * 100}%` }}
            ></div>
        </div>
    </div>
);


export const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onGenerate, isGenerating }) => {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 transform hover:scale-[1.02] transition-transform duration-300">
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48 mb-4">
          <img
            src={pokemon.imageUrl}
            alt={pokemon.name}
            className="w-full h-full object-contain drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]"
          />
          <span className="absolute top-0 right-0 bg-gray-900 text-gray-400 text-xs font-bold px-2 py-1 rounded-full">
            #{String(pokemon.id).padStart(3, '0')}
          </span>
        </div>
        <h2 className="text-3xl font-bold capitalize">{pokemon.name}</h2>
        <div className="flex gap-2 mt-2">
          {pokemon.types.map((type) => (
            <span key={type} className={`px-3 py-1 text-sm font-semibold rounded-full ${typeColorMap[type] || 'bg-gray-200 text-gray-800'}`}>
              {type.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
      
      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2">Base Stats</h3>
        {pokemon.stats.map((stat) => (
          <StatBar key={stat.name} name={stat.name} value={stat.value} />
        ))}
      </div>

       <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2">Abilities</h3>
            <ul className="list-disc list-inside mt-2 text-gray-300">
                {pokemon.abilities.map((ability) => (
                    <li key={ability}>{ability}</li>
                ))}
            </ul>
          </div>
           <div>
            <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2">Moves</h3>
            <ul className="list-disc list-inside mt-2 text-gray-300">
                {pokemon.moves.map((move) => (
                    <li key={move}>{move}</li>
                ))}
            </ul>
          </div>
      </div>

      {onGenerate && (
        <div className="mt-8 text-center">
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
                <SparklesIcon />
                {isGenerating ? 'Generating...' : 'Generate Pro Analysis'}
            </button>
        </div>
      )}
    </div>
  );
};