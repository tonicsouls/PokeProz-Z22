import React, { useState, useMemo } from 'react';
import { DetailedPokemon, DetailedMove } from '../../types';

interface MovesTabProps {
  pokemon: DetailedPokemon;
}

type SortKey = 'name' | 'level' | 'learnMethod';
type SortDirection = 'asc' | 'desc';

export const MovesTab: React.FC<MovesTabProps> = ({ pokemon }) => {
  const [sortKey, setSortKey] = useState<SortKey>('level');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedMoves = useMemo(() => {
    return [...pokemon.learnableMoves].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
  }, [pokemon.learnableMoves, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const SortableHeader: React.FC<{ headerKey: SortKey, label: string }> = ({ headerKey, label }) => {
    const isSorted = sortKey === headerKey;
    const icon = isSorted ? (sortDirection === 'asc' ? '▲' : '▼') : '';
    return (
        <th className="p-2 cursor-pointer" onClick={() => handleSort(headerKey)}>
            {label} <span className="text-xs">{icon}</span>
        </th>
    );
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2 mb-3 text-center">Learnable Moves</h3>
      <div className="max-h-96 overflow-y-auto">
        <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                <tr>
                    <SortableHeader headerKey="name" label="Move" />
                    <SortableHeader headerKey="learnMethod" label="Method" />
                    <SortableHeader headerKey="level" label="Level" />
                </tr>
            </thead>
            <tbody>
                {sortedMoves.map(move => (
                    <tr key={`${move.name}-${move.learnMethod}-${move.level}`} className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="p-2 font-medium">{move.name}</td>
                        <td className="p-2 capitalize">{move.learnMethod}</td>
                        <td className="p-2">{move.level > 0 ? move.level : '-'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};
