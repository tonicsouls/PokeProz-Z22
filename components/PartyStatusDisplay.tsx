import React from 'react';
import { BattlePokemon } from '../types';

interface PartyStatusDisplayProps {
    team: BattlePokemon[];
    activeIndex: number;
    isPlayer: boolean;
}

export const PartyStatusDisplay: React.FC<PartyStatusDisplayProps> = ({ team, activeIndex, isPlayer }) => {
    
    const teamStatus = Array.from({ length: 6 }).map((_, i) => team[i] || null);
    const alignment = isPlayer ? 'justify-start' : 'justify-end';

    const getStatusClasses = (pokemon: BattlePokemon | null, isActive: boolean) => {
        let classes = 'transition-all duration-300 ';
        if (!pokemon) {
            return classes + 'grayscale opacity-30';
        }
        if (pokemon.status === 'fainted') {
            return classes + 'grayscale opacity-50';
        }
        if (isActive) {
            return classes + 'ring-2 ring-yellow-400 rounded-full';
        }
        return classes;
    };


    return (
        <div className={`flex gap-1.5 p-1 mb-1 ${alignment}`}>
            {teamStatus.map((pokemon, i) => {
                const isActive = i === activeIndex;
                return (
                    <div 
                        key={i} 
                        title={pokemon ? `${pokemon.name} (${pokemon.status})` : 'Empty'}
                        className="relative w-8 h-8 flex items-center justify-center"
                    >
                         {pokemon ? (
                            <img 
                                src={pokemon.spriteUrl} 
                                alt={pokemon.name} 
                                className={`w-full h-full object-contain ${getStatusClasses(pokemon, isActive)}`}
                            />
                         ) : (
                             // Poké Ball icon for empty slot
                             <div className="w-5 h-5 bg-gray-700 rounded-full border-2 border-gray-500"></div>
                         )}
                    </div>
                );
            })}
        </div>
    );
};