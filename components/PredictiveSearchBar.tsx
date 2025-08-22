import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PokemonListItem } from '../types';

interface PredictiveSearchBarProps {
  pokemonList: PokemonListItem[];
  onSearch: (searchTerm: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export const PredictiveSearchBar: React.FC<PredictiveSearchBarProps> = ({ pokemonList, onSearch, isLoading, placeholder="Enter Pokémon name or ID..." }) => {
  const [term, setTerm] = useState('');
  const [suggestions, setSuggestions] = useState<PokemonListItem[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (term.length > 1) {
      const filtered = pokemonList
        .filter(p => p.name.toLowerCase().includes(term.toLowerCase()))
        .slice(0, 7); // Limit suggestions for performance and UI
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [term, pokemonList]);
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (pokemonName: string) => {
    setTerm(pokemonName);
    setSuggestions([]);
    onSearch(pokemonName);
    setIsFocused(false);
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSelect(suggestions[0].name)
    } else {
      onSearch(term);
    }
    setSuggestions([]);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition duration-200"
          disabled={isLoading}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center"
        >
          {isLoading ? '...' : 'Search'}
        </button>
      </form>
      {isFocused && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-80 overflow-y-auto shadow-lg">
          {suggestions.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => handleSelect(p.name)}
                className="w-full flex items-center gap-3 p-2 hover:bg-purple-600 text-left transition-colors duration-150"
              >
                <img src={p.spriteUrl} alt={p.name} className="w-8 h-8" style={{ imageRendering: 'pixelated' }}/>
                <span className="capitalize font-medium">{p.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
