import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, RadialLinearScale } from 'chart.js';
import { DetailedPokemon } from '../../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, RadialLinearScale);

interface StatsInfoTabProps {
  pokemon: DetailedPokemon;
}

const StatBar: React.FC<{ name: string; value: number }> = ({ name, value }) => {
    const statColorMap: { [key: string]: string } = { hp: 'bg-red-500', attack: 'bg-orange-500', defense: 'bg-yellow-500', 'sp. atk': 'bg-blue-500', 'sp. def': 'bg-green-500', speed: 'bg-pink-500' };
    return(
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
}

const TypeEffectivenessDisplay: React.FC<{ effectiveness: {type: string, multiplier: number}[] }> = ({ effectiveness }) => {
    if (effectiveness.length === 0) return <span className="text-sm text-gray-500">None</span>;
    
    const typeColorMap: { [key: string]: string } = { normal: 'bg-gray-400', fire: 'bg-red-500', water: 'bg-blue-500', electric: 'bg-yellow-400', grass: 'bg-green-500', ice: 'bg-teal-300 text-gray-800', fighting: 'bg-orange-700', poison: 'bg-purple-600', ground: 'bg-yellow-600', flying: 'bg-indigo-400', psychic: 'bg-pink-500', bug: 'bg-lime-500', rock: 'bg-yellow-700', ghost: 'bg-indigo-800', dragon: 'bg-purple-800', dark: 'bg-gray-800', steel: 'bg-gray-500', fairy: 'bg-pink-300 text-gray-800' };

    return (
        <div className="flex flex-wrap gap-2">
            {effectiveness.map(({type, multiplier}) => (
                <div key={type} className="relative">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeColorMap[type] || 'bg-gray-200 text-gray-800'}`}>
                        {type.toUpperCase()}
                    </span>
                     <span className="absolute -top-1 -right-2 text-xs font-bold text-gray-200 bg-gray-900/80 rounded-full px-1.5 py-0.5" style={{fontSize: '0.6rem'}}>
                        x{multiplier}
                    </span>
                </div>
            ))}
        </div>
    );
};

export const StatsInfoTab: React.FC<StatsInfoTabProps> = ({ pokemon }) => {

    const chartData = {
        labels: pokemon.stats.map(s => s.name),
        datasets: [{
            label: pokemon.name,
            data: pokemon.stats.map(s => s.value),
            backgroundColor: 'rgba(192, 132, 252, 0.2)',
            borderColor: 'rgba(192, 132, 252, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(192, 132, 252, 1)',
        }]
    };

    const chartOptions = {
        scales: {
            r: {
                angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
                grid: { color: 'rgba(255, 255, 255, 0.2)' },
                pointLabels: { color: '#d1d5db', font: { size: 12 } },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    backdropColor: 'transparent',
                    stepSize: 50
                },
                min: 0,
                max: 200,
            }
        },
        plugins: {
            legend: { display: false }
        }
    };
    
    const weaknesses = Object.entries(pokemon.typeEffectiveness).filter(([, mult]) => mult > 1).map(([type, multiplier]) => ({type, multiplier}));
    const resistances = Object.entries(pokemon.typeEffectiveness).filter(([, mult]) => mult < 1 && mult > 0).map(([type, multiplier]) => ({type, multiplier}));
    const immunities = Object.entries(pokemon.typeEffectiveness).filter(([, mult]) => mult === 0).map(([type, multiplier]) => ({type, multiplier}));

    return (
        <div className="space-y-6">
            <div>
                 <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2 mb-3">Base Stats</h3>
                 <div className="max-w-sm mx-auto">
                    <Line type="radar" data={chartData} options={chartOptions} />
                 </div>
            </div>
            
            <div>
                <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2 mb-3">Type Effectiveness</h3>
                <div className="space-y-3">
                    <div>
                        <h4 className="font-bold text-red-400 text-sm mb-1">Weaknesses</h4>
                        <TypeEffectivenessDisplay effectiveness={weaknesses} />
                    </div>
                     <div>
                        <h4 className="font-bold text-green-400 text-sm mb-1">Resistances</h4>
                        <TypeEffectivenessDisplay effectiveness={resistances} />
                    </div>
                     <div>
                        <h4 className="font-bold text-sky-400 text-sm mb-1">Immunities</h4>
                        <TypeEffectivenessDisplay effectiveness={immunities} />
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2 mb-3">Pokédex Entries</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {pokemon.pokedexEntries.slice(0, 5).map(entry => (
                        <div key={entry.version}>
                            <strong className="text-purple-300 text-sm">Pokémon {entry.version}:</strong>
                            <p className="text-sm text-gray-300 italic">"{entry.text}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
