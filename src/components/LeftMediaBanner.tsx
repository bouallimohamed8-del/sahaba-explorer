/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExternalLink, Sparkles, Volume2, Film, Image as ImageIcon, Code, Landmark } from 'lucide-react';

export interface BannerConfig {
  id: string;
  enabled: boolean;
  type: 'image' | 'video' | 'youtube' | 'text' | 'html';
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  mediaUrl: string;
  linkUrl: string;
  htmlContent: string;
}

interface LeftMediaBannerProps {
  config: BannerConfig;
  isArabic: boolean;
  isDarkMode?: boolean;
}

export default function LeftMediaBanner({ config, isArabic, isDarkMode = true }: LeftMediaBannerProps) {
  if (!config || !config.enabled) return null;

  const title = isArabic ? config.titleAr : config.titleEn;
  const content = isArabic ? config.contentAr : config.contentEn;

  // Helper to extract YouTube ID
  const getYouTubeId = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  const renderMedia = () => {
    switch (config.type) {
      case 'video':
        return (
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
            <video
              src={config.mediaUrl}
              controls
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-auto object-cover max-h-[220px]"
            />
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[9px] text-cyan-400 font-mono flex items-center gap-1">
              <Film className="w-3 h-3 text-cyan-400" />
              <span>VIDEO</span>
            </div>
          </div>
        );

      case 'youtube':
        const ytId = getYouTubeId(config.mediaUrl);
        if (!ytId) {
          return (
            <div className="p-4 bg-slate-950 rounded-2xl text-center text-[10px] text-slate-500 border border-slate-850">
              Invalid YouTube URL
            </div>
          );
        }
        return (
          <div className="relative pb-[56.25%] h-0 rounded-2xl overflow-hidden border border-slate-850 bg-slate-950 shadow-inner">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=0&mute=1`}
              className="absolute top-0 left-0 w-full h-full"
              allowFullScreen
              title="YouTube banner player"
            />
          </div>
        );

      case 'html':
        return (
          <div 
            className="custom-banner-embed rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200"
            dangerouslySetInnerHTML={{ __html: config.htmlContent }}
          />
        );

      case 'image':
      default:
        if (!config.mediaUrl) return null;
        return (
          <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/60 shadow-md">
            {config.linkUrl ? (
              <a href={config.linkUrl} target="_blank" rel="noopener noreferrer" className="block relative overflow-hidden">
                <img
                  src={config.mediaUrl}
                  alt={title}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover max-h-[240px] group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                <div className="absolute bottom-2.5 right-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 p-1.5 rounded-full shadow-md transition-all scale-90 group-hover:scale-100 flex items-center justify-center">
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>
            ) : (
              <div className="relative overflow-hidden">
                <img
                  src={config.mediaUrl}
                  alt={title}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover max-h-[240px]"
                />
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div 
      className={`p-4 border rounded-3xl space-y-4 shadow-xl relative overflow-hidden transition-all duration-300 ${
        isDarkMode 
          ? 'bg-natural-dark-panel border-neutral-800 text-slate-100' 
          : 'bg-[#FDFBF7] border-natural-accent/25 text-natural-text'
      }`}
    >
      {/* Decorative medieval arch corner light */}
      <div className="absolute -left-12 -top-12 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

      {/* Header bar of the banner */}
      <div className="flex items-center justify-between border-b pb-2 border-slate-800/40">
        <div className="flex items-center gap-1.5 min-w-0">
          <Landmark className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-[10px] font-bold tracking-wider text-amber-500 uppercase font-serif truncate">
            {isArabic ? 'رواق السيرة والوسائط' : 'BIOGRAPHICAL PRESS'}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-mono text-emerald-500 uppercase">{isArabic ? 'مباشر' : 'Live'}</span>
        </div>
      </div>

      {/* Main rich media element */}
      {renderMedia()}

      {/* Banner descriptive details */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-serif font-bold text-natural-brand leading-snug flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="hover:text-natural-accent transition">{title}</span>
        </h4>
        <p className="text-[11px] leading-relaxed text-slate-400 font-sans">
          {content}
        </p>
      </div>

      {/* Action link if configured and not already wrapping the image */}
      {config.linkUrl && config.type !== 'image' && (
        <a
          href={config.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold py-2 px-3 rounded-xl transition text-[10px] flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>{isArabic ? 'تصفح التفاصيل والخرائط' : 'Explore Chronicles'}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
