/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Companion, Relationship, CompanionCategory, RelationshipType } from '../types';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Orbit, 
  Compass, 
  HelpCircle, 
  Layers, 
  Calendar, 
  Sparkles, 
  Eye, 
  Info, 
  Play, 
  Pause, 
  Maximize2 
} from 'lucide-react';

interface NetworkGraphProps {
  companions: Companion[];
  relationships: Relationship[];
  selectedCompanion: Companion | null;
  onSelectCompanion: (companion: Companion) => void;
  hoveredCompanion: Companion | null;
  onHoverCompanion: (companion: Companion | null) => void;
  isArabic: boolean;
  highlightedPath: string[] | null;
  isDarkMode?: boolean;
}

// Category design parameters
export const CATEGORY_CONFIG: Record<CompanionCategory, { color: string; bgClass: string; textClass: string; labelAr: string; labelEn: string }> = {
  Khulafa_Rashidun: {
    color: '#D4AF37', // Pure Gold
    bgClass: 'bg-amber-500/15 border-amber-400',
    textClass: 'text-amber-500',
    labelAr: 'الخلفاء الراشدون',
    labelEn: 'Khulafa al-Rashidun'
  },
  Ahl_al_Bayt: {
    color: '#10B981', // Emerald
    bgClass: 'bg-emerald-500/15 border-emerald-400',
    textClass: 'text-emerald-500',
    labelAr: 'آل البيت الأطهار',
    labelEn: 'Ahl al-Bayt'
  },
  Muhajirun: {
    color: '#3B82F6', // Celestial blue
    bgClass: 'bg-blue-500/15 border-blue-400',
    textClass: 'text-blue-500',
    labelAr: 'المهاجرون',
    labelEn: 'Muhajirun'
  },
  Ansar: {
    color: '#22C55E', // Islamic green
    bgClass: 'bg-green-500/15 border-green-400',
    textClass: 'text-green-500',
    labelAr: 'الأنصار',
    labelEn: 'Ansar'
  },
  Wives: {
    color: '#EC4899', // Elegant pink
    bgClass: 'bg-pink-500/15 border-pink-400',
    textClass: 'text-pink-500',
    labelAr: 'أمهات المؤمنين',
    labelEn: 'Wives of the Prophet ﷺ'
  },
  Hadith_Narrators: {
    color: '#8B5CF6', // Royal purple
    bgClass: 'bg-violet-500/15 border-violet-400',
    textClass: 'text-violet-500',
    labelAr: 'رواة الحديث الحفاظ',
    labelEn: 'Hadith Narrators'
  },
  Military: {
    color: '#EF4444', // Crimson red
    bgClass: 'bg-red-500/15 border-red-400',
    textClass: 'text-red-500',
    labelAr: 'القادة الفاتحون',
    labelEn: 'Military Commanders'
  },
  Scholars: {
    color: '#06B6D4', // Indigo cyan
    bgClass: 'bg-cyan-500/15 border-cyan-400',
    textClass: 'text-cyan-500',
    labelAr: 'العلماء والفقهاء',
    labelEn: 'Scholars'
  },
  Other: {
    color: '#71717A', // Warm slate
    bgClass: 'bg-zinc-500/15 border-zinc-400',
    textClass: 'text-zinc-500',
    labelAr: 'صحابة آخرون',
    labelEn: 'Other Sahaba'
  }
};

// Relation aesthetic mappings
export const RELATION_CONFIG: Record<RelationshipType, { color: string; dash?: string; labelAr: string; labelEn: string; icon: string }> = {
  family: {
    color: '#F59E0B', 
    dash: 'none',
    labelAr: 'قرابة ونسب عائلي',
    labelEn: 'Family relationship',
    icon: '👥'
  },
  marriage: {
    color: '#EC4899', 
    dash: '4,4',
    labelAr: 'رابطة صهر ومصاهرة',
    labelEn: 'Marriage connection',
    icon: '💍'
  },
  teacher_student: {
    color: '#06B6D4', 
    dash: 'none',
    labelAr: 'رواية علم وتلمذة',
    labelEn: 'Teacher & Student',
    icon: '📜'
  },
  friendship: {
    color: '#3B82F6', 
    dash: '2,2',
    labelAr: 'أخوة ومؤاخاة الإسلام',
    labelEn: 'Brotherhood / Companionship',
    icon: '🤝'
  },
  hijra_partner: {
    color: '#10B981', 
    dash: '6,3',
    labelAr: 'رفقة الهجرة والبيعة',
    labelEn: 'Hijra Migration Partner',
    icon: '🐪'
  },
  battle_comrade: {
    color: '#EF4444', 
    dash: 'none',
    labelAr: 'رفقة الغزو والجهاد',
    labelEn: 'Battle Comrade',
    icon: '⚔️'
  },
  political: {
    color: '#8B5CF6', 
    dash: '5,5',
    labelAr: 'شورى وإمارة وخلافة',
    labelEn: 'Alliance / Shura Council',
    icon: '🏛️'
  },
  hadith_transmission: {
    color: '#F97316', 
    dash: '1,3',
    labelAr: 'إسناد ونقل مرويات',
    labelEn: 'Hadith Transmission Chain',
    icon: '✍️'
  }
};

export default function NetworkGraph({
  companions,
  relationships,
  selectedCompanion,
  onSelectCompanion,
  hoveredCompanion,
  onHoverCompanion,
  isArabic,
  highlightedPath,
  isDarkMode = false
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 3D Matrix Projection Angles (Pitch = Tilt X, Yaw = Spin Y)
  const [pitch, setPitch] = useState<number>(0.55); // Default ~31 degrees tilt
  const [yaw, setYaw] = useState<number>(0.25);   // Default rotation
  const [zoom, setZoom] = useState<number>(1.05);

  // Layout selection: 'dome' | 'tiers' | 'helix'
  const [layout, setLayout] = useState<'dome' | 'tiers' | 'helix'>('dome');
  
  // Interactive Controls state
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [isAutoSpinning, setIsAutoSpinning] = useState<boolean>(true);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(true);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);
  const [hoveredCategoryKey, setHoveredCategoryKey] = useState<string | null>(null);

  // Reference for dragging rotational state
  const dragStartMouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartAngles = useRef<{ pitch: number; yaw: number }>({ pitch: 0.55, yaw: 0.25 });

  // Slow orbital continuous rotation effect
  useEffect(() => {
    if (!isAutoSpinning || isPanning) return;
    const interval = setInterval(() => {
      setYaw(prev => (prev + 0.003) % (2 * Math.PI));
    }, 20); // Smooth fluid rotations
    return () => clearInterval(interval);
  }, [isAutoSpinning, isPanning]);

  // Center view on selected companion node triggers
  useEffect(() => {
    if (selectedCompanion) {
      setIsAutoSpinning(false); // Pause so they can read and navigate relations
    }
  }, [selectedCompanion]);

  // 3D coordinates system calculations (Calculates raw X, Y, Z coordinates depending on active layout mode)
  const relativeCoordinates = useMemo(() => {
    const coords: Record<string, { x: number; y: number; z: number }> = {};
    const total = companions.length;

    if (layout === 'dome') {
      // 1. DOME OF LUMINARIES (Spherical coordinates hemisphere distribution sorted by group)
      const sorted = [...companions].sort((a, b) => a.category.localeCompare(b.category));
      
      sorted.forEach((companion, idx) => {
        // Map as a layered golden dome
        const angle = idx * 2.39996; // Golden Angle spacing
        const radius = 230 * Math.sqrt((idx + 0.6) / total); // Uniform area density
        
        // Circular coordinates in X-Z plane
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        
        // Domical curvature: Hemispherical projection (negative Y is upward on screen)
        const domeHeight = 240;
        const sphericalY = -Math.sqrt(Math.max(0, domeHeight * domeHeight - x * x - z * z)) * 0.7;
        
        coords[companion.id] = { x, y: sphericalY, z };
      });

    } else if (layout === 'tiers') {
      // 2. CONCENTRIC ASTROLABE TIERS (Divided horizontally based on historical roles)
      const tier3 = companions.filter(c => ['Khulafa_Rashidun', 'Ahl_al_Bayt', 'Wives'].includes(c.category));
      const tier2 = companions.filter(c => ['Muhajirun', 'Ansar'].includes(c.category));
      const tier1 = companions.filter(c => !['Khulafa_Rashidun', 'Ahl_al_Bayt', 'Wives', 'Muhajirun', 'Ansar'].includes(c.category));

      const assignTier = (comps: Companion[], height: number, outerRadius: number) => {
        const len = comps.length;
        comps.forEach((comp, idx) => {
          // Space evenly around the ring
          const angle = (idx / (len || 1)) * 2 * Math.PI;
          coords[comp.id] = {
            x: outerRadius * Math.cos(angle),
            y: height,
            z: outerRadius * Math.sin(angle)
          };
        });
      };

      // Plot the 3 dynamic heights
      assignTier(tier3, -110, 120); // Top golden tier (closer to focus)
      assignTier(tier2, 0, 200);   // Middle structural tier
      assignTier(tier1, 110, 275);  // Bottom foundation scholars and narrative conveyers

    } else if (layout === 'helix') {
      // 3. GREAT TEMPORAL HELIX SPIRAL (Sorted chronologically by deathYearAH)
      const sortedChronological = [...companions].sort((a, b) => {
        // Fallback default years if missing to prevent alignment collapses
        const yearA = a.deathYearAH !== undefined ? a.deathYearAH : 50;
        const yearB = b.deathYearAH !== undefined ? b.deathYearAH : 50;
        return yearA - yearB;
      });

      sortedChronological.forEach((companion, idx) => {
        const progress = idx / (total || 1);
        const angle = idx * 0.42; // Spiral spacing pitch winding around center
        const radius = 90 + progress * 160; // Slightly funneling outward
        
        // Generate winding spiral coordinates up the axis
        coords[companion.id] = {
          x: radius * Math.cos(angle),
          y: -140 + progress * 280, // Winding vertically from top (early death) down to base (late death)
          z: radius * Math.sin(angle)
        };
      });
    }

    return coords;
  }, [companions, layout]);

  // Combined projection transform (Projects dynamic 3D coords onto 2D viewport coordinates)
  const projectedData = useMemo(() => {
    const center = { x: 400, y: 260 };
    const list: Record<string, { id: string; screenX: number; screenY: number; zDepth: number }> = {};

    Object.entries(relativeCoordinates).forEach(([id, coordVal]) => {
      const coord = coordVal as { x: number; y: number; z: number };
      // 3D rotation matrix around Y-axis (Yaw)
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const xRotated = coord.x * cosY - coord.z * sinY;
      const zRotated = coord.x * sinY + coord.z * cosY;

      // 3D rotation matrix around X-axis (Pitch)
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const yRotated = coord.y * cosP - zRotated * sinP;
      const zDepth = coord.y * sinP + zRotated * cosP;

      // Camera focal projection distance model
      const cameraDistance = 720;
      const perspectiveScale = cameraDistance / (cameraDistance + zDepth);

      list[id] = {
        id,
        screenX: center.x + xRotated * perspectiveScale * zoom,
        screenY: center.y + yRotated * perspectiveScale * zoom,
        zDepth
      };
    });

    return list;
  }, [relativeCoordinates, yaw, pitch, zoom]);

  // Project mathematical wireframe auxiliary orbits dynamically in 3D based on visual layout
  const projectedAstrolabeRings = useMemo(() => {
    const center = { x: 400, y: 260 };
    const cameraDistance = 720;

    const projectPoint3D = (x: number, y: number, z: number) => {
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const xRot = x * cosY - z * sinY;
      const zRot = x * sinY + z * cosY;

      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const yRot = y * cosP - zRot * sinP;
      const zDepth = y * sinP + zRot * cosP;

      const scale = cameraDistance / (cameraDistance + zDepth);
      return {
        x: center.x + xRot * scale * zoom,
        y: center.y + yRot * scale * zoom,
        zDepth
      };
    };

    const ringsPaths: { path: string; labelAr: string; labelEn: string; color: string; style: 'solid' | 'dashed' }[] = [];

    if (layout === 'tiers') {
      // Draw 3 dynamic concentric tier tracks
      const tiersParams = [
        { h: -110, r: 120, labelAr: 'الفلك الأعلى (الآل والخلفاء)', labelEn: 'Upper Tier: Family & Caliphs', color: '#D4AF37' },
        { h: 0, r: 200, labelAr: 'المحيط الأوسط (المهاجرون والأنصار)', labelEn: 'Mid Tier: Migrators & Supporters', color: '#3B82F6' },
        { h: 110, r: 275, labelAr: 'أفق السند والحديث والعلوم', labelEn: 'Base Tier: Narrators & Jurists', color: '#8B5CF6' }
      ];

      tiersParams.forEach(t => {
        let pathString = '';
        const pointsCount = 48;
        for (let i = 0; i <= pointsCount; i++) {
          const angle = (i / pointsCount) * 2 * Math.PI;
          const x = t.r * Math.cos(angle);
          const z = t.r * Math.sin(angle);
          const pt = projectPoint3D(x, t.h, z);
          
          if (i === 0) pathString += `M ${pt.x} ${pt.y}`;
          else pathString += ` L ${pt.x} ${pt.y}`;
        }
        ringsPaths.push({
          path: pathString,
          labelAr: t.labelAr,
          labelEn: t.labelEn,
          color: t.color,
          style: 'solid'
        });
      });

    } else if (layout === 'dome') {
      // Draw concentric circular orbits detailing latitude parallel bounds on dome of Sahaba
      const heights = [-180, -115, -45, 0];
      const radii = [135, 195, 230, 240];

      radii.forEach((r, idx) => {
        const h = heights[idx];
        let pathString = '';
        const pointsCount = 42;
        for (let i = 0; i <= pointsCount; i++) {
          const angle = (i / pointsCount) * 2 * Math.PI;
          const x = r * Math.cos(angle);
          const z = r * Math.sin(angle);
          const pt = projectPoint3D(x, h, z);
          
          if (i === 0) pathString += `M ${pt.x} ${pt.y}`;
          else pathString += ` L ${pt.x} ${pt.y}`;
        }
        ringsPaths.push({
          path: pathString,
          labelAr: isArabic ? `المدار الفلكي ${idx + 1}` : `Celestial Orbit Ring ${idx + 1}`,
          labelEn: `Orbital Ring ${idx + 1}`,
          color: '#CFC5AD',
          style: 'dashed'
        });
      });

      // Longitude cross meridian arches
      for (let angleFactor = 0; angleFactor < 4; angleFactor++) {
        const phiAngle = (angleFactor / 4) * Math.PI;
        let pathString = '';
        const stepCount = 20;
        for (let j = 0; j <= stepCount; j++) {
          const progress = (j / stepCount) * Math.PI - Math.PI / 2; // sweep hemisphere
          const r = 230 * Math.cos(progress);
          const y = -230 * Math.sin(progress) * 0.55;
          const x = r * Math.cos(phiAngle);
          const z = r * Math.sin(phiAngle);
          const pt = projectPoint3D(x, y, z);

          if (j === 0) pathString += `M ${pt.x} ${pt.y}`;
          else pathString += ` L ${pt.x} ${pt.y}`;
        }
        ringsPaths.push({
          path: pathString,
          labelAr: '',
          labelEn: '',
          color: '#CFC5AD',
          style: 'dashed'
        });
      }

    } else if (layout === 'helix') {
      // Continuous spiral baseline ribbon matching chronological flow of historical souls
      let pathString = '';
      const totalSteps = 80;
      for (let i = 0; i <= totalSteps; i++) {
        const progress = i / totalSteps;
        const angle = progress * totalSteps * 0.42 * (totalSteps / 80);
        const radius = 90 + progress * 160;
        const y = -140 + progress * 280;
        
        const pt = projectPoint3D(radius * Math.cos(angle), y, radius * Math.sin(angle));
        
        if (i === 0) pathString += `M ${pt.x} ${pt.y}`;
        else pathString += ` L ${pt.x} ${pt.y}`;
      }
      ringsPaths.push({
        path: pathString,
        labelAr: 'خط تواتر الأثر الزمني',
        labelEn: 'Time Spiral Chronological Ribbon',
        color: '#D4AF37',
        style: 'solid'
      });
    }

    return ringsPaths;
  }, [pitch, yaw, zoom, layout, isArabic]);

  // Compute node relationship matches or dimming parameters in active 3D view
  const nodeStates = useMemo(() => {
    const states: Record<string, { isSelected: boolean; isHovered: boolean; isConnected: boolean; isPath: boolean; shouldDim: boolean }> = {};

    companions.forEach(c => {
      const isSel = selectedCompanion?.id === c.id;
      const isHov = hoveredCompanion?.id === c.id;
      
      const categoryMatches = !selectedCategoryKey || c.category === selectedCategoryKey;
      const hoverCategoryMatches = !hoveredCategoryKey || c.category === hoveredCategoryKey;
      
      let isPath = highlightedPath?.includes(c.id) || false;

      // Determine connections from links
      let isConnected = false;
      if (hoveredCompanion) {
        isConnected = relationships.some(r => 
          (r.sourceId === hoveredCompanion.id && r.targetId === c.id) ||
          (r.targetId === hoveredCompanion.id && r.sourceId === c.id)
        );
      } else if (selectedCompanion) {
        isConnected = relationships.some(r => 
          (r.sourceId === selectedCompanion.id && r.targetId === c.id) ||
          (r.targetId === selectedCompanion.id && r.sourceId === c.id)
        );
      }

      // Dim criteria
      let shouldDim = false;
      if (selectedCompanion && !isSel && !isConnected && !isPath) {
        shouldDim = true;
      } else if (hoveredCompanion && !isHov && !isConnected) {
        shouldDim = true;
      } else if (selectedCategoryKey && !categoryMatches) {
        shouldDim = true;
      } else if (hoveredCategoryKey && !hoverCategoryMatches) {
        shouldDim = true;
      }

      states[c.id] = {
        isSelected: isSel,
        isHovered: isHov,
        isConnected,
        isPath,
        shouldDim
      };
    });

    return states;
  }, [companions, relationships, selectedCompanion, hoveredCompanion, highlightedPath, selectedCategoryKey, hoveredCategoryKey]);

  // Compile map categories node count dictionary
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    companions.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [companions]);

  // Trackball/Coordinates rotation handlers on dragging canvas workspace
  const handleMouseDown = (e: React.MouseEvent) => {
    // Start canvas-wide dragging orbit rotation
    setIsPanning(true);
    dragStartMouse.current = { x: e.clientX, y: e.clientY };
    dragStartAngles.current = { pitch, yaw };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    
    const deltaX = e.clientX - dragStartMouse.current.x;
    const deltaY = e.clientY - dragStartMouse.current.y;

    // Convert pixels drag delta to radial angle adjustments
    const speed = 0.006;
    let newYaw = dragStartAngles.current.yaw - deltaX * speed;
    let newPitch = dragStartAngles.current.pitch + deltaY * speed;

    // Clamp pitch to prevent extreme upside down flips
    newPitch = Math.max(-1.1, Math.min(1.4, newPitch));

    setYaw(newYaw);
    setPitch(newPitch);
  };

  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
  };

  // Depth-sorting all elements prior to drawing ensures correct visual overlays
  const sortedDrawOrder = useMemo(() => {
    const list: { type: 'node'; id: string; zDepth: number; companion: Companion }[] = [];
    
    companions.forEach(c => {
      const proj = projectedData[c.id];
      if (proj) {
        list.push({
          type: 'node',
          id: c.id,
          zDepth: proj.zDepth,
          companion: c
        });
      }
    });

    // Sort descending by zDepth: largest depth (furthest away) is rendered first (painters algorithm)
    return list.sort((a, b) => b.zDepth - a.zDepth);
  }, [companions, projectedData]);

  // Handle zoom changes
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 2.2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.45));
  
  // Reset views
  const handleReset = () => {
    setPitch(0.55);
    setYaw(0.25);
    setZoom(1.05);
    setIsAutoSpinning(true);
    setSelectedCategoryKey(null);
    setHoveredCategoryKey(null);
  };

  return (
    <div
      ref={containerRef}
      id="sahaba-celestial-canvas-container"
      className={`relative w-full h-[580px] border rounded-[2rem] overflow-hidden select-none transition-all duration-550 shadow-2xl ${
        isDarkMode 
          ? 'bg-[#10110D] border-neutral-850 text-slate-100' 
          : 'bg-[#F2ECE0] border-[#CFC5AD]/55 text-[#443825]'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
    >
      
      {/* Dynamic starry nebula particle cluster backdrop */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className={`absolute inset-0 bg-gradient-radial from-[#D4AF37]/5 to-transparent`} />
        {/* Generates ambient vector sparkling particles */}
        <svg className="w-full h-full">
          {Array.from({ length: 30 }).map((_, i) => (
            <circle
              key={i}
              cx={`${((i * 197) % 100)}%`}
              cy={`${((i * 313) % 100)}%`}
              r={0.6 + (i % 3) * 0.4}
              fill={isDarkMode ? '#FCF3D7' : '#4E3D25'}
              opacity={0.3 + (i % 4) * 0.2}
              className={i % 2 === 0 ? 'animate-pulse' : ''}
              style={{ animationDuration: `${2 + (i % 5)}s` }}
            />
          ))}
        </svg>
      </div>

      {/* Elegant HUD Control Bar Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap gap-2 items-center justify-between pointer-events-none">
        
        {/* Dynamic Instructional Indicator Capsule */}
        <div className={`px-4 py-2 rounded-full border text-[11px] font-serif font-bold flex items-center gap-2 pointer-events-auto shadow-lg backdrop-blur-xl transition ${
          isDarkMode 
            ? 'bg-[#181914]/90 border-neutral-850 text-slate-200' 
            : 'bg-white/95 border-[#CFBFA5] text-[#3E311B]'
        }`}>
          <Compass className="w-4 h-4 text-amber-500 animate-spin-slow shrink-0" />
          <span>
            {isArabic
              ? 'توجيه ثلاثي الأبعاد: اسحب أي مكان فارغ لتدوير أفلاك الصحابة • استخدم المفاتيح للتحكم'
              : '3D Tracker: Click & drag anywhere to steer orbits • Hover nodes to inspect ties'}
          </span>
        </div>

        {/* Dynamic Controls Hub */}
        <div className="flex items-center gap-2 pointer-events-auto">
          
          {/* Layout Modifiers Pill */}
          <div className={`flex rounded-full p-1 border shadow-lg backdrop-blur-xl ${
            isDarkMode ? 'bg-[#181914]/90 border-neutral-850' : 'bg-white/95 border-[#CFBFA5]'
          }`}>
            <button
              onClick={() => setLayout('dome')}
              className={`p-1.5 px-3 rounded-full text-xs font-serif font-bold flex items-center gap-1 transition ${
                layout === 'dome'
                  ? 'bg-amber-600 text-white shadow-inner'
                  : 'text-stone-500 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
              title={isArabic ? 'قبة السلف الصالح' : 'Dome of Luminaries'}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[10.5px]">{isArabic ? 'القبة السماوية' : 'Aura Dome'}</span>
            </button>
            <button
              onClick={() => setLayout('tiers')}
              className={`p-1.5 px-3 rounded-full text-xs font-serif font-bold flex items-center gap-1 transition ${
                layout === 'tiers'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-stone-500 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
              title={isArabic ? 'أفلاك الطبقات' : 'Category Concentric Rings'}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[10.5px]">{isArabic ? 'أفلاك الطبقات' : 'Orbital Rings'}</span>
            </button>
            <button
              onClick={() => setLayout('helix')}
              className={`p-1.5 px-3 rounded-full text-xs font-serif font-bold flex items-center gap-1 transition-all ${
                layout === 'helix'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-stone-500 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
              title={isArabic ? 'اللولب السيري الزمني' : 'Temporal Chronological Spiral'}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[10.5px]">{isArabic ? 'المنحنى الزمني' : 'Helix Timeline'}</span>
            </button>
          </div>

          {/* Navigational Utilities */}
          <div className={`flex items-center p-1 rounded-full border shadow-lg backdrop-blur-xl ${
            isDarkMode ? 'bg-[#181914]/90 border-neutral-850' : 'bg-white/95 border-[#CFBFA5]'
          }`}>
            <button
              onClick={() => setIsAutoSpinning(!isAutoSpinning)}
              className={`p-1.5 rounded-full transition hover:bg-stone-100 dark:hover:bg-neutral-800 ${
                isAutoSpinning ? 'text-emerald-500' : 'text-neutral-500'
              }`}
              title={isAutoSpinning ? (isArabic ? 'إيقاف الدوران' : 'Pause Auto-Spin') : (isArabic ? 'بدء الدوران تلقائياً' : 'Spin Orbits')}
            >
              {isAutoSpinning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-full transition hover:bg-stone-100 dark:hover:bg-neutral-800 text-stone-500 hover:text-amber-600"
              title={isArabic ? 'تكبير البؤرة' : 'Perspective Zoom In'}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-full transition hover:bg-stone-100 dark:hover:bg-neutral-800 text-stone-500 hover:text-amber-600"
              title={isArabic ? 'تنصيف النطاق' : 'Perspective Zoom Out'}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-full transition hover:bg-stone-100 dark:hover:bg-neutral-800 text-stone-500 hover:text-amber-605"
              title={isArabic ? 'إعادة الإحداثيات' : 'Calibrate Astrolabe'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 3D projected Canvas workspace using standard SVG with painter overlays */}
      <svg className="w-full h-full select-none" viewBox="0 0 800 520">
        <defs>
          {/* Glowing Filters */}
          <filter id="astrolabe-node-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <filter id="golden-pulse-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComponentTransfer in="blur" result="glow">
              <feFuncA type="linear" slope="0.8" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Connections custom arrows markers */}
          {Object.entries(RELATION_CONFIG).map(([type, config]) => (
            <marker
              key={`arrow-head-${type}`}
              id={`arrow-cap-${type}`}
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="4"
              markerHeight="4"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill={config.color} />
            </marker>
          ))}
        </defs>

        {/* 1. THREE-DIMENSIONAL ASTROLABE WIREFRAME GEOMETRY AND ORBITS */}
        <g id="astrolabe-wireframe-lines" opacity={isDarkMode ? 0.35 : 0.5}>
          {projectedAstrolabeRings.map((ring, idx) => (
            <g key={`astrolabe-ring-${idx}`}>
              <path
                d={ring.path}
                fill="none"
                stroke={ring.color}
                strokeWidth={ring.style === 'solid' ? 1.4 : 0.8}
                strokeDasharray={ring.style === 'dashed' ? '3,6' : 'none'}
                className="transition-all duration-300"
              />
              {/* Overlay orbital micro annotations */}
              {ring.labelAr && idx === 0 && (
                <path d={ring.path} id={`ring-text-${idx}`} fill="none" />
              )}
            </g>
          ))}
        </g>

        {/* 2. THREE-DIMENSIONAL CONSTELLATION LINES (RELATIONSHIPS) */}
        <g id="astrolabe-constellation-lines">
          {relationships.map(rel => {
            const ptStart = projectedData[rel.sourceId];
            const ptEnd = projectedData[rel.targetId];
            if (!ptStart || !ptEnd) return null;

            const stateStart = nodeStates[rel.sourceId];
            const stateEnd = nodeStates[rel.targetId];
            if (!stateStart || !stateEnd) return null;

            const isPathEdge = highlightedPath?.includes(rel.sourceId) && highlightedPath?.includes(rel.targetId);
            
            // Highlight connections that involve active nodes
            const isDirectLink = (hoveredCompanion?.id === rel.sourceId || hoveredCompanion?.id === rel.targetId) ||
                                 (selectedCompanion?.id === rel.sourceId || selectedCompanion?.id === rel.targetId);

            const config = RELATION_CONFIG[rel.type] || { color: '#CFC5AD', dash: '3,3' };

            let strokeColor = config.color;
            let strokeWidth = 1.25;
            let strokeOpacity = isDarkMode ? 0.14 : 0.22;
            let displayLabel = false;

            if (isPathEdge) {
              strokeColor = '#D4AF37'; // Pure path gold
              strokeWidth = 3.2;
              strokeOpacity = 0.95;
              displayLabel = true;
            } else if (isDirectLink) {
              strokeWidth = 2.4;
              strokeOpacity = 0.9;
              displayLabel = true;
            } else if (selectedCategoryKey) {
              // Dim links if filtered
              const matchSource = companions.find(x => x.id === rel.sourceId)?.category === selectedCategoryKey;
              const matchTarget = companions.find(x => x.id === rel.targetId)?.category === selectedCategoryKey;
              strokeOpacity = matchSource && matchTarget ? 0.45 : 0.04;
            } else if (selectedCompanion || hoveredCompanion) {
              // Dim unrelated nodes
              strokeOpacity = 0.04;
            }

            // Curve coordinate offset to avoid overlapping straight lines (giving spatial volume)
            const dx = ptEnd.screenX - ptStart.screenX;
            const dy = ptEnd.screenY - ptStart.screenY;
            const len = Math.sqrt(dx*dx + dy*dy) || 1;
            
            // Standard smooth arc bezier coordinates control offset
            const midX = (ptStart.screenX + ptEnd.screenX) / 2 - (dy / len) * 16;
            const midY = (ptStart.screenY + ptEnd.screenY) / 2 + (dx / len) * 16;

            return (
              <g key={rel.id} className="transition-all duration-300">
                {/* Projected Arch Connection */}
                <path
                  d={`M ${ptStart.screenX} ${ptStart.screenY} Q ${midX} ${midY} ${ptEnd.screenX} ${ptEnd.screenY}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={config.dash}
                  opacity={strokeOpacity}
                  markerEnd={`url(#arrow-cap-${rel.type})`}
                  className="transition-all duration-300"
                />

                {/* Interactive floating holographic relation badge */}
                {displayLabel && (
                  <g transform={`translate(${midX}, ${midY})`} className="cursor-help">
                    <rect
                      x="-55"
                      y="-8"
                      width="110"
                      height="16"
                      rx="6"
                      fill={isDarkMode ? '#1B1C16' : '#FAF8F4'}
                      stroke={strokeColor}
                      strokeWidth="1.2"
                      className="shadow-md"
                      opacity="0.95"
                    />
                    <text
                      textAnchor="middle"
                      y="2.5"
                      className={`text-[8.5px] font-bold font-serif ${isDarkMode ? 'fill-slate-205' : 'fill-stone-750'}`}
                    >
                      {isArabic ? rel.labelAr : rel.labelEn}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* 3. DEPTH-SORTED RADIAN COMPANION NODES (Preserves genuine spatial alignment overlaps) */}
        <g id="astrolabe-stars-nodes">
          {sortedDrawOrder.map(item => {
            const state = nodeStates[item.id];
            const proj = projectedData[item.id];
            if (!proj || !state) return null;

            const categoryConf = CATEGORY_CONFIG[item.companion.category] || CATEGORY_CONFIG.Other;

            let sizeScale = 1.0;
            let borderStroke = categoryConf.color;
            let borderWidth = 2.0;

            // Scale nodes dynamically closer vs further
            const defaultProximityScale = 1.0 - (proj.zDepth / 1400); // 1.2 at front, 0.7 at back
            
            if (state.isSelected) {
              sizeScale = 1.45;
              borderStroke = '#D4AF37'; // Pure gold selection anchor
              borderWidth = 3.6;
            } else if (state.isHovered || state.isConnected) {
              sizeScale = 1.25;
              borderWidth = 2.8;
              borderStroke = '#D4AF37'; // Glow highlights relative peers
            } else if (state.isPath) {
              sizeScale = 1.2;
              borderWidth = 3.0;
              borderStroke = '#10B981';
            } else if (state.shouldDim) {
              sizeScale = 0.75;
            }

            const scale = sizeScale * defaultProximityScale;

            return (
              <g
                key={item.id}
                transform={`translate(${proj.screenX}, ${proj.screenY}) scale(${scale})`}
                className="transition-all duration-350 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCompanion(item.companion);
                }}
                onMouseEnter={() => onHoverCompanion(item.companion)}
                onMouseLeave={() => onHoverCompanion(null)}
                opacity={state.shouldDim ? 0.25 : 1.0}
              >
                
                {/* 3D Drop Projective Line to base plane (Visual suspension string) */}
                {layout !== 'helix' && (
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2={35 / scale}
                    stroke={categoryConf.color}
                    strokeWidth="0.8"
                    strokeDasharray="2,3"
                    opacity="0.45"
                  />
                )}

                {/* Pulsing selection aura glow ring */}
                {(state.isSelected || state.isHovered || state.isPath) && (
                  <circle
                    r="24"
                    fill="none"
                    stroke={categoryConf.color}
                    strokeWidth="2.5"
                    className="animate-pulse opacity-40"
                    filter="url(#astrolabe-node-glow)"
                  />
                )}

                {/* Sacred Geometrical Octagram backing plates (Islamic star plate Rub' El Hizb style) */}
                <g className="transition-all duration-300">
                  {/* Rotating decorative geometric background */}
                  <path
                    d="M -13,0 L -9,-9 L 0,-13 L 9,-9 L 13,0 L 9,9 L 0,13 L -9,9 Z"
                    fill={isDarkMode ? '#1B1C16' : '#FCFAF7'}
                    stroke={borderStroke}
                    strokeWidth={borderWidth}
                    className="shadow-lg transition-colors"
                  />
                  {/* Second interlocking plate offset by 45 degrees forming exact 8-pointed star */}
                  <path
                    d="M -13,0 L -9,-9 L 0,-13 L 9,-9 L 13,0 L 9,9 L 0,13 L -9,9 Z"
                    fill="none"
                    stroke={borderStroke}
                    strokeWidth={borderWidth - 0.7}
                    transform="rotate(45)"
                    className="transition-colors"
                  />
                </g>

                {/* Core Initial emblem */}
                <circle cx="0" cy="0" r="7" fill={categoryConf.color} className="opacity-15" />
                <text
                  textAnchor="middle"
                  y="3"
                  className="text-[9px] font-extrabold font-serif"
                  fill={categoryConf.color}
                >
                  {item.companion.nameAr.charAt(0)}
                </text>

                {/* Primary Arabic Title label banner */}
                <text
                  y="24"
                  textAnchor="middle"
                  className={`text-[9.5px] font-bold font-serif filter drop-shadow select-none ${
                    isDarkMode ? 'fill-slate-150' : 'fill-[#2B2319]'
                  } ${state.isSelected ? 'fill-amber-500 font-extrabold scale-105' : ''}`}
                  style={{ textShadow: isDarkMode ? '0 1px 2px #000' : '0 1px 1px #fff' }}
                >
                  {item.companion.nameAr.split(' ')[0]}
                </text>

                {/* Sub-heading Transliterated English text */}
                <text
                  y="31.5"
                  textAnchor="middle"
                  className={`text-[7px] font-mono tracking-wide ${
                    isDarkMode ? 'fill-slate-400' : 'fill-stone-500'
                  }`}
                >
                  {item.companion.nameEn.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating 3D Navigation Compass Widget (Bottom-Left) */}
      <div className={`absolute bottom-4 left-4 z-20 rounded-2xl border p-3.5 shadow-xl backdrop-blur-xl transition pointer-events-auto ${
        isDarkMode 
          ? 'bg-[#181914]/95 border-neutral-850 text-slate-300' 
          : 'bg-white/95 border-[#CFBFA5] text-[#3E311B] font-serif'
      }`}>
        <div className="flex items-center gap-2 text-xs font-bold border-b pb-1.5 mb-2">
          <Eye className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{isArabic ? 'إحداثيات بوصلة الأسطرلاب' : 'Compass Orientation'}</span>
        </div>
        
        {/* Simple interactive dials or radar visualizers */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-mono font-bold">
          <span className="text-stone-500">{isArabic ? 'الميل العمودي:' : 'Vertical Tilt:'}</span>
          <span className="text-amber-500 text-right">{Math.round((pitch * 180) / Math.PI)}°</span>

          <span className="text-stone-500">{isArabic ? 'الدوران الأفقي:' : 'Spin Orbit:'}</span>
          <span className="text-amber-500 text-right">{Math.round((yaw * 180) / Math.PI)}°</span>

          <span className="text-stone-500">{isArabic ? 'نمط التوزيع:' : 'Active Array:'}</span>
          <span className="text-amber-500 text-right capitalize">{layout}</span>
        </div>
      </div>

      {/* INTERACTIVE LEGEND BAR PANEL (Bottom-Right) */}
      <div className={`absolute bottom-4 right-4 z-20 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 pointer-events-auto ${
        isDarkMode 
          ? 'bg-[#181914]/95 border-neutral-850 text-slate-300' 
          : 'bg-white/95 border-[#CFBFA5] text-[#3E311B] font-serif'
      } ${isLegendOpen ? 'w-[250px] p-3.5' : 'w-[48px] h-[48px] p-0 flex items-center justify-center cursor-pointer'}`}
      onClick={() => {
        if (!isLegendOpen) setIsLegendOpen(true);
      }}
      >
        {!isLegendOpen ? (
          <HelpCircle className="w-5 h-5 text-amber-500 animate-pulse" />
        ) : (
          <div>
            <div className={`font-bold border-b pb-1.5 mb-2.5 flex items-center justify-between text-xs`}>
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>{isArabic ? 'تصنيف الفئات والطبقات' : 'Astronomical Categories'}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLegendOpen(false);
                }}
                className="text-[9px] px-1.5 py-0.5 rounded hover:bg-stone-100 dark:hover:bg-neutral-805 cursor-pointer text-stone-500"
              >
                {isArabic ? 'إخفاء' : 'Close'}
              </button>
            </div>

            {/* Loop categories interactively */}
            <div className="space-y-1 max-h-[175px] overflow-y-auto pr-1">
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                const count = categoryCounts[key] || 0;
                const isSelected = selectedCategoryKey === key;
                const isHovered = hoveredCategoryKey === key;

                return (
                  <div
                    key={key}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategoryKey(isSelected ? null : key);
                    }}
                    onMouseEnter={() => setHoveredCategoryKey(key)}
                    onMouseLeave={() => setHoveredCategoryKey(null)}
                    className={`flex items-center justify-between text-[11px] p-1 px-2 rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-600/15 text-amber-500 font-bold border border-amber-600/25'
                        : isHovered
                          ? 'bg-stone-100 dark:bg-neutral-850 text-amber-500'
                          : 'hover:bg-amber-600/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block shrink-0 border border-black/10"
                        style={{ backgroundColor: config.color }}
                      />
                      <span className="truncate pr-1">{isArabic ? config.labelAr : config.labelEn}</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-stone-100 dark:bg-neutral-800 text-stone-605">
                      {count}
                    </span>
                  </div>
                );
              })}

              {selectedCategoryKey && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategoryKey(null);
                  }}
                  className="w-full text-center text-[10px] py-1 mt-2 tracking-wide font-bold uppercase rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 cursor-pointer transition"
                >
                  {isArabic ? 'إلغاء تصفية الفئات' : 'Reset Category Filters'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
