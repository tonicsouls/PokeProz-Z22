import React, { useState } from 'react';
import { DetailedPokemon } from '../types';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { StatsInfoTab } from './pokedex-tabs/StatsInfoTab';
import { EvolutionsTab } from './pokedex-tabs/EvolutionsTab';
import { MovesTab } from './pokedex-tabs/MovesTab';

interface PokedexDetailViewProps {
  pokemon: DetailedPokemon;
  onGenerateAnalysis: () => void;
  isGenerating: boolean;
  onPokemonSelect: (nameOrId: string) => void;
}

type PokedexTab = 'stats' | 'evolutions' | 'moves';

const typeColorMap: { [key: string]: string } = { normal: 'bg-gray-400', fire: 'bg-red-500', water: 'bg-blue-500', electric: 'bg-yellow-400', grass: 'bg-green-500', ice: 'bg-teal-300 text-gray-800', fighting: 'bg-orange-700', poison: 'bg-purple-600', ground: 'bg-yellow-600', flying: 'bg-indigo-400', psychic: 'bg-pink-500', bug: 'bg-lime-500', rock: 'bg-yellow-700', ghost: 'bg-indigo-800', dragon: 'bg-purple-800', dark: 'bg-gray-800', steel: 'bg-gray-500', fairy: 'bg-pink-300 text-gray-800' };

export const PokedexDetailView: React.FC<PokedexDetailViewProps> = ({ pokemon, onGenerateAnalysis, isGenerating, onPokemonSelect }) => {
  const [activeTab, setActiveTab] = useState<PokedexTab>('stats');
  const [showShiny, setShowShiny] = useState(false);
  const cryAudio = pokemon.cryUrl ? new Audio(pokemon.cryUrl) : null;

  const playCry = () => {
    cryAudio?.play().catch(err => console.error("Failed to play audio:", err));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'stats':
        return <StatsInfoTab pokemon={pokemon} />;
      case 'evolutions':
        return <EvolutionsTab pokemon={pokemon} onPokemonSelect={onPokemonSelect}/>;
      case 'moves':
          return <MovesTab pokemon={pokemon} />
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tab: PokedexTab, label: string }> = ({ tab, label }) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tab ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
    >
        {label}
    </button>
  );

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
      {/* Top Section */}
      <div className="p-6">
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48 mb-4">
            <img
              src={showShiny ? pokemon.shinyImageUrl : pokemon.imageUrl}
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
          <div className="flex gap-2 mt-4">
              <button onClick={() => setShowShiny(!showShiny)} className="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 rounded-full hover:bg-yellow-500/40">
                  {showShiny ? 'Show Regular' : 'Show Shiny'}
              </button>
              {cryAudio && <button onClick={playCry} className="px-3 py-1 text-xs bg-sky-500/20 text-sky-300 border border-sky-500/50 rounded-full hover:bg-sky-500/40">
                  Play Cry
              </button>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-4 bg-gray-900/50 border-y border-gray-700">
         <div className="flex justify-center gap-3">
            <TabButton tab="stats" label="Stats & Info" />
            <TabButton tab="evolutions" label="Evolutions" />
            <TabButton tab="moves" label="Moves" />
         </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 min-h-[300px]">
        {renderTabContent()}
      </div>

       {/* AI Button */}
      <div className="p-6 border-t border-gray-700">
        <button
          onClick={onGenerateAnalysis}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
        >
          <SparklesIcon />
          {isGenerating ? 'Generating...' : 'Generate Pro Analysis'}
        </button>
      </div>
    </div>
  );
};
