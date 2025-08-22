import React, { useState, useEffect } from 'react';
import { MainMenu } from './components/MainMenu';
import { PokedexView } from './views/PokedexView';
import { BattleArenaView } from './views/BattleArenaView';
import { LoadingSpinner } from './components/LoadingSpinner';
import { fetchAllPokemonList } from './services/pokeapi';
import { PokemonListItem } from './types';

type View = 'menu' | 'pokedex' | 'battle';

const ApiErrorMessage: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
  <div className="fixed top-4 right-4 z-50 max-w-md w-full bg-red-800/90 backdrop-blur-sm border border-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-start gap-3">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    <div className="flex-grow">
      <p className="font-semibold">Gemini API Error</p>
      <p className="text-sm text-red-200">{message}</p>
    </div>
    <button onClick={onClose} className="text-red-200 hover:text-white">&times;</button>
  </div>
);


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('menu');
  const [allPokemon, setAllPokemon] = useState<PokemonListItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleApiError = (message: string) => {
    // A simplified error message parser
    if (message.includes('quota exceeded')) {
        setApiError('You have reached the daily limit of requests for this model. Please use the "Engine Battle" option or try again tomorrow.');
    } else {
        setApiError(message);
    }
  };

  useEffect(() => {
    const loadPokemonList = async () => {
      try {
        setIsLoadingList(true);
        const pokemonList = await fetchAllPokemonList();
        setAllPokemon(pokemonList);
      } catch (error) {
        console.error("Failed to fetch Pokémon list:", error);
      } finally {
        setIsLoadingList(false);
      }
    };
    loadPokemonList();
  }, []);

  const renderContent = () => {
    if (isLoadingList) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <LoadingSpinner />
          <p className="mt-4 text-gray-300">Loading Pokémon database...</p>
        </div>
      );
    }

    switch (currentView) {
      case 'pokedex':
        return <PokedexView allPokemon={allPokemon} navigateTo={setCurrentView} onApiError={handleApiError} />;
      case 'battle':
        return <BattleArenaView allPokemon={allPokemon} navigateTo={setCurrentView} onApiError={handleApiError} />;
      case 'menu':
      default:
        return <MainMenu onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans antialiased">
      {apiError && <ApiErrorMessage message={apiError} onClose={() => setApiError(null)} />}
      {renderContent()}
    </div>
  );
};

export default App;