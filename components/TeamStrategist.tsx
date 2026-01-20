import React, { useState } from 'react';
import { BattlePokemon, TypeEffectiveness } from '../types';
import { generateTeamAnalysisStream } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { LoadingSpinner } from './LoadingSpinner';

interface TeamStrategistProps {
    team: BattlePokemon[];
    onApiError: (message: string) => void;
}

interface TeamAnalysis {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    overallRating: number;
}

export const TeamStrategist: React.FC<TeamStrategistProps> = ({ team, onApiError }) => {
    const [analysis, setAnalysis] = useState<TeamAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const analyzeTeam = async () => {
        if (team.length === 0) return;

        setIsAnalyzing(true);
        setAnalysis(null);

        try {
            // Calculate type coverage
            const allTypes = team.flatMap((p) => p.types);
            const typeCount = allTypes.reduce((acc, type) => {
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            // Calculate combined weaknesses
            const combinedWeaknesses: Record<string, number> = {};
            team.forEach((p) => {
                Object.entries(p.typeEffectiveness).forEach(([type, multiplier]) => {
                    if (multiplier > 1) {
                        combinedWeaknesses[type] = (combinedWeaknesses[type] || 0) + 1;
                    }
                });
            });

            // Get AI analysis
            const teamSummary = team.map((p) => ({
                name: p.name,
                types: p.types,
                moves: p.selectedMoves.map((m) => m.name),
            }));

            const stream = generateTeamAnalysisStream(JSON.stringify(teamSummary));
            let jsonStr = '';
            for await (const chunk of stream) {
                jsonStr += chunk.text;
            }

            // Parse AI response
            const aiAnalysis = JSON.parse(jsonStr);

            setAnalysis({
                strengths: aiAnalysis.strengths || [],
                weaknesses: aiAnalysis.weaknesses || [],
                suggestions: aiAnalysis.suggestions || [],
                overallRating: aiAnalysis.rating || 7,
            });
        } catch (e) {
            onApiError(e instanceof Error ? e.message : 'Failed to analyze team');

            // Fallback to basic analysis
            const weakTypes = Object.entries(
                team.reduce((acc, p) => {
                    Object.entries(p.typeEffectiveness).forEach(([type, mult]) => {
                        if (mult > 1) acc[type] = (acc[type] || 0) + 1;
                    });
                    return acc;
                }, {} as Record<string, number>)
            )
                .filter(([_, count]) => count >= 3)
                .map(([type]) => type);

            setAnalysis({
                strengths: [`Team has ${team.length} Pokémon ready for battle`],
                weaknesses: weakTypes.length > 0
                    ? [`Multiple team members weak to: ${weakTypes.join(', ')}`]
                    : ['No major shared weaknesses detected'],
                suggestions: ['Consider type coverage when selecting moves'],
                overallRating: 6,
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 8) return 'text-green-400';
        if (rating >= 6) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl border border-indigo-600/50 overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-indigo-800/30 transition-colors"
            >
                <span className="font-semibold text-indigo-200 flex items-center gap-2">
                    <SparklesIcon /> AI Battle Strategist
                </span>
                <span className="text-indigo-400">{isExpanded ? '▼' : '▶'}</span>
            </button>

            {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                    {team.length === 0 ? (
                        <p className="text-indigo-300 text-sm text-center py-4">
                            Add Pokémon to your team to get AI-powered analysis
                        </p>
                    ) : (
                        <>
                            <button
                                onClick={analyzeTeam}
                                disabled={isAnalyzing}
                                className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <LoadingSpinner /> Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon /> Analyze My Team
                                    </>
                                )}
                            </button>

                            {analysis && (
                                <div className="space-y-3 animate-fade-in">
                                    <div className="text-center">
                                        <span className="text-sm text-gray-400">Team Rating</span>
                                        <div className={`text-3xl font-bold ${getRatingColor(analysis.overallRating)}`}>
                                            {analysis.overallRating}/10
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="bg-green-900/30 rounded-lg p-3 border border-green-700/50">
                                            <h4 className="text-green-400 font-semibold mb-2">💪 Strengths</h4>
                                            <ul className="text-sm text-green-200 space-y-1">
                                                {analysis.strengths.map((s, i) => (
                                                    <li key={i}>• {s}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="bg-red-900/30 rounded-lg p-3 border border-red-700/50">
                                            <h4 className="text-red-400 font-semibold mb-2">⚠️ Weaknesses</h4>
                                            <ul className="text-sm text-red-200 space-y-1">
                                                {analysis.weaknesses.map((w, i) => (
                                                    <li key={i}>• {w}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-700/50">
                                        <h4 className="text-blue-400 font-semibold mb-2">💡 Suggestions</h4>
                                        <ul className="text-sm text-blue-200 space-y-1">
                                            {analysis.suggestions.map((s, i) => (
                                                <li key={i}>• {s}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
