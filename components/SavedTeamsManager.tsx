import React, { useState } from 'react';
import { BattlePokemon } from '../types';
import { useSavedTeams, SavedTeam } from '../hooks/useSavedTeams';

interface SavedTeamsManagerProps {
    currentTeam: BattlePokemon[];
    onLoadTeam: (team: BattlePokemon[]) => void;
}

export const SavedTeamsManager: React.FC<SavedTeamsManagerProps> = ({
    currentTeam,
    onLoadTeam,
}) => {
    const { savedTeams, saveTeam, deleteTeam, duplicateTeam } = useSavedTeams();
    const [newTeamName, setNewTeamName] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    const handleSave = () => {
        if (currentTeam.length === 0) return;
        saveTeam(newTeamName, currentTeam);
        setNewTeamName('');
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 2000);
    };

    const handleLoad = (team: SavedTeam) => {
        onLoadTeam(team.pokemon);
    };

    return (
        <div className="bg-gray-800/70 rounded-xl border border-gray-700 overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-700/50 transition-colors"
            >
                <span className="font-semibold text-gray-200 flex items-center gap-2">
                    📁 Saved Teams ({savedTeams.length})
                </span>
                <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>
            </button>

            {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                    {/* Save Current Team */}
                    {currentTeam.length > 0 && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                                placeholder="Team name..."
                                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            />
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                            >
                                {showSaveSuccess ? '✓ Saved!' : 'Save Team'}
                            </button>
                        </div>
                    )}

                    {/* Saved Teams List */}
                    {savedTeams.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-4">
                            No saved teams yet. Build a team and save it!
                        </p>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {savedTeams.map((team) => (
                                <div
                                    key={team.id}
                                    className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
                                >
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-white">{team.name}</h4>
                                        <div className="flex gap-1 mt-1">
                                            {team.pokemon.slice(0, 6).map((p, idx) => (
                                                <img
                                                    key={idx}
                                                    src={p.spriteUrl}
                                                    alt={p.name}
                                                    className="w-8 h-8"
                                                    title={p.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleLoad(team)}
                                            className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                                            title="Load this team"
                                        >
                                            Load
                                        </button>
                                        <button
                                            onClick={() => duplicateTeam(team.id)}
                                            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                            title="Duplicate this team"
                                        >
                                            Copy
                                        </button>
                                        <button
                                            onClick={() => deleteTeam(team.id)}
                                            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                                            title="Delete this team"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
