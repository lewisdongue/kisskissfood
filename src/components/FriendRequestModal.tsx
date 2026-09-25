import React, { useState } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';

interface FriendRequestModalProps {
    onConfirm: () => void;
    onCancel: () => void;
    isFirstConfirmation: boolean;
}

export const FriendRequestModal: React.FC<FriendRequestModalProps> = ({
    onConfirm,
    onCancel,
    isFirstConfirmation
}) => {
    const [confirmed, setConfirmed] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleConfirm = () => {
        if (isFirstConfirmation && !confirmed) {
            setConfirmed(true);
        } else {
            onConfirm();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <div className="text-center mb-6">
                    <div className="inline-block p-4 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full mb-4">
                        <span className="text-5xl">👥</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Add as Friend?</h2>
                </div>

                {isFirstConfirmation && !confirmed ? (
                    <>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                            By pressing "Friend", you'll be able to exchange contact information
                            with this person <strong>if both of you agree</strong>.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-sm text-gray-700">
                            ✉️ Email addresses will be shared<br />
                            📵 Phone numbers will NOT be shared
                        </div>
                        <p className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-amber-700 font-medium text-sm text-center">
                            Tap "Friend" again to confirm
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                            Are you sure you want to send a friend request?
                        </p>
                        <p className="bg-green-50 border border-green-300 rounded-xl p-3 text-green-700 font-medium text-sm text-center">
                            ✓ If they accept, you'll both see each other's email addresses!
                        </p>
                    </>
                )}

                <div className="flex gap-3 mt-6">
                    <button
                        className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl transition-all"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
                        onClick={handleConfirm}
                    >
                        {isFirstConfirmation && !confirmed ? 'Friend' : 'Confirm'}
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
