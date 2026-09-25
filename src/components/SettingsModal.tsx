import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { VerifiedAvatarWrapper, shouldShowVerifiedBadge } from '@/components/VerifiedBadge';
import {
    User as UserIcon,
    Camera,
    Save,
    X,
    Eye,
    EyeOff,
    Globe,
    MapPin,
    Star,
    DollarSign,
    Gift,
    Calendar,
    Mail
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { LANGUAGES, type User } from '../types';
import { updateUser } from '../services/supabaseService';
import { ProfilePictureUploadModal } from './ProfilePictureUploadModal';

const LANGUAGE_STORAGE_KEY = 'audioChat_language';

interface SettingsModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onUserUpdate: (updates: Partial<User>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    user,
    isOpen,
    onClose,
    onUserUpdate
}) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: user.name,
        country: user.country,
        language: user.language,
        hide_picture: user.hide_picture
    });
    const [isLoading, setIsLoading] = useState(false);
    const [profilePictureModalOpen, setProfilePictureModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: user.name,
                country: user.country,
                language: user.language,
                hide_picture: user.hide_picture
            });
        }
    }, [isOpen, user]);

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Validate required fields
            if (!formData.name.trim()) {
                toast.error(t('settingsModal.nameRequired'));
                return;
            }

            if (!formData.country.trim()) {
                toast.error(t('settingsModal.countryRequired'));
                return;
            }

            // Update user data (profile picture is updated via ProfilePictureUploadModal)
            const updates = {
                name: formData.name.trim(),
                country: formData.country.trim(),
                language: formData.language,
                hide_picture: formData.hide_picture
            };

            const success = await updateUser(user.id, updates);

            if (success) {
                onUserUpdate(updates);
                // Persist language so it stays when navigating between pages
                if (updates.language) {
                    i18n.changeLanguage(updates.language);
                    try {
                        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, updates.language);
                    } catch {
                        // ignore
                    }
                }
                toast.success('Settings updated successfully!');
                onClose();
            } else {
                toast.error(t('settingsModal.updateFailed'));
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error(t('settingsModal.updateError'));
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <UserIcon className="h-5 w-5" />
                        {t('settingsModal.title')}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Profile Picture Section – same crop modal as Settings page */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Camera className="h-4 w-4" />
                                {t('settingsModal.profilePicture')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <VerifiedAvatarWrapper
                                        isVerified={shouldShowVerifiedBadge(user)}
                                        subscriptionType={user.subscription_type}
                                        size="xl"
                                    >
                                        <Avatar className="h-20 w-20">
                                            <AvatarImage
                                                src={user.profile_picture || ''}
                                                alt={formData.name}
                                            />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg font-semibold">
                                                {formData.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </VerifiedAvatarWrapper>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Button
                                        type="button"
                                        variant="default"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                        onClick={() => setProfilePictureModalOpen(true)}
                                    >
                                        <Camera className="h-4 w-4" />
                                        {user.profile_picture ? t('settings.changePhoto') : t('settingsModal.uploadPhoto')}
                                    </Button>
                                    <p className="text-xs text-gray-500">
                                        {t('settingsModal.maxSize')}
                                    </p>
                                </div>
                            </div>
                            <ProfilePictureUploadModal
                                isOpen={profilePictureModalOpen}
                                onClose={() => setProfilePictureModalOpen(false)}
                                user={user}
                                onUserUpdate={onUserUpdate}
                            />

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="hide-picture"
                                    checked={formData.hide_picture}
                                    onChange={(e) => handleInputChange('hide_picture', e.target.checked)}
                                    className="rounded"
                                />
                                <Label htmlFor="hide-picture" className="flex items-center gap-2 text-sm">
                                    {formData.hide_picture ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    {t('settingsModal.hideProfilePic')}
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <UserIcon className="h-4 w-4" />
                                {t('settingsModal.personalInfo')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">{t('settingsModal.displayName')}</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder={t('settingsModal.enterDisplayName')}
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">{t('settingsModal.emailAddress')}</Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            value={user.email}
                                            disabled
                                            className="h-11 bg-gray-100 dark:bg-gray-800 text-gray-500"
                                        />
                                        <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>
                                    <p className="text-xs text-gray-500">{t('settingsModal.emailCannotChange')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="country">{t('settingsModal.country')}</Label>
                                    <div className="relative">
                                        <Input
                                            id="country"
                                            value={formData.country}
                                            onChange={(e) => handleInputChange('country', e.target.value)}
                                            placeholder={t('settingsModal.enterCountry')}
                                            className="h-11 pl-10"
                                        />
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="language">{t('settingsModal.language')}</Label>
                                    <Select
                                        value={formData.language}
                                        onValueChange={(value) => handleInputChange('language', value)}
                                    >
                                        <SelectTrigger className="h-11">
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-gray-400" />
                                                <SelectValue placeholder={t('settingsModal.selectLanguage')} />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LANGUAGES.map((lang) => (
                                                <SelectItem key={lang.code} value={lang.code}>
                                                    {lang.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Star className="h-4 w-4" />
                                {t('settingsModal.accountStats')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Star className="h-4 w-4 text-yellow-500" />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('settingsModal.yuyuCoins')}</span>
                                    </div>
                                    <div className="text-xl font-bold text-blue-600">{user.yuyu_score.toLocaleString()}</div>
                                </div>

                                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <DollarSign className="h-4 w-4 text-green-500" />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('settingsModal.balance')}</span>
                                    </div>
                                    <div className="text-xl font-bold text-green-600">${user.balance.toFixed(3)}</div>
                                </div>

                                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Gift className="h-4 w-4 text-purple-500" />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('settingsModal.referralCode')}</span>
                                    </div>
                                    <Badge variant="outline" className="text-purple-600 border-purple-200">
                                        {user.referral_code}
                                    </Badge>
                                </div>

                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('settingsModal.memberSince')}</span>
                                    </div>
                                    <div className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                        {formatDate(user.created_at)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    {t('settingsModal.saving')}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Save className="h-4 w-4" />
                                    {t('settingsModal.saveChanges')}
                                </div>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="h-11 px-6"
                        >
                            <X className="h-4 w-4 mr-2" />
                            {t('settingsModal.cancel')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};