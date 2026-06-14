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
  HelpCircle, 
  Layers, 
  Calendar, 
  Compass,
  Play, 
  Pause,
  Sparkles
} from 'lucide-react';
import { LanguageCode, CATEGORY_TRANSLATIONS, RELATIONSHIP_TRANSLATIONS, translateCityLabel } from '../lib/i18n';

interface NetworkGraphProps {
  companions: Companion[];
  relationships: Relationship[];
  selectedCompanion: Companion | null;
  onSelectCompanion: (companion: Companion) => void;
  hoveredCompanion: Companion | null;
  onHoverCompanion: (companion: Companion | null) => void;
  isArabic: boolean;
  lang?: LanguageCode;
  highlightedPath: string[] | null;
  isDarkMode?: boolean;
}

// Minimal aesthetic categories configuration (clean modern pastel lights/dark accents)
export const CATEGORY_CONFIG: Record<CompanionCategory, { color: string; bgClass: string; textClass: string; labelAr: string; labelEn: string }> = {
  Khulafa_Rashidun: {
    color: '#D4AF37', // Pure Celestial Gold
    bgClass: 'bg-amber-500/15 border-amber-400',
    textClass: 'text-amber-500',
    labelAr: 'الخلفاء الراشدون',
    labelEn: 'Khulafa al-Rashidun'
  },
  Ahl_al_Bayt: {
    color: '#10B981', // Emerald Mint
    bgClass: 'bg-emerald-500/15 border-emerald-400',
    textClass: 'text-emerald-500',
    labelAr: 'آل البيت الأطهار',
    labelEn: 'Ahl al-Bayt'
  },
  Muhajirun: {
    color: '#3B82F6', // Luminous Blue
    bgClass: 'bg-blue-500/15 border-blue-400',
    textClass: 'text-blue-500',
    labelAr: 'المهاجرون',
    labelEn: 'Muhajirun'
  },
  Ansar: {
    color: '#22C55E', // Sage Green
    bgClass: 'bg-green-500/15 border-green-400',
    textClass: 'text-green-500',
    labelAr: 'الأنصار',
    labelEn: 'Ansar'
  },
  Wives: {
    color: '#EC4899', // Blossom Pink
    bgClass: 'bg-pink-500/15 border-pink-400',
    textClass: 'text-pink-500',
    labelAr: 'أمهات المؤمنين',
    labelEn: 'Wives of the Prophet ﷺ'
  },
  Hadith_Narrators: {
    color: '#8B5CF6', // Astral Purple
    bgClass: 'bg-violet-500/15 border-violet-400',
    textClass: 'text-violet-500',
    labelAr: 'رواة الحديث الحفاظ',
    labelEn: 'Hadith Narrators'
  },
  Military: {
    color: '#EF4444', // Crimson Spark
    bgClass: 'bg-red-500/15 border-red-400',
    textClass: 'text-red-500',
    labelAr: 'القادة الفاتحون',
    labelEn: 'Military Commanders'
  },
  Scholars: {
    color: '#06B6D4', // Deep Cyan
    bgClass: 'bg-cyan-500/15 border-cyan-400',
    textClass: 'text-cyan-500',
    labelAr: 'العلماء والفقهاء',
    labelEn: 'Scholars'
  },
  Other: {
    color: '#71717A', // Minimal Grey
    bgClass: 'bg-zinc-500/15 border-zinc-400',
    textClass: 'text-zinc-500',
    labelAr: 'صحابة آخرون',
    labelEn: 'Other Sahaba'
  }
};

export const RELATION_CONFIG: Record<RelationshipType, { color: string; dash?: string; labelAr: string; labelEn: string }> = {
  family: {
    color: '#F59E0B', 
    dash: 'none',
    labelAr: 'نسب وقرابة',
    labelEn: 'Family relationship'
  },
  marriage: {
    color: '#EC4899', 
    dash: '3,3',
    labelAr: 'مصاهرة',
    labelEn: 'Marriage connection'
  },
  teacher_student: {
    color: '#06B6D4', 
    dash: 'none',
    labelAr: 'رواية وعلم',
    labelEn: 'Teacher & Student'
  },
  friendship: {
    color: '#3B82F6', 
    dash: '1,2',
    labelAr: 'مؤاخاة وصحبة',
    labelEn: 'Brotherhood & Companionship'
  },
  hijra_partner: {
    color: '#10B981', 
    dash: '5,2',
    labelAr: 'رفقة الهجرة',
    labelEn: 'Hijra Partner'
  },
  battle_comrade: {
    color: '#EF4444', 
    dash: 'none',
    labelAr: 'رفقة الجهاد',
    labelEn: 'Battle Comrade'
  },
  political: {
    color: '#8B5CF6', 
    dash: '4,4',
    labelAr: 'شورى وبيعة',
    labelEn: 'Alliance / Shura'
  },
  hadith_transmission: {
    color: '#F97316', 
    dash: '1,4',
    labelAr: 'إسناد ونقل',
    labelEn: 'Hadith Transmission'
  }
};

// Historical cities/geographic anchors of early Islam
const CITIES_LIST = [
  { id: 'mecca', labelAr: 'مكة المكرمة', labelEn: 'Makkah', x: 230, y: 380, hubTextAr: 'أم القرى', hubTextEn: 'Al-Mukarramah' },
  { id: 'medina', labelAr: 'المدينة المنورة', labelEn: 'Al-Madinah', x: 280, y: 260, hubTextAr: 'طيبة الطيبة', hubTextEn: 'Al-Munawwarah' },
  { id: 'sham', labelAr: 'حاضرة الشام', labelEn: 'Al-Sham (Syria)', x: 270, y: 90, hubTextAr: 'أرض الرباط الخصيب', hubTextEn: 'Levant Garrison' },
  { id: 'iraq', labelAr: 'العراق الكوفي', labelEn: 'Al-Iraq (Kufa)', x: 440, y: 110, hubTextAr: 'محراب الفقه', hubTextEn: 'House of Science' },
  { id: 'egypt', labelAr: 'ديار مصر والفسطاط', labelEn: 'Egypt (Fustat)', x: 90, y: 170, hubTextAr: 'حصن الفلاح', hubTextEn: 'Nile Outpost' },
  { id: 'abyssinia', labelAr: 'أرض الحبشة النبيلة', labelEn: 'Abyssinia', x: 120, y: 480, hubTextAr: 'ملك لا يظلم بشر به', hubTextEn: 'First Hegira Haven' },
  { id: 'yemen', labelAr: 'أكناف اليمن', labelEn: 'Yemen', x: 440, y: 460, hubTextAr: 'مأرز الإيمان والحكمة', hubTextEn: 'Southern Gate' },
  { id: 'persia', labelAr: 'بلاد فارس والشرق', labelEn: 'Persia & East', x: 620, y: 140, hubTextAr: 'مشرق البصائر', hubTextEn: 'Persian Horizons' }
];

export default function NetworkGraph({
  companions,
  relationships,
  selectedCompanion,
  onSelectCompanion,
  hoveredCompanion,
  onHoverCompanion,
  isArabic,
  lang = 'fr',
  highlightedPath,
  isDarkMode = false
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Projection Angles
  const [pitch, setPitch] = useState<number>(0.45);
  const [yaw, setYaw] = useState<number>(0.6);
  const [zoom, setZoom] = useState<number>(1.25);

  // Interactive Maps / Layout states: 'map' (Geographic Caravan Scroll) | 'sphere' (3D Constellation) | 'rings' (Astrolabe orbits) | 'helix' (Timeline path)
  const [layout, setLayout] = useState<'map' | 'sphere' | 'rings' | 'helix'>('sphere');
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [isAutoSpinning, setIsAutoSpinning] = useState<boolean>(true);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);

  const dragStartMouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartAngles = useRef<{ pitch: number; yaw: number }>({ pitch: 0.45, yaw: 0.6 });

  // Auto orbital rotation (only when layout is 3D sphere/rings)
  useEffect(() => {
    if (!isAutoSpinning || isPanning || layout === 'map') return;
    const interval = setInterval(() => {
      setYaw(prev => (prev + 0.0025) % (2 * Math.PI));
    }, 25);
    return () => clearInterval(interval);
  }, [isAutoSpinning, isPanning, layout]);

  // Pause on click to focus
  useEffect(() => {
    if (selectedCompanion) {
      setIsAutoSpinning(false);
    }
  }, [selectedCompanion]);

  // Map companion to a high-accuracy historical geographical hub
  const getCompanionAssignedCity = (companion: Companion): string => {
    const id = companion.id;
    const city = (companion.cityEn || '').toLowerCase();
    
    // Hardcoded overrides for prominent figures
    if (id === 'abu_bakr' || id === 'umar_ibn_al_khattab' || id === 'uthman_ibn_affan') return 'medina';
    if (id === 'ali_ibn_abi_talib' || id === 'abdullah_ibn_masud') return 'iraq';
    if (id === 'khalid_ibn_al_walid' || id === 'abu_ubaydah_ibn_al_jarrah') return 'sham';
    if (id === 'amr_ibn_al_aas') return 'egypt';
    if (id === 'jaafar_ibn_abi_talib') return 'abyssinia';
    if (id === 'muadh_ibn_jabal') return 'yemen';
    if (id === 'salman_al_farsi') return 'persia';
    if (id === 'bilal_ibn_rabah') return 'sham'; // Went to Sham (Damascus) post-prophet era

    if (city.includes('mecca') && city.includes('medina')) {
      if (companion.category === 'Wives') return 'mecca';
      return 'medina';
    }
    
    if (city.includes('medina')) return 'medina';
    if (city.includes('mecca')) return 'mecca';
    if (city.includes('kufa') || city.includes('basra') || city.includes('iraq')) return 'iraq';
    if (city.includes('syria') || city.includes('sham') || city.includes('damascus')) return 'sham';
    if (city.includes('egypt') || city.includes('fustat')) return 'egypt';
    if (city.includes('abyssinia') || city.includes('habash')) return 'abyssinia';
    if (city.includes('persia') || city.includes('fars')) return 'persia';
    if (city.includes('yemen')) return 'yemen';
    
    if (companion.category === 'Ansar') return 'medina';
    if (companion.category === 'Wives') return 'mecca';
    
    // Simple balanced distribute hash
    const hashCode = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hubs = ['mecca', 'medina', 'sham', 'iraq'];
    return hubs[hashCode % hubs.length];
  };

  // Generate clean geographical and mathematical coordinates
  const relativeCoordinates = useMemo(() => {
    const coords: Record<string, { x: number; y: number; z: number }> = {};
    const total = companions.length;

    if (layout === 'map') {
      // Group companions by their assigned city
      const cityGroups: Record<string, Companion[]> = {};
      CITIES_LIST.forEach(city => {
        cityGroups[city.id] = [];
      });

      companions.forEach(c => {
        const cityId = getCompanionAssignedCity(c);
        if (!cityGroups[cityId]) cityGroups[cityId] = [];
        cityGroups[cityId].push(c);
      });

      // Position each companion in an orbital system around their city hub
      Object.entries(cityGroups).forEach(([cityId, comps]) => {
        const cityInfo = CITIES_LIST.find(city => city.id === cityId)!;
        const count = comps.length;

        comps.forEach((comp, idx) => {
          let offsetRadius = 24;
          let angleOffset = 0;

          if (count > 4) {
            const ringIndex = idx % 2;
            offsetRadius = ringIndex === 0 ? 18 : 34;
            angleOffset = ringIndex === 0 ? 0 : Math.PI / count;
          }

          const angle = angleOffset + (idx / (count || 1)) * 2 * Math.PI;
          coords[comp.id] = {
            x: cityInfo.x + offsetRadius * Math.cos(angle),
            y: cityInfo.y + offsetRadius * Math.sin(angle),
            z: 0 // flat map
          };
        });
      });
    } else if (layout === 'sphere') {
      // Elegant natural spherical layout sorted by category to form star constellations
      const sorted = [...companions].sort((a, b) => a.category.localeCompare(b.category));
      sorted.forEach((companion, idx) => {
        const phi = Math.acos(-1 + (2 * idx) / total); // uniform elevation distribution
        const theta = Math.sqrt(total * Math.PI) * phi; // spiral horizontal wrapping

        // Radius for space volume
        const radius = 220; 
        coords[companion.id] = {
          x: radius * Math.sin(phi) * Math.cos(theta),
          y: radius * Math.cos(phi) * 0.85, // sleek squashed celestial look
          z: radius * Math.sin(phi) * Math.sin(theta)
        };
      });
    } else if (layout === 'rings') {
      // Concentric minimalist astrolabe tracks
      const primaryGroup = companions.filter(c => ['Khulafa_Rashidun', 'Ahl_al_Bayt', 'Wives'].includes(c.category));
      const secondaryGroup = companions.filter(c => ['Muhajirun', 'Ansar'].includes(c.category));
      const restGroup = companions.filter(c => !primaryGroup.includes(c) && !secondaryGroup.includes(c));

      const assignRing = (comps: Companion[], radius: number, heightOffset: number) => {
        const len = comps.length;
        comps.forEach((comp, idx) => {
          const angle = (idx / (len || 1)) * 2 * Math.PI;
          coords[comp.id] = {
            x: radius * Math.cos(angle),
            y: heightOffset,
            z: radius * Math.sin(angle)
          };
        });
      };

      assignRing(primaryGroup, 100, -80);
      assignRing(secondaryGroup, 190, 0);
      assignRing(restGroup, 260, 80);

    } else if (layout === 'helix') {
      // Pure mathematical chronological thread
      const sortedChronological = [...companions].sort((a, b) => {
        const yearA = a.deathYearAH !== undefined ? a.deathYearAH : 40;
        const yearB = b.deathYearAH !== undefined ? b.deathYearAH : 40;
        return yearA - yearB;
      });

      sortedChronological.forEach((companion, idx) => {
        const progress = idx / (total || 1);
        const angle = idx * 0.45;
        const radius = 80 + progress * 160;
        coords[companion.id] = {
          x: radius * Math.cos(angle),
          y: -130 + progress * 260,
          z: radius * Math.sin(angle)
        };
      });
    }

    return coords;
  }, [companions, layout]);

  // Modern camera projection matrices (integrates flat 2D maps and 3D rotations)
  const projectedData = useMemo(() => {
    const center = { x: 400, y: 260 };
    const list: Record<string, { id: string; screenX: number; screenY: number; zDepth: number }> = {};

    Object.entries(relativeCoordinates).forEach(([id, coordVal]) => {
      const coord = coordVal as { x: number; y: number; z: number };

      if (layout === 'map') {
        // Flat Geographical Map - scales around map center utilizing zoom
        const dx = coord.x - center.x;
        const dy = coord.y - center.y;
        list[id] = {
          id,
          screenX: center.x + dx * zoom,
          screenY: center.y + dy * zoom,
          zDepth: 0
        };
      } else {
        const cosY = Math.cos(yaw);
        const sinY = Math.sin(yaw);
        const xRotated = coord.x * cosY - coord.z * sinY;
        const zRotated = coord.x * sinY + coord.z * cosY;

        const cosP = Math.cos(pitch);
        const sinP = Math.sin(pitch);
        const yRotated = coord.y * cosP - zRotated * sinP;
        const zDepth = coord.y * sinP + zRotated * cosP;

        const cameraDistance = 750;
        const perspectiveScale = cameraDistance / (cameraDistance + zDepth);

        list[id] = {
          id,
          screenX: center.x + xRotated * perspectiveScale * zoom,
          screenY: center.y + yRotated * perspectiveScale * zoom,
          zDepth
        };
      }
    });

    return list;
  }, [relativeCoordinates, yaw, pitch, zoom, layout]);

  // Project faint minimalist geometric orbital background rings (sphere layout)
  const geometricRings = useMemo(() => {
    if (layout === 'map') return []; // custom geographic map vectors rendered separately

    const cameraDistance = 750;
    const center = { x: 400, y: 260 };

    const projectPoint = (x: number, y: number, z: number) => {
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const xR = x * cosY - z * sinY;
      const zR = x * sinY + z * cosY;

      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const yR = y * cosP - zR * sinP;
      const zDepth = y * sinP + zR * cosP;

      const scale = cameraDistance / (cameraDistance + zDepth);
      return {
        x: center.x + xR * scale * zoom,
        y: center.y + yR * scale * zoom
      };
    };

    const lines: string[] = [];

    if (layout === 'sphere') {
      const ringRadii = [120, 220];
      ringRadii.forEach(r => {
        let pathStr = '';
        for (let i = 0; i <= 64; i++) {
          const angle = (i / 64) * 2 * Math.PI;
          const pt = projectPoint(r * Math.cos(angle), 0, r * Math.sin(angle));
          pathStr += (i === 0 ? 'M' : 'L') + ` ${pt.x} ${pt.y}`;
        }
        lines.push(pathStr);
      });
    } else if (layout === 'rings') {
      [-80, 0, 80].forEach((h, idx) => {
        const radii = [100, 190, 260];
        const r = radii[idx];
        let pathStr = '';
        for (let i = 0; i <= 64; i++) {
          const angle = (i / 64) * 2 * Math.PI;
          const pt = projectPoint(r * Math.cos(angle), h, r * Math.sin(angle));
          pathStr += (i === 0 ? 'M' : 'L') + ` ${pt.x} ${pt.y}`;
        }
        lines.push(pathStr);
      });
    } else if (layout === 'helix') {
      let pathStr = '';
      for (let i = 0; i <= 80; i++) {
        const progress = i / 80;
        const angle = i * 0.45;
        const radius = 80 + progress * 160;
        const pt = projectPoint(radius * Math.cos(angle), -130 + progress * 260, radius * Math.sin(angle));
        pathStr += (i === 0 ? 'M' : 'L') + ` ${pt.x} ${pt.y}`;
      }
      lines.push(pathStr);
    }

    return lines;
  }, [pitch, yaw, zoom, layout]);

  // Determine which companions are direct connection neighbors of the active selection (Only clicked/active gets details)
  const connectedNeighborIds = useMemo(() => {
    const setOfIds = new Set<string>();
    const activeId = selectedCompanion?.id;
    if (!activeId) return setOfIds;

    relationships.forEach(r => {
      if (r.sourceId === activeId) setOfIds.add(r.targetId);
      if (r.targetId === activeId) setOfIds.add(r.sourceId);
    });

    return setOfIds;
  }, [selectedCompanion, relationships]);

  // Drag behaviors (Pitch/Yaw only triggers when 3D is active, otherwise panning happens)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (layout === 'map') return; // stationary map
    setIsPanning(true);
    dragStartMouse.current = { x: e.clientX, y: e.clientY };
    dragStartAngles.current = { pitch, yaw };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || layout === 'map') return;
    const dx = e.clientX - dragStartMouse.current.x;
    const dy = e.clientY - dragStartMouse.current.y;
    const speed = 0.005;
    
    let newYaw = dragStartAngles.current.yaw - dx * speed;
    let newPitch = dragStartAngles.current.pitch + dy * speed;
    
    newPitch = Math.max(-1.0, Math.min(1.2, newPitch));
    
    setYaw(newYaw);
    setPitch(newPitch);
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Painter's sorting sequence
  const sortedDrawOrder = useMemo(() => {
    return Object.entries(projectedData)
      .map(([id, proj]) => {
        const c = companions.find(x => x.id === id);
        return {
          id,
          proj: proj as { id: string; screenX: number; screenY: number; zDepth: number },
          companion: c!
        };
      })
      .filter(item => item.companion !== undefined)
      .sort((a, b) => b.proj.zDepth - a.proj.zDepth);
  }, [companions, projectedData]);

  // Clean filters resetting
  const handleReset = () => {
    setPitch(0.45);
    setYaw(0.6);
    setZoom(1.25);
    setIsAutoSpinning(true);
  };

  return (
    <div
      ref={containerRef}
      id="astro-celestial-constellation"
      className={`relative w-full h-[600px] border rounded-[2rem] overflow-hidden select-none transition-all duration-300 shadow-xl ${
        isDarkMode 
          ? 'bg-[#090A08] border-neutral-900 text-stone-200 animate-fade-in' 
          : 'bg-[#F9F6F0] border-stone-200/80 text-stone-850 animate-fade-in'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isPanning && layout !== 'map' ? 'grabbing' : layout === 'map' ? 'default' : 'grab' }}
    >
      {/* Absolute parchment grain / stars background */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <svg className="w-full h-full">
          {layout === 'map' ? (
            // Grid and coordinate lines for ancient parchment atlas
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={`${(i + 1) * 15}%`}
                  y1="0"
                  x2={`${(i + 1) * 15}%`}
                  y2="100%"
                  stroke={isDarkMode ? 'rgba(174,139,59,0.06)' : 'rgba(174,139,59,0.1)'}
                  strokeWidth="0.8"
                  strokeDasharray="4,8"
                />
              ))}
              {Array.from({ length: 5 }).map((_, i) => (
                <line
                  key={`h-${i}`}
                  x1="0"
                  y1={`${(i + 1) * 18}%`}
                  x2="100%"
                  y2={`${(i + 1) * 18}%`}
                  stroke={isDarkMode ? 'rgba(174,139,59,0.06)' : 'rgba(174,139,59,0.1)'}
                  strokeWidth="0.8"
                  strokeDasharray="4,8"
                />
              ))}
            </>
          ) : (
            // Celestial starry backdrop
            Array.from({ length: 45 }).map((_, i) => (
              <circle
                key={i}
                cx={`${((i * 263) % 100)}%`}
                cy={`${((i * 419) % 100)}%`}
                r={0.4 + (i % 2) * 0.4}
                fill={isDarkMode ? '#FCF3D7' : '#9E8665'}
                opacity={0.3 + (i % 3) * 0.2}
              />
            ))
          )}
        </svg>
      </div>

      {/* Control overlay menu */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap gap-2 items-center justify-between pointer-events-none">
        
        {/* Instructional Pill */}
        <div className={`px-4 py-2 rounded-full border text-[10.5px] font-sans tracking-wide font-medium flex items-center gap-2 pointer-events-auto shadow-md backdrop-blur-md transition-all ${
          isDarkMode 
            ? 'bg-neutral-950/80 border-neutral-800 text-stone-300' 
            : 'bg-white/85 border-stone-200 text-stone-700'
        }`}>
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            {layout === 'map' 
              ? (lang === 'fr' 
                  ? "Cliquez sur l'étoile d'un compagnon pour révéler son parcours et ses relations" 
                  : (isArabic ? 'انقر على نجمة الصحابي لعرض صلاته ومسيرته بين الحواضر' : 'Click a companion star to reveal their paths and relationships'))
              : (lang === 'fr' 
                  ? "Cliquez sur les nœuds d'étoiles pour afficher les liens de parenté célestes" 
                  : (isArabic ? 'اضغط على النجم لعرض البيانات السلكية والعلاقات' : 'Click star nodes to unleash celestial relationship bridges'))}
          </span>
        </div>

        {/* Navigation / Switch Layout buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className={`flex rounded-full p-0.5 border shadow-sm backdrop-blur-md ${
            isDarkMode ? 'bg-neutral-950/80 border-neutral-850' : 'bg-white/80 border-stone-200'
          }`}>
            <button
              onClick={() => setLayout('sphere')}
              className={`p-1.5 px-3 rounded-full text-xs font-serif font-bold flex items-center gap-1 transition-all ${
                layout === 'sphere'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-stone-500 hover:text-amber-555'
              }`}
              title="3D Sphere Constellation"
            >
              <Orbit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">{lang === 'fr' ? 'Dôme Céleste' : (isArabic ? 'القبة السماوية' : 'Dome Const')}</span>
            </button>
            <button
              onClick={() => setLayout('rings')}
              className={`p-1.5 px-3 rounded-full text-xs font-serif font-bold flex items-center gap-1 transition-all ${
                layout === 'rings'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-stone-500 hover:text-amber-555'
              }`}
              title="Astrolabe Concentric Orbits"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">{lang === 'fr' ? 'Astrolabe' : (isArabic ? 'مسارات الأسطرلاب' : 'Astrolabe')}</span>
            </button>
            <button
              onClick={() => setLayout('helix')}
              className={`p-1.5 px-3 rounded-full text-xs font-serif font-bold flex items-center gap-1 transition-all ${
                layout === 'helix'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-stone-500 hover:text-amber-555'
              }`}
              title="Chronological Timeline helix"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">{lang === 'fr' ? 'Chronologie' : (isArabic ? 'خط الزمن' : 'Timeline')}</span>
            </button>
          </div>

          {/* Action pills */}
          <div className={`flex items-center p-0.5 rounded-full border shadow-sm backdrop-blur-md ${
            isDarkMode ? 'bg-neutral-950/80 border-neutral-850' : 'bg-white/80 border-stone-200'
          }`}>
            {layout !== 'map' && (
              <button
                onClick={() => setIsAutoSpinning(!isAutoSpinning)}
                className="p-1.5 rounded-full text-stone-500 hover:text-amber-500 transition-colors"
                title="Pause/Resume Auto-spin"
              >
                {isAutoSpinning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
            )}
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.15, 2.2))}
              className="p-1.5 rounded-full text-stone-500 hover:text-amber-500 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.45))}
              className="p-1.5 rounded-full text-stone-500 hover:text-amber-500 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-full text-stone-500 hover:text-amber-500 transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main interactive SVG stage */}
      <svg className="w-full h-full select-none" viewBox="0 0 800 520">
        <defs>
          <filter id="celestial-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. LAYOUT: GEOGRAPHIC BACKGROUND MAP */}
        {layout === 'map' && (
          <g id="geographic-cartography-backdrop" opacity="0.8">
            
            {/* RED SEA water vector body */}
            <path
              d="M 50,530 Q 140,430 170,340 T 140,210"
              fill="none"
              stroke={isDarkMode ? '#1e241c' : '#cee7e5'}
              strokeWidth="42"
              strokeLinecap="round"
              opacity="0.65"
            />
            <path
              d="M 50,530 Q 140,430 170,340 T 140,210"
              fill="none"
              stroke={isDarkMode ? '#233230' : '#b2dbda'}
              strokeWidth="16"
              strokeLinecap="round"
              opacity="0.8"
            />
            
            {/* MEDITERRANEAN SEA water vector body */}
            <path
              d="M 0,220 Q 110,210 150,195 T 250,75 L 0,75 Z"
              fill={isDarkMode ? '#172324' : '#daf1f0'}
              opacity="0.65"
            />
            
            {/* PERSIAN GULF water vector body */}
            <path
              d="M 530,230 Q 630,245 680,330 L 800,290 L 800,180 Z"
              fill={isDarkMode ? '#172221' : '#daedea'}
              opacity="0.6"
            />

            {/* Compass Rose at the Top-Right */}
            <g transform="translate(740, 95)" opacity="0.6">
              <circle r="22" fill="none" stroke={isDarkMode ? '#444' : '#cbd5e1'} strokeWidth="1" strokeDasharray="2,3" />
              <polygon points="0,-26 4,-6 0,0" fill="#ae8b3b" />
              <polygon points="0,-26 -4,-6 0,0" fill="#d4af37" />
              <polygon points="0,26 4,6 0,0" fill="#71717A" />
              <polygon points="0,26 -4,6 0,0" fill="#A1A1AA" />
              <polygon points="26,0 6,4 0,0" fill="#ae8b3b" />
              <polygon points="26,0 6,-4 0,0" fill="#d4af37" />
              <polygon points="-26,0 -6,4 0,0" fill="#71717A" />
              <polygon points="-26,0 -6,-4 0,0" fill="#A1A1AA" />
              <circle r="4" fill={isDarkMode ? '#090a08' : '#fafaf9'} stroke="#ae8b3b" strokeWidth="1" />
              <text y="-32" textAnchor="middle" className="text-[9px] font-serif font-bold fill-amber-600">N (شمال)</text>
            </g>

            {/* Decorative Waves icons on seas */}
            <path d="M 120,290 Q 125,286 130,290 Q 135,286 140,290" fill="none" stroke={isDarkMode ? '#444' : '#aec7c5'} strokeWidth="1" />
            <path d="M 60,370 Q 65,366 70,370 Q 75,366 80,370" fill="none" stroke={isDarkMode ? '#444' : '#aec7c5'} strokeWidth="1" />
            <path d="M 640,240 Q 645,236 650,240 Q 655,236 660,240" fill="none" stroke={isDarkMode ? '#333' : '#aec7c5'} strokeWidth="1" />

            {/* Faint Historic Caravan / Migration paths */}
            {/* 1. Darb al-Hijrah: Mecca to Medina */}
            <path
              id="geo-path-hijrah"
              d="M 230,380 Q 255,320 280,260"
              fill="none"
              stroke="#ae8b3b"
              strokeWidth="1.2"
              strokeDasharray="4,6"
              opacity="0.8"
            />
            {/* 2. Sommer trade route: Mecca to Syria */}
            <path
              id="geo-path-syria"
              d="M 230,380 L 270,90"
              fill="none"
              stroke="#5a7e6b"
              strokeWidth="1.0"
              strokeDasharray="2,6"
              opacity="0.7"
            />
            {/* 3. Red Sea crossing path to Abyssinia */}
            <path
              id="geo-path-abyssinia"
              d="M 230,380 L 120,480"
              fill="none"
              stroke="#a87c93"
              strokeWidth="1.2"
              strokeDasharray="5,6"
              opacity="0.75"
            />
            {/* 4. Iraq-Kufe caravan trails */}
            <path
              id="geo-path-iraq"
              d="M 280,260 Q 360,180 440,110"
              fill="none"
              stroke="#436585"
              strokeWidth="0.8"
              strokeDasharray="3,5"
              opacity="0.7"
            />

            {/* Geographical label identifiers */}
            <text x="180" y="440" transform="rotate(-65 180 440)" className={`text-[8px] font-serif font-semibold pointer-events-none tracking-widest ${isDarkMode ? 'fill-neutral-700' : 'fill-[#829998]'}`}>
              {lang === 'fr' ? 'LA MER ROUGE' : (isArabic ? 'البحر الأحمر (بحر القلزم)' : 'THE RED SEA')}
            </text>
            <text x="60" y="115" className={`text-[8.5px] font-serif font-semibold pointer-events-none tracking-widest ${isDarkMode ? 'fill-neutral-700' : 'fill-[#81a1a0]'}`}>
              {lang === 'fr' ? 'LA MER MÉDITERRANÉE' : (isArabic ? 'بحر الروم (المتوسط)' : 'MEDITERRANEAN SEA')}
            </text>
            <text x="350" y="320" transform="rotate(-15 350 320)" className={`text-[7px] font-mono pointer-events-none ${isDarkMode ? 'fill-stone-850' : 'fill-stone-400'}`}>
              {lang === 'fr' ? "← ROUTE DE L'HÉGIRE PROPHÉTIQUE" : (isArabic ? '← طريق الهجرة النبوية الشريفة' : '← ROUTE OF NABAWI HIJRA')}
            </text>
          </g>
        )}

        {/* 2. LAYOUT: 3D CELESTIAL WIREFRAMES BACKGROUND */}
        {layout !== 'map' && (
          <g stroke={isDarkMode ? '#242424' : '#EBE6DC'} fill="none" strokeWidth="0.85" opacity="0.55">
            {geometricRings.map((p, idx) => (
              <path key={idx} d={p} strokeDasharray={idx % 2 === 0 ? 'none' : '2,4'} />
            ))}
          </g>
        )}

        {/* 3. GEOGRAPHIC CITY BUILT EMBLEMS AND LABELS (MAP ONLY) */}
        {layout === 'map' && (
          <g id="historical-city-emblems-group">
            {CITIES_LIST.map((city) => {
              // Convert coordinate with dynamic zoom
              const dx = (city.x - 400) * zoom;
              const dy = (city.y - 260) * zoom;
              const cx = 400 + dx;
              const cy = 260 + dy;

              // Count companions clustered in this city
              const cityCompsCount = companions.filter(c => getCompanionAssignedCity(c) === city.id).length;

              return (
                <g key={city.id} className="transition-all duration-300">
                  {/* Dotted boundaries for companion system orbits */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={cityCompsCount > 4 ? 41 : 31}
                    fill="none"
                    stroke={isDarkMode ? 'rgba(174,139,59,0.1)' : 'rgba(174,139,59,0.15)'}
                    strokeWidth="0.8"
                    strokeDasharray="3,4"
                  />

                  {/* Pulsing focal hub core */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r="8"
                    fill={isDarkMode ? 'rgba(174,139,59,0.08)' : 'rgba(174,139,59,0.04)'}
                    className="animate-pulse"
                  />

                  {/* Vector ancient minaret/dome structure */}
                  <path
                    d={`M ${cx - 5} ${cy + 4} L ${cx - 5} ${cy - 1} Q ${cx} ${cy - 8} ${cx + 5} ${cy - 1} L ${cx + 5} ${cy + 4} Z`}
                    fill={isDarkMode ? 'rgba(212,175,55,0.7)' : 'rgba(197,160,89,0.7)'}
                    stroke={isDarkMode ? '#ae8b3b' : '#bfa168'}
                    strokeWidth="0.8"
                  />
                  <line
                    x1={cx}
                    y1={cy - 8}
                    x2={cx}
                    y2={cy - 12}
                    stroke={isDarkMode ? '#d4af37' : '#c5a059'}
                    strokeWidth="1"
                  />

                  {/* City Label plate - offset dynamically to avoid overlapping the nodes below or above */}
                  <g transform={`translate(${cx}, ${cy - 20})`}>
                    <rect
                      x="-42"
                      y="-11"
                      width="84"
                      height="19"
                      rx="4"
                      fill={isDarkMode ? '#0d0d0c' : '#FAF8F4'}
                      stroke={isDarkMode ? '#222' : '#E8DED2'}
                      strokeWidth="0.8"
                      className="shadow-sm border"
                    />
                    <text
                      textAnchor="middle"
                      y="-1"
                      className={`text-[8px] font-sans font-bold ${isDarkMode ? 'fill-amber-400' : 'fill-[#8A6D3B]'}`}
                    >
                      {lang === 'fr' ? translateCityLabel(city.id, 'fr').name : (isArabic ? city.labelAr : city.labelEn)}
                    </text>
                    <text
                      textAnchor="middle"
                      y="6"
                      className={`text-[6px] font-serif ${isDarkMode ? 'fill-stone-400' : 'fill-stone-500'}`}
                    >
                      {lang === 'fr' ? translateCityLabel(city.id, 'fr').hubText : (isArabic ? city.hubTextAr : city.hubTextEn)}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        )}

        {/* 4. HIGH-FIDELITY ARCHED CONNECTIONS AND RELATIONSHIPS */}
        <g id="celestial-relationship-bridges">
          {relationships.map(rel => {
            const startPt = projectedData[rel.sourceId];
            const endPt = projectedData[rel.targetId];
            if (!startPt || !endPt) return null;

            // Decision Guidlines: Connections MUST appear ONLY if either source or target is selected/highlighted 
            // of if they belong to a highlighted pathway. This keeps views entirely offline/clean by default!
            const isRelatedToClicked = selectedCompanion && (selectedCompanion.id === rel.sourceId || selectedCompanion.id === rel.targetId);
            const isPathSelected = highlightedPath && (highlightedPath.includes(rel.sourceId) && highlightedPath.includes(rel.targetId));
            
            if (!isRelatedToClicked && !isPathSelected) {
              return null; // pure minimalist hiding
            }

            const rConfig = (RELATION_CONFIG[rel.type] || { color: '#D4AF37', dash: '2,2', labelAr: '', labelEn: '' }) as { color: string; dash?: string; labelAr: string; labelEn: string };
            const dx = endPt.screenX - startPt.screenX;
            const dy = endPt.screenY - startPt.screenY;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            
            // Layout-specific customizable bend curves to avoid crowded centers
            const curveOffset = layout === 'map' ? 12 : 21;
            const controlX = (startPt.screenX + endPt.screenX) / 2 - (dy / distance) * curveOffset;
            const controlY = (startPt.screenY + endPt.screenY) / 2 + (dx / distance) * curveOffset;

            const color = isPathSelected ? '#D4AF37' : rConfig.color;
            const strokeWidth = isPathSelected ? 2.5 : 1.4;

            return (
              <g key={rel.id} className="transition-all duration-300">
                <path
                  d={`M ${startPt.screenX} ${startPt.screenY} Q ${controlX} ${controlY} ${endPt.screenX} ${endPt.screenY}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={rConfig.dash}
                  opacity="0.85"
                />
                
                {/* Float relationship label near center of the curve */}
                <g transform={`translate(${controlX}, ${controlY})`}>
                  <rect
                    x="-45"
                    y="-7"
                    width="90"
                    height="14"
                    rx="4"
                    fill={isDarkMode ? '#131411' : '#FCFAF7'}
                    stroke={color}
                    strokeWidth="0.8"
                    className="shadow-sm"
                  />
                  <text
                    textAnchor="middle"
                    y="3.5"
                    className={`text-[8px] font-sans font-bold ${isDarkMode ? 'fill-neutral-300' : 'fill-stone-800'}`}
                  >
                    {lang === 'fr' ? RELATIONSHIP_TRANSLATIONS[rel.type]?.fr : (isArabic ? rConfig.labelAr : rConfig.labelEn)}
                  </text>
                </g>
              </g>
            );
          })}
        </g>

        {/* 5. CELESTIAL STAR COMPANIONS */}
        <g id="celestial-stars-systems">
          {sortedDrawOrder.map(item => {
            const isSelected = selectedCompanion?.id === item.id;
            const isNeighbor = connectedNeighborIds.has(item.id);
            const isHovered = hoveredCompanion?.id === item.id;
            const isPathPoint = highlightedPath?.includes(item.id) || false;

            const category = item.companion.category;
            const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Other;

            // Z-Depth scaling logic
            const proximityScale = layout === 'map' ? 1.0 : (1.0 - (item.proj.zDepth / 1650));
            let sizeScale = 1.0;
            let opacity = 0.85;

            // Focus states filtering opacity
            if (selectedCompanion) {
              if (isSelected) {
                sizeScale = 1.55;
                opacity = 1.0;
              } else if (isNeighbor || isPathPoint) {
                sizeScale = 1.1;
                opacity = 0.95;
              } else {
                sizeScale = 0.55;
                opacity = 0.12; // Dim down unselected/unrelated companions to highlight links
              }
            } else if (hoveredCompanion) {
              const isDirectHoverNeighbor = relationships.some(r => 
                (r.sourceId === hoveredCompanion.id && r.targetId === item.id) ||
                (r.targetId === hoveredCompanion.id && r.sourceId === item.id)
              );
              if (item.id === hoveredCompanion.id) {
                sizeScale = 1.35;
                opacity = 1.0;
              } else if (isDirectHoverNeighbor) {
                sizeScale = 1.05;
                opacity = 0.9;
              } else {
                sizeScale = 0.6;
                opacity = 0.18;
              }
            }

            const finalScale = sizeScale * proximityScale;

            return (
              <g
                key={item.id}
                transform={`translate(${item.proj.screenX}, ${item.proj.screenY}) scale(${finalScale})`}
                className="cursor-pointer transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCompanion(item.companion);
                }}
                onMouseEnter={() => onHoverCompanion(item.companion)}
                onMouseLeave={() => onHoverCompanion(null)}
                opacity={opacity}
              >
                {/* Glowing light aura backdrop for active elements */}
                {(isSelected || isHovered || isPathPoint) && (
                  <circle
                    r="15"
                    fill={config.color}
                    opacity="0.32"
                    filter="url(#celestial-glow)"
                    className="animate-pulse"
                  />
                )}

                {/* Minimal elegant star center point */}
                <circle
                  r={isSelected ? "6.5" : "4.2"}
                  fill={config.color}
                  stroke={isDarkMode ? '#000' : '#FFF'}
                  strokeWidth={isSelected ? "1.8" : "1.1"}
                  className="shadow-sm transition-all duration-300"
                />

                {/* Rotating concentric orbiting ring indicating active selection */}
                {isSelected && (
                  <circle
                    r="10.5"
                    fill="none"
                    stroke="#D4AF37"
                    strokeWidth="1.0"
                    strokeDasharray="2,2"
                  />
                )}

                {/* VISIBLE CARDS ON SELECTION/HOVER ONLY: Reveals themselves cleanly on demand */}
                {(isSelected || isNeighbor || isHovered || isPathPoint) && (
                  <g className="transition-all duration-300 pointer-events-none">
                    <rect
                      x="-44"
                      y={isSelected ? "14" : "10"}
                      width="88"
                      height="20"
                      rx="4"
                      fill={isDarkMode ? 'rgba(9, 10, 8, 0.92)' : 'rgba(255, 255, 255, 0.96)'}
                      stroke={isSelected ? '#D4AF37' : config.color}
                      strokeWidth="0.8"
                      className="shadow-sm"
                    />
                    <text
                      y={isSelected ? "23" : "19"}
                      textAnchor="middle"
                      className={`text-[8.5px] font-bold font-serif ${
                        isSelected 
                          ? 'fill-amber-500 font-extrabold' 
                          : isDarkMode ? 'fill-neutral-200' : 'fill-stone-800'
                      }`}
                    >
                      {lang === 'fr' 
                        ? (item.companion.nameFr || item.companion.nameEn).split(' ')[0] 
                        : (isArabic ? item.companion.nameAr.split(' ')[0] : item.companion.nameEn.split(' ')[0])}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Active Selection Banner Indicator on Click */}
      {selectedCompanion && (
        <div className={`absolute top-18 left-4 p-3 rounded-2xl border flex items-center gap-3 shadow-lg backdrop-blur-md transition-all duration-300 ${
          isDarkMode 
            ? 'bg-neutral-950/90 border-neutral-800 text-stone-200' 
            : 'bg-white/95 border-stone-200 text-stone-800'
        }`}>
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_CONFIG[selectedCompanion.category]?.color || '#71717A' }} />
          <div className="flex flex-col text-xs font-serif leading-tight">
            <span className="font-bold">{lang === 'fr' ? (selectedCompanion.nameFr || selectedCompanion.nameEn) : (isArabic ? selectedCompanion.nameAr : selectedCompanion.nameEn)}</span>
            <span className="text-[10px] text-stone-550 capitalize">
              {lang === 'fr' ? CATEGORY_TRANSLATIONS[selectedCompanion.category]?.fr : (isArabic ? CATEGORY_TRANSLATIONS[selectedCompanion.category]?.ar : CATEGORY_TRANSLATIONS[selectedCompanion.category]?.en)}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onHoverCompanion(null);
              // reset companion by clicking deselect in parent App
              onSelectCompanion(selectedCompanion); // toggles off if done again or reset
            }}
            className="text-[10px] ml-2 px-1 rounded bg-stone-150 dark:bg-neutral-800 hover:text-red-500 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Astro Categories Legend Toggle Pill */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
        <button
          onClick={() => setIsLegendOpen(!isLegendOpen)}
          className={`p-2.5 px-4 rounded-full border text-xs font-sans font-bold flex items-center gap-2 shadow-md backdrop-blur-md transition-all ${
            isDarkMode 
              ? 'bg-neutral-950/80 border-neutral-850 text-stone-300 font-bold' 
              : 'bg-white/85 border-stone-200 text-stone-705 font-bold'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
          <span>{lang === 'fr' ? 'Classifications' : (isArabic ? 'الفئات النجمية' : 'Classifications')}</span>
        </button>

        {/* Legend Expandable Menu */}
        {isLegendOpen && (
          <div className={`absolute bottom-12 right-0 w-[240px] p-3.5 rounded-2xl border shadow-xl backdrop-blur-md transition-all ${
            isDarkMode 
              ? 'bg-neutral-950/95 border-neutral-800 text-stone-300' 
              : 'bg-white/95 border-stone-200 text-stone-800'
          }`}>
            <div className="font-serif font-bold text-xs border-b pb-1.5 mb-2 flex items-center justify-between">
              <span>{lang === 'fr' ? 'Groupements Célestes' : (isArabic ? 'تصانيف النجوم الكونية' : 'Celestial Groupings')}</span>
              <button onClick={() => setIsLegendOpen(false)} className="text-[10px] text-stone-550 hover:text-stone-300">✕</button>
            </div>
            <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2 text-[10.5px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: config.color }} />
                  <span className="text-stone-500 dark:text-stone-300 truncate">
                    {lang === 'fr' ? CATEGORY_TRANSLATIONS[key as CompanionCategory]?.fr : (isArabic ? config.labelAr : config.labelEn)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
