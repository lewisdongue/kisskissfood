import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { updateUser } from '@/services/supabaseService';
import { getCroppedImgAsDataUrl } from '@/utils/cropImage';
import type { User } from '@/types';

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export interface ProfilePictureUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUserUpdate: (updates: Partial<User>) => void;
}

export const ProfilePictureUploadModal: React.FC<ProfilePictureUploadModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdate,
}) => {
  const { t } = useTranslation();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPx: Area) => {
    setCroppedAreaPixels(croppedAreaPx);
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t('common.imageTooLarge'));
      return;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(t('common.invalidImage'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleApplyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsSaving(true);
    try {
      const dataUrl = await getCroppedImgAsDataUrl(imageSrc, croppedAreaPixels);
      const success = await updateUser(user.id, { profile_picture: dataUrl });
      if (success) {
        onUserUpdate({ profile_picture: dataUrl });
        toast.success(t('common.settingsUpdated'));
        handleClose();
      } else {
        toast.error(t('common.settingsUpdateFailed'));
      }
    } catch (err) {
      console.error('Crop/save error:', err);
      toast.error(t('common.settingsUpdateError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePhoto = async () => {
    setIsSaving(true);
    try {
      const success = await updateUser(user.id, { profile_picture: '' });
      if (success) {
        onUserUpdate({ profile_picture: '' });
        toast.success(t('common.settingsUpdated'));
        handleClose();
      } else {
        toast.error(t('common.settingsUpdateFailed'));
      }
    } catch (err) {
      console.error('Remove photo error:', err);
      toast.error(t('common.settingsUpdateError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    onClose();
  };

  const hasCurrentPhoto = Boolean(user.profile_picture && user.profile_picture.trim());

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg overflow-hidden p-0 gap-0 bg-slate-900 border-white/10">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl text-white">
            <Camera className="h-5 w-5 text-blue-400" />
            {t('settings.profilePicture')}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {!imageSrc ? (
            <>
              <p className="text-sm text-blue-200/80">{t('settings.profilePictureCropHint')}</p>
              <input
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                onChange={handleFileSelect}
                className="hidden"
                id="profile-picture-file-input"
              />
              <label
                htmlFor="profile-picture-file-input"
                className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-8 cursor-pointer hover:bg-white/10 hover:border-blue-500/50 transition-colors"
              >
                <Camera className="h-12 w-12 text-blue-400" />
                <span className="text-sm font-medium text-white">{t('settings.chooseImage')}</span>
                <span className="text-xs text-blue-200/70">{t('settings.profilePictureHint')}</span>
              </label>
            </>
          ) : (
            <>
              <div className="relative h-[320px] w-full rounded-xl overflow-hidden bg-slate-800">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  style={{ containerStyle: { backgroundColor: 'rgb(30 41 59)' } }}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-200/70">{t('settings.zoom')}</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 h-2 rounded-lg appearance-none bg-white/10 accent-blue-500"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={handleApplyCrop}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span className="ml-2">{t('settings.applyCrop')}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setImageSrc(null)}
                  className="border-white/20 text-blue-200 hover:bg-white/10"
                >
                  {t('settings.chooseDifferent')}
                </Button>
              </div>
            </>
          )}

          {hasCurrentPhoto && !imageSrc && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemovePhoto}
              disabled={isSaving}
              className="w-full border-red-500/40 text-red-300 hover:bg-red-500/20"
            >
              {t('settings.removePhoto')}
            </Button>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={handleClose} className="text-blue-200 hover:text-white">
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
