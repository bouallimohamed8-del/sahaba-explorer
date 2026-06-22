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
import { DEFAULT_COMPANIONS, DEFAULT_RELATIONSHIPS, DEFAULT_BATTLES } from './data/defaultDataset';
import { Globe, Moon, Sun, Search, GitFork, User, ShieldAlert, Sparkles, RefreshCw, Layers, Compass, HelpCircle, ChevronRight, Info, LogOut, Shield, FileText, Printer, Heart, BookOpen, Award, Check, X, Calendar, Activity, GraduationCap, Trophy } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import AuthPages from './components/AuthPages';
import { db } from './lib/firebase';
import { doc, setDoc, collection, query, orderBy, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';
import { LanguageCode, UI_TRANSLATIONS, SEERAH_QCM_QUESTIONS, QCMQuestion } from './lib/i18n';
import LeftMediaBanner, { BannerConfig } from './components/LeftMediaBanner';
import { motion, AnimatePresence } from 'motion/react';

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
    relationshipType: '',
    minHadiths: 0
  });

  // Main UI Navigation tab
  const [activeTab, setActiveTab] = useState<'home' | 'directory' | 'timeline' | 'learning' | 'quiz' | 'leaderboard' | 'favorites'>('home');

  // Favorites bookmarked IDs state (cached locally)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sahaba_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('sahaba_favorites', JSON.stringify(next));
      return next;
    });
  };

  // Interactive Quiz State
  const [quizQuestion, setQuizQuestion] = useState<QCMQuestion | null>(null);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [quizPoints, setQuizPoints] = useState<number>(0);
  const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean; points: number } | null>(null);
  const [quizOverallScore, setQuizOverallScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sahaba_quiz_score');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // UI state
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);
  const [hoveredCompanion, setHoveredCompanion] = useState<Companion | null>(null);
  const [lang, setLang] = useState<LanguageCode>('ar');
  const isArabic = lang === 'ar';
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'explorer' | 'admin' | 'profile'>('explorer');
  const [explorerViewType, setExplorerViewType] = useState<'graph' | 'directory' | 'classify'>('directory');

  const DEFAULT_BANNER: BannerConfig = {
    id: 'main',
    enabled: true,
    type: 'image',
    titleAr: 'مستكشف سير الصحابة الأخيار والغزوات المأثورة',
    titleEn: 'Biographical Chronicles & Ancient Gazawat Maps',
    contentAr: 'تصفح الخرائط الجغرافية والوسائط المعتمدة للفتوحات الإسلامية وسير أحباء المصطفى عليه السلام برعاية المشرف السوبر.',
    contentEn: 'Experience high-fidelity coordinate charts, detailed timeline loops, and biographical maps of the holy Sahabah.',
    mediaUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
    linkUrl: '',
    htmlContent: ''
  };

  const [bannerConfig, setBannerConfig] = useState<BannerConfig>(DEFAULT_BANNER);

  // Load live banner from Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'banners', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        setBannerConfig({ ...DEFAULT_BANNER, ...docSnap.data() } as BannerConfig);
      }
    }, (err) => {
      console.warn("Banner config snapshot error:", err);
    });
    return () => unsub();
  }, []);
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
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-[#031410] text-slate-100 natural-dotted-bg-dark' : 'bg-[#F2EFE9] text-stone-900 natural-dotted-bg'} transition-all duration-300 relative pb-16`}>
      {/* Decorative Top Islamic Arch Geometric Grid Border */}
      <div className="h-2 bg-gradient-to-r from-emerald-500 via-[#C5A059] to-emerald-800 opacity-95" />

      {/* Global Navbar - Premium Dark Green & Amber Accentuation */}
      <header className={`border-b ${isDarkMode ? 'bg-[#020d0af2] border-emerald-950/40 text-white' : 'bg-[#FAF8F5]/95 border-emerald-800/10 text-stone-900'} sticky top-0 z-50 px-4 py-3 shadow-lg backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          
          {/* Logo Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700/90 border border-emerald-500/20 flex items-center justify-center font-serif text-white font-bold text-lg select-none shadow hover:rotate-12 transition-transform duration-300">
              ص
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-white font-serif flex items-center gap-1.5 leading-none">
                {isArabic ? 'مستكشف الصحابة والتابعين ﷺ' : 'Sahaba Explorer'}
              </div>
              <div className="text-[10px] text-emerald-500 font-mono tracking-wider leading-none mt-1">
                V 0.0.2
              </div>
            </div>
          </div>

          {/* Center: Premium Tab-Selector */}
          <nav className="hidden md:flex items-center gap-1">
            {(['home', 'directory', 'timeline', 'learning', 'quiz', 'leaderboard', 'favorites'] as const).map((tab) => {
              const active = activeTab === tab && viewMode === 'explorer';
              const label = {
                home: isArabic ? 'الرئيسية' : 'Home',
                directory: isArabic ? 'البطاقات والمستكشف' : 'Directory',
                timeline: isArabic ? 'الخط الزمني' : 'Timeline',
                learning: isArabic ? 'التعليم والعلوم' : 'Learning',
                quiz: isArabic ? 'الاختبارات' : 'Quiz',
                leaderboard: isArabic ? 'المتصدرون' : 'Leaderboard',
                favorites: isArabic ? 'المفضلة' : 'Favorites',
              }[tab];
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setViewMode('explorer');
                    setShowAuthScreen(false);
                  }}
                  className={`relative px-3.5 py-2 text-xs font-bold font-serif transition-colors cursor-pointer rounded-lg ${
                    active 
                      ? 'text-[#D9A752] bg-emerald-950/20' 
                      : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-stone-650 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#D9A752] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-2.5">
            {/* Quick Go-To Admin button for supervisor */}
            <button
              onClick={() => {
                setViewMode(viewMode === 'admin' ? 'explorer' : 'admin');
                setShowAuthScreen(false);
              }}
              className={`p-1.5 rounded-lg border transition cursor-pointer text-xs ${
                viewMode === 'admin'
                  ? 'bg-[#D9A752]/20 border-[#D9A752]/40 text-[#D9A752]'
                  : isDarkMode ? 'bg-emerald-950/10 border-emerald-950 text-slate-300 hover:bg-emerald-950/30' : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-205'
              }`}
              title={isArabic ? 'وحدة الإشراف والتحكم' : 'Supervisor Admin Desk'}
            >
              <Shield className="w-4 h-4" />
            </button>

            {/* Language Toggle */}
            <div className={`flex p-0.5 rounded-lg border ${isDarkMode ? 'bg-[#06221A] border-emerald-950/45' : 'bg-stone-100 border-stone-200'}`}>
              <button
                onClick={() => setLang('ar')}
                className={`px-2 py-1 text-[10px] font-bold rounded-md cursor-pointer transition ${
                  lang === 'ar' ? 'bg-[#D9A752] text-white font-serif' : 'text-slate-400'
                }`}
              >
                AR
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 text-[10px] font-bold rounded-md cursor-pointer transition ${
                  lang === 'en' ? 'bg-[#D9A752] text-white font-serif' : 'text-slate-400'
                }`}
              >
                EN
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                isDarkMode ? 'bg-[#06221A] border-emerald-950 text-amber-400 hover:bg-emerald-900/30' : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Account / Profile */}
            {!authLoading && (
              profile ? (
                <div
                  onClick={() => {
                    setViewMode('profile');
                    setShowAuthScreen(false);
                  }}
                  className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs max-w-[150px] cursor-pointer hover:bg-emerald-950/30 transition-all ${
                    viewMode === 'profile'
                      ? 'bg-[#D9A752] border-[#D9A752] shadow-inner text-white'
                      : isDarkMode ? 'bg-[#06221A] border-[#06221A] text-slate-300' : 'bg-white border-stone-200 text-stone-700'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-[10px] text-white overflow-hidden shrink-0">
                    {profile.photoURL ? (
                      <img src={profile.photoURL} alt={profile.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      profile.fullName.charAt(0)
                    )}
                  </div>
                  <span className="font-bold truncate max-w-[60px]" title={profile.fullName}>{profile.fullName}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      logout();
                      setViewMode('explorer');
                    }}
                    className="p-0.5 hover:text-red-500 cursor-pointer shrink-0"
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
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    showAuthScreen 
                      ? 'bg-[#D9A752] text-white border-[#D9A752]' 
                      : 'text-slate-300 bg-[#06221A]/80 border-emerald-950 hover:bg-[#06221A]'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-[#D9A752]" />
                  <span>{isArabic ? 'دخول' : 'Login'}</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Mobile Subnavbar */}
        <div className="flex md:hidden items-center justify-center gap-1 mt-2 py-1 overflow-x-auto border-t border-emerald-950/20">
          {(['home', 'directory', 'timeline', 'quiz', 'leaderboard', 'favorites'] as const).map((tab) => {
            const active = activeTab === tab && viewMode === 'explorer';
            const label = {
              home: isArabic ? 'الرئيسية' : 'Home',
              directory: isArabic ? 'البطاقات' : 'Sira',
              timeline: isArabic ? 'التاريخ' : 'Time',
              quiz: isArabic ? 'اختبر' : 'Quiz',
              leaderboard: isArabic ? 'القمة' : 'Top',
              favorites: isArabic ? 'المحفوظة' : 'Favs',
            }[tab];
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setViewMode('explorer');
                  setShowAuthScreen(false);
                }}
                className={`px-3 py-1 text-[11px] font-bold font-serif whitespace-nowrap rounded ${
                  active ? 'text-[#D9A752] bg-emerald-950/40' : 'text-slate-400'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Primary Body Workspace */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <RefreshCw className="w-8 h-8 text-[#D9A752] animate-spin" />
            <p className="text-xs text-[#D9A752] font-serif tracking-widest">{isArabic ? 'يُحمّل سجلاّت التاريخ والفضائل العطرة...' : 'Retrieving prestigious companions histories...'}</p>
          </div>
        ) : showAuthScreen ? (
          <AuthPages isArabic={isArabic} isDarkMode={isDarkMode} lang={lang} onSuccess={() => setShowAuthScreen(false)} />
        ) : viewMode === 'profile' ? (
          <UserProfilePage
            allCompanions={companions}
            onSelectCompanion={(comp) => {
              setSelectedCompanion(comp);
              setViewMode('explorer');
              setActiveTab('directory');
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
            onNavigateHome={() => {
              setViewMode('explorer');
              setActiveTab('home');
            }}
          />
        ) : viewMode === 'admin' ? (
          /* ADMIN PORTAL */
          !user ? (
            <div className="space-y-4 max-w-sm mx-auto my-12">
              <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-600 font-sans text-center">
                {isArabic 
                  ? 'يتطلب دخول هذا القسم تسجيل الدخول بحساب مشرف معتمد.' 
                  : 'Accessing this environment requires signing in with an authorized collaborator account.'}
              </div>
              <AuthPages isArabic={isArabic} isDarkMode={isDarkMode} lang={lang} onSuccess={() => {}} />
            </div>
          ) : !profile || profile.role !== 'admin' ? (
            <div className="max-w-md mx-auto my-12 animate-fade-in text-center p-8 border rounded-3xl bg-[#06221A] border-emerald-900/60 shadow-xl space-y-5">
              <ShieldAlert className="w-12 h-12 text-[#D9A752] mx-auto animate-pulse" />
              <div className="space-y-2">
                <h3 className="text-lg font-serif font-bold text-[#D9A752]">
                  {isArabic ? 'صلاحيات غير كافية' : 'Restricted Admin Console Access'}
                </h3>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  {isArabic 
                    ? 'عذراً، بروفايل حسابك الحالي لا يمتلك صلاحيات المشرفين. للقيام بعمليات الإدخال والمراجعة، تفضل بالانتقال للمستكشف المرئي أو تسجيل الدخول بحساب مشرف معتمد.' 
                    : 'Sorry, your registered account profile is not appointed with administrator privileges. Go back to browse the interactive graph explorer or authenticate with an authorized credentials.'}
                </p>
              </div>
              <button
                onClick={() => logout()}
                className="w-full bg-[#D9A752] hover:bg-[#D9A752]/80 text-[#031410] font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                {isArabic ? 'تسجيل الخروج والتبديل' : 'Sign Out and Switch'}
              </button>
            </div>
          ) : (
            <div className="animate-fade-in">
              <AdminDashboard
                companions={companions}
                relationships={relationships}
                isArabic={isArabic}
                onRefreshData={loadData}
                firebaseProfile={profile}
                isDarkMode={isDarkMode}
              />
            </div>
          )
        ) : (
          /* STANDARD EXPLORER SPACE with gorgeous tab routing */
          <div className="space-y-8 animate-fade-in">
            
            {/* 1. HOME TAB */}
            {activeTab === 'home' && (
              <div className="flex flex-col items-center justify-center py-20 text-center max-w-4xl mx-auto space-y-12 animate-fade-in relative z-10">
                {/* Sparkle badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-mono text-[10px] uppercase tracking-wider shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[#D9A752]" />
                  <span>V 0.0.2 • Islamic Encyclopedia</span>
                </div>

                {/* Main Titles */}
                <div className="space-y-4">
                  <h1 className="text-7xl font-sans tracking-tight leading-none font-black flex flex-col sm:flex-row items-center justify-center gap-3">
                    <span className="text-white">Sahaba</span>
                    <span className="text-[#D9A752] font-serif italic text-6xl">Explorer</span>
                  </h1>
                  <p className="text-lg font-sans text-emerald-100/70 max-w-xl mx-auto font-light leading-relaxed">
                    Discover the lives of the Companions of Prophet Muhammad ﷺ
                  </p>
                  
                  {/* Caligraphy snippet */}
                  <div className="text-3xl font-serif text-[#D9A752]/90 font-medium py-3 tracking-wider block" lang="ar" dir="rtl">
                    رضي الله عنهم وأرضاهم
                  </div>
                </div>

                {/* CTA operations */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md mx-auto">
                  <button
                    onClick={() => setActiveTab('directory')}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#10B981] hover:bg-[#0f9f72] text-white font-bold text-sm tracking-wide cursor-pointer shadow-md shadow-emerald-950/40 hover:-translate-y-0.5 active:translate-y-0 transition flex items-center justify-center gap-2"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Explore Sahaba</span>
                  </button>
                  <button
                    onClick={() => {
                      if (companions.length > 0) {
                        const randomComp = companions[Math.floor(Math.random() * companions.length)];
                        setSelectedCompanion(randomComp);
                        setActiveTab('directory');
                        setTimeout(() => {
                          const detailAnchor = document.getElementById('sahaba-detail-container-anchor');
                          if (detailAnchor) {
                            detailAnchor.scrollIntoView({ behavior: 'smooth' });
                          }
                        }, 100);
                      }
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#06221A] border border-emerald-900/60 hover:bg-emerald-900/10 text-white font-bold text-sm tracking-wide cursor-pointer hover:-translate-y-0.5 active:translate-y-0 transition flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#D9A752]" />
                    <span>Random Companion</span>
                  </button>
                </div>

                {/* Counters / Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-emerald-950/20 w-full">
                  <div className="flex flex-col items-center p-5 bg-[#06221A] rounded-2xl border border-emerald-500/10 shadow-sm">
                    <User className="w-6 h-6 text-[#D9A752] mb-2" />
                    <span className="text-4xl font-sans font-black text-white">{companions.length || '10'}</span>
                    <span className="text-[11px] text-slate-400 tracking-wider font-mono mt-1">Sahaba Profiles</span>
                  </div>
                  <div className="flex flex-col items-center p-5 bg-[#06221A] rounded-2xl border border-emerald-500/10 shadow-sm">
                    <Layers className="w-6 h-6 text-[#D9A752] mb-2" />
                    <span className="text-4xl font-sans font-black text-white">7+</span>
                    <span className="text-[11px] text-slate-400 tracking-wider font-mono mt-1">Categories</span>
                  </div>
                  <div className="flex flex-col items-center p-5 bg-[#06221A] rounded-2xl border border-emerald-500/10 shadow-sm">
                    <Calendar className="w-6 h-6 text-[#D9A752] mb-2" />
                    <span className="text-4xl font-sans font-black text-white">45+</span>
                    <span className="text-[11px] text-slate-400 tracking-wider font-mono mt-1">Historical Events</span>
                  </div>
                  <div className="flex flex-col items-center p-5 bg-[#06221A] rounded-2xl border border-emerald-500/10 shadow-sm">
                    <Award className="w-6 h-6 text-[#D9A752] mb-2" />
                    <span className="text-4xl font-sans font-black text-white">{DEFAULT_BATTLES.length || '23'}+</span>
                    <span className="text-[11px] text-slate-400 tracking-wider font-mono mt-1">Battles Documented</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. DIRECTORY TAB - BEAUTIFUL CARDS WITH WATERMARK & NESTED GRAPH MAP */}
            {activeTab === 'directory' && (
              <div className="space-y-6">
                
                {/* Header title */}
                <div className="space-y-2 border-b border-emerald-950/20 pb-4">
                  <h2 className="text-3xl font-extrabold font-serif text-white tracking-tight flex items-center gap-2">
                    <Compass className="w-7 h-7 text-[#D9A752]" />
                    <span>{isArabic ? 'بطاقات وأطلس السير الشريفة' : 'Sahaba Directory'}</span>
                  </h2>
                  <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
                    {isArabic 
                      ? 'ابحث واستكشف تراث السير العطرة لجيل الصحابة الأبرار، مدعوماً بخرائط الربط التفاعلية والتصنيف القيمي.' 
                      : 'Search and explore companions categorized by their role in Islamic history with watermarks and relations.'}
                  </p>
                </div>

                {/* Consolidated Search & View Toggles block */}
                <div className="p-4 rounded-3xl bg-[#06221A] border border-emerald-950/60 shadow flex flex-col md:flex-row gap-4 items-center justify-between">
                  {/* Left search bar */}
                  <div className="relative w-full md:w-96">
                    <input
                      type="text"
                      value={filter.searchQuery}
                      onChange={(e) => setFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
                      placeholder={isArabic ? 'البحث بالاسم في العربية، الإنجليزية أو الفرنسية...' : 'Search by name in Arabic, English or French...'}
                      className="w-full border rounded-2xl py-2.5 pl-3.5 pr-10 focus:outline-none text-xs transition bg-[#031410] border-emerald-950 text-slate-100 focus:border-[#D9A752]"
                    />
                    <Search className="w-4 h-4 text-[#D9A752] absolute top-3.5 right-3.5" />
                  </div>

                  {/* Switch Sub-Display Modes */}
                  <div className="flex gap-2 p-1 bg-[#031410] border border-emerald-950/60 rounded-xl">
                    <button
                      onClick={() => setExplorerViewType('directory')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        explorerViewType === 'directory' 
                          ? 'bg-emerald-800 text-white shadow' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'بطاقات السيرة' : 'Sira Cards'}</span>
                    </button>
                    <button
                      onClick={() => setExplorerViewType('graph')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        explorerViewType === 'graph' 
                          ? 'bg-emerald-800 text-white shadow' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <GitFork className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'شبكة العلاقات' : 'Relations Map'}</span>
                    </button>
                    <button
                      onClick={() => setExplorerViewType('classify')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        explorerViewType === 'classify' 
                          ? 'bg-emerald-800 text-white shadow' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'أداة التصنيف القيمة' : 'Classification'}</span>
                    </button>
                  </div>
                </div>

                {/* Sub-Filters based on Categories with Counts */}
                <div className="flex flex-wrap gap-2 py-2 overflow-x-auto select-none">
                  {[
                    { value: '', labelEn: 'All', labelAr: 'الكل' },
                    { value: 'Khulafa_Rashidun', labelEn: 'Rashidun Caliphs', labelAr: 'الخلفاء الراشدون' },
                    { value: 'Muhajirun', labelEn: 'Muhajirun', labelAr: 'المهاجرون' },
                    { value: 'Ansar', labelEn: 'Ansar', labelAr: 'الأنصار' },
                    { value: 'Ahl_al_Bayt', labelEn: 'Ahl Al Bayt', labelAr: 'آل البيت الأطهار' },
                    { value: 'Military', labelEn: 'Military Leaders', labelAr: 'القادة العسكريون' },
                    { value: 'Scholars', labelEn: 'Scholars', labelAr: 'العلماء والفقهاء' },
                    { value: 'Wives', labelEn: 'Wives of Prophet', labelAr: 'أمهات المؤمنين' },
                  ].map((chip) => {
                    const isSelected = filter.category === chip.value;
                    const count = chip.value === '' 
                      ? companions.length 
                      : companions.filter(c => c.category === chip.value).length;

                    return (
                      <button
                        key={chip.value}
                        onClick={() => setFilter(prev => ({ ...prev, category: chip.value }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'bg-[#10B981] text-white border-[#10B981]'
                            : 'bg-[#06221A] text-slate-350 border-emerald-950/65 hover:bg-emerald-900/35 hover:text-white'
                        }`}
                      >
                        <span>{isArabic ? chip.labelAr : chip.labelEn}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-emerald-950/40 text-emerald-100' : 'bg-emerald-950 text-emerald-400'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Primary Content Panel columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  
                  {/* Left Column: List/Grid workspace */}
                  <div className="lg:col-span-2 space-y-4">
                    {explorerViewType === 'directory' ? (
                      /* BEAUTIFUL DIRECTORY CARD GRID WITH ARABIC WATERMARKS */
                      filteredCompanions.length === 0 ? (
                        <div className="border border-dashed border-emerald-900/30 rounded-3xl p-12 text-center bg-[#06221A]/30">
                          <Search className="w-7 h-7 text-emerald-600 mx-auto mb-2" />
                          <p className="text-xs font-serif text-slate-400 leading-relaxed">
                            {isArabic 
                              ? 'عذراً، لم يتم العثور على أي صحابة يطابقون خيارات البحث المتاحة.' 
                              : 'No companions match your search parameters. Try resetting your query.'}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {filteredCompanions.map((comp) => {
                            const cat = CATEGORY_CONFIG[comp.category] || CATEGORY_CONFIG.Other;
                            const isSelected = selectedCompanion?.id === comp.id;
                            const isFav = favorites.includes(comp.id);
                            
                            // Watermark generation: extracting first main Arabic letter
                            const initialWatermark = comp.nameAr?.trim().replace(/^ال/, '').charAt(0) || '';

                            return (
                              <div
                                key={comp.id}
                                onClick={() => {
                                  setSelectedCompanion(comp);
                                  const detailAnchor = document.getElementById('sahaba-detail-container-anchor');
                                  if (detailAnchor) {
                                    detailAnchor.scrollIntoView({ behavior: 'smooth' });
                                  }
                                }}
                                className={`group p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden shadow-sm h-72 ${
                                  isSelected
                                    ? 'bg-[#06221A] border-[#D9A752] text-white ring-1 ring-[#D9A752]/20'
                                    : 'bg-[#06221A] border-emerald-950 hover:bg-[#082a21] text-slate-100 hover:border-emerald-900/40'
                                }`}
                              >
                                {/* Category top line */}
                                <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: cat.color }} />

                                {/* Large initial watermark background */}
                                <div className="absolute -top-3 right-4 text-[13rem] font-serif font-black text-[#D9A752]/[0.05] group-hover:text-[#D9A752]/[0.09] select-none pointer-events-none transition-all duration-500">
                                  {initialWatermark}
                                </div>

                                {/* Bookmark button absolute placement */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(comp.id);
                                  }}
                                  className="absolute top-5 left-5 p-1 z-30 transition cursor-pointer hover:scale-110 active:scale-95"
                                  title="Add to Favorites"
                                >
                                  <Heart className={`w-4 h-4 ${isFav ? 'text-red-500 fill-red-500' : 'text-slate-500 hover:text-white'}`} />
                                </button>

                                <div className="space-y-4 pt-2 relative z-10">
                                  {/* Head labels */}
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
                                    <h3 className="text-xl font-bold text-[#D9A752] font-serif tracking-wide group-hover:text-white transition-colors">
                                      {comp.nameAr}
                                    </h3>
                                    <p className="text-xs text-white font-serif font-bold tracking-tight">
                                      {comp.nameEn}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-mono italic">
                                      {isArabic ? comp.kunyaAr : comp.kunyaEn} &bull; {isArabic ? comp.tribeAr : comp.tribeEn}
                                    </p>
                                  </div>

                                  {/* Bio snip */}
                                  <p className="text-xs text-slate-350 line-clamp-3 leading-relaxed font-light">
                                    {isArabic ? comp.shortBioAr : comp.shortBioEn}
                                  </p>
                                </div>

                                {/* Narrations Footer */}
                                <div className="border-t border-emerald-900/20 pt-3 mt-4 flex justify-between items-center text-[11px] text-slate-400 relative z-10 font-mono">
                                  <span>📚 {comp.hadithCount} narrations</span>
                                  <span className="text-[#D9A752] font-bold hover:underline flex items-center gap-1">
                                    {isArabic ? 'تصفح السيرة' : 'View Seerah'} &rarr;
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )
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
                      <ClassificationTool
                        companions={filteredCompanions}
                        onSelectCompanion={setSelectedCompanion}
                        selectedCompanion={selectedCompanion}
                        isArabic={isArabic}
                        lang={lang}
                        isDarkMode={isDarkMode}
                      />
                    )}
                  </div>

                  {/* Right Column: Mini Pathfinder / Quick selection review */}
                  <div className="space-y-6">
                    {/* Pathfinder tool */}
                    <div className="p-5 rounded-2xl bg-[#06221A] border border-emerald-950/60 shadow">
                      <h3 className="text-sm font-bold border-b border-emerald-950 pb-2 mb-3 flex items-center gap-1.5 font-serif text-[#D9A752]">
                        <GitFork className="w-4 h-4" />
                        <span>{isArabic ? 'تقصي خطوط ومسارات النسب والصلة' : 'Relationship Path Finder'}</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                        {isArabic 
                          ? 'حدد صحابيين لإيجاد أقصر مسار روابط تاريخية أو مصاهرة تجمع بينهما:' 
                          : 'Choose two companions of the Prophet ﷺ to trace their mutual lineage or historic alliance chain:'}
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold mb-1">{isArabic ? 'الصحابي الأول (البداية)' : 'Start Companion'}</label>
                          <select
                            value={pathStartId}
                            onChange={(e) => setPathStartId(e.target.value)}
                            className="w-full bg-[#031410] border border-emerald-950 text-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-[#D9A752]"
                          >
                            <option value="">-- {isArabic ? 'اختر البداية' : 'Select Start Node'} --</option>
                            {companions.map(c => (
                              <option key={c.id} value={c.id}>{c.nameAr} ({c.nameEn})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 font-bold mb-1">{isArabic ? 'الصحابي الثاني (الهدف)' : 'Target Companion'}</label>
                          <select
                            value={pathEndId}
                            onChange={(e) => setPathEndId(e.target.value)}
                            className="w-full bg-[#031410] border border-emerald-950 text-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-[#D9A752]"
                          >
                            <option value="">-- {isArabic ? 'اختر الهدف' : 'Select Target Node'} --</option>
                            {companions.map(c => (
                              <option key={c.id} value={c.id}>{c.nameAr} ({c.nameEn})</option>
                            ))}
                          </select>
                        </div>

                        {pathError && (
                          <div className="p-2 border border-red-500/10 bg-red-500/5 text-red-400 text-[10px] text-center rounded-lg">{pathError}</div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={findShortestRelationshipPath}
                            className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold p-2.5 rounded-lg text-xs cursor-pointer transition active:scale-95 shadow-md flex justify-center gap-1"
                          >
                            <span>{isArabic ? 'كشف خط الاتصال' : 'Trace Connection Path'}</span>
                          </button>
                          {highlightedPath && (
                            <button
                              onClick={clearHighlightedPath}
                              className="px-3 py-2 bg-[#031410] border border-slate-700 text-slate-300 rounded-lg text-xs"
                            >
                              {isArabic ? 'مسح' : 'Clear'}
                            </button>
                          )}
                        </div>

                        {/* Pathfinder Render display */}
                        {highlightedPath && (
                          <div className="p-3 bg-[#031410] border border-emerald-950 rounded-lg space-y-2 mt-4 animate-fade-in text-xs text-slate-300">
                            <span className="font-bold text-[10px] text-[#D9A752] uppercase block">{isArabic ? 'مسار الوصل المكتشف:' : 'Discovered Historic Hops:'}</span>
                            <div className="space-y-1">
                              {highlightedPath.map((nodeId, idx) => {
                                const node = companions.find(c => c.id === nodeId);
                                if (!node) return null;
                                return (
                                  <div key={nodeId} className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-emerald-900 border border-emerald-600/30 text-white text-[10px] font-bold flex items-center justify-center">
                                      {idx + 1}
                                    </span>
                                    <span className="font-serif font-bold text-white leading-none">{node.nameAr}</span>
                                    {idx < highlightedPath.length - 1 && (
                                      <span className="text-[#D9A752] font-mono text-[10px]">&rarr;</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Left Banner Media config support */}
                    {bannerConfig.enabled && (
                      <LeftMediaBanner config={bannerConfig} isArabic={isArabic} isDarkMode={isDarkMode} />
                    )}
                  </div>

                </div>

                {/* Companion detailed profile cards section wrapper */}
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
                      }}
                      user={user}
                      profile={profile}
                    />
                  )}
                </div>

              </div>
            )}

            {/* 3. TIMELINE TAB - BEAUTIFULLY STYLED HISTORICAL MILESTONES */}
            {activeTab === 'timeline' && (
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="space-y-2 text-center pb-6 border-b border-emerald-950/20">
                  <h2 className="text-3xl font-extrabold font-serif text-white tracking-tight flex items-center justify-center gap-2">
                    <Calendar className="w-7 h-7 text-[#D9A752]" />
                    <span>{isArabic ? 'الخط الزمني للتاريخ والسير العطرة' : 'Historical Timeline'}</span>
                  </h2>
                  <p className="text-sm text-slate-400 font-sans max-w-md mx-auto">
                    {isArabic 
                      ? 'مخطط كبرى الغزوات والتحولات الفضلى في عهد النبوة والخلافة الراشدة.' 
                      : 'Step through pivotal milestones, sacred battles and historical turnpoints in Sahaba chronicles.'}
                  </p>
                </div>

                {/* Timeline loops */}
                <div className="relative border-l border-emerald-900/60 ml-6 pl-8 space-y-12 py-4">
                  {[
                    { yearAH: -53, yearCE: 570, titleAr: 'ولادة النبي محمد ﷺ', titleEn: 'Birth of Prophet Muhammad ﷺ', descAr: 'ولادة سيد ولد آدم ﷺ في مكة في عام الفيل.', descEn: 'The Prophetic light illumines the world in Mecca, in the Year of Elephant.' },
                    { yearAH: -13, yearCE: 610, titleAr: 'نزول الوحي البعثة الكريمة', titleEn: 'First Revelation (The Call)', descAr: 'نزول جبريل عليه السلام بغار حراء، وبدء الدعوة وإسلام أبي بكر وعلي خديجة.', descEn: 'Dawah begins; Abu Bakr al-Siddiq, Ali, Khadija, and other early stalwarts proclaim their faith.' },
                    { yearAH: 1, yearCE: 622, titleAr: 'الهجرة النبوية المباركة', titleEn: 'The Great Migration (Hijra)', descAr: 'هجرة الرسول وصاحبه أبي بكر ليلاً للمدينة المنورة وحلف المؤاخاة العظيم بين المهاجرين والأنصار.', descEn: 'The Prophet and Abu Bakr construct the holy fraternal bond between Muhajirun and Madinah\'s Ansar.' },
                    { yearAH: 2, yearCE: 624, titleAr: 'غزوة بدر الكبرى العظيمة', titleEn: 'The Battle of Badr', descAr: 'معركة الفرقان الأولى الحاسمة، وانتصار ٣١٣ مؤمن على جيش قريش.', descEn: 'The absolute clash of standards where 313 believers, guided by divine mercy, routed Quraish.' },
                    { yearAH: 3, yearCE: 625, titleAr: 'غزوة أحد وشهادة حمزة', titleEn: 'The Battle of Uhud', descAr: 'اختبار الرماة وثبات القادة واستشهاد حمزة بن عبد المطلب رضي الله عنه.', descEn: 'The critical trial of archers, resulting in core leadership lessons and martyrdom of Hamza.' },
                    { yearAH: 5, yearCE: 627, titleAr: 'غزوة الخندق وتأمين المدينة', titleEn: 'The Battle of the Trench', descAr: 'حصار قريش والأحزاب واستعمال فكرة خندق سلمان الفارسي رضي الله عنه.', descEn: 'The majestic Coalition Siege defeated through the defensive trench engineered by Salman al-Farsi.' },
                    { yearAH: 8, yearCE: 630, titleAr: 'فتح مكة الكبرى الفاتحة', titleEn: 'The Liberation of Mecca', descAr: 'دخول مكة فاتحين وتطهير الكعبة من الأوثان مع عفو عام ورحمة مطلقة.', descEn: 'The triumphant non-violent entry of 10,000 believers cleanses the Kaaba under general amnesty.' },
                    { yearAH: 11, yearCE: 632, titleAr: 'الوفاة النبوية وخلافة الصديق', titleEn: 'Passing of Prophet ﷺ & 1st Caliph', descAr: 'وفاة خاتم المرسلين عليه السلام، وبيعة أبي بكر الصديق خليفة أول وثبات الأمة.', descEn: 'The passing of the Prophet ﷺ; Abu Bakr is elected Caliph, preserving the early Islamic State.' },
                    { yearAH: 13, yearCE: 634, titleAr: 'وفاة أبي بكر وخلافة الفاروق', titleEn: 'Passing of Abu Bakr & 2nd Caliph', descAr: 'وفاة الصديق وتولي أمير المؤمنين عمر بن الخطاب الخلافة وتأسيس الدواوين وعقد العدالة.', descEn: 'Umar ibn al-Khattab assumes office, charting administrative structures, land offices, and judicial codes.' },
                    { yearAH: 23, yearCE: 644, titleAr: 'استشهاد عمر وخلافة ذي النورين', titleEn: 'Passing of Umar & 3rd Caliph', descAr: 'استشهاد الفاروق على يد أبي لؤلؤة وتولي عثمان بن عفان الخلافة وتعميم جمع القرآن.', descEn: 'Uthman ibn Affan succeeds Umar, standardizing the written text of the Holy Quran Mushaf compilation.' },
                    { yearAH: 35, yearCE: 656, titleAr: 'استشهاد عثمان وخلافة علي', titleEn: 'Passing of Uthman & 4th Caliph', descAr: 'استشهاد عثمان بفتنة بغيضة، ومبايعة أمير المؤمنين علي بن أبي طالب رابع الخلفاء الراشدين.', descEn: 'Ali ibn Abi Talib assumes the caliphate, piloting civil justice and governance during immense internal trials.' }
                  ].map((evt) => (
                    <div key={evt.yearAH} className="relative group">
                      
                      {/* Interactive Year Indicator Accent bubble */}
                      <div className="absolute -left-[54px] top-1.5 w-10 h-10 rounded-full bg-[#031410] border-2 border-[#D9A752]/70 group-hover:bg-[#D9A752] group-hover:border-[#D9A752] transition flex items-center justify-center font-serif text-white font-bold text-xs select-none">
                        {evt.yearAH > 0 ? `${evt.yearAH}هـ` : `${Math.abs(evt.yearAH)}ق.هـ`}
                      </div>

                      {/* Info Card Content */}
                      <div className="p-6 rounded-2xl bg-[#06221A] border border-emerald-950 shadow hover:border-[#D9A752]/30 transition-all duration-300">
                        <div className="flex justify-between items-center text-xs text-[#D9A752] mb-2 font-mono">
                          <span>AH {evt.yearAH} &bull; CE {evt.yearCE}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-[10px] text-emerald-400">Chronicle</span>
                        </div>
                        <h3 className="text-lg font-bold font-serif text-white group-hover:text-[#D9A752] transition-colors mb-2">
                          {isArabic ? evt.titleAr : evt.titleEn}
                        </h3>
                        <p className="text-xs text-slate-350 leading-relaxed font-light">
                          {isArabic ? evt.descAr : evt.descEn}
                        </p>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. LEARNING TAB - SCHOLASTIC DATASET LIBRARY */}
            {activeTab === 'learning' && (
              <div className="space-y-6 max-w-5xl mx-auto">
                <div className="space-y-2 text-center pb-6 border-b border-emerald-950/20">
                  <h2 className="text-3xl font-extrabold font-serif text-white tracking-tight flex items-center justify-center gap-2">
                    <GraduationCap className="w-8 h-8 text-[#D9A752]" />
                    <span>{isArabic ? 'صرح العلوم والتعلم التاريخي الموثق' : 'Scholastic Learning Center'}</span>
                  </h2>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    {isArabic 
                      ? 'اقرأ وثائق الغزوات، تصفح المصادر التاريخية المعتمدة واحصل على دروس السير العطرة.' 
                      : 'Explore historical battles, examine verified references, and study Prophetic biographies.'}
                  </p>
                </div>

                {/* Subsections: Battles Index */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {/* Item 1: Detailed Battles directory */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#D9A752] uppercase font-serif tracking-widest border-b border-emerald-950 pb-2 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span>{isArabic ? 'سجلات ودواوين الغزوات النبوية' : 'Chronicled Prophetic Battles'}</span>
                    </h3>
                    
                    <div className="space-y-3">
                      {DEFAULT_BATTLES.map((btl) => (
                        <div key={btl.id} className="p-4 rounded-xl bg-[#06221A] border border-emerald-950 hover:border-emerald-900 transition-all text-xs">
                          <div className="flex justify-between items-center mb-1 font-mono text-emerald-500 font-bold">
                            <span>AH {btl.yearAH}</span>
                            <span>{isArabic ? btl.locationAr : btl.locationEn}</span>
                          </div>
                          <h4 className="text-sm font-serif font-bold text-[#D9A752] mb-1.5">{isArabic ? btl.nameAr : btl.nameEn}</h4>
                          <p className="text-slate-350 leading-relaxed font-light">{isArabic ? btl.summaryAr : btl.summaryEn}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Item 2: Verified Sources & Daily lesson */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-[#D9A752] uppercase font-serif tracking-widest border-b border-emerald-950 pb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{isArabic ? 'المراجع والمصادر التفتيشية المعتمدة' : 'Verified Academic Sources'}</span>
                      </h3>
                      <div className="p-5 rounded-2xl bg-[#06221A] border border-emerald-950 space-y-4 text-xs">
                        <p className="text-slate-400 leading-relaxed">
                          {isArabic 
                            ? 'نعتمد في فحص السير والأعمار والتواريخ الكودية لقاعدة مستكشف الصحابة على المصادر التاريخية الإسلامية الكلاسيكية المعتدلة:' 
                            : 'This digital resource relies exclusively on primary classical references verified by historical major scholars.'}
                        </p>
                        <div className="grid grid-cols-2 gap-3 font-serif">
                          <div className="p-3 bg-[#031410] border border-emerald-950 rounded-lg text-white font-bold">
                            📖 صحيح البخاري
                          </div>
                          <div className="p-3 bg-[#031410] border border-emerald-950 rounded-lg text-white font-bold">
                            📖 أسد الغابة - ابن الأثير
                          </div>
                          <div className="p-3 bg-[#031410] border border-emerald-950 rounded-lg text-white font-bold">
                            📖 الإصابة - ابن حجر العسقلاني
                          </div>
                          <div className="p-3 bg-[#031410] border border-emerald-950 rounded-lg text-white font-bold">
                            📖 طبقات ابن سعد الكبرى
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Daily Seerah Reflection block */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#06221A] to-[#043326] border border-emerald-950 text-xs text-center space-y-3.5 shadow">
                      <Sparkles className="w-6 h-6 text-[#D9A752] mx-auto animate-pulse" />
                      <h4 className="text-[#D9A752] font-serif font-black text-sm">{isArabic ? 'حكمة ودرس اليوم' : 'Daily Reflection'}</h4>
                      <p className="italic text-slate-205 leading-relaxed max-w-sm mx-auto font-serif">
                        {isArabic 
                          ? '"إن الأخوة الإسلامية الحقة التي رسخها المعصوم ﷺ بين المهاجرين والأنصار كانت المعجزة الاجتماعية الكبرى التي قامت عليها أركان الدولة المباركة والمدينة المنورة."' 
                          : '"The bond of brotherhood established in Medina remains history\'s most noble civic fusion, proving that shared virtue can bridge any lineage gap."'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. QUIZ TAB - INTERACTIVE BILINGUAL QCM FOR STUDENTS */}
            {activeTab === 'quiz' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="space-y-2 text-center pb-6 border-b border-emerald-950/20">
                  <h2 className="text-3xl font-extrabold font-serif text-white tracking-tight flex items-center justify-center gap-2">
                    <Trophy className="w-7 h-7 text-[#D9A752]" />
                    <span>{isArabic ? 'اختبار السيرة العطرة الكبرى' : 'Prophetic Seerah Quiz'}</span>
                  </h2>
                  <p className="text-sm text-slate-400 font-sans max-w-md mx-auto">
                    {isArabic 
                      ? 'اختبر حصيلتك وسعة اطلاعك في قصص الصحابة وحروب الدفاع الشامخة، واكسب نقاط ترقية!' 
                      : 'Test your understanding, earn scholarly reward scores, and review detailed seerah explanations.'}
                  </p>
                </div>

                {quizQuestion ? (
                  /* Active Question Game box */
                  <div className="p-6 rounded-2xl bg-[#06221A] border border-emerald-950 shadow-xl space-y-6">
                    
                    {/* Header stats info */}
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="px-2.5 py-1 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20 rounded-full font-bold uppercase tracking-wider text-[9px]">
                        Difficulty: {quizQuestion.difficulty}
                      </span>
                      <span className="text-slate-400 font-bold">
                        Scholarly Score: <span className="text-[#D9A752] font-black underline">{quizOverallScore} pts</span>
                      </span>
                    </div>

                    {/* Question text */}
                    <h3 className="text-lg font-serif font-bold text-white leading-relaxed pt-2">
                      {isArabic ? quizQuestion.question.ar : quizQuestion.question.en || quizQuestion.question.fr}
                    </h3>

                    {/* Options list */}
                    <div className="space-y-3 pt-2">
                      {(isArabic ? quizQuestion.choices.ar : quizQuestion.choices.en || quizQuestion.choices.fr).map((choice, idx) => {
                        const isCorrectAnswer = idx === quizQuestion.correctIndex;
                        const isThisSelected = quizSelected === idx;
                        
                        let choiceClass = 'bg-[#031410] hover:bg-emerald-950 border-emerald-950 text-slate-200';
                        if (quizAnswered) {
                          if (isCorrectAnswer) {
                            choiceClass = 'bg-emerald-900/30 border-emerald-650 text-emerald-300';
                          } else if (isThisSelected) {
                            choiceClass = 'bg-rose-950/20 border-rose-800 text-rose-300';
                          } else {
                            choiceClass = 'bg-[#031410]/50 border-emerald-950/30 text-slate-500 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            disabled={quizAnswered}
                            onClick={async () => {
                              if (quizAnswered) return;
                              setQuizSelected(idx);
                              setQuizAnswered(true);
                              const isCorrect = idx === quizQuestion.correctIndex;
                              const pts = isCorrect ? (quizQuestion.difficulty === 'easy' ? 10 : quizQuestion.difficulty === 'medium' ? 15 : 20) : -5;
                              setQuizFeedback({ isCorrect, points: pts });
                              
                              const newScr = Math.max(0, quizOverallScore + pts);
                              setQuizOverallScore(newScr);
                              localStorage.setItem('sahaba_quiz_score', newScr.toString());

                              // Also sync to logged-in Firebase Profile
                              if (user) {
                                try {
                                  const userDocRef = doc(db, 'users', user.uid);
                                  await updateDoc(userDocRef, { score: newScr });
                                } catch (e) {
                                  console.warn("Quiz Firebase sync error:", e);
                                }
                              }
                            }}
                            className={`w-full text-left p-4 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${choiceClass}`}
                          >
                            <span>{choice}</span>
                            {quizAnswered && isCorrectAnswer && <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                            {quizAnswered && isThisSelected && !isCorrectAnswer && <X className="w-4 h-4 text-rose-400 shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanatory feedback */}
                    {quizAnswered && quizFeedback && (
                      <div className="p-4 bg-[#031410] border border-emerald-950 rounded-xl space-y-3 text-xs animate-fade-in relative z-10">
                        <div className="flex items-center gap-2">
                          {quizFeedback.isCorrect ? (
                            <span className="text-emerald-400 font-bold font-serif">✓ Correct (+{quizFeedback.points} pts!)</span>
                          ) : (
                            <span className="text-rose-400 font-bold font-serif">✗ Incorrect ({quizFeedback.points} pts)</span>
                          )}
                        </div>
                        <p className="text-slate-350 leading-relaxed font-light">
                          <span className="font-bold text-[#D9A752] block mb-1">{isArabic ? 'البيان والتوضيح التاريخي:' : 'Historical Detail & Biography Context:'}</span>
                          {isArabic ? quizQuestion.explanation.ar : quizQuestion.explanation.en || quizQuestion.explanation.fr || ''}
                        </p>
                        
                        {/* Next question operation button */}
                        <button
                          onClick={() => {
                            const remain = SEERAH_QCM_QUESTIONS.filter(q => q.id !== quizQuestion.id);
                            const pool = remain.length > 0 ? remain : SEERAH_QCM_QUESTIONS;
                            const nextQ = pool[Math.floor(Math.random() * pool.length)];
                            setQuizQuestion(nextQ);
                            setQuizSelected(null);
                            setQuizAnswered(false);
                            setQuizFeedback(null);
                          }}
                          className="w-full bg-[#D9A752] text-[#031410] font-sans font-black py-2.5 rounded-lg text-xs mt-4 transition hover:bg-[#D9A752]/90 cursor-pointer shadow-md shadow-emerald-950/20 flex justify-center gap-1.5"
                        >
                          <span>{isArabic ? 'السؤال التالي والمذاكرة' : 'Next Lesson Question'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Start Banner default */
                  <div className="p-8 rounded-3xl bg-[#06221A] border border-emerald-950 text-center space-y-6">
                    <Trophy className="w-12 h-12 text-[#D9A752] mx-auto animate-bounce" />
                    <div className="space-y-2">
                      <h3 className="text-xl font-serif font-black text-white">{isArabic ? 'مستعد لبدء تحدي السير العطرة؟' : 'Ready to begin the Seerah Challenge?'}</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        {isArabic 
                          ? 'جاوب على أسئلة الاختيار من متعدد لترقية بروفايلك المنهجي وتتبع تقدم مهاراتك العلمية.' 
                          : 'Solve verified study questions with historical commentary, accummulate points, and compete on the scholars scoreboard.'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const randomQ = SEERAH_QCM_QUESTIONS[Math.floor(Math.random() * SEERAH_QCM_QUESTIONS.length)];
                        setQuizQuestion(randomQ);
                        setQuizSelected(null);
                        setQuizAnswered(false);
                        setQuizFeedback(null);
                      }}
                      className="px-8 py-3.5 rounded-full bg-[#10B981] hover:bg-[#0f9f72] text-[#031410] font-sans font-black text-xs cursor-pointer shadow-md shadow-emerald-900/10"
                    >
                      {isArabic ? 'بدء اللعب والاختبار' : 'Launch New Quiz Board'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 6. LEADERBOARD TAB */}
            {activeTab === 'leaderboard' && (
              <div className="max-w-xl mx-auto space-y-6">
                <div className="space-y-2 text-center pb-6 border-b border-emerald-950/20">
                  <h2 className="text-3xl font-extrabold font-serif text-white tracking-tight flex items-center justify-center gap-2">
                    <Trophy className="w-7 h-7 text-[#D9A752] animate-spin-slow" />
                    <span>{isArabic ? 'شُرفة فرسان الدراية والمتصدرين' : 'Scholarly Leaderboard'}</span>
                  </h2>
                  <p className="text-sm text-slate-400 font-sans max-w-sm mx-auto">
                    {isArabic 
                      ? 'قائمة العلماء والطلبة الحاصلين على أعلى النقاط في اختبارات الأرشفة والتقصي.' 
                      : 'The hall of knowledge honoring the highly-rated scholars based on completed seerah challenges.'}
                  </p>
                </div>

                {/* Score listing board card */}
                <div className="p-5 rounded-2xl bg-[#06221A] border border-emerald-950 shadow-xl divide-y divide-emerald-950/40 text-xs">
                  {[
                    { rank: 1, name: 'Boualli Mohamed (Super)', role: 'Administrator', score: 980, avatar: 'M' },
                    { rank: 2, name: 'Abu Bakr Shura Student', role: 'Collaborator', score: 720, avatar: 'A' },
                    { rank: 3, name: 'Hafiz Scholar', role: 'Moderator', score: 650, avatar: 'H' },
                    { rank: 4, name: 'Ummah Study Guide', role: 'Premium Reader', score: 540, avatar: 'U' },
                    { rank: 5, name: profile?.fullName || (isArabic ? 'أنت (مذاكر محلي)' : 'You (Offline Scholar)'), role: profile?.role ? profile.role.toUpperCase() : 'Guest Student', score: quizOverallScore, avatar: 'Y', isUser: true }
                  ]
                    .sort((a,b) => b.score - a.score)
                    .map((item, idx) => {
                      const isMe = item.isUser;
                      return (
                        <div key={idx} className={`p-4 flex items-center justify-between gap-4 transition ${isMe ? 'bg-[#D9A752]/5 border-y border-[#D9A752]/10' : ''}`}>
                          <div className="flex items-center gap-3">
                            {/* Rank circle */}
                            <span className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-[11px] ${
                              idx === 0 ? 'bg-amber-400 text-[#031410] shadow' :
                              idx === 1 ? 'bg-slate-300 text-[#031410] shadow' :
                              idx === 2 ? 'bg-[#C59E50] text-white shadow' : 'bg-emerald-950 text-slate-400'
                            }`}>
                              {idx + 1}
                            </span>

                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-serif flex items-center justify-center font-bold">
                              {item.avatar}
                            </div>

                            {/* Meta info */}
                            <div>
                              <h4 className={`font-serif font-bold text-sm ${isMe ? 'text-[#D9A752]' : 'text-white'}`}>
                                {item.name} {isMe && '⭐'}
                              </h4>
                              <p className="text-[10px] text-slate-500 font-mono tracking-tight">{item.role}</p>
                            </div>
                          </div>

                          {/* Score output */}
                          <div className="text-right">
                            <span className="font-mono text-base font-extrabold text-[#D9A752]">
                              {item.score}
                            </span>
                            <span className="text-[9px] text-slate-500 block">pts</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* 7. FAVORITES TAB - SAVED STATIONS */}
            {activeTab === 'favorites' && (
              <div className="space-y-6">
                <div className="space-y-2 text-center pb-6 border-b border-emerald-950/20 max-w-md mx-auto">
                  <Heart className="w-10 h-10 text-red-500 mx-auto fill-red-500 animate-pulse" />
                  <h2 className="text-3xl font-extrabold font-serif text-white tracking-tight">
                    {isArabic ? 'رف المفضلة والدروس المحفوظة' : 'My Favorites Shelf'}
                  </h2>
                  <p className="text-sm text-slate-400 font-sans leading-relaxed">
                    {isArabic 
                      ? 'قائمة الصحابة الأخيار الذين قمت بوضع علامة القلب عليهم لمذاكرتهم ومراجعتهم السريعة.' 
                      : 'Your curated list of beloved companions bookmarked to your favorites bar.'}
                  </p>
                </div>

                {favorites.length === 0 ? (
                  /* Empty state advice */
                  <div className="p-8 rounded-3xl bg-[#06221A] border border-dashed border-emerald-900/30 text-center max-w-md mx-auto space-y-4">
                    <User className="w-10 h-10 text-emerald-600 mx-auto" />
                    <p className="text-xs text-slate-400 font-serif leading-relaxed">
                      {isArabic 
                        ? 'رف المحفوظات الخاص بك فارغ حالياً! تصفح دليل الصحابة واضغط على علامة القلب لتضيفهم هنا للبحث السريع.' 
                        : 'Your bookmarks shelf is offline. Tap the heart symbol on companion cards to add them to your shelf.'}
                    </p>
                    <button
                      onClick={() => setActiveTab('directory')}
                      className="px-6 py-2.5 rounded-full bg-[#10B981] hover:bg-[#0f9f72] text-[#031410] font-sans font-black text-xs cursor-pointer shadow"
                    >
                      {isArabic ? 'تصفح باقة دليل الصحابة' : 'Explore Companion Directory'}
                    </button>
                  </div>
                ) : (
                  /* Render favorited cards */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {companions
                      .filter((comp) => favorites.includes(comp.id))
                      .map((comp) => {
                        const cat = CATEGORY_CONFIG[comp.category] || CATEGORY_CONFIG.Other;
                        const initialWatermark = comp.nameAr?.trim().replace(/^ال/, '').charAt(0) || '';
                        
                        return (
                          <div
                            key={comp.id}
                            onClick={() => {
                              setSelectedCompanion(comp);
                              setActiveTab('directory');
                              setTimeout(() => {
                                const detailAnchor = document.getElementById('sahaba-detail-container-anchor');
                                if (detailAnchor) {
                                  detailAnchor.scrollIntoView({ behavior: 'smooth' });
                                }
                              }, 100);
                            }}
                            className="group p-6 rounded-2xl border bg-[#06221A] border-emerald-950 hover:bg-[#0a3529] hover:border-[#D9A752]/40 transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden h-72 h-72 text-white shadow-md shadow-emerald-950/50"
                          >
                            <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: cat.color }} />
                            
                            <div className="absolute -top-3 right-4 text-[13rem] font-serif font-black text-[#D9A752]/[0.05] group-hover:text-[#D9A752]/[0.08] select-none pointer-events-none transition-all duration-500">
                              {initialWatermark}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(comp.id);
                              }}
                              className="absolute top-5 left-5 p-1 z-30 opacity-80 hover:opacity-100 transition cursor-pointer"
                            >
                              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                            </button>

                            <div className="space-y-4 pt-1 relative z-10">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="px-2 py-0.5 rounded bg-[#031410] border border-[#D9A752]/20 text-[#D9A752] font-serif font-bold">
                                  {isArabic ? cat.labelAr : cat.labelEn}
                                </span>
                                <span className="font-mono text-emerald-500 font-bold">
                                  {comp.deathYearAH} AH
                                </span>
                              </div>

                              <div className="space-y-1">
                                <h3 className="text-xl font-bold font-serif text-[#D9A752] tracking-wide group-hover:text-white-light transition-colors">
                                  {comp.nameAr}
                                </h3>
                                <p className="text-xs text-white-90 font-serif font-bold tracking-tight">
                                  {comp.nameEn}
                                </p>
                              </div>

                              <p className="text-xs text-slate-350 line-clamp-3 leading-relaxed font-light">
                                {isArabic ? comp.shortBioAr : comp.shortBioEn}
                              </p>
                            </div>

                            <div className="border-t border-emerald-900/20 pt-3 flex justify-between items-center text-[11px] text-slate-400 relative z-10 font-mono">
                              <span>📚 {comp.hadithCount} narrations</span>
                              <span className="text-[#D9A752] font-bold">
                                {isArabic ? 'فتح السيرة' : 'View Seerah'} &rarr;
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </main>

      {/* Modern footer with Islamic and educational quotes */}
      <footer className={`mt-24 border-t py-12 ${isDarkMode ? 'bg-[#020D0A] border-emerald-950/40 text-slate-400' : 'bg-[#E8E4D9] border-emerald-800/10 text-stone-700'}`}>
        <p className="font-serif italic leading-relaxed max-w-2xl mx-auto mb-5 text-center px-6 text-sm text-[#D9A752]">
          {isArabic
            ? 'قال رسول الله ﷺ: «أَصْحَابِي كَالنُّجُومِ بِأَيِّهِمُ اقْتَدَيْتُمُ اهْتَدَيْتُمْ» - روايات الأثر الشريف هادية لطريق التوحيد والصفاء.'
            : '"My companions are like stars; whichever of them you follow, you will be rightly guided." — Prophetic tradition regarding the prestigious companions.'}
        </p>
        <div className={`pt-6 max-w-7xl mx-auto px-8 border-t flex flex-col sm:flex-row justify-between items-center text-[11px] font-mono gap-3 ${isDarkMode ? 'border-emerald-950/20 text-slate-500' : 'border-stone-400/25 text-stone-500'}`}>
          <span>{isArabic ? '© مستكشف الصحابة - موسوعة تعليمية تفاعلية' : '© Sahaba Explorer - Interactive Educational Platform'}</span>
          <span>{isArabic ? 'صُنع بدقة وإخلاص لدعاة المعرفة' : 'Crafted with absolute historical precision'}</span>
        </div>
      </footer>

    </div>
  );
}