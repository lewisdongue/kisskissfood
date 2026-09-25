import React from 'react';
import { useNavigate } from '@/lib/router-compat';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';

interface IncomingFriendRequestModalProps {
    onAccept: () => void;
    onDecline: () => void;
}

export const IncomingFriendRequestModal: React.FC<IncomingFriendRequestModalProps> = ({
    onAccept,
    onDecline
}) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <div className="text-center mb-6">
                    <div className="inline-block p-4 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full mb-4 animate-bounce">
                        <span className="text-5xl">👥</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Friend Request!</h2>
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed text-center text-lg">
                    The person you're talking to wants to be friends!
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-gray-700">
                    ✉️ You'll exchange email addresses<br />
                    📵 Phone numbers will NOT be shared
                </div>
                <div className="flex gap-3">
                    <button
                        className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl transition-all"
                        onClick={onDecline}
                    >
                        Decline
                    </button>
                    <button
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
                        onClick={onAccept}
                    >
                        Accept
                    </button>
                </div>
                <button
                    onClick={() => navigate('/connections')}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-white font-semibold text-sm shadow-md border border-amber-400/40 transition-all hover:scale-[1.02]"
                >
                    <Users className="h-4 w-4" />
                    {t('globalConnection.viewAllFriends')}
                </button>
            </div>
        </div>
    );
};