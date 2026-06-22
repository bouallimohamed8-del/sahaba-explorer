/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
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
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Tracking mouse movement for lighting and 3D tilt
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
  }, []);

  const cat = CATEGORY_CONFIG[comp.category] || CATEGORY_CONFIG.Other;
  const initialWatermark = comp.nameAr?.trim().replace(/^ال/, '').charAt(0) || '';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    
    // Mouse coords relative to the card container
    const x = e.clientX - left;
    const y = e.clientY - top;
    setCoords({ x, y });

    if (isReducedMotion) return;

    // Calculate normalized position between -1 and 1
    const normalizedX = (x / width) * 2 - 1; // -1 on left, 1 on right
    const normalizedY = (y / height) * 2 - 1; // -1 on top, 1 on bottom

    // Tilt limits: maximum pitch/yaw of 6 degrees
    const maxTilt = 5;
    setTilt({
      x: -normalizedY * maxTilt, // pitch (around X-axis)
      y: normalizedX * maxTilt  // yaw (around Y-axis)
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const currentTransform = isReducedMotion
    ? 'none'
    : `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translate3d(0, ${isHovered ? '-4px' : '0px'}, 0)`;

  // Glowing light color scheme in sync with light/dark mode and green/gold theme
  const lightColor = isDarkMode 
    ? 'rgba(217, 167, 82, 0.08)' // Noble Gold overlay
    : 'rgba(16, 185, 129, 0.08)'; // Radiant Green overlay

  const glowStyle: React.CSSProperties = isHovered ? {
    background: `radial-gradient(280px circle at ${coords.x}px ${coords.y}px, ${lightColor}, transparent 80%)`
  } : {};

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: currentTransform,
        transition: isHovered 
          ? 'transform 0.05s ease-out, box-shadow 0.3s ease'
          : 'transform 0.4s ease, box-shadow 0.4s ease',
      }}
      className={`group p-6 rounded-2xl border flex flex-col justify-between cursor-pointer relative overflow-hidden shadow transition-all duration-300 h-72 ${
        isSelected
          ? 'bg-[#06221A] border-[#D9A752] text-white ring-1 ring-[#D9A752]/20 shadow-lg shadow-emerald-950/40'
          : 'bg-[#06221A] border-emerald-950 hover:bg-[#07271E] text-slate-100 hover:border-emerald-800/40 hover:shadow-xl hover:shadow-emerald-950/20'
      }`}
    >
      {/* Dynamic Cursor Light Overlay */}
      {isHovered && (
        <div 
          className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-300"
          style={glowStyle}
        />
      )}

      {/* Category top line marker */}
      <div className="absolute top-0 left-0 right-0 h-1.5 z-10" style={{ backgroundColor: cat.color }} />

      {/* Large authentic initial Arabic calligraphy watermark background */}
      <div 
        className="absolute -top-3 right-4 text-[13rem] font-serif font-black select-none pointer-events-none transition-all duration-500 z-0 text-[#D9A752]/[0.05]"
        style={{
          transform: isReducedMotion ? 'none' : `translate3d(${tilt.y * -1.5}px, ${tilt.x * -1.5}px, -20px)`,
          opacity: isSelected ? 0.08 : isHovered ? 0.08 : 0.04
        }}
      >
        {initialWatermark}
      </div>

      {/* Bookmark favorite absolute trigger */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onFavoriteToggle(comp.id);
        }}
        className="absolute top-5 left-5 p-1.5 z-30 transition hover:scale-115 active:scale-90 bg-emerald-900/10 hover:bg-emerald-900/35 rounded-full border border-transparent hover:border-emerald-800/20"
        title="Add to Favorites"
      >
        <Heart 
          className={`w-3.5 h-3.5 transition-colors ${
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
        <span className="text-[#D9A752] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
          {isArabic ? 'تصفح السيرة' : 'View Seerah'} &rarr;
        </span>
      </div>
    </div>
  );
}
