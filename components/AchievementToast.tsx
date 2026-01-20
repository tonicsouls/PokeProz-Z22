import React, { useState, useEffect } from 'react';

interface AchievementToastProps {
    title: string;
    description: string;
    icon?: string;
    duration?: number;
    onClose?: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
    title,
    description,
    icon = '🏆',
    duration = 5000,
    onClose,
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
                setIsVisible(false);
                onClose?.();
            }, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!isVisible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.5rem',
                backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
                color: '#fff',
                zIndex: 9999,
                transform: isExiting ? 'translateX(120%)' : 'translateX(0)',
                opacity: isExiting ? 0 : 1,
                transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
                animation: 'slideIn 0.4s ease-out',
            }}
        >
            <span style={{ fontSize: '2rem' }}>{icon}</span>
            <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>{title}</h4>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', opacity: 0.9 }}>
                    {description}
                </p>
            </div>
            <button
                onClick={() => {
                    setIsExiting(true);
                    setTimeout(() => {
                        setIsVisible(false);
                        onClose?.();
                    }, 300);
                }}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    opacity: 0.7,
                    marginLeft: '0.5rem',
                }}
                aria-label="Dismiss"
            >
                ×
            </button>
            <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
        </div>
    );
};
