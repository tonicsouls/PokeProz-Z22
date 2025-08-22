import React from 'react';
import { DetailedPokemon, EvolutionStage } from '../../types';

interface EvolutionsTabProps {
  pokemon: DetailedPokemon;
  onPokemonSelect: (nameOrId: string) => void;
}

const EvolutionNode: React.FC<{ stage: EvolutionStage, onPokemonSelect: (nameOrId: string) => void }> = ({ stage, onPokemonSelect }) => {
  return (
    <div className="flex items-center justify-center">
      <button 
        onClick={() => onPokemonSelect(stage.pokemon.name)}
        className="text-center p-2 rounded-lg hover:bg-gray-700/50 transition-colors group"
      >
        <img 
          src={stage.pokemon.spriteUrl} 
          alt={stage.pokemon.name} 
          className="w-24 h-24 mx-auto group-hover:scale-110 transition-transform"
        />
        <p className="font-semibold capitalize mt-1 text-sm">{stage.pokemon.name}</p>
      </button>

      {stage.evolvesTo.length > 0 && (
        <>
          <div className="text-2xl text-gray-500 mx-4">&rarr;</div>
          <div className="flex flex-col gap-4">
            {stage.evolvesTo.map(nextStage => (
              <EvolutionNode key={nextStage.pokemon.id} stage={nextStage} onPokemonSelect={onPokemonSelect} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};


export const EvolutionsTab: React.FC<EvolutionsTabProps> = ({ pokemon, onPokemonSelect }) => {
    if (!pokemon.evolutionChain) {
        return <div className="text-center text-gray-500">This Pokémon does not evolve.</div>
    }

  return (
    <div>
        <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2 mb-4 text-center">Evolution Chain</h3>
        <div className="flex justify-center items-center p-4 overflow-x-auto">
            <EvolutionNode stage={pokemon.evolutionChain} onPokemonSelect={onPokemonSelect} />
        </div>
    </div>
  );
};
