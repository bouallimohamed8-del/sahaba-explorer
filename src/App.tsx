/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Companion, Relationship, FilterState, TimelineEvent, BattleInfo } from './types';
import NetworkGraph, { CATEGORY_CONFIG } from './components/NetworkGraph';
import CompanionDetail from './components/CompanionDetail';
import ClassificationTool from './components/ClassificationTool';
import FilterControls from './components/FilterControls';
import AdminDashboard from './components/AdminDashboard';
import UserProfilePage from './components/UserProfilePage';
import { DEFAULT_COMPANIONS, DEFAULT_RELATIONSHIPS } from './data/defaultDataset';
import { Globe, Moon, Sun, Search, GitFork, User, ShieldAlert, Sparkles, RefreshCw, Layers, Compass, HelpCircle, ChevronRight, Info, LogOut, Shield } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import AuthPages from './components/AuthPages';
import { db } from './lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { LanguageCode, UI_TRANSLATIONS } from './lib/i18n';

export default function App() {
  const { user, profile, loading: authLoading, logout } = useAuth();
  const [showAuthScreen, setShowAuthScreen] = useState<boolean>(false);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    category: '',
    tribe: '',
    city: '',
    battle: '',
    relationshipType: ''
  });

  // UI state
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);
  const [hoveredCompanion, setHoveredCompanion] = useState<Companion | null>(null);
  const [lang, setLang] = useState<LanguageCode>('fr');
  const isArabic = lang === 'ar';
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'explorer' | 'admin' | 'profile'>('explorer');
  const [explorerViewType, setExplorerViewType] = useState<'graph' | 'directory' | 'classify'>('classify');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Record browsed history in Firestore
  useEffect(() => {
    if (user && selectedCompanion) {
      const logBrowsed = async () => {
        try {
          const docRef = doc(db, 'users', user.uid, 'history', selectedCompanion.id);
          await setDoc(docRef, {
            id: selectedCompanion.id,
            userId: user.uid,
            companionId: selectedCompanion.id,
            companionNameAr: selectedCompanion.nameAr,
            companionNameEn: selectedCompanion.nameEn,
            viewedAt: new Date().toISOString()
          });
        } catch (err) {
          console.error("Failed recording history log:", err);
        }
      };
      logBrowsed();
    }
  }, [selectedCompanion, user]);

  // Pathfinder state
  const [pathStartId, setPathStartId] = useState<string>('');
  const [pathEndId, setPathEndId] = useState<string>('');
  const [highlightedPath, setHighlightedPath] = useState<string[] | null>(null);
  const [pathError, setPathError] = useState<string>('');

  // Loaded successfully log handler
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch from Express fullstack server
  const loadData = async () => {
    setIsLoading(true);
    try {
      const companionsRes = await fetch('/api/companions');
      const relationshipsRes = await fetch('/api/relationships');
      if (companionsRes.ok && relationshipsRes.ok) {
        const companionsData = await companionsRes.json();
        const relationshipsData = await relationshipsRes.json();
        setCompanions(companionsData);
        setRelationships(relationshipsData);
      } else {
        // Fallback to offline defaults
        setCompanions(DEFAULT_COMPANIONS);
        setRelationships(DEFAULT_RELATIONSHIPS);
      }
    } catch (e) {
      console.error('Failed to load full-stack data, falling back to client-only baseline.', e);
      setCompanions(DEFAULT_COMPANIONS);
      setRelationships(DEFAULT_RELATIONSHIPS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered companions
  const filteredCompanions = useMemo(() => {
    return companions.filter(comp => {
      // 1. Search Query
      if (filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase();
        const matchesAr = comp.nameAr.toLowerCase().includes(q) || comp.shortBioAr.toLowerCase().includes(q) || (comp.lineageAr && comp.lineageAr.toLowerCase().includes(q));
        const matchesEn = comp.nameEn.toLowerCase().includes(q) || comp.shortBioEn.toLowerCase().includes(q) || (comp.lineageEn && comp.lineageEn.toLowerCase().includes(q));
        if (!matchesAr && !matchesEn) return false;
      }

      // 2. Category
      if (filter.category && comp.category !== filter.category) {
        return false;
      }

      // 3. Tribe
      if (filter.tribe) {
        const tribeMatch = (comp.tribeAr === filter.tribe || comp.tribeEn === filter.tribe);
        if (!tribeMatch) return false;
      }

      // 4. City
      if (filter.city) {
        const cityMatch = (comp.cityAr === filter.city || comp.cityEn === filter.city);
        if (!cityMatch) return false;
      }

      // 5. Battle
      if (filter.battle && !comp.battles.includes(filter.battle)) {
        return false;
      }

      return true;
    });
  }, [companions, filter]);

  // Handle pathfinding using BFS
  const findShortestRelationshipPath = () => {
    setPathError('');
    setHighlightedPath(null);

    if (!pathStartId || !pathEndId) {
      setPathError(isArabic ? 'الرجاء اختيار الصحابيين لمعرفة طريق الاتصال.' : 'Please choose both companions to trace their link.');
      return;
    }
    if (pathStartId === pathEndId) {
      setHighlightedPath([pathStartId]);
      return;
    }

    // Graph Construction
    const adjList: Record<string, string[]> = {};
    companions.forEach(c => {
      adjList[c.id] = [];
    });
    relationships.forEach(r => {
      if (adjList[r.sourceId] && adjList[r.targetId]) {
        adjList[r.sourceId].push(r.targetId);
        adjList[r.targetId].push(r.sourceId); // Undirected relationship tracing
      }
    });

    // BFS Queue
    const queue: string[] = [pathStartId];
    const visited: Set<string> = new Set([pathStartId]);
    const parent: Record<string, string> = {};

    let found = false;
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === pathEndId) {
        found = true;
        break;
      }

      const neighbors = adjList[current] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parent[neighbor] = current;
          queue.push(neighbor);
        }
      }
    }

    if (!found) {
      setPathError(isArabic ? 'لم يتم العثور على سلسلة نسب أو علاقة مباشرة تربط الصحابيين المحددين.' : 'No direct chain found connecting these two companions.');
      return;
    }

    // Reconstruct pathway
    const path: string[] = [];
    let current = pathEndId;
    while (current !== pathStartId) {
      path.push(current);
      current = parent[current];
    }
    path.push(pathStartId);
    path.reverse();

    setHighlightedPath(path);
  };

  const clearHighlightedPath = () => {
    setPathStartId('');
    setPathEndId('');
    setHighlightedPath(null);
    setPathError('');
  };

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-natural-dark-bg text-slate-100 natural-dotted-bg-dark' : 'bg-natural-bg text-natural-text natural-dotted-bg'} transition-all duration-300 relative pb-16`}>
      {/* Decorative Top Islamic Arch Geometric Grid Border */}
      <div className="h-2 bg-gradient-to-r from-natural-accent via-[#A88849] to-natural-brand opacity-90" />

      {/* Global Navbar */}
      <header className={`border-b-4 border-natural-accent ${isDarkMode ? 'bg-natural-dark-header text-white' : 'bg-natural-brand text-white'} sticky top-0 z-50 px-4 py-3 shadow-md`}>
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          {/* Logo Identity */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-natural-accent rounded-sm rotate-45 flex items-center justify-center shadow-md">
              <div className="w-8 h-8 border border-white/50 rotate-45 flex items-center justify-center font-serif text-lg text-white">
                ﷺ
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white font-serif">
                {isArabic ? 'مستكشف الصحابة والتابعين ﷺ' : 'Sahaba Explorer'}
              </h1>
              <p className="text-[10.5px] text-white/80 capitalize">
                {isArabic ? 'موسوعة تفاعلية مصورة للعلاقات التاريخية الفاضلة' : 'Interactive Encyclopedia of Companions\' Relationships'}
              </p>
            </div>
          </div>

          {/* Quick Config Toggles */}
          <div className="flex items-center gap-3">
            {/* Explorer vs Admin tab toggles */}
            <div className={`flex p-1 rounded-xl border ${isDarkMode ? 'bg-natural-dark-panel border-natural-accent/15' : 'bg-white/10 border-white/20'}`}>
              <button
                id="btn-switch-explorer"
                onClick={() => {
                  setViewMode('explorer');
                  setShowAuthScreen(false);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${viewMode === 'explorer' && !showAuthScreen ? 'bg-natural-accent text-white shadow' : 'text-white/80 hover:text-white'}`}
              >
                {isArabic ? 'المستكشف المرئي' : 'Interactive Graph'}
              </button>
              <button
                id="btn-switch-admin"
                onClick={() => {
                  setViewMode('admin');
                  setShowAuthScreen(false);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${viewMode === 'admin' ? 'bg-natural-accent text-white shadow' : 'text-white/80 hover:text-white'}`}
              >
                {isArabic ? 'المشرف والمراجعة' : 'Admin Console'}
              </button>
            </div>

            {/* Language Selection Toggle Group */}
            <div className={`flex p-1 rounded-xl border ${isDarkMode ? 'bg-natural-dark-panel border-natural-accent/15' : 'bg-white/10 border-white/20'}`}>
              <button
                id="btn-lang-fr"
                onClick={() => setLang('fr')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${lang === 'fr' ? 'bg-natural-accent text-white shadow' : 'text-white/80 hover:text-white'}`}
                title="Français"
              >
                FR
              </button>
              <button
                id="btn-lang-ar"
                onClick={() => setLang('ar')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${lang === 'ar' ? 'bg-natural-accent text-white shadow' : 'text-white/80 hover:text-white'}`}
                title="العربية"
              >
                AR
              </button>
              <button
                id="btn-lang-en"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${lang === 'en' ? 'bg-natural-accent text-white shadow' : 'text-white/80 hover:text-white'}`}
                title="English"
              >
                EN
              </button>
            </div>

            {/* Dark mode lights */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl border transition cursor-pointer ${isDarkMode ? 'bg-natural-dark-panel border-natural-accent/20 text-natural-accent' : 'bg-white/10 border-white/20 text-white hover:bg-white/25'}`}
              title={isArabic ? 'تغيير المظهر' : 'Toggle Theme'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-white" />}
            </button>

            {/* User auth state indicators */}
            {!authLoading && (
              profile ? (
                <div
                  onClick={() => {
                    setViewMode('profile');
                    setShowAuthScreen(false);
                  }}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs text-white max-w-[170px] cursor-pointer hover:bg-white/10 transition-all ${
                    viewMode === 'profile'
                      ? 'bg-natural-accent border-natural-accent shadow-inner'
                      : isDarkMode ? 'bg-natural-dark-panel border-natural-accent/20' : 'bg-white/10 border-white/20'
                  }`}
                  title={isArabic ? 'عرض سجل القراءة الفخيم ومذكرات المذاكرة' : 'Open study log and notes'}
                >
                  <div className="w-5 h-5 rounded-full bg-natural-accent flex items-center justify-center font-bold text-[10px] text-white overflow-hidden shrink-0">
                    {profile.photoURL ? (
                      <img src={profile.photoURL} alt={profile.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      profile.fullName.charAt(0)
                    )}
                  </div>
                  <span className="font-bold truncate max-w-[70px] text-white" title={profile.fullName}>{profile.fullName}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      logout();
                      setViewMode('explorer');
                    }}
                    className="p-1 hover:text-red-350 transition cursor-pointer shrink-0"
                    title={isArabic ? 'تسجيل الخروج' : 'Log Out'}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthScreen(!showAuthScreen);
                  }}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    showAuthScreen 
                      ? 'bg-natural-accent text-white border-natural-accent' 
                      : 'text-white bg-white/10 border-white/20 hover:bg-white/20'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? 'Connexion' : (isArabic ? 'دخول' : 'Login')}</span>
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Primary body view content */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <RefreshCw className="w-10 h-10 text-natural-accent animate-spin" />
            <p className="text-xs text-natural-brand/80 font-serif">{isArabic ? 'يُحمّل سجلاّت التاريخ والفضائل العطرة...' : 'Retrieving prestigious companions histories...'}</p>
          </div>
        ) : showAuthScreen ? (
          <AuthPages isArabic={isArabic} isDarkMode={isDarkMode} lang={lang} onSuccess={() => setShowAuthScreen(false)} />
        ) : viewMode === 'explorer' ? (
          // EXPLORER WORKSPACE
          <div className="space-y-6 animate-fade-in">
            {/* Slim Header & Filter Toggles */}
            <div className={`p-4 rounded-3xl border flex flex-col md:flex-row gap-4 items-center justify-between ${
              isDarkMode ? 'bg-natural-dark-panel border-neutral-800' : 'bg-white border-natural-accent/30'
            } shadow`}>
              {/* Left search bar */}
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  value={filter.searchQuery}
                  onChange={(e) => setFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
                  placeholder={isArabic ? 'بحث سريع باسم الصحابي...' : 'Search sahaba instantly by name...'}
                  className={`w-full border rounded-2xl py-2.5 pl-3.5 pr-10 focus:outline-none text-xs transition duration-150 ${
                    isDarkMode 
                      ? 'bg-natural-dark-bg border-neutral-750 text-slate-100 focus:border-natural-accent' 
                      : 'bg-white border-natural-accent/30 text-natural-text focus:border-natural-brand'
                  }`}
                />
                <Search className={`w-4 h-4 text-natural-accent absolute top-3 ${isArabic ? 'left-3' : 'right-3'}`} />
              </div>

              {/* Right buttons row */}
              <div className="flex flex-wrap gap-2 items-center w-full md:w-auto justify-end">
                {/* Advanced filter toggle */}
                <button
                  id="btn-toggle-filters"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-serif font-bold cursor-pointer transition flex items-center gap-2 active:scale-95 border ${
                    showAdvancedFilters
                      ? 'bg-natural-accent text-white border-natural-accent shadow-sm'
                      : isDarkMode
                        ? 'bg-natural-dark-bg/40 border-neutral-850 hover:bg-[#20211B] text-slate-300'
                        : 'bg-[#FDFCFB] border-natural-accent/25 hover:bg-[#F5F2ED] text-natural-brand'
                  }`}
                >
                  <span>🎛️</span>
                  <span>{isArabic ? 'خيارات الفرز والبحث المتقدم' : 'Advanced Search Criteria'}</span>
                </button>

                {/* Reset button */}
                {(filter.category || filter.tribe || filter.city || filter.battle || filter.relationshipType || filter.searchQuery) && (
                  <button
                    onClick={() => {
                      setFilter({ searchQuery: '', category: '', tribe: '', city: '', battle: '', relationshipType: '' });
                      setSelectedCompanion(null);
                      setHoveredCompanion(null);
                      clearHighlightedPath();
                    }}
                    className={`px-3 py-2.5 rounded-2xl text-xs font-serif font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 border ${
                      isDarkMode
                        ? 'bg-neutral-800 text-stone-300 hover:bg-neutral-700/80'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    <span>🔄</span>
                    <span>{isArabic ? 'إعادة تعيين' : 'ResetAll'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Collapsed Advanced Filters panel container drawer */}
            {showAdvancedFilters && (
              <div className="animate-fade-in">
                <FilterControls
                  companions={companions}
                  filter={filter}
                  onFilterChange={setFilter}
                  isArabic={isArabic}
                  isDarkMode={isDarkMode}
                  onReset={() => {
                    setFilter({ searchQuery: '', category: '', tribe: '', city: '', battle: '', relationshipType: '' });
                    setSelectedCompanion(null);
                    setHoveredCompanion(null);
                    clearHighlightedPath();
                  }}
                />
              </div>
            )}

            {/* Dual split panel layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Column: Network Graph Board or Directory Card Grid */}
              <div id="explorer-main-column" className="lg:col-span-2 space-y-4">
                {/* Visual Style Selection tab bar */}
                <div className={`p-1.5 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-natural-dark-panel border-neutral-805' : 'bg-white border-natural-accent/30'} shadow-sm`}>
                  <div className="flex gap-2 items-center px-2">
                    <Layers className="w-4 h-4 text-natural-accent" />
                    <span className="text-xs font-bold font-serif text-natural-brand">{isArabic ? 'طريقة العرض المعتمدة:' : 'Explorer Display Layout:'}</span>
                  </div>
                   <div className="flex gap-1" id="view-mode-toggle-group">
                    <button
                      id="view-type-classify"
                      onClick={() => setExplorerViewType('classify')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                        explorerViewType === 'classify'
                          ? 'bg-natural-brand text-white shadow'
                          : isDarkMode
                            ? 'text-slate-400 hover:bg-neutral-800 hover:text-white'
                            : 'text-neutral-600 hover:bg-[#F5F2ED] hover:text-natural-accent'
                      }`}
                    >
                      <span>🗂️</span>
                      <span>{isArabic ? 'أداة التصنيف القيمة' : 'Classification'}</span>
                    </button>
                    <button
                      id="view-type-grid"
                      onClick={() => setExplorerViewType('directory')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                        explorerViewType === 'directory'
                          ? 'bg-natural-brand text-white shadow'
                          : isDarkMode
                            ? 'text-slate-400 hover:bg-neutral-800 hover:text-white'
                            : 'text-neutral-600 hover:bg-[#F5F2ED] hover:text-natural-accent'
                      }`}
                    >
                      <span>📑</span>
                      <span>{isArabic ? 'بطاقات السيرة' : 'Sira cards'}</span>
                    </button>
                    <button
                      id="view-type-graph"
                      onClick={() => setExplorerViewType('graph')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                        explorerViewType === 'graph'
                          ? 'bg-natural-brand text-white shadow'
                          : isDarkMode
                            ? 'text-slate-400 hover:bg-neutral-800 hover:text-white'
                            : 'text-neutral-600 hover:bg-[#F5F2ED] hover:text-natural-accent'
                      }`}
                    >
                      <span>🕸️</span>
                      <span>{isArabic ? 'شبكة العلاقات' : 'Relations Map'}</span>
                    </button>
                  </div>
                </div>

                {explorerViewType === 'classify' ? (
                  <ClassificationTool
                    companions={filteredCompanions}
                    onSelectCompanion={setSelectedCompanion}
                    selectedCompanion={selectedCompanion}
                    isArabic={isArabic}
                    lang={lang}
                    isDarkMode={isDarkMode}
                  />
                ) : explorerViewType === 'graph' ? (
                  <NetworkGraph
                    companions={filteredCompanions}
                    relationships={relationships}
                    selectedCompanion={selectedCompanion}
                    onSelectCompanion={setSelectedCompanion}
                    hoveredCompanion={hoveredCompanion}
                    onHoverCompanion={setHoveredCompanion}
                    isArabic={isArabic}
                    lang={lang}
                    highlightedPath={highlightedPath}
                    isDarkMode={isDarkMode}
                  />
                ) : (
                  /* Directory Card Grid */
                  <div className="space-y-4">
                    {filteredCompanions.length === 0 ? (
                      <div className={`border border-dashed rounded-3xl p-12 text-center ${isDarkMode ? 'bg-natural-dark-panel/20 border-neutral-800 text-slate-500' : 'bg-white/40 border-natural-accent/20 text-neutral-500'}`}>
                        <Search className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                        <p className="text-xs font-serif leading-relaxed text-natural-brand/80">
                          {isArabic
                            ? 'عذراً، لم نجد صحابة يتوافقون مع شروط البحث والفلترة المطبقة.'
                            : 'No companions match your current search/filtering selection.'}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredCompanions.map((comp) => {
                          const cat = CATEGORY_CONFIG[comp.category] || CATEGORY_CONFIG.Other;
                          const isSelected = selectedCompanion?.id === comp.id;

                          return (
                            <div
                              key={comp.id}
                              id={`companion-card-${comp.id}`}
                              onClick={() => {
                                setSelectedCompanion(comp);
                                // Scroll nicely to companion detail anchor if open
                                const detailAnchor = document.getElementById('sahaba-detail-container-anchor');
                                if (detailAnchor) {
                                  detailAnchor.scrollIntoView({ behavior: 'smooth' });
                                }
                              }}
                              className={`group p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between cursor-pointer translate-y-0 hover:-translate-y-1 relative overflow-hidden shadow-sm hover:shadow-md ${
                                isSelected
                                  ? isDarkMode
                                    ? 'bg-natural-dark-panel border-natural-accent text-slate-100 ring-1 ring-natural-accent/20'
                                    : 'bg-[#F9F7F2] border-natural-accent text-natural-text ring-1 ring-natural-accent/25'
                                  : isDarkMode
                                    ? 'bg-natural-dark-panel/40 border-neutral-800 hover:border-neutral-700/80 hover:bg-natural-dark-panel/60 text-slate-200'
                                    : 'bg-white border-natural-accent/15 hover:border-natural-accent/35 hover:bg-[#FDFCF9] text-natural-text'
                              }`}
                            >
                              {/* Left Category Accent Pill */}
                              <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: cat.color }} />

                              <div className="space-y-3.5">
                                <div className="flex justify-between items-start pt-1">
                                  <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-serif font-bold ${
                                    isDarkMode ? 'bg-neutral-800 text-stone-300' : 'bg-natural-brand/5 border border-natural-brand/10 text-natural-brand/90'
                                  }`}>
                                    {isArabic ? cat.labelAr : cat.labelEn}
                                  </span>
                                  <span className="text-[10px] font-mono text-stone-500">
                                    {comp.deathYearAH} AH ({comp.ageAtDeath} {isArabic ? 'عاماً' : 'yrs'})
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <h4 className="text-base font-serif font-bold text-natural-brand group-hover:text-natural-accent transition-colors" lang="ar" dir="rtl">
                                    {comp.nameAr}
                                  </h4>
                                  <p className="text-[11px] font-mono text-stone-500 truncate">
                                    {isArabic ? comp.tribeAr : comp.tribeEn}
                                  </p>
                                </div>

                                <p className={`text-[12px] leading-relaxed font-serif ${isDarkMode ? 'text-slate-300' : 'text-neutral-700'} line-clamp-3`}>
                                  {isArabic ? comp.shortBioAr : comp.shortBioEn}
                                </p>
                              </div>

                              <div className="mt-4 pt-3.5 border-t border-stone-205/50 dark:border-stone-850/40 flex justify-between items-center text-[10.5px]">
                                <span className="font-mono text-stone-500">
                                  📚 {comp.hadithCount} {isArabic ? 'حديث مروي' : 'narrations'}
                                </span>
                                <span className="font-bold text-natural-accent flex items-center gap-0.5 group-hover:underline">
                                  {isArabic ? 'عرض التفاصيل والنسب' : 'View Seerah'}
                                  <ChevronRight className={`w-3 h-3 transform transition-transform group-hover:translate-x-0.5 ${isArabic ? 'rotate-180' : ''}`} />
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Floating Interactive Hover Card beneath/over graph */}
                {hoveredCompanion && explorerViewType === 'graph' && (
                  <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-natural-dark-panel border-neutral-800 text-slate-100' : 'bg-white border-natural-accent/30 text-natural-text'} shadow-xl transition duration-300 flex gap-4 animate-fade-in`}>
                    <div className="w-12 h-12 rounded-xl bg-natural-brand/10 border border-natural-brand/25 flex items-center justify-center text-3xl font-extrabold font-serif text-natural-brand">
                      {hoveredCompanion.nameAr.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h4 className="text-sm font-bold text-natural-brand font-serif" lang="ar" dir="rtl">{hoveredCompanion.nameAr}</h4>
                        <span className="text-[10px] bg-natural-accent/15 border border-natural-accent/30 rounded px-1.5 font-bold text-natural-brand font-mono">
                          {hoveredCompanion.ageAtDeath} {isArabic ? 'سنة' : 'yrs'}
                        </span>
                      </div>
                      <p className={`text-[11.5px] leading-relaxed line-clamp-2 ${isDarkMode ? 'text-slate-300' : 'text-neutral-700'}`}>
                        {isArabic ? hoveredCompanion.shortBioAr : hoveredCompanion.shortBioEn}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Pathfinder tool & Node detail preview */}
              <div className="space-y-6">
                {/* 1. PATHFINDER TOOL */}
                <div className={`border rounded-3xl p-5 shadow-lg ${isDarkMode ? 'bg-natural-dark-panel border-neutral-800' : 'bg-white/90 border-natural-accent/30'}`}>
                  <h3 className="text-xs font-bold border-b pb-2 mb-3 flex items-center gap-1.5 uppercase font-serif text-natural-brand border-natural-accent/25">
                    <GitFork className="w-4 h-4 text-natural-accent" />
                    <span>{isArabic ? 'تقصي خطوط ومسارات النسب والصلة' : 'Relationship Path Finder'}</span>
                  </h3>
                  <p className={`text-[11px] mb-4 leading-relaxed ${isDarkMode ? 'text-slate-450' : 'text-neutral-600'}`}>
                    {isArabic
                      ? 'حدد صحابيين شريفين لمعرفة سلسلة الروابط والعلاقات المباشرة والمركبة التي تجمع بينهما:'
                      : 'Choose two companions of the Prophet ﷺ to trace their mutual lineage or historic alliance chain:'}
                  </p>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-natural-brand/80 mb-1 font-bold">{isArabic ? 'الصحابي الأول (البداية)' : 'Start Companion'}</label>
                      <select
                        id="pathfinder-start-select"
                        value={pathStartId}
                        onChange={(e) => setPathStartId(e.target.value)}
                        className={`w-full border rounded-xl p-2.5 focus:outline-none text-xs transition duration-200 ${isDarkMode ? 'bg-natural-dark-bg border-neutral-750 text-slate-200' : 'bg-white border-natural-accent/40 text-natural-text focus:border-natural-brand'}`}
                      >
                        <option value="">-- {isArabic ? 'اختر البداية' : 'Select Start Node'} --</option>
                        {companions.map(c => (
                          <option key={c.id} value={c.id}>{c.nameAr} ({c.nameEn})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-natural-brand/80 mb-1 font-bold">{isArabic ? 'الصحابي الثاني (الهدف)' : 'Target Companion'}</label>
                      <select
                        id="pathfinder-end-select"
                        value={pathEndId}
                        onChange={(e) => setPathEndId(e.target.value)}
                        className={`w-full border rounded-xl p-2.5 focus:outline-none text-xs transition duration-200 ${isDarkMode ? 'bg-natural-dark-bg border-neutral-750 text-slate-200' : 'bg-white border-natural-accent/40 text-natural-text focus:border-natural-brand'}`}
                      >
                        <option value="">-- {isArabic ? 'اختر الهدف' : 'Select Target Node'} --</option>
                        {companions.map(c => (
                          <option key={c.id} value={c.id}>{c.nameAr} ({c.nameEn})</option>
                        ))}
                      </select>
                    </div>

                    {pathError && (
                      <p className="text-[10.5px] text-red-500 italic bg-red-500/5 border border-red-500/20 p-2.5 rounded-xl text-center">{pathError}</p>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        id="btn-trace-path"
                        onClick={findShortestRelationshipPath}
                        className="flex-1 bg-natural-brand hover:bg-natural-brand/90 text-white font-bold p-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95 shadow-md"
                      >
                        <span>{isArabic ? 'كشف خط الاتصال' : 'Trace Connection Path'}</span>
                      </button>
                      {highlightedPath && (
                        <button
                          onClick={clearHighlightedPath}
                          className={`border px-3 py-2 rounded-xl text-xs cursor-pointer ${isDarkMode ? 'bg-natural-dark-bg border-neutral-700 text-slate-300' : 'bg-white border-neutral-300 text-natural-text hover:bg-slate-100'}`}
                        >
                          {isArabic ? 'مسح' : 'Clear'}
                        </button>
                      )}
                    </div>

                    {/* Render Highlighted path details chain */}
                    {highlightedPath && (
                      <div className={`p-3.5 rounded-2xl space-y-2 mt-4 border ${isDarkMode ? 'bg-natural-dark-bg/60 border-neutral-850' : 'bg-natural-brand/5 border-natural-brand/10'}`}>
                        <span className="font-bold text-[10px] text-natural-accent uppercase block font-serif">{isArabic ? 'مسار الوصل التاريخي المكتشف' : 'Discovered Historic Hops:'}</span>
                        <div className="space-y-1">
                          {highlightedPath.map((nodeId, idx) => {
                            const node = companions.find(c => c.id === nodeId);
                            if (!node) return null;
                            return (
                              <div key={nodeId} className="flex items-center gap-1.5 text-[11.5px]">
                                <span className="w-5 h-5 rounded bg-natural-accent/20 text-natural-brand text-[10.5px] font-bold flex items-center justify-center border border-natural-accent/30 font-mono">
                                  {idx + 1}
                                </span>
                                <span className={`font-serif font-bold ${isDarkMode ? 'text-slate-100' : 'text-natural-brand'}`} lang="ar" dir="rtl">{node.nameAr}</span>
                                {idx < highlightedPath.length - 1 && (
                                  <span className="text-natural-accent text-[11px]">&larr;</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. COMPANION SELECTION PROFILE SIDEBAR BRIEF */}
                {selectedCompanion ? (
                  <div className={`border rounded-3xl p-5 shadow-lg relative ${isDarkMode ? 'bg-natural-dark-panel border-neutral-800' : 'bg-white/90 border-natural-accent/30 animate-fade-in'}`}>
                    <span className="text-[9px] uppercase font-bold text-natural-accent block mb-1">SELECTED COMPANION</span>
                    <h2 className="text-lg font-bold text-natural-brand font-serif mb-0.5" lang="ar" dir="rtl">{selectedCompanion.nameAr}</h2>
                    <p className={`text-[11.5px] leading-relaxed mt-2 italic mb-4 ${isDarkMode ? 'text-slate-300' : 'text-neutral-700 font-serif'}`}>
                      "{isArabic ? selectedCompanion.shortBioAr : selectedCompanion.shortBioEn}"
                    </p>

                    <button
                      id="btn-trigger-explore-detail"
                      onClick={() => {
                        // Scroll nicely down to detail board
                        const t = document.getElementById('sahaba-detail-container-anchor');
                        if (t) t.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full bg-natural-accent hover:bg-natural-accent/90 text-white font-bold p-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'فتح السيرة والتفاصيل الكاملة' : 'View Complete Seerah & Legacy'}</span>
                    </button>
                  </div>
                ) : (
                  <div className={`border border-dashed rounded-3xl p-10 text-center ${isDarkMode ? 'bg-natural-dark-panel/30 border-neutral-800 text-slate-500' : 'bg-white/40 border-natural-accent/30 text-neutral-500'}`}>
                    <User className="w-8 h-8 text-natural-brand/50 mx-auto mb-2" />
                    <p className="text-xs leading-relaxed font-serif text-natural-brand/80">{isArabic ? 'انقر على أحد الصحابة في المخطط لقراءة خط النسب والسيرة العطرة الكبرى.' : 'Click any companion node inside the relationship map to read their timeline.'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Anchor point and details page wrapper */}
            <div id="sahaba-detail-container-anchor" className="pt-2">
              {selectedCompanion && (
                <CompanionDetail
                  companion={selectedCompanion}
                  relationships={relationships}
                  allCompanions={companions}
                  onSelectCompanion={setSelectedCompanion}
                  isArabic={isArabic}
                  isDarkMode={isDarkMode}
                  onBack={() => {
                    setSelectedCompanion(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  user={user}
                  profile={profile}
                />
              )}
            </div>
          </div>
        ) : viewMode === 'profile' ? (
          <UserProfilePage
            allCompanions={companions}
            onSelectCompanion={(comp) => {
              setSelectedCompanion(comp);
              setViewMode('explorer');
              // Wait for render layout, then smoothly target anchor
              setTimeout(() => {
                const detailAnchor = document.getElementById('sahaba-detail-container-anchor');
                if (detailAnchor) {
                  detailAnchor.scrollIntoView({ behavior: 'smooth' });
                }
              }, 150);
            }}
            isArabic={isArabic}
            lang={lang}
            isDarkMode={isDarkMode}
            onNavigateHome={() => setViewMode('explorer')}
          />
        ) : (
          // ADMIN SECTION
          !user ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-600 font-sans text-center max-w-sm mx-auto">
                {isArabic 
                  ? 'يتطلب دخول هذا القسم تسجيل الدخول بحساب مشرف معتمد.' 
                  : 'Accessing this environment requires signing in with an authorized collaborator account.'}
              </div>
              <AuthPages isArabic={isArabic} isDarkMode={isDarkMode} />
            </div>
          ) : !profile || profile.role !== 'admin' ? (
            <div className="max-w-md mx-auto my-12 animate-fade-in" dir={isArabic ? 'rtl' : 'ltr'}>
              <div className={`p-8 border rounded-3xl shadow-xl text-center space-y-5 ${
                isDarkMode ? 'bg-natural-dark-panel border-neutral-800 text-slate-100' : 'bg-white border-natural-accent/30 text-natural-text'
              }`}>
                <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto animate-pulse" />
                <div className="space-y-2">
                  <h3 className="text-lg font-serif font-bold text-natural-brand">
                    {isArabic ? 'صلاحيات غير كافية' : 'Restricted Admin Console Access'}
                  </h3>
                  <p className="text-xs text-gray-500 font-sans leading-relaxed">
                    {isArabic 
                      ? 'عذراً، بروفايل حسابك الحالي لا يمتلك صلاحيات المشرفين. للقيام بعمليات الإدخال والمراجعة، تفضل بالانتقال للمستكشف المرئي أو تسجيل الدخول بحساب مشرف معتمد.' 
                      : 'Sorry, your registered account profile is not appointed with administrator privileges. Go back to browse the interactive graph explorer or authenticate with an authorized credentials.'}
                  </p>
                </div>
                <button
                  onClick={() => logout()}
                  className="w-full bg-natural-brand hover:bg-natural-brand/90 text-white font-bold p-3 rounded-xl cursor-pointer text-xs"
                >
                  {isArabic ? 'تسجيل الخروج والتبديل' : 'Sign Out and Switch'}
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <AdminDashboard
                companions={companions}
                relationships={relationships}
                isArabic={isArabic}
                onRefreshData={loadData}
              />
            </div>
          )
        )}
      </main>

      {/* Modern footer with Islamic and educational quotes */}
      <footer className={`mt-20 border-t py-12 ${isDarkMode ? 'bg-natural-dark-header border-neutral-800 text-slate-400' : 'bg-[#E8E4D9] border-natural-accent/20 text-[#5A5A40]'}`}>
        <p className="font-serif italic leading-relaxed max-w-2xl mx-auto mb-5 text-center px-6 text-sm">
          {isArabic
            ? 'قال رسول الله ﷺ: «أَصْحَابِي كَالنُّجُومِ بِأَيِّهِمُ اقْتَدَيْتُمُ اهْتَدَيْتُمْ» - روايات الأثر الشريف هادية لطريق التوحيد والصفاء.'
            : '"My companions are like stars; whichever of them you follow, you will be rightly guided." — Prophetic tradition regarding the prestigious companions.'}
        </p>
        <div className={`pt-6 max-w-7xl mx-auto px-8 border-t flex flex-col sm:flex-row justify-between items-center text-[11px] font-mono gap-3 ${isDarkMode ? 'border-neutral-800/60 text-slate-550' : 'border-[#C5A059]/20 text-[#5A5A40]/60'}`}>
          <span>{isArabic ? '© مستكشف الصحابة - موسوعة تعليمية تفاعلية' : '© Sahaba Explorer - Interactive Educational Platform'}</span>
          <span>{isArabic ? 'صُنع بدقة وإخلاص لدعاة المعرفة' : 'Crafted with absolute historical precision'}</span>
        </div>
      </footer>
    </div>
  );
}
