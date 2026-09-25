import React from 'react';
import { useTranslation } from 'react-i18next';

interface LoadingScreenProps {
    message?: string;
    className?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
    message,
    className = ''
}) => {
    const { t } = useTranslation();
    const displayMessage = message || t('loadingScreen.loading');
    return (
        <div className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${className}`}>
            <div className="text-center">
                <img
                    src="/logo.webp"
                    alt={t('common.logoAlt')}
                    className="w-16 h-16 mx-auto mb-4 animate-pulse drop-shadow-lg"
                    style={{
                        animation: 'caakusBounce 1.5s ease-in-out infinite',
                    }}
                />
                <style>{`
                    @keyframes caakusBounce {
                        0%, 100% {
                            transform: scale(1);
                            opacity: 1;
                        }
                        50% {
                            transform: scale(1.15);
                            opacity: 0.7;
                        }
                    }
                `}</style>
                <p className="text-gray-600 dark:text-gray-400 font-medium">{displayMessage}</p>
            </div>
        </div>
    );
};