import React from 'react';
import { useNavigate } from '@/lib/router-compat';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';

interface ExchangedEmailsModalProps {
    myEmail: string;
    peerEmail: string;
    onClose: () => void;
}

export const ExchangedEmailsModal: React.FC<ExchangedEmailsModalProps> = ({
    myEmail,
    peerEmail,
    onClose
}) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <div className="text-center mb-6">
                    <div className="inline-block p-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mb-4">
                        <span className="text-5xl">🎉</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Friends!</h2>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed text-center">
                    You are now friends! Here are your contact details:
                </p>
                <div className="space-y-4 mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <strong className="text-gray-800 block mb-1">Your Email:</strong>
                        <p className="text-gray-700 break-all">{myEmail}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <strong className="text-gray-800 block mb-1">Their Email:</strong>
                        <p className="text-gray-700 break-all">{peerEmail}</p>
                    </div>
                </div>
                <p className="text-sm text-gray-600 bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-center">
                    📧 You can now contact each other directly!
                </p>
                <button
                    onClick={() => navigate('/connections')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-white font-semibold text-sm shadow-md border border-amber-400/40 transition-all hover:scale-[1.02] mb-3"
                >
                    <Users className="h-4 w-4" />
                    {t('globalConnection.viewAllFriends')}
                </button>
                <button
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
                    onClick={onClose}
                >
                    Got it!
                </button>
            </div>
        </div>
    );
};