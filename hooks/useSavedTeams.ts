import { useState, useEffect, useCallback } from 'react';
import { BattlePokemon } from '../types';

export interface SavedTeam {
    id: string;
    name: string;
    pokemon: BattlePokemon[];
    createdAt: string;
    updatedAt: string;
}

const STORAGE_KEY = 'pokeproz_saved_teams';

function generateId(): string {
    return `team_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function loadTeamsFromStorage(): SavedTeam[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Failed to load saved teams:', e);
    }
    return [];
}

function saveTeamsToStorage(teams: SavedTeam[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
    } catch (e) {
        console.error('Failed to save teams:', e);
    }
}

export function useSavedTeams() {
    const [savedTeams, setSavedTeams] = useState<SavedTeam[]>(loadTeamsFromStorage);

    // Persist whenever teams change
    useEffect(() => {
        saveTeamsToStorage(savedTeams);
    }, [savedTeams]);

    const saveTeam = useCallback((name: string, pokemon: BattlePokemon[]): SavedTeam => {
        const newTeam: SavedTeam = {
            id: generateId(),
            name: name.trim() || `Team ${savedTeams.length + 1}`,
            pokemon,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setSavedTeams((prev) => [...prev, newTeam]);
        return newTeam;
    }, [savedTeams.length]);

    const updateTeam = useCallback((id: string, updates: Partial<Pick<SavedTeam, 'name' | 'pokemon'>>): void => {
        setSavedTeams((prev) =>
            prev.map((team) =>
                team.id === id
                    ? { ...team, ...updates, updatedAt: new Date().toISOString() }
                    : team
            )
        );
    }, []);

    const deleteTeam = useCallback((id: string): void => {
        setSavedTeams((prev) => prev.filter((team) => team.id !== id));
    }, []);

    const getTeam = useCallback((id: string): SavedTeam | undefined => {
        return savedTeams.find((team) => team.id === id);
    }, [savedTeams]);

    const duplicateTeam = useCallback((id: string): SavedTeam | undefined => {
        const original = savedTeams.find((team) => team.id === id);
        if (!original) return undefined;

        const duplicate: SavedTeam = {
            id: generateId(),
            name: `${original.name} (Copy)`,
            pokemon: [...original.pokemon],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setSavedTeams((prev) => [...prev, duplicate]);
        return duplicate;
    }, [savedTeams]);

    return {
        savedTeams,
        saveTeam,
        updateTeam,
        deleteTeam,
        getTeam,
        duplicateTeam,
        teamCount: savedTeams.length,
    };
}
