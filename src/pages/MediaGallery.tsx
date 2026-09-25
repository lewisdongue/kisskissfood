import React, { useState, useEffect } from 'react';
import { ParticleBackground } from "@/components/ParticleBackground";
import { useTranslation } from 'react-i18next';
import { X, Search, ArrowLeft, Eye, Smartphone, Monitor } from 'lucide-react';
import { Link } from '@/lib/router-compat';
import { caakusImages } from '../data/mediaImages';

const MediaGallery: React.FC = () => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<typeof caakusImages[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMedia = caakusImages.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.alt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <>
      <ParticleBackground />
      <div className="min-h-screen w-full overflow-x-hidden relative z-10">

      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/60 backdrop-blur-2xl shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center gap-3">
            <Link to="/" className="rounded-full p-2 hover:bg-white/10 transition-all group" aria-label={t('common.backToHome')}>
              <ArrowLeft className="h-5 w-5 text-white group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 rounded-xl blur-lg opacity-60"></div>
              <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shadow-2xl ring-2 ring-white/20 overflow-hidden">
                <img src="/logo.webp" alt={t('common.logoAlt')} className="w-8 h-8 object-contain" />
              </div>
            </div>
            <div className="ml-1">
              <h2 className="text-lg font-black bg-gradient-to-r from-blue-400 via-blue-300 to-indigo-400 bg-clip-text text-transparent">Caakus</h2>
              <p className="text-xs text-blue-200/70 font-medium">{t('mediaGallery.title')}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="relative overflow-hidden">
        <div className="relative container mx-auto px-4 pt-16 pb-10 text-center">
          <p className="inline-flex items-center gap-2 bg-blue-500/10 backdrop-blur-sm border border-blue-400/30 rounded-full px-3 py-1.5 mb-6">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-semibold text-blue-300">{t('mediaGallery.screenshots', { count: caakusImages.length })}</span>
          </p>
          <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
            {t('mediaGallery.platformShowcase')}
          </h2>
          <p className="text-blue-200/60 text-base max-w-2xl mx-auto leading-relaxed">
            {t('mediaGallery.platformShowcaseDesc')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-6">
        <div className="flex justify-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input
              type="text"
              placeholder={t('mediaGallery.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>
        <p className="text-white/20 text-xs mt-4 text-center">{t('mediaGallery.showing', { count: filteredMedia.length, total: caakusImages.length })}</p>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMedia.map((item, index) => (
            <div
              key={index}
              className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-blue-500/10"
              onClick={() => setSelectedImage(item)}
            >
              <div className="relative overflow-hidden bg-slate-900 aspect-video">
                <img
                  src={item.src}
                  alt={item.alt}
                  title={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <Eye size={20} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white/90 text-sm mb-1 line-clamp-1">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>

        {filteredMedia.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/30 text-lg">{t('mediaGallery.noResults')}</p>
          </div>
        )}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)} className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors">
              <X size={28} />
            </button>
            <div className="rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl">
              <img src={selectedImage.src} alt={selectedImage.alt} title={selectedImage.title} className="w-full h-auto max-h-[75vh] object-contain" />
              <div className="p-5 border-t border-white/10">
                <h3 className="text-lg font-bold text-white mb-1">{selectedImage.title}</h3>
                <p className="text-xs text-white/30 leading-relaxed">{selectedImage.alt}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-white/5">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white/80 mb-4">{t('mediaGallery.aboutCaakus')}</h2>
            <p className="text-white/30 text-sm leading-relaxed mb-4">
              {t('mediaGallery.aboutCaakusDesc')}
            </p>
            <p className="text-white/20 text-xs">English | Français | Deutsch | Español | हिंदी | Hausa</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default MediaGallery;
