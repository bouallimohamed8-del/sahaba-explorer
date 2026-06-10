/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Companion, Relationship, CompanionCategory, RelationshipType } from '../types';
import { ZoomIn, ZoomOut, Maximize2, Compass, Move, HelpCircle, RefreshCw } from 'lucide-react';

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

interface NodeState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
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
  const [zoom, setZoom] = useState<number>(0.9);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 300, y: 220 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const panStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Physics Simulation Node positions state
  const [nodes, setNodes] = useState<Record<string, NodeState>>({});

  // Initialize nodes in circular coordinates around center
  useEffect(() => {
    const initialNodes: Record<string, NodeState> = {};
    const radius = 220;
    companions.forEach((companion, index) => {
      // If it already exists, keep or slightly update
      if (nodes[companion.id]) {
        initialNodes[companion.id] = nodes[companion.id];
      } else {
        const angle = (index / companions.length) * 2 * Math.PI;
        initialNodes[companion.id] = {
          id: companion.id,
          x: 400 + Math.cos(angle) * radius + (Math.random() - 0.5) * 40,
          y: 300 + Math.sin(angle) * radius + (Math.random() - 0.5) * 40,
          vx: 0,
          vy: 0
        };
      }
    });

    // Cleanup obsolete nodes
    Object.keys(nodes).forEach(key => {
      if (companions.some(c => c.id === key)) {
        initialNodes[key] = nodes[key];
      }
    });

    setNodes(initialNodes);
  }, [companions]);

  // Run Physics Simulation loop
  useEffect(() => {
    let animationFrameId: number;

    const runPhysics = () => {
      setNodes(prevNodes => {
        const nextNodes = JSON.parse(JSON.stringify(prevNodes)) as Record<string, NodeState>;
        const nodeIds = Object.keys(nextNodes);
        if (nodeIds.length === 0) return prevNodes;

        const kCharge = -1200; // Repulsion strength
        const kSpring = 0.05;   // Link spring stretch
        const idealLength = 160; // Ideal link distance
        const kCenter = 0.015;   // Tendency to return to center
        const friction = 0.82;  // Deceleration

        // 1. Repulsion force between all node pairs
        for (let i = 0; i < nodeIds.length; i++) {
          const idA = nodeIds[i];
          const nodeA = nextNodes[idA];
          if (idA === draggedNodeId) continue;

          for (let j = i + 1; j < nodeIds.length; j++) {
            const idB = nodeIds[j];
            const nodeB = nextNodes[idB];

            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const distSq = dx * dx + dy * dy + 0.1;
            const dist = Math.sqrt(distSq);

            if (dist < 400) {
              const force = (kCharge / distSq);
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;

              if (idA !== draggedNodeId) {
                nodeA.vx += fx;
                nodeA.vy += fy;
              }
              if (idB !== draggedNodeId) {
                nodeB.vx -= fx;
                nodeB.vy -= fy;
              }
            }
          }
        }

        // 2. Spring force along active connections/relationships
        relationships.forEach(rel => {
          const nodeA = nextNodes[rel.sourceId];
          const nodeB = nextNodes[rel.targetId];
          if (!nodeA || !nodeB) return;

          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const dist = Math.sqrt(dx * dx + dy * dy) + 0.1;

          const displacement = dist - idealLength;
          const force = kSpring * displacement;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (rel.sourceId !== draggedNodeId) {
            nodeA.vx += fx;
            nodeA.vy += fy;
          }
          if (rel.targetId !== draggedNodeId) {
            nodeB.vx -= fx;
            nodeB.vy -= fy;
          }
        });

        // 3. Central gravitational anchor & update coordinates
        nodeIds.forEach(id => {
          const node = nextNodes[id];
          if (id === draggedNodeId) return; // Keep dragged node anchored to mouse

          const dx = 400 - node.x;
          const dy = 300 - node.y;
          node.vx += dx * kCenter;
          node.vy += dy * kCenter;

          node.vx *= friction;
          node.vy *= friction;

          // Cap velocity
          const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
          if (speed > 12) {
            node.vx = (node.vx / speed) * 12;
            node.vy = (node.vy / speed) * 12;
          }

          node.x += node.vx;
          node.y += node.vy;

          // Dampen boundaries so nodes don't fly off screen
          if (node.x < 50) { node.x = 55; node.vx *= -0.5; }
          if (node.x > 750) { node.x = 745; node.vx *= -0.5; }
          if (node.y < 50) { node.y = 55; node.vy *= -0.5; }
          if (node.y > 550) { node.y = 545; node.vy *= -0.5; }
        });

        return nextNodes;
      });

      animationFrameId = requestAnimationFrame(runPhysics);
    };

    animationFrameId = requestAnimationFrame(runPhysics);
    return () => cancelAnimationFrame(animationFrameId);
  }, [relationships, draggedNodeId]);

  // Handle Dragging / Panning on SVG Board
  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggedNodeId) return; // If clicking a node, don't pan board
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
      // Calculate local mouse points on the scaled board
      const localX = (e.clientX - rect.left - pan.x) / zoom;
      const localY = (e.clientY - rect.top - pan.y) / zoom;

      setNodes(prev => {
        if (!prev[draggedNodeId]) return prev;
        const copy = { ...prev };
        copy[draggedNodeId] = {
          ...copy[draggedNodeId],
          x: localX,
          y: localY,
          vx: 0,
          vy: 0
        };
        return copy;
      });
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  const handleNodeDragStart = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggedNodeId(id);
  };

  // Zoom helpers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.4));
  const handleResetZoom = () => {
    setZoom(1.0);
    setPan({ x: 220, y: 140 });
  };

  // Auto-set optimal pan on selecting a companion to focus and center on them
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

  // Minimap layout logic: nodes relative to full dimension
  const miniNodes = useMemo(() => {
    return (Object.values(nodes) as NodeState[]).map(n => ({
      id: n.id,
      x: (n.x / 800) * 120,
      y: (n.y / 600) * 90,
      companion: companions.find(c => c.id === n.id)
    }));
  }, [nodes, companions]);

  return (
    <div
      id="sahaba-graph-canvas-wrapper"
      ref={containerRef}
      className={`relative w-full h-[520px] ${isDarkMode ? 'bg-[#22231C] border-[#2E3024] natural-dotted-bg-dark' : 'bg-[#EDE8DF] border-natural-accent/35 natural-dotted-bg'} overflow-hidden border rounded-3xl transition duration-300 shadow-inner`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      style={{ cursor: isPanning ? 'grabbing' : draggedNodeId ? 'grabbing' : 'grab' }}
    >
      {/* Background Star/Pattern Motif */}
      <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
        <svg width="400" height="400" viewBox="0 0 100 100" fill="currentColor" className="text-natural-accent">
          <path d="M50 0L61.2 38.8L100 50L61.2 61.2L50 100L38.8 61.2L0 50L38.8 38.8Z" />
          <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      {/* Floating Instructions Banner */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2 items-center justify-between pointer-events-none">
        <div className={`px-4 py-2 rounded-full border text-xs flex items-center gap-2 pointer-events-auto shadow-md ${isDarkMode ? 'bg-natural-dark-panel/90 border-[#3E4032] text-slate-200' : 'bg-white/95 border-natural-accent/25 text-natural-brand font-serif font-bold'}`}>
          <Compass className="w-3.5 h-3.5 text-natural-accent animate-spin-slow" />
          <span>
            {isArabic
              ? 'اسحب اللوحة للتحريك • عجلات الفأرة للتكبير • اسحب العقد لإعادة الترتيب'
              : 'Drag canvas to pan • Scroll to zoom • Drag nodes to reposition'}
          </span>
        </div>

        {/* Action Zoom Controls */}
        <div className={`flex items-center gap-1 p-1 rounded-full border shadow-md pointer-events-auto ${isDarkMode ? 'bg-natural-dark-panel border-[#3E4032]' : 'bg-white border-natural-accent/20'}`}>
          <button
            id="btn-zoom-in"
            className={`p-1.5 rounded-full transition-all active:scale-95 ${isDarkMode ? 'text-slate-300 hover:bg-[#1E1F1A]/80 hover:text-white' : 'text-natural-brand hover:bg-[#F5F2ED] hover:text-natural-accent'}`}
            onClick={handleZoomIn}
            title={isArabic ? 'تكبير' : 'Zoom In'}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="btn-zoom-out"
            className={`p-1.5 rounded-full transition-all active:scale-95 ${isDarkMode ? 'text-slate-300 hover:bg-[#1E1F1A]/80 hover:text-white' : 'text-natural-brand hover:bg-[#F5F2ED] hover:text-natural-accent'}`}
            onClick={handleZoomOut}
            title={isArabic ? 'تصغير' : 'Zoom Out'}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            id="btn-reset-zoom"
            className={`p-1.5 rounded-full transition-all active:scale-95 ${isDarkMode ? 'text-slate-300 hover:bg-[#1E1F1A]/80 hover:text-white' : 'text-natural-brand hover:bg-[#F5F2ED] hover:text-natural-accent'}`}
            onClick={handleResetZoom}
            title={isArabic ? 'إعادة تعيين المشهد' : 'Reset View'}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* The Central Interactive SVG Workspace */}
      <svg className="w-full h-full select-none">
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* DEFINITIONS – Unique connection arrowheads and line ends */}
          <defs>
            {Object.keys(RELATION_CONFIG).map(type => {
              const config = RELATION_CONFIG[type as RelationshipType];
              return (
                <marker
                  key={`marker-${type}`}
                  id={`arrow-${type}`}
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill={config.color} />
                </marker>
              );
            })}
          </defs>

          {/* 1. Connections / Relationship Paths */}
          {relationships.map(rel => {
            const start = nodes[rel.sourceId];
            const end = nodes[rel.targetId];
            if (!start || !end) return null;

            const isHovered = hoveredCompanion?.id === rel.sourceId || hoveredCompanion?.id === rel.targetId;
            const isClickSelected = selectedCompanion?.id === rel.sourceId || selectedCompanion?.id === rel.targetId;
            const isRouteHighlighted = highlightedPath?.includes(rel.sourceId) && highlightedPath?.includes(rel.targetId);

            const config = RELATION_CONFIG[rel.type] || { color: '#6B7280', dash: 'none' };

            // Determine line opacity and thickness based on focus
            let opacity = isDarkMode ? 0.22 : 0.35;
            let strokeWidth = 1.5;
            if (isRouteHighlighted) {
              opacity = 1.0;
              strokeWidth = 3;
            } else if (isClickSelected || isHovered) {
              opacity = 0.88;
              strokeWidth = 2.5;
            } else if (selectedCompanion || hoveredCompanion) {
              // Dim other lines when focus exists
              opacity = isDarkMode ? 0.06 : 0.1;
            }

            // Draw link curves (smooth arcs) or straight lines
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            // Draw direct line
            return (
              <g key={rel.id} className="transition-all duration-300">
                <line
                  id={`link-line-${rel.id}`}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={config.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={config.dash}
                  opacity={opacity}
                  markerEnd={`url(#arrow-${rel.type})`}
                  className="transition-all duration-300"
                />

                {/* Micro-label floating over relation line when selected / hovered */}
                {(isHovered || isRouteHighlighted || isClickSelected) && dist > 110 && (
                  <g transform={`translate(${(start.x + end.x) / 2}, ${(start.y + end.y) / 2 - 4})`}>
                    <rect
                      x="-55"
                      y="-10"
                      width="110"
                      height="16"
                      rx="4"
                      fill={isDarkMode ? "#282922" : "#FAF9F5"}
                      stroke={config.color}
                      strokeWidth="1"
                      className="opacity-95"
                    />
                    <text
                      className={`text-[8px] ${isDarkMode ? 'fill-slate-200' : 'fill-natural-brand'} font-serif font-bold tracking-tight`}
                      textAnchor="middle"
                      y="1"
                    >
                      {isArabic ? rel.labelAr : rel.labelEn}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* 2. Companions Nodes / Circles and Decorative Geometric Frames */}
          {companions.map(companion => {
            const pos = nodes[companion.id];
            if (!pos) return null;

            const isSelected = selectedCompanion?.id === companion.id;
            const isHovered = hoveredCompanion?.id === companion.id;
            const isRouteMember = highlightedPath?.includes(companion.id);

            const cat = CATEGORY_CONFIG[companion.category] || CATEGORY_CONFIG.Other;

            let scale = 1.0;
            let strokeColor = cat.color;
            let strokeWidth = 2;
            let textWeight = 'font-normal';

            if (isSelected) {
              scale = 1.25;
              strokeColor = isDarkMode ? '#FFFFFF' : '#5A5A40';
              strokeWidth = 3.5;
              textWeight = 'font-bold';
            } else if (isHovered) {
              scale = 1.15;
              strokeWidth = 3;
            } else if (isRouteMember) {
              scale = 1.12;
              strokeColor = '#C5A059'; // Gold for route paths
              strokeWidth = 2.5;
            } else if (selectedCompanion || hoveredCompanion) {
              // Dim unrelated nodes
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
                onMouseDown={(e) => handleMouseDown && handleNodeDragStart(companion.id, e)}
              >
                {/* Visual pulse glow for selected companion */}
                {isSelected && (
                  <circle
                    r="25"
                    fill="none"
                    stroke={cat.color}
                    strokeWidth="2"
                    className="animate-ping opacity-35"
                  />
                )}

                {/* Beautiful Islamic Geometric Octagonal frame for Node border */}
                <path
                  d="M -15,-6 L -6,-15 L 6,-15 L 15,-6 L 15,6 L 6,15 L -6,15 L -15,6 Z"
                  fill={isDarkMode ? "#282922" : "#FAF9F5"}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  className="transition-all duration-300 shadow-md"
                />

                {/* Category circle inside Octagon */}
                <circle
                  cx="0"
                  cy="0"
                  r="10"
                  fill={cat.color}
                  className="opacity-25"
                />

                {/* Miniature calligraphic icon or first letter of Arabic Name */}
                <text
                  className="text-[9px] font-bold select-none text-center font-serif"
                  textAnchor="middle"
                  y="3"
                  fill={cat.color}
                >
                  {companion.nameAr.charAt(0)}
                </text>

                {/* Node Tags - Companion Arabic name underneath */}
                <text
                  id={`label-name-${companion.id}`}
                  className={`text-[10px] select-none ${textWeight} ${isDarkMode ? 'fill-slate-100' : 'fill-natural-brand'} font-serif tracking-tight`}
                  textAnchor="middle"
                  y="26"
                  style={isDarkMode ? { textShadow: '0 1px 2px rgba(0,0,0,0.8)' } : { textShadow: '0 1px 1px rgba(255,255,255,0.7)' }}
                >
                  {companion.nameAr}
                </text>

                {/* Secondary English Transliteration Tag */}
                <text
                  className={`text-[7.5px] select-none ${isDarkMode ? 'fill-slate-400' : 'fill-natural-accent'} font-mono`}
                  textAnchor="middle"
                  y="34"
                  style={isDarkMode ? { textShadow: '0 1px 2px rgba(0,0,0,0.8)' } : { textShadow: '0 1px 1px rgba(255,255,255,0.7)' }}
                >
                  {companion.nameEn.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Legend / Key Panel */}
      <div className={`absolute bottom-4 right-4 z-10 rounded-2xl border p-2.5 max-w-[215px] text-[10.5px] max-h-[170px] overflow-y-auto shadow-lg ${isDarkMode ? 'bg-natural-dark-panel/90 border-[#3E4032] text-slate-300' : 'bg-white/95 border-natural-accent/35 text-natural-text font-serif'}`}>
        <div className={`font-bold border-b pb-1 mb-1.5 flex items-center gap-1 ${isDarkMode ? 'text-slate-200 border-neutral-800' : 'text-natural-brand border-natural-accent/20'}`}>
          <HelpCircle className="w-3.5 h-3.5 text-natural-accent" />
          <span>{isArabic ? 'دليل الألوان والرموز' : 'Color & Legend keys'}</span>
        </div>
        <div className="space-y-1.5">
          {Object.entries(CATEGORY_CONFIG).slice(0, 8).map(([key, value]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0 border border-black/10" style={{ backgroundColor: value.color }} />
              <span className="truncate">{isArabic ? value.labelAr : value.labelEn}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FLOATING NAVIGATION MINIMAP */}
      <div className={`absolute bottom-4 left-4 z-10 rounded-2xl border p-2 h-[105px] w-[135px] pointer-events-auto flex flex-col justify-between shadow-lg select-none ${isDarkMode ? 'bg-natural-dark-panel/90 border-[#3E4032]' : 'bg-white/95 border-natural-accent/35'}`}>
        <div className={`text-[8.5px] border-b pb-1 flex justify-between items-center px-1 ${isDarkMode ? 'text-slate-400 border-neutral-850' : 'text-natural-brand border-natural-accent/15 font-bold font-serif'}`}>
          <span>{isArabic ? 'خرائط مصغرة' : 'Minimap Navigation'}</span>
          <Move className="w-2.5 h-2.5 text-natural-accent" />
        </div>
        <div className={`relative w-full h-[71px] border rounded-lg overflow-hidden ${isDarkMode ? 'bg-[#1E1F1A] border-neutral-800' : 'bg-[#EFEDE6] border-natural-accent/15'}`}>
          {/* Miniature nodes representing positioning on coordinate planes */}
          <svg className="w-full h-full">
            {miniNodes.map(m => (
              <circle
                key={`mini-${m.id}`}
                cx={m.x}
                cy={m.y}
                r={hoveredCompanion?.id === m.id || selectedCompanion?.id === m.id ? 2.5 : 1}
                fill={m.companion ? CATEGORY_CONFIG[m.companion.category]?.color || '#ffffff' : '#ffffff'}
                opacity={0.8}
              />
            ))}
            {/* Viewport Overlay bounds box showing current camera */}
            <rect
              x={Math.max(10, 50 - pan.x / 14)}
              y={Math.max(10, 40 - pan.y / 14)}
              width={Math.min(100, 110 / zoom)}
              height={Math.min(65, 75 / zoom)}
              fill="none"
              stroke="#C5A059"
              strokeWidth="0.8"
              strokeDasharray="1,2"
              opacity={0.6}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
