import { useNavigate } from '@/lib/router-compat';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { SettingsPage } from './Settings';
import { CausticsBackground } from '@/components/CausticsBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogIn, ArrowLeft } from 'lucide-react';

export default function SettingsWrapper() {
    const { t } = useTranslation();
    const { user, loading, updateUserData } = useAuth();
    const navigate = useNavigate();
    const authedUser = user && !('isGuest' in user) ? user : null;

    // Preserve the page surface while auth resolves; never replace it with a branded splash.
    if (loading) {
        return <div className="min-h-screen bg-background" aria-hidden />;
    }

    // Show login required message if user is not authenticated
    if (!authedUser) {
        return (
            <>
                <CausticsBackground />
                <div className="min-h-screen w-full overflow-x-hidden relative z-10">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-black/60 backdrop-blur-xl border-b border-white/10">
                        <div className="container mx-auto px-4 py-4">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate('/')}
                                    className="h-10 w-10 p-0 rounded-full hover:bg-slate-800 text-white"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold text-white">{t('settingsWrapper.profileSettings')}</h1>
                                    <p className="text-sm text-slate-400">{t('settingsWrapper.managePreferences')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Login Required Content */}
                    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
                        <Card className="max-w-md w-full shadow-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl">
                            <CardContent className="text-center p-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <LogIn className="h-8 w-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-4">
                                    {t('settingsWrapper.loginRequired')}
                                </h2>
                                <p className="text-slate-400 mb-6">
                                    {t('settingsWrapper.loginRequiredDesc')}
                                </p>
                                <div className="space-y-3">
                                    <Button
                                        onClick={() => navigate('/')}
                                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all rounded-xl font-medium"
                                    >
                                        {t('settingsWrapper.goHomeLogin')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate(-1)}
                                        className="w-full h-12 rounded-xl border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                                    >
                                        {t('settingsWrapper.goBack')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </>
        );
    }

    // Render the settings page if user is authenticated
    return <SettingsPage user={authedUser} onUserUpdate={updateUserData} />;
}