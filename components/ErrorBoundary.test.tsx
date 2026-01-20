import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

describe('ErrorBoundary', () => {
    it('renders children when there is no error', () => {
        render(
            <ErrorBoundary>
                <div data-testid="child">Hello</div>
            </ErrorBoundary>
        );

        expect(screen.getByTestId('child')).toBeInTheDocument();
        expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('renders fallback UI when provided and error occurs', () => {
        const ThrowingComponent = () => {
            throw new Error('Test error');
        };

        // Suppress console.error for this test
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        render(
            <ErrorBoundary fallback={<div>Custom Fallback</div>}>
                <ThrowingComponent />
            </ErrorBoundary>
        );

        expect(screen.getByText('Custom Fallback')).toBeInTheDocument();

        consoleSpy.mockRestore();
    });
});
