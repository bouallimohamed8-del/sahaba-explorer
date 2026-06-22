/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart } from 'lucide-react';
import { Companion } from '../types';
import { CATEGORY_CONFIG } from './NetworkGraph';

interface InteractiveCompanionCardProps {
  key?: string;
  comp: Companion;
  isSelected: boolean;
  isFav: boolean;
  isArabic: boolean;
  onFavoriteToggle: (id: string) => void;
  onClick: () => void;
  isDarkMode?: boolean;
}

export default function InteractiveCompanionCard({
  comp,
  isSelected,
  isFav,
  isArabic,
  onFavoriteToggle,
  onClick,
  isDarkMode = true
}: InteractiveCompanionCardProps) {
  const cat = CATEGORY_CONFIG[comp.category] || CATEGORY_CONFIG.Other;
  const initialWatermark = comp.nameAr?.trim().replace(/^ال/, '').charAt(0) || '';

  return (
    <div
      onClick={onClick}
      className={`group p-6 rounded-2xl border flex flex-col justify-between cursor-pointer relative overflow-hidden transition-all duration-300 h-72 select-none ${
        isSelected
          ? 'bg-[#06221A] border-[#D9A752] text-white ring-1 ring-[#D9A752]/20 shadow-lg shadow-emerald-950/50 scale-[1.01]'
          : 'bg-[#06221A] border-emerald-950 hover:bg-[#07271E] text-slate-100 hover:border-emerald-600/30 hover:-translate-y-1 shadow hover:shadow-xl hover:shadow-emerald-950/30'
      }`}
    >
      {/* Category top line marker */}
      <div className="absolute top-0 left-0 right-0 h-1.5 z-10" style={{ backgroundColor: cat.color }} />

      {/* Large authentic initial Arabic calligraphy watermark background (Static, Elegant) */}
      <div 
        className={`absolute -top-3 right-4 text-[13rem] font-serif font-black select-none pointer-events-none transition-all duration-500 z-0 ${
          isSelected ? 'text-[#D9A752]/10' : 'text-[#D9A752]/[0.04] group-hover:text-[#D9A752]/[0.08] group-hover:scale-105'
        }`}
      >
        {initialWatermark}
      </div>

      {/* Bookmark favorite absolute trigger */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onFavoriteToggle(comp.id);
        }}
        className="absolute top-5 left-5 p-1.5 z-30 transition hover:scale-110 active:scale-90 bg-emerald-900/10 hover:bg-emerald-900/35 rounded-full border border-transparent hover:border-emerald-800/20"
        title="Add to Favorites"
      >
        <Heart 
          className={`w-3.5 h-3.5 transition-colors duration-200 ${
            isFav 
              ? 'text-red-500 fill-red-500 scale-110' 
              : 'text-slate-500 group-hover:text-amber-500'
          }`} 
        />
      </button>

      {/* Main card details block */}
      <div className="space-y-4 pt-2 relative z-10 select-none">
        
        {/* Card head tags */}
        <div className="flex justify-between items-center text-[10px] pl-6">
          <span className="px-2 py-0.5 rounded bg-[#031410] text-[#D9A752] border border-[#D9A752]/20 font-serif font-bold">
            {isArabic ? cat.labelAr : cat.labelEn}
          </span>
          <span className="font-mono text-emerald-500 font-bold">
            {comp.deathYearAH} AH ({comp.ageAtDeath} {isArabic ? 'سنة' : 'yrs'})
          </span>
        </div>

        {/* Names block */}
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-[#D9A752] font-serif tracking-wide group-hover:text-white transition-colors duration-300">
            {comp.nameAr}
          </h3>
          <p className="text-xs text-white font-serif font-bold tracking-tight">
            {comp.nameEn}
          </p>
          <p className="text-[10px] text-slate-400 font-mono italic">
            {isArabic ? comp.kunyaAr : comp.kunyaEn} &bull; {isArabic ? comp.tribeAr : comp.tribeEn}
          </p>
        </div>

        {/* Short seerah excerpt */}
        <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-light">
          {isArabic ? comp.shortBioAr : comp.shortBioEn}
        </p>
      </div>

      {/* Footer stats line */}
      <div className="border-t border-emerald-900/20 pt-3 mt-4 flex justify-between items-center text-[11px] text-slate-400 relative z-10 font-mono">
        <span>📚 {comp.hadithCount} narrations</span>
        <span className="text-[#D9A752] font-bold group-hover:translate-x-1.5 transition-all duration-300 flex items-center gap-1">
          {isArabic ? 'تصفح السيرة' : 'View Seerah'} &rarr;
        </span>
      </div>
    </div>
  );
}
