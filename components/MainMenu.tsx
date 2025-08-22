import React from 'react';

interface MainMenuProps {
  onNavigate: (view: 'pokedex' | 'battle') => void;
}

const MenuCard: React.FC<{ title: string, description: string, onClick: () => void, gradient: string }> = 
({ title, description, onClick, gradient }) => (
    <button
        onClick={onClick}
        className={`w-full max-w-md p-8 rounded-2xl shadow-2xl text-left transform hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${gradient}`}
    >
        <h2 className="text-4xl font-bold text-white drop-shadow-md">{title}</h2>
        <p className="mt-2 text-lg text-white/90 drop-shadow-sm">{description}</p>
    </button>
);

export const MainMenu: React.FC<MainMenuProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900">
        <header className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Welcome to PokeProZ1
            </h1>
            <p className="text-gray-400 mt-3 text-lg">Your AI-Powered Pokémon Companion</p>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
            <MenuCard 
                title="Pokedex"
                description="Search, analyze, and build your team of Pokémon."
                onClick={() => onNavigate('pokedex')}
                gradient="bg-gradient-to-br from-blue-500 to-teal-400 focus:ring-blue-400"
            />
            <MenuCard 
                title="Battle Arena"
                description="Pit your Pokémon against others in an AI-simulated battle."
                onClick={() => onNavigate('battle')}
                gradient="bg-gradient-to-br from-red-500 to-orange-500 focus:ring-red-400"
            />
        </div>
    </div>
  );
};
