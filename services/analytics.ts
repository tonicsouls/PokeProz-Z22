/**
 * Analytics Service
 * Provides a unified interface for tracking user events.
 * Currently logs to console; can be extended to GA4, Plausible, Mixpanel, etc.
 */

type EventCategory = 'navigation' | 'team_builder' | 'battle' | 'engagement' | 'error';

interface AnalyticsEvent {
    category: EventCategory;
    action: string;
    label?: string;
    value?: number;
}

const IS_PRODUCTION = import.meta.env.MODE === 'production';

function trackEvent(event: AnalyticsEvent) {
    if (!IS_PRODUCTION) {
        console.log('[Analytics]', event);
        return;
    }

    // Google Analytics 4 (gtag)
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event.action, {
            event_category: event.category,
            event_label: event.label,
            value: event.value,
        });
    }
}

function trackPageView(path: string) {
    if (!IS_PRODUCTION) {
        console.log('[Analytics] Page View:', path);
        return;
    }

    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
            page_path: path,
        });
    }
}

export const analytics = {
    trackEvent,
    trackPageView,

    // Pre-defined event helpers
    teamCreated: (teamName: string) =>
        trackEvent({ category: 'team_builder', action: 'team_created', label: teamName }),

    battleStarted: (format: string) =>
        trackEvent({ category: 'battle', action: 'battle_started', label: format }),

    achievementUnlocked: (achievementId: string) =>
        trackEvent({ category: 'engagement', action: 'achievement_unlocked', label: achievementId }),

    errorOccurred: (errorType: string) =>
        trackEvent({ category: 'error', action: 'error_occurred', label: errorType }),
};
