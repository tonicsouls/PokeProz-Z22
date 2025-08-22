import React, { useState, useCallback } from 'react';
import { PredictiveSearchBar } from '../components/PredictiveSearchBar';
import { ResultCard } from '../components/ResultCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { PokedexHistory } from '../components/PokedexHistory';
import { fetchPokedexData } from '../services/pokeapi';
import { generatePokemonAnalysisStream } from '../services/geminiService';
import { DetailedPokemon, PokemonListItem } from '../types';
import { PokedexDetailView } from './PokedexDetailView';

interface PokedexViewProps {
    allPokemon: PokemonListItem[];
    navigateTo: (view: 'menu' | 'battle') => void;
    onApiError: (message: string) => void;
}

export const PokedexView: React.FC<PokedexViewProps> = ({ allPokemon, navigateTo, onApiError }) => {
  const [pokemon, setPokemon] = useState<DetailedPokemon | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<DetailedPokemon[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm) {
      setError('Please enter a Pokémon name or ID.');
      return;
    }
    
    setIsLoading(true);
    setPokemon(null);
    setAnalysis('');
    setError(null);

    try {
      const data = await fetchPokedexData(searchTerm);
      setPokemon(data);
      setSearchHistory(prev => {
        if (prev.find(p => p.id === data.id)) return prev;
        return [data, ...prev].slice(0, 10);
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(message);
      setPokemon(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleHistorySelect = (searchTerm: string) => {
    handleSearch(searchTerm);
  };

  const handleGenerateAnalysis = useCallback(async () => {
    if (!pokemon) return;

    setIsGenerating(true);
    setAnalysis('');
    setError(null);

    const promptPokemon = {
      id: pokemon.id,
      name: pokemon.name,
      types: pokemon.types,
      abilities: pokemon.abilities,
    }

    try {
      const stream = await generatePokemonAnalysisStream(promptPokemon);
      let content = '';
      for await (const chunk of stream) {
        content += chunk.text;
        setAnalysis(content);
      }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to generate analysis.';
        onApiError(message);
        setError(message);
    } finally {
      setIsGenerating(false);
    }
  }, [pokemon, onApiError]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
      <header className="text-center mb-8 relative">
          <button onClick={() => navigateTo('menu')} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
            &larr; Main Menu
          </button>
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-500">
              Pokedex
          </h1>
          <p className="text-gray-400 mt-2">Search and Analyze Any Pokémon</p>
      </header>

      <main>
        <PredictiveSearchBar pokemonList={allPokemon} onSearch={handleSearch} isLoading={isLoading} />
        {error && <ErrorMessage message={error} />}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-3">
              <PokedexHistory history={searchHistory} onSelect={handleHistorySelect} />
          </div>

          <div className="lg:col-span-9">
             {isLoading && <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>}
             {!pokemon && !isLoading && !error && (
                <div className="text-center mt-16 text-gray-500 h-full flex flex-col items-center justify-center bg-gray-800/50 rounded-lg p-8">
                  <p>Search for a Pokémon to begin your discovery.</p>
                  <p className="text-sm">Try "Pikachu", "Charizard", or "25".</p>
                </div>
              )}
             {pokemon && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <PokedexDetailView 
                        pokemon={pokemon}
                        onGenerateAnalysis={handleGenerateAnalysis}
                        isGenerating={isGenerating}
                        onPokemonSelect={handleSearch}
                    />
                    <div className="w-full">
                        {isGenerating && !analysis && (
                            <div className="flex flex-col items-center justify-center p-8 bg-gray-800/50 rounded-lg h-full">
                                <LoadingSpinner />
                                <p className="mt-4 text-gray-300">Generating Pro Analysis...</p>
                            </div>
                        )}
                        {analysis && <ResultCard title="AI Professional Analysis" content={analysis} />}
                    </div>
                </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
};