import { useState, useEffect, useCallback } from 'react';
import { analytics } from '../services/analytics';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: string;
}

const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_team',
        title: 'Team Builder!',
        description: 'You created your first team.',
        icon: '🎯',
    },
    {
        id: 'first_battle',
        title: 'Battle Ready!',
        description: 'You started your first battle.',
        icon: '⚔️',
    },
    {
        id: 'ai_assistant',
        title: 'AI Strategist',
        description: 'You used the AI battle assistant.',
        icon: '🤖',
    },
    {
        id: 'five_teams',
        title: 'Team Collector',
        description: 'You created 5 teams.',
        icon: '🏆',
    },
];

const STORAGE_KEY = 'pokeproz_engagement';

interface EngagementState {
    achievements: Achievement[];
    sessionCount: number;
    lastVisit: string;
    teamsCreated: number;
    battlesStarted: number;
}

const getInitialState = (): EngagementState => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Failed to load engagement state', e);
    }

    return {
        achievements: [],
        sessionCount: 0,
        lastVisit: new Date().toISOString(),
        teamsCreated: 0,
        battlesStarted: 0,
    };
};

export function useEngagement() {
    const [state, setState] = useState<EngagementState>(getInitialState);
    const [pendingAchievement, setPendingAchievement] = useState<Achievement | null>(null);

    // Save state on change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    // Track session on mount
    useEffect(() => {
        setState((prev) => ({
            ...prev,
            sessionCount: prev.sessionCount + 1,
            lastVisit: new Date().toISOString(),
        }));
    }, []);

    const unlockAchievement = useCallback((achievementId: string) => {
        const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
        if (!achievement) return;

        setState((prev) => {
            const alreadyUnlocked = prev.achievements.some((a) => a.id === achievementId);
            if (alreadyUnlocked) return prev;

            const unlockedAchievement = {
                ...achievement,
                unlockedAt: new Date().toISOString(),
            };

            analytics.achievementUnlocked(achievementId);
            setPendingAchievement(unlockedAchievement);

            return {
                ...prev,
                achievements: [...prev.achievements, unlockedAchievement],
            };
        });
    }, []);

    const recordTeamCreated = useCallback(() => {
        setState((prev) => {
            const newCount = prev.teamsCreated + 1;
            return { ...prev, teamsCreated: newCount };
        });
        unlockAchievement('first_team');
    }, [unlockAchievement]);

    const recordBattleStarted = useCallback(() => {
        setState((prev) => {
            const newCount = prev.battlesStarted + 1;
            return { ...prev, battlesStarted: newCount };
        });
        unlockAchievement('first_battle');
    }, [unlockAchievement]);

    const dismissAchievement = useCallback(() => {
        setPendingAchievement(null);
    }, []);

    return {
        ...state,
        pendingAchievement,
        unlockAchievement,
        recordTeamCreated,
        recordBattleStarted,
        dismissAchievement,
        allAchievements: ACHIEVEMENTS,
    };
}
