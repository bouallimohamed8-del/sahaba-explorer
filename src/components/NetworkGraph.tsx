/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Companion, Relationship, CompanionCategory, RelationshipType } from '../types';
import { ZoomIn, ZoomOut, Maximize2, Compass, Move, HelpCircle, LayoutGrid, RotateCcw, Orbit } from 'lucide-react';

interface NetworkGraphProps {
  companions: Companion[];
  relationships: Relationship[];
  selectedCompanion: Companion | null;
  onSelectCompanion: (companion: Companion) => void;
  hoveredCompanion: Companion | null;
  onHoverCompanion: (companion: Companion | null) => void;
  isArabic: boolean;
  highlightedPath: string[] | null; // list of companion IDs in path
  isDarkMode?: boolean;
}

// Category Configuration mapping colors and labels
export const CATEGORY_CONFIG: Record<CompanionCategory, { color: string; bgClass: string; textClass: string; labelAr: string; labelEn: string }> = {
  Khulafa_Rashidun: {
    color: '#D4AF37', // Gold
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
    color: '#3B82F6', // celestial blue
    bgClass: 'bg-blue-500/15 border-blue-400',
    textClass: 'text-blue-500',
    labelAr: 'المهاجرون',
    labelEn: 'Muhajirun'
  },
  Ansar: {
    color: '#22C55E', // Green
    bgClass: 'bg-green-500/15 border-green-400',
    textClass: 'text-green-500',
    labelAr: 'الأنصار',
    labelEn: 'Ansar'
  },
  Wives: {
    color: '#EC4899', // Pink
    bgClass: 'bg-pink-500/15 border-pink-400',
    textClass: 'text-pink-500',
    labelAr: 'أمهات المؤمنين',
    labelEn: 'Wives of the Prophet ﷺ'
  },
  Hadith_Narrators: {
    color: '#8B5CF6', // Purple
    bgClass: 'bg-violet-500/15 border-violet-400',
    textClass: 'text-violet-500',
    labelAr: 'رواة الحديث الحفاظ',
    labelEn: 'Hadith Narrators'
  },
  Military: {
    color: '#EF4444', // Red
    bgClass: 'bg-red-500/15 border-red-400',
    textClass: 'text-red-500',
    labelAr: 'القادة الفاتحون',
    labelEn: 'Military Commanders'
  },
  Scholars: {
    color: '#06B6D4', // Cyan
    bgClass: 'bg-cyan-500/15 border-cyan-400',
    textClass: 'text-cyan-500',
    labelAr: 'العلماء والفقهاء',
    labelEn: 'Scholars'
  },
  Other: {
    color: '#6B7280', // Grey
    bgClass: 'bg-zinc-500/15 border-zinc-400',
    textClass: 'text-zinc-500',
    labelAr: 'صحابة آخرون',
    labelEn: 'Other Sahaba'
  }
};

// Relationship Visual Config mapping unique styling and markers
export const RELATION_CONFIG: Record<RelationshipType, { color: string; dash?: string; labelAr: string; labelEn: string; icon: string }> = {
  family: {
    color: '#EAB308', // Amber
    dash: 'none',
    labelAr: 'قرابة ونسب عائلي',
    labelEn: 'Family relationship',
    icon: '👥'
  },
  marriage: {
    color: '#EC4899', // Pink
    dash: '4,4',
    labelAr: 'رابطة صهر ومصاهرة',
    labelEn: 'Marriage connection',
    icon: '💍'
  },
  teacher_student: {
    color: '#06B6D4', // Cyan
    dash: 'none',
    labelAr: 'أستاذ وتلميذ/رواية',
    labelEn: 'Teacher / Student link',
    icon: '📜'
  },
  friendship: {
    color: '#3B82F6', // Blue
    dash: '2,2',
    labelAr: 'مؤاخاة وصداقة وثيقة',
    labelEn: 'Friendship & Brotherhood',
    icon: '🤝'
  },
  hijra_partner: {
    color: '#10B981', // Esmerald
    dash: '6,3',
    labelAr: 'شراكة هجرة فداء',
    labelEn: 'Migration Partner',
    icon: '🐪'
  },
  battle_comrade: {
    color: '#EF4444', // Red
    dash: 'none',
    labelAr: 'رفقة جهاد وغزوات',
    labelEn: 'Battle Comrade',
    icon: '⚔️'
  },
  political: {
    color: '#8B5CF6', // Purple
    dash: '5,5',
    labelAr: 'شورى وإدارة وسياسة',
    labelEn: 'Shura / Alliance',
    icon: '🏛️'
  },
  hadith_transmission: {
    color: '#F97316', // Orange
    dash: '1,3',
    labelAr: 'إسناد ورواية أثر',
    labelEn: 'Hadith transmission chain',
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
  
  // Interactive View Settings
  const [zoom, setZoom] = useState<number>(0.9);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 260, y: 190 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const panStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Layout Styles and Custom Positions offsets logic
  const [layoutStyle, setLayoutStyle] = useState<'concentric' | 'radial'>('concentric');
  const [dragOffsets, setDragOffsets] = useState<Record<string, { x: number; y: number }>>({});

  // Interactive Legend Highlight / Filtering States
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);
  const [hoveredCategoryKey, setHoveredCategoryKey] = useState<string | null>(null);

  // 1. DYNAMIC STABLE DETERMINISTIC CONCENTRIC LAYOUT
  const concentricPositions = useMemo(() => {
    const list: Record<string, { x: number; y: number }> = {};
    const center = { x: 400, y: 300 };

    // Grouping by concentric ring ranks
    const ring0: Companion[] = []; // Centerpiece characters
    const ring1: Companion[] = []; // Core Prophet family & companions
    const ring2: Companion[] = []; // Important Migrators/Helpers
    const ring3: Companion[] = []; // Other historical elites

    companions.forEach(c => {
      if (c.category === 'Khulafa_Rashidun') {
        ring0.push(c);
      } else if (c.category === 'Ahl_al_Bayt' || c.category === 'Wives') {
        ring1.push(c);
      } else if (c.category === 'Muhajirun' || c.category === 'Ansar') {
        ring2.push(c);
      } else {
        ring3.push(c);
      }
    });

    const plotRing = (ringCompanions: Companion[], radius: number) => {
      const len = ringCompanions.length;
      ringCompanions.forEach((comp, idx) => {
        const angle = (idx / (len || 1)) * 2 * Math.PI - Math.PI / 2;
        list[comp.id] = {
          x: center.x + Math.cos(angle) * radius,
          y: center.y + Math.sin(angle) * radius
        };
      });
    };

    plotRing(ring0, 75);
    plotRing(ring1, 155);
    plotRing(ring2, 235);
    plotRing(ring3, 315);

    return list;
  }, [companions]);

  // 2. DYNAMIC STABLE DETERMINISTIC SPIRAL STAR GALAXY LAYOUT
  const radialPositions = useMemo(() => {
    const list: Record<string, { x: number; y: number }> = {};
    const center = { x: 400, y: 300 };
    const len = companions.length;

    companions.forEach((comp, idx) => {
      const angle = idx * 2.39996; // Golden Angle spacing to avoid overlaps
      const radius = 50 + (idx / (len || 1)) * 270;
      list[comp.id] = {
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius
      };
    });

    return list;
  }, [companions]);

  // Combined positions calculated from base layouts and offsets
  const nodes = useMemo(() => {
    const base = layoutStyle === 'concentric' ? concentricPositions : radialPositions;
    const finalNodes: Record<string, { id: string; x: number; y: number }> = {};

    companions.forEach(c => {
      const basePos = base[c.id] || { x: 400, y: 300 };
      const offset = dragOffsets[c.id] || { x: 0, y: 0 };
      finalNodes[c.id] = {
        id: c.id,
        x: basePos.x + offset.x,
        y: basePos.y + offset.y
      };
    });

    return finalNodes;
  }, [companions, layoutStyle, concentricPositions, radialPositions, dragOffsets]);

  // Compile map nodes statistics for legend badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    companions.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [companions]);

  // Set optimal panning centering on Selected Companion node
  useEffect(() => {
    if (selectedCompanion && nodes[selectedCompanion.id]) {
      const node = nodes[selectedCompanion.id];
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        setPan({
          x: centerX - node.x * zoom,
          y: centerY - node.y * zoom
        });
      }
    }
  }, [selectedCompanion]);

  // Drag and Pan SVG callbacks
  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggedNodeId) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y
      });
    } else if (draggedNodeId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const localX = (e.clientX - rect.left - pan.x) / zoom;
      const localY = (e.clientY - rect.top - pan.y) / zoom;

      setDragOffsets(prev => ({
        ...prev,
        [draggedNodeId]: {
          x: localX - dragStartPos.current.x,
          y: localY - dragStartPos.current.y
        }
      }));
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  const handleNodeDragStart = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggedNodeId(id);

    const base = layoutStyle === 'concentric' ? concentricPositions : radialPositions;
    const basePos = base[id] || { x: 400, y: 300 };
    const currentOffset = dragOffsets[id] || { x: 0, y: 0 };

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const localX = (e.clientX - rect.left - pan.x) / zoom;
      const localY = (e.clientY - rect.top - pan.y) / zoom;

      // Track the displacement vector
      dragStartPos.current = {
        x: localX - currentOffset.x,
        y: localY - currentOffset.y
      };
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 2.3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.45));
  const handleResetZoomAndPositions = () => {
    setZoom(0.9);
    setPan({ x: 260, y: 190 });
    setDragOffsets({});
    setSelectedCategoryKey(null);
    setHoveredCategoryKey(null);
  };

  // Determine if a specific node is highlighted or dimmed
  const checkNodeState = (companion: Companion) => {
    const isSelected = selectedCompanion?.id === companion.id;
    const isHovered = hoveredCompanion?.id === companion.id;
    const isPathMember = highlightedPath?.includes(companion.id);
    const categoryMatches = !selectedCategoryKey || companion.category === selectedCategoryKey;
    const hoverCategoryMatches = !hoveredCategoryKey || companion.category === hoveredCategoryKey;

    // Check if neighbors highlighting is happening (hover companion is active)
    let isConnectedNeighbor = false;
    let anyNeighborHighlighting = hoveredCompanion !== null;
    
    if (hoveredCompanion) {
      isConnectedNeighbor = relationships.some(r => 
        (r.sourceId === hoveredCompanion.id && r.targetId === companion.id) ||
        (r.targetId === hoveredCompanion.id && r.sourceId === companion.id)
      );
    }

    // Node is glowing/active
    const isActive = isSelected || isHovered || isPathMember || 
                     (selectedCategoryKey && categoryMatches) || 
                     (hoveredCategoryKey && hoverCategoryMatches) ||
                     isConnectedNeighbor;

    // Node should be dimmed because other elements are selected/hovered and it does not fit
    const shouldDim = (selectedCompanion !== null && !isSelected && !isPathMember) || 
                       (hoveredCompanion !== null && !isHovered && !isConnectedNeighbor) ||
                       (selectedCategoryKey && !categoryMatches) ||
                       (hoveredCategoryKey && !hoverCategoryMatches);

    return { isSelected, isHovered, isPathMember, isActive, shouldDim, isConnectedNeighbor };
  };

  // Minimap layout logic coordinates representation
  const miniNodes = useMemo(() => {
    return Object.keys(nodes).map(key => {
      const node = nodes[key];
      const companion = companions.find(c => c.id === key);
      return {
        id: key,
        x: (node.x / 800) * 120,
        y: (node.y / 600) * 85,
        companion
      };
    });
  }, [nodes, companions]);

  return (
    <div
      id="sahaba-graph-canvas-wrapper"
      ref={containerRef}
      className={`relative w-full h-[540px] border rounded-[2rem] overflow-hidden transition-all duration-300 shadow-xl ${
        isDarkMode 
          ? 'bg-[#181914] border-[#2F3124] natural-dotted-bg-dark text-slate-100' 
          : 'bg-[#F2ECE0] border-[#DCD5C4] natural-dotted-bg text-[#443825]'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      style={{ cursor: isPanning ? 'grabbing' : draggedNodeId ? 'grabbing' : 'grab' }}
    >
      {/* Decorative Star Islamic Motif Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
        <svg width="420" height="420" viewBox="0 0 100 100" fill="currentColor" className="text-natural-accent">
          <path d="M50 0L61.2 38.8L100 50L61.2 61.2L50 100L38.8 61.2L0 50L38.8 38.8Z" />
          <circle cx="50" cy="50" r="13" fill="none" stroke="currentColor" strokeWidth="0.85" />
        </svg>
      </div>

      {/* Elegant Layout & Navigation Header Controls Ribbons */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2 items-center justify-between pointer-events-none">
        
        {/* Help tooltip pills */}
        <div className={`px-4 py-2 rounded-full border text-xs flex items-center gap-2 pointer-events-auto shadow-md backdrop-blur-md transition ${
          isDarkMode 
            ? 'bg-[#1D1E16]/90 border-[#3B3D2C] text-slate-200' 
            : 'bg-white/90 border-[#D8CEB6] text-[#4E3D25] font-serif font-bold'
        }`}>
          <Compass className="w-3.5 h-3.5 text-natural-accent animate-spin-slow shrink-0" />
          <span className="text-[11px]">
            {isArabic
              ? 'تفاعل: اسحب اللوحة • عجلات الفأرة للتكبير والتحجيم • رتب العقد المفضلة بالسحب'
              : 'Interact: Drag to pan • Scroll to zoom • Drag any hero to space them'}
          </span>
        </div>

        {/* Dynamic controls and layout selector */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Layout mode buttons */}
          <div className={`flex rounded-full p-1 border shadow-md backdrop-blur-md ${
            isDarkMode ? 'bg-[#1D1E16]/95 border-[#3B3D2C]' : 'bg-white/95 border-[#D8CEB6]'
          }`}>
            <button
              onClick={() => setLayoutStyle('concentric')}
              className={`p-1.5 px-3 rounded-full text-xs font-serif font-bold flex items-center gap-1 transition ${
                layoutStyle === 'concentric'
                  ? 'bg-natural-brand text-white shadow-inner'
                  : 'text-stone-500 hover:text-natural-accent hover:bg-stone-100 dark:hover:bg-neutral-800'
              }`}
              title={isArabic ? 'تنسيق الحلقات المئوية' : 'Concentric Generation Circles'}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10.5px]">{isArabic ? 'التوزيع التاريخي' : 'Generations Ring'}</span>
            </button>
            <button
              onClick={() => setLayoutStyle('radial')}
              className={`p-1.5 px-3 rounded-full text-xs font-serif font-bold flex items-center gap-1 transition-all ${
                layoutStyle === 'radial'
                  ? 'bg-natural-brand text-white shadow'
                  : 'text-stone-500 hover:text-natural-accent hover:bg-stone-100 dark:hover:bg-neutral-800'
              }`}
              title={isArabic ? 'تنسيق المجرة النجمية' : 'Shorthand Spiral Galaxy'}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10.5px]">{isArabic ? 'المجرة النجمية' : 'Spiral Galaxy'}</span>
            </button>
          </div>

          {/* Zooms configuration panel */}
          <div className={`flex items-center gap-1 p-1 rounded-full border shadow-md backdrop-blur-md ${
            isDarkMode ? 'bg-[#1D1E16]/95 border-[#3B3D2C]' : 'bg-white/95 border-[#D8CEB6]'
          }`}>
            <button
              className="p-2 rounded-full transition hover:bg-stone-150 text-stone-500 hover:text-natural-brand active:scale-90 dark:hover:bg-neutral-800"
              onClick={handleZoomIn}
              title={isArabic ? 'تقريب' : 'Zoom In'}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              className="p-2 rounded-full transition hover:bg-stone-150 text-stone-500 hover:text-natural-brand active:scale-90 dark:hover:bg-neutral-800"
              onClick={handleZoomOut}
              title={isArabic ? 'إبعاد' : 'Zoom Out'}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              className="p-2 rounded-full transition hover:bg-stone-150 text-stone-500 hover:text-natural-accent active:scale-90 dark:hover:bg-neutral-800"
              onClick={handleResetZoomAndPositions}
              title={isArabic ? 'إعادة ضبط العرض والعقد' : 'Reset Coordinates Layout'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Central SVG Graphic Board Workspace */}
      <svg className="w-full h-full select-none">
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          <defs>
            {/* Arrows Setup */}
            {Object.keys(RELATION_CONFIG).map(type => {
              const conf = RELATION_CONFIG[type as RelationshipType];
              return (
                <marker
                  key={`marker-${type}`}
                  id={`arrow-${type}`}
                  viewBox="0 0 10 10"
                  refX="16"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto"
                >
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill={conf.color} />
                </marker>
              );
            })}
          </defs>

          {/* 1. RELATIONS / EDGES DRAFT LINES */}
          <g id="graph-edges">
            {relationships.map(rel => {
              const start = nodes[rel.sourceId];
              const end = nodes[rel.targetId];
              if (!start || !end) return null;

              const companionStart = companions.find(c => c.id === rel.sourceId);
              const companionEnd = companions.find(c => c.id === rel.targetId);
              if (!companionStart || !companionEnd) return null;

              // Check if nodes related to this line are active/hovered/selected
              const stateStart = checkNodeState(companionStart);
              const stateEnd = checkNodeState(companionEnd);

              const isPathEdge = highlightedPath?.includes(rel.sourceId) && highlightedPath?.includes(rel.targetId);
              const isDirectlyFocused = (hoveredCompanion?.id === rel.sourceId || hoveredCompanion?.id === rel.targetId) ||
                                         (selectedCompanion?.id === rel.sourceId || selectedCompanion?.id === rel.targetId);

              const config = RELATION_CONFIG[rel.type] || { color: '#6B7280', dash: 'none' };

              // Determine visual opacity based on search/filters
              let strokeOpacity = isDarkMode ? 0.22 : 0.35;
              let strokeWidth = 1.6;

              if (isPathEdge) {
                strokeOpacity = 1.0;
                strokeWidth = 3.5;
              } else if (isDirectlyFocused) {
                strokeOpacity = 0.9;
                strokeWidth = 2.4;
              } else if (selectedCategoryKey) {
                const matchesCat = companionStart.category === selectedCategoryKey && companionEnd.category === selectedCategoryKey;
                strokeOpacity = matchesCat ? 0.6 : 0.08;
              } else if (hoveredCategoryKey) {
                const matchesCat = companionStart.category === hoveredCategoryKey && companionEnd.category === hoveredCategoryKey;
                strokeOpacity = matchesCat ? 0.61 : 0.08;
              } else if (selectedCompanion || hoveredCompanion) {
                // Dim other inactive relationship edges
                strokeOpacity = 0.06;
              }

              // Arc math coordinates
              const midX = (start.x + end.x) / 2;
              const midY = (start.y + end.y) / 2;

              return (
                <g key={rel.id} className="transition-all duration-300">
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={config.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={config.dash}
                    opacity={strokeOpacity}
                    markerEnd={`url(#arrow-${rel.type})`}
                    className="transition-all duration-300"
                  />

                  {/* Micro relation label overlay inside curves */}
                  {(isDirectlyFocused || isPathEdge) && (
                    <g transform={`translate(${midX}, ${midY - 4})`} className="cursor-help">
                      <rect
                        x="-60"
                        y="-9"
                        width="120"
                        height="17"
                        rx="4"
                        fill={isDarkMode ? '#22231C' : '#FCFBFA'}
                        stroke={config.color}
                        strokeWidth="1"
                        className="shadow"
                      />
                      <text
                        className={`text-[8.5px] font-bold font-serif ${isDarkMode ? 'fill-slate-350' : 'fill-[#443825]'}`}
                        textAnchor="middle"
                        y="2"
                      >
                        {isArabic ? rel.labelAr : rel.labelEn}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* 2. COMPANION HERO NODES */}
          <g id="graph-nodes">
            {companions.map(companion => {
              const pos = nodes[companion.id];
              if (!pos) return null;

              const { isSelected, isHovered, isPathMember, isActive, shouldDim, isConnectedNeighbor } = checkNodeState(companion);
              const cat = CATEGORY_CONFIG[companion.category] || CATEGORY_CONFIG.Other;

              let scale = 1.0;
              let borderStroke = cat.color;
              let borderWidth = 2.0;
              let textWeight = 'font-normal';

              if (isSelected) {
                scale = 1.35;
                borderStroke = isDarkMode ? '#FFFFFF' : '#4E3D25';
                borderWidth = 3.8;
                textWeight = 'font-bold';
              } else if (isHovered || isConnectedNeighbor) {
                scale = 1.2;
                borderWidth = 2.8;
                borderStroke = '#D4AF37'; // Golden glow highlights
              } else if (isActive) {
                scale = 1.1;
                borderWidth = 2.5;
              } else if (shouldDim) {
                scale = 0.85;
              }

              return (
                <g
                  key={companion.id}
                  id={`node-${companion.id}`}
                  transform={`translate(${pos.x}, ${pos.y}) scale(${scale})`}
                  className="transition-all duration-300 cursor-pointer"
                  onClick={() => onSelectCompanion(companion)}
                  onMouseEnter={() => onHoverCompanion(companion)}
                  onMouseLeave={() => onHoverCompanion(null)}
                  onMouseDown={(e) => handleNodeDragStart(companion.id, e)}
                  opacity={shouldDim ? 0.28 : 1.0}
                >
                  {/* Dynamic pulse glow ring effect */}
                  {(isSelected || isHovered) && (
                    <circle
                      r="24"
                      fill="none"
                      stroke={cat.color}
                      strokeWidth="2"
                      className="animate-pulse opacity-40"
                    />
                  )}

                  {/* Elegant Octagonal Geometrical Border matching Islamic theme */}
                  <path
                    d="M -15,-6 L -6,-15 L 6,-15 L 15,-6 L 15,6 L 6,15 L -6,15 L -15,6 Z"
                    fill={isDarkMode ? '#22231C' : '#FCFBFA'}
                    stroke={borderStroke}
                    strokeWidth={borderWidth}
                    className="transition-all duration-300 shadow-md"
                  />

                  {/* Ring highlight interior */}
                  <circle
                    cx="0"
                    cy="0"
                    r="9.5"
                    fill={cat.color}
                    className="opacity-25"
                  />

                  {/* Islamic calligraphic initial character key */}
                  <text
                    className="text-[9.5px] font-bold font-serif"
                    textAnchor="middle"
                    y="3"
                    fill={cat.color}
                  >
                    {companion.nameAr.charAt(0)}
                  </text>

                  {/* Companions Arabic Title Label Tags */}
                  <text
                    className={`text-[10px] select-none ${textWeight} font-serif tracking-tight ${
                      isDarkMode ? 'fill-slate-150' : 'fill-[#2B2319]'
                    }`}
                    textAnchor="middle"
                    y="25"
                    style={{ textShadow: isDarkMode ? '0 1px 2px rgba(0,0,0,0.8)' : '0 1px 1px rgba(255,255,255,0.7)' }}
                  >
                    {companion.nameAr.split(' ')[0]}
                  </text>

                  {/* Transliterated English Label */}
                  <text
                    className={`text-[7.5px] select-none font-mono ${
                      isDarkMode ? 'fill-slate-400' : 'fill-stone-500'
                    }`}
                    textAnchor="middle"
                    y="31.5"
                  >
                    {companion.nameEn.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* INTERACTIVE LEGEND BAR PANEL */}
      <div className={`absolute bottom-4 right-4 z-10 rounded-2xl border p-3 w-[240px] max-h-[220px] overflow-y-auto shadow-xl backdrop-blur-md transition-all ${
        isDarkMode 
          ? 'bg-[#181914]/95 border-[#2F3124] text-slate-300' 
          : 'bg-white/95 border-[#D8CEB6] text-[#4E3D25] font-serif'
      }`}>
        <div className={`font-bold border-b pb-1.5 mb-2 flex items-center justify-between text-xs ${
          isDarkMode ? 'text-slate-200 border-neutral-800' : 'border-neutral-200/65'
        }`}>
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-natural-accent" />
            <span>{isArabic ? 'تصنيف الفئات والنسب' : 'Interactive Categories'}</span>
          </div>
          {(selectedCategoryKey || hoveredCategoryKey) && (
            <button
              onClick={() => setSelectedCategoryKey(null)}
              className="text-[9px] px-1.5 py-0.5 rounded bg-natural-accent/15 hover:bg-natural-accent/30 text-natural-accent font-mono cursor-pointer active:scale-95"
            >
              {isArabic ? 'إلغاء الفرز' : 'Clear'}
            </button>
          )}
        </div>

        {/* Categories items looping */}
        <div className="space-y-1">
          {Object.entries(CATEGORY_CONFIG).slice(0, 8).map(([key, value]) => {
            const count = categoryCounts[key] || 0;
            const isFilterSelected = selectedCategoryKey === key;
            const isFilterHovered = hoveredCategoryKey === key;

            return (
              <div
                key={key}
                onClick={() => setSelectedCategoryKey(isFilterSelected ? null : key)}
                onMouseEnter={() => setHoveredCategoryKey(key)}
                onMouseLeave={() => setHoveredCategoryKey(null)}
                className={`flex items-center justify-between text-[10.5px] p-1 px-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                  isFilterSelected
                    ? 'bg-natural-brand/10 text-natural-brand font-bold ring-1 ring-natural-brand/35'
                    : isFilterHovered
                      ? isDarkMode ? 'bg-[#2E3024]/50' : 'bg-stone-100'
                      : 'hover:bg-natural-brand/5'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0 border border-black/10 shadow-sm"
                    style={{ backgroundColor: value.color }}
                  />
                  <span className="truncate pr-1">{isArabic ? value.labelAr : value.labelEn}</span>
                </div>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                  isDarkMode ? 'bg-neutral-800 text-stone-300' : 'bg-stone-100 border text-stone-600'
                }`}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* MINI MAP NAVIGATION */}
      <div className={`absolute bottom-4 left-4 z-10 rounded-2xl border p-2 h-[110px] w-[140px] shadow-xl backdrop-blur-md select-none transition ${
        isDarkMode 
          ? 'bg-[#181914]/95 border-[#2F3124]' 
          : 'bg-white/95 border-[#D8CEB6]'
      }`}>
        <div className={`text-[8.5px] border-b pb-1 mb-1 flex justify-between items-center px-1 ${
          isDarkMode ? 'text-slate-400 border-neutral-800' : 'text-stone-600 border-neutral-100'
        }`}>
          <span>{isArabic ? 'منظور البوصلة' : 'Macro Radar'}</span>
          <Move className="w-2.5 h-2.5 text-natural-accent" />
        </div>
        <div className={`relative w-full h-[73px] border rounded-lg overflow-hidden ${
          isDarkMode ? 'bg-[#12120C] border-[#22231C]' : 'bg-[#EFEDE6] border-stone-200'
        }`}>
          <svg className="w-full h-full">
            {miniNodes.map(m => (
              <circle
                key={`mini-${m.id}`}
                cx={m.x}
                cy={m.y}
                r={hoveredCompanion?.id === m.id || selectedCompanion?.id === m.id ? 2.8 : 1.2}
                fill={m.companion ? CATEGORY_CONFIG[m.companion.category]?.color || '#888' : '#888'}
                opacity={selectedCompanion?.id === m.id ? 1.0 : 0.8}
              />
            ))}
            {/* Camera rectangular bounding preview bounds */}
            <rect
              x={Math.max(10, 48 - pan.x / 11)}
              y={Math.max(10, 38 - pan.y / 11)}
              width={Math.min(105, 120 / zoom)}
              height={Math.min(65, 75 / zoom)}
              fill="none"
              stroke="#D4AF37"
              strokeWidth="0.8"
              strokeDasharray="1,2"
              opacity={0.65}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
