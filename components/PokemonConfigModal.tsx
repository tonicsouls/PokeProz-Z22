import React, { useState, useEffect, useMemo } from 'react';
import { BattlePokemon, Move, EV, Nature, NatureList, NATURE_MODIFIERS, BattleItem } from '../types';
import { calculateStats } from '../utils/statCalculator';
import { BATTLE_ITEMS } from '../constants';

interface PokemonConfigModalProps {
  pokemon: BattlePokemon;
  onClose: () => void;
  onSave: (updatedPokemon: BattlePokemon) => void;
  isReadOnly?: boolean;
}

const StatRow: React.FC<{
    label: string;
    baseValue: number;
    calculatedValue: number;
    ev: number;
    onEvChange: (ev: number) => void;
    natureModifier?: 'increase' | 'decrease';
    isReadOnly?: boolean;
}> = ({ label, baseValue, calculatedValue, ev, onEvChange, natureModifier, isReadOnly }) => {
    const statColorMap: { [key: string]: string } = { hp: 'bg-red-500', attack: 'bg-orange-500', defense: 'bg-yellow-500', 'sp. atk': 'bg-blue-500', 'sp. def': 'bg-green-500', speed: 'bg-pink-500' };
    const labelLower = label.toLowerCase();
    
    let natureColor = 'text-gray-300';
    if (natureModifier === 'increase') natureColor = 'text-green-400';
    if (natureModifier === 'decrease') natureColor = 'text-red-400';

    return (
        <div className="grid grid-cols-[80px_1fr_60px] items-center gap-4">
            <label className={`text-sm font-bold capitalize ${natureColor}`}>
                {label}
                {natureModifier === 'increase' && ' ▲'}
                {natureModifier === 'decrease' && ' ▼'}
            </label>
            <div className="flex items-center gap-2">
                <div className="w-full bg-gray-600 rounded-full h-2.5 relative" title={`Base: ${baseValue}`}>
                    <div className={`${statColorMap[labelLower]} h-2.5 rounded-full`} style={{ width: `${(baseValue / 255) * 100}%` }} />
                </div>
                <span className="text-sm font-mono w-8 text-right font-semibold">{calculatedValue}</span>
            </div>
            <input 
              type="number" 
              min="0" 
              max="252" 
              step="4"
              value={ev} 
              onChange={e => {
                  let val = parseInt(e.target.value, 10);
                  if (isNaN(val)) val = 0;
                  onEvChange(val);
              }}
              className="w-16 bg-gray-900 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
              disabled={isReadOnly}
            />
        </div>
    );
};


export const PokemonConfigModal: React.FC<PokemonConfigModalProps> = ({ pokemon, onClose, onSave, isReadOnly = false }) => {
  const [selectedMoves, setSelectedMoves] = useState<Move[]>(pokemon.selectedMoves);
  const [evs, setEvs] = useState<EV>(pokemon.evs);
  const [nature, setNature] = useState<Nature>(pokemon.nature);
  const [item, setItem] = useState<BattleItem | null>(pokemon.item);

  const [calculatedStats, setCalculatedStats] = useState<EV>(pokemon.calculatedStats);

  const totalEvs = useMemo(() => Object.values(evs).reduce((sum, val) => sum + val, 0), [evs]);

  // Recalculate stats whenever dependencies change
  useEffect(() => {
    const newStats = calculateStats({ ...pokemon, evs, nature });
    setCalculatedStats(newStats);
  }, [evs, nature, pokemon]);

  const handleEvChange = (stat: keyof EV, value: number) => {
    // Clamp value between 0 and 252
    const clampedValue = Math.max(0, Math.min(252, value));
    
    const newEvs = { ...evs, [stat]: clampedValue };
    const newTotal = Object.values(newEvs).reduce((sum, val) => sum + val, 0);

    if (newTotal <= 510) {
        setEvs(newEvs);
    } else {
        // If total exceeds 510, revert the change but allow decreasing values
        if (clampedValue < evs[stat]) {
            setEvs(newEvs);
        }
    }
  };

  const sortedMoveList = useMemo(() => {
    return [...pokemon.moveList].sort((a, b) => a.name.localeCompare(b.name));
  }, [pokemon.moveList]);

  const handleMoveToggle = (move: Move) => {
    if (isReadOnly) return;
    setSelectedMoves(prevSelected => {
      if (prevSelected.some(m => m.name === move.name)) {
        return prevSelected.filter(m => m.name !== move.name);
      }
      if (prevSelected.length < 4) {
        return [...prevSelected, move];
      }
      return prevSelected;
    });
  };

  const handleSaveChanges = () => {
    if (isReadOnly) {
        onClose();
        return;
    }
    if (selectedMoves.length !== 4) {
        alert("Please select exactly 4 moves.");
        return;
    }
    if (totalEvs > 510) {
        alert(`Total EVs cannot exceed 510. Current total: ${totalEvs}`);
        return;
    }
    const finalStats = calculateStats({ ...pokemon, evs, nature });
    const finalPokemon = { 
        ...pokemon, 
        selectedMoves, 
        evs, 
        nature, 
        item, 
        calculatedStats: finalStats, 
        maxHp: finalStats.hp 
    };
    onSave(finalPokemon);
  };
  
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const natureMod = NATURE_MODIFIERS[nature];

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
        <div 
            className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
        >
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                        {isReadOnly ? `Inspecting ${pokemon.name}` : `Configure ${pokemon.name}`}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left Side: Base Stats, EVs, Nature */}
                    <div className="lg:col-span-3 space-y-6 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <div>
                            <h3 className="text-xl font-semibold mb-3">Base Stats & EVs</h3>
                             <p className={`text-xs mb-3 ${totalEvs > 510 ? 'text-red-400' : 'text-gray-400'}`}>Total EVs: {totalEvs} / 510</p>
                            <div className="space-y-3">
                                {pokemon.stats.map(stat => {
                                    const key = stat.name.toLowerCase().replace('. ', '') as keyof EV;
                                    let modifier: 'increase' | 'decrease' | undefined = undefined;
                                    if(natureMod?.increase === key) modifier = 'increase';
                                    if(natureMod?.decrease === key) modifier = 'decrease';

                                    return <StatRow key={stat.name} label={stat.name} baseValue={stat.value} calculatedValue={calculatedStats[key]} ev={evs[key]} onEvChange={v => handleEvChange(key, v)} natureModifier={modifier} isReadOnly={isReadOnly} />
                                })}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Nature</h3>
                                <select value={nature} onChange={e => setNature(e.target.value as Nature)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white" disabled={isReadOnly}>
                                    {NatureList.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                             <div>
                                <h3 className="text-xl font-semibold mb-2">Held Item</h3>
                                <select value={item?.name || ''} onChange={e => {
                                    const selectedItem = BATTLE_ITEMS.find(i => i.name === e.target.value) || null;
                                    setItem(selectedItem);
                                }} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white" disabled={isReadOnly}>
                                    <option value="">None</option>
                                    {BATTLE_ITEMS.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Move Selection */}
                    <div className="lg:col-span-2">
                        <h3 className="text-xl font-semibold mb-3">Select Moves ({selectedMoves.length}/4)</h3>
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 h-[350px] overflow-y-auto">
                            <ul className="space-y-2">
                                {sortedMoveList.map(move => {
                                    const isSelected = selectedMoves.some(m => m.name === move.name);
                                    const isDisabled = !isSelected && selectedMoves.length >= 4;
                                    return (
                                        <li key={move.name}>
                                            <button
                                                onClick={() => handleMoveToggle(move)}
                                                disabled={isDisabled && !isReadOnly}
                                                className={`w-full text-left p-3 rounded-md transition-colors text-sm ${
                                                    isSelected ? 'bg-purple-600 text-white font-semibold' : 'bg-gray-700 hover:bg-gray-600'
                                                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${isReadOnly ? 'cursor-default hover:bg-gray-700' : ''}`}
                                            >
                                               {move.name}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
                 <div className="mt-6 flex gap-4">
                    {!isReadOnly && <button onClick={onClose} className="w-full px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors">
                        Cancel
                    </button>}
                     <button 
                        onClick={handleSaveChanges} 
                        disabled={!isReadOnly && (selectedMoves.length !== 4 || totalEvs > 510)}
                        className={`w-full px-6 py-3 text-white font-bold rounded-lg transition-colors ${isReadOnly ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed'}`}
                    >
                        {isReadOnly ? 'Close' : 'Save Changes'}
                    </button>
                 </div>
            </div>
        </div>
    </div>
  );
};