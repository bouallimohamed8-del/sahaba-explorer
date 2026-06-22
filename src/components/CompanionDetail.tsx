/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Companion, Relationship, BattleInfo } from '../types';
import { DEFAULT_BATTLES } from '../data/defaultDataset';
import { BookOpen, Calendar, Award, Copy, Check, Users, ShieldAlert, ArrowRight, ArrowLeft, Landmark, History, Library, Compass, Save, Trash2, Edit3, Plus, FileText, Lock, Play, Tv, LayoutGrid, List, ExternalLink } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, doc, setDoc, deleteDoc, where } from 'firebase/firestore';

interface CompanionDetailProps {
  companion: Companion;
  relationships: Relationship[];
  allCompanions: Companion[];
  onSelectCompanion: (companion: Companion) => void;
  isArabic: boolean;
  isDarkMode?: boolean;
  onBack: () => void;
  user?: any;
  profile?: any;
}

export default function CompanionDetail({
  companion,
  relationships,
  allCompanions,
  onSelectCompanion,
  isArabic,
  isDarkMode = false,
  onBack,
  user,
  profile
}: CompanionDetailProps) {
  const [activeTab, setActiveTab] = useState<'seerah' | 'knowledge' | 'battles' | 'sources'>('seerah');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [videoViewMode, setVideoViewMode] = useState<'grid' | 'list'>('grid');
  const [playingVideo, setPlayingVideo] = useState<any | null>(null);

  // Personal study notes state for this specific companion
  const [localCompanionNotes, setLocalCompanionNotes] = useState<any[]>([]);
  const [loadingCompanionNotes, setLoadingCompanionNotes] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [noteTitleInput, setNoteTitleInput] = useState('');
  const [noteErrorMessage, setNoteErrorMessage] = useState('');

  // Dynamic YouTube Videos list for this Companion
  const [videos, setVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(false);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!companion) return;
      setLoadingVideos(true);
      try {
        const qRef = collection(db, 'videos');
        const qs = await getDocs(qRef);
        const list: any[] = [];
        qs.forEach(docSnap => {
          const data = docSnap.data();
          if (data.companionId === companion.id) {
            list.push({ id: docSnap.id, ...data });
          }
        });
        setVideos(list);
      } catch (err) {
        console.error("Error fetching companion videos in detail:", err);
      } finally {
        setLoadingVideos(false);
      }
    };
    fetchVideos();
  }, [companion.id]);

  // Fetch study notes belonging to this companion
  const fetchCompanionNotes = async () => {
    if (!user || !companion) return;
    setLoadingCompanionNotes(true);
    try {
      const q = query(
        collection(db, 'users', user.uid, 'notes'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.companionId === companion.id) {
          list.push({ id: docSnap.id, ...data });
        }
      });
      setLocalCompanionNotes(list);
    } catch (e) {
      console.error("Error loading companion-specific notes:", e);
    } finally {
      setLoadingCompanionNotes(false);
    }
  };

  useEffect(() => {
    if (user && companion) {
      fetchCompanionNotes();
    } else {
      setLocalCompanionNotes([]);
    }
  }, [user, companion.id]);

  // Save new note
  const handleAddCompanionNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newNoteContent.trim()) return;
    setNoteErrorMessage('');
    try {
      const notesColRef = collection(db, 'users', user.uid, 'notes');
      const noteId = doc(notesColRef).id;
      const newNote = {
        id: noteId,
        userId: user.uid,
        companionId: companion.id,
        companionNameAr: companion.nameAr,
        companionNameEn: companion.nameEn,
        title: noteTitleInput.trim() || '',
        content: newNoteContent.trim(),
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', user.uid, 'notes', noteId), newNote);
      setNewNoteContent('');
      setNoteTitleInput('');
      fetchCompanionNotes();
    } catch (err: any) {
      console.error(err);
      setNoteErrorMessage(isArabic ? 'حدث خطأ أثناء حفظ التدوينة.' : 'Failed to save study note.');
    }
  };

  // Delete note
  const handleDeleteCompanionNote = async (noteId: string) => {
    if (!user) return;
    if (!window.confirm(isArabic ? 'هل تريد بالتأكيد حذف هذه الفائدة؟' : 'Are you sure you want to delete this key summary?')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'notes', noteId));
      fetchCompanionNotes();
    } catch (err) {
      console.error(err);
    }
  };


  // Filter relationships for this companion
  const companionRelations = useMemo(() => {
    return relationships.filter(
      r => r.sourceId === companion.id || r.targetId === companion.id
    ).map(r => {
      const isSource = r.sourceId === companion.id;
      const associatedId = isSource ? r.targetId : r.sourceId;
      const peer = allCompanions.find(c => c.id === associatedId);
      return {
        ...r,
        peer,
        peerRelationText: isSource ? r.labelAr : r.labelAr, // can adjust direction naming
        peerRelationTextEn: isSource ? r.labelEn : r.labelEn
      };
    }).filter(r => r.peer !== undefined);
  }, [relationships, companion.id, allCompanions]);

  // Map battle IDs to detailed data
  const companionBattles = useMemo(() => {
    return companion.battles.map(bId => {
      return DEFAULT_BATTLES.find(b => b.id === bId);
    }).filter((b): b is BattleInfo => b !== undefined);
  }, [companion.battles]);

  // Construct a timeline of crucial events dynamically
  const chronologicalTimeline = useMemo(() => {
    const events = [];

    // Birth
    events.push({
      yearAH: companion.birthYearAH,
      yearCE: 622 + companion.birthYearAH, // approximation
      titleAr: 'المولد الشريف',
      titleEn: 'Birth',
      descAr: `ولد رضي الله عنه في ${companion.cityAr} قبيل الهجرة بدراية نسبية تقديرية.`,
      descEn: `Born in ${companion.cityEn} prior to the Hijri calendar.`
    });

    // Conversion
    events.push({
      yearAH: companion.birthYearAH + 10, // arbitrary or conversion period
      yearCE: 610, // approximate epoch of calling
      titleAr: 'اعتناق الإسلام والهداية',
      titleEn: 'Elected Islam',
      descAr: companion.conversionAr,
      descEn: companion.conversionEn
    });

    // Detailed battles timeline
    companionBattles.forEach(battle => {
      events.push({
        yearAH: battle.yearAH,
        yearCE: 622 + battle.yearAH,
        titleAr: `شهد ${battle.nameAr}`,
        titleEn: `Participated in ${battle.nameEn}`,
        descAr: `شهد مع رسول الله ﷺ معركة ${battle.nameAr} وساند حياض الدفاع عن الإسلام في بقعة ${battle.locationAr}.`,
        descEn: `Fought alongside the Prophet ﷺ at the decisive battle of ${battle.nameEn} around ${battle.locationEn}.`
      });
    });

    // Death
    events.push({
      yearAH: companion.deathYearAH,
      yearCE: 622 + companion.deathYearAH,
      titleAr: 'الوفاة والاستشهاد رضي الله عنه',
      titleEn: 'Demise / Martyrdom',
      descAr: `استأثر رضي الله عنه برحمة الله في عام ${companion.deathYearAH} هـ في بقعة ${companion.cityAr} عن عمر يناهز ${companion.ageAtDeath} عاماً.`,
      descEn: `Passed away in the year ${companion.deathYearAH} AH in ${companion.cityEn} at the age of ${companion.ageAtDeath} years old.`
    });

    // Sort chronologically
    return events.sort((a, b) => a.yearAH - b.yearAH);
  }, [companion, companionBattles]);

  const handleCopyHadith = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className={`border p-6 md:p-8 rounded-3xl shadow-xl relative transition duration-300 ${isDarkMode ? 'bg-natural-dark-panel border-neutral-800 text-slate-100' : 'bg-white border-natural-accent/30 text-natural-text'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Back button */}
      <button
        id="btn-back-to-explore"
        onClick={onBack}
        className={`absolute top-6 right-6 flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition-all active:scale-95 shadow ${isDarkMode ? 'bg-natural-dark-bg hover:bg-neutral-800 text-slate-300 border border-neutral-700' : 'bg-natural-brand hover:bg-natural-brand/90 text-white'}`}
      >
        {isArabic ? <span className="flex items-center gap-1.5">استكشاف المخطط <ArrowLeft className="w-3.5 h-3.5" /></span> : <span className="flex items-center gap-1.5"><ArrowLeft className="w-3.5 h-3.5" /> Back to Graph</span>}
      </button>

      {/* Hero Header Section */}
      <div className={`flex flex-col md:flex-row gap-6 border-b pb-6 mb-6 ${isDarkMode ? 'border-neutral-803' : 'border-natural-accent/15'}`}>
        {/* Calligraphic Avatar */}
        <div className={`w-24 h-24 rounded-2xl border flex items-center justify-center text-5xl font-bold font-serif flex-shrink-0 mx-auto md:mx-0 shadow-sm ${isDarkMode ? 'bg-[#1E1F1A]/85 border-neutral-700 text-natural-accent shadow-inner' : 'bg-[#FAF9F5] border-natural-accent/35 text-natural-brand shadow'}`}>
          {companion.nameAr.charAt(0)}
        </div>

        <div className="text-center md:text-start flex-1">
          {/* Identity Name */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-1.5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-natural-brand tracking-tight font-serif" lang="ar" dir="rtl">{companion.nameAr}</h1>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold ${isDarkMode ? 'bg-natural-dark-bg border border-neutral-700 text-slate-400' : 'bg-[#FBECE6] border border-natural-accent/30 text-natural-brand'}`}>
              {companion.ageAtDeath} {isArabic ? 'سنة هجرية' : 'years old'}
            </span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-sans font-bold ${companion.confidenceLevel === 'High' ? (isDarkMode ? 'bg-green-500/15 text-green-400 border border-green-500/30' : 'bg-emerald-50 text-emerald-800 border border-emerald-250') : (isDarkMode ? 'bg-yellow-500/15 text-yellow-500 border border-yellow-500/30' : 'bg-amber-50 text-amber-805 border-natural-accent/30')}`}>
              ★ {isArabic ? `دقة: ${companion.confidenceLevel}` : `Confidence: ${companion.confidenceLevel}`}
            </span>
          </div>

          <p className={`text-xs font-mono mb-2 ${isDarkMode ? 'text-slate-400' : 'text-natural-accent/90'}`}>{isArabic ? companion.lineageAr : companion.lineageEn}</p>

          {/* Titles & Achievements */}
          <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mb-3.5">
            {(isArabic ? companion.titlesAr : companion.titlesEn).map((title, i) => (
              <span key={i} className={`text-[10.5px] font-serif border px-2.5 py-0.5 rounded-full ${isDarkMode ? 'bg-natural-dark-bg text-natural-accent border-neutral-702' : 'bg-natural-brand/5 text-natural-brand border-natural-brand/15'}`}>
                {title}
              </span>
            ))}
          </div>

          {/* Quick info row */}
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl border max-w-2xl text-xs font-sans ${isDarkMode ? 'bg-[#1E1F1A] border-neutral-800/80' : 'bg-[#FAF9F5] border-natural-accent/25'}`}>
            <div>
              <span className={`block font-serif text-[10.5px] pb-0.5 font-bold ${isDarkMode ? 'text-slate-500' : 'text-natural-brand/75'}`}>{isArabic ? 'الكنية' : 'Kunya'}</span>
              <span className={`font-semibold ${isDarkMode ? 'text-slate-205' : 'text-natural-brand font-bold'}`}>{isArabic ? companion.kunyaAr : companion.kunyaEn}</span>
            </div>
            <div>
              <span className={`block font-serif text-[10.5px] pb-0.5 font-bold ${isDarkMode ? 'text-slate-500' : 'text-natural-brand/75'}`}>{isArabic ? 'القبيلة وبنو' : 'Tribe'}</span>
              <span className={`font-semibold ${isDarkMode ? 'text-slate-205' : 'text-natural-brand font-bold'}`}>{isArabic ? companion.tribeAr : companion.tribeEn}</span>
            </div>
            <div>
              <span className={`block font-serif text-[10.5px] pb-0.5 font-bold ${isDarkMode ? 'text-slate-500' : 'text-natural-brand/75'}`}>{isArabic ? 'البلد والمنشأ' : 'City origin'}</span>
              <span className={`font-semibold ${isDarkMode ? 'text-slate-205' : 'text-natural-brand font-bold'}`}>{isArabic ? companion.cityAr : companion.cityEn}</span>
            </div>
            <div>
              <span className={`block font-serif text-[10.5px] pb-0.5 font-bold ${isDarkMode ? 'text-slate-500' : 'text-natural-brand/75'}`}>{isArabic ? 'روايات الحديث' : 'Hadith narrations'}</span>
              <span className="font-extrabold text-natural-accent font-mono">{companion.hadithCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs list navigation */}
      <div className={`flex mb-6 overflow-x-auto gap-4 scrollbar-none border-b ${isDarkMode ? 'border-neutral-800' : 'border-natural-accent/20'}`}>
        <button
          onClick={() => setActiveTab('seerah')}
          className={`pb-3 text-sm font-medium transition-all relative flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'seerah' ? (isDarkMode ? 'text-natural-accent border-b-2 border-natural-accent' : 'text-natural-brand border-b-2 border-natural-brand font-bold') : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-natural-brand/77 hover:text-natural-brand')}`}
        >
          <History className="w-4 h-4" />
          <span>{isArabic ? 'السيرة العطرة والنبي' : 'Seerah & Timeline'}</span>
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`pb-3 text-sm font-medium transition-all relative flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'knowledge' ? (isDarkMode ? 'text-natural-accent border-b-2 border-natural-accent' : 'text-natural-brand border-b-2 border-natural-brand font-bold') : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-natural-brand/77 hover:text-natural-brand')}`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{isArabic ? 'العلم والمرويات والآثار' : 'Knowledge & Narrations'}</span>
        </button>
        <button
          onClick={() => setActiveTab('battles')}
          className={`pb-3 text-sm font-medium transition-all relative flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'battles' ? (isDarkMode ? 'text-natural-accent border-b-2 border-natural-accent' : 'text-natural-brand border-b-2 border-natural-brand font-bold') : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-natural-brand/77 hover:text-natural-brand')}`}
        >
          <Award className="w-4 h-4" />
          <span>{isArabic ? 'المشاهد والغزوات والجهاد' : 'Battles & Expeditions'}</span>
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`pb-3 text-sm font-medium transition-all relative flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'sources' ? (isDarkMode ? 'text-natural-accent border-b-2 border-natural-accent' : 'text-natural-brand border-b-2 border-natural-brand font-bold') : (isDarkMode ? 'text-slate-400 hover:text-slate-205' : 'text-natural-brand/77 hover:text-natural-brand')}`}
        >
          <Library className="w-4 h-4" />
          <span>{isArabic ? 'المصادر والخرائط التاريخية' : 'Sources & Libraries'}</span>
        </button>
      </div>

      {/* TAB CONTENT: SEERAH BIOGRAPHY & LINEAL TIMELINE */}
      {activeTab === 'seerah' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-neutral-800">
          {/* Main Biography Column */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2 font-serif text-natural-brand">
                <Landmark className="w-4.5 h-4.5 text-natural-accent" />
                <span>{isArabic ? 'بيان سيرة الصحابي رضي الله عنه' : 'Complete Seerah Narrative'}</span>
              </h2>
              <div className={`p-5 rounded-3xl border text-sm leading-relaxed whitespace-pre-line font-serif ${isDarkMode ? 'bg-[#1E1F1A]/70 border-neutral-800 text-slate-300' : 'bg-[#FAF9F5] border-natural-accent/20 text-natural-text font-serif shadow-sm'}`}>
                {isArabic ? companion.longBioAr : companion.longBioEn}
              </div>
            </div>

            {/* Achievements bullets */}
            <div>
              <h3 className="text-sm font-bold text-natural-brand mb-2.5 font-serif">{isArabic ? 'أبرز الإسهامات والإنجازات في الإسلام' : 'Key Achievements & Legacies'}</h3>
              <ul className="space-y-2 text-xs">
                {(isArabic ? companion.achievementsAr : companion.achievementsEn).map((ach, idx) => (
                  <li key={idx} className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-natural-dark-bg/60 border-neutral-750 text-slate-300' : 'bg-white border-natural-accent/20 text-natural-text font-serif'}`}>
                    <span className="text-natural-accent flex-shrink-0 text-sm font-bold">•</span>
                    <span>{ach}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Timeline and Relationships Subnetwork column */}
          <div className="space-y-6">
            {/* Interactive chronological timeline */}
            <div className={`border rounded-2xl p-4 shadow-sm ${isDarkMode ? 'bg-natural-dark-bg/65 border-neutral-850' : 'bg-[#FAF9F5] border-natural-accent/25'}`}>
              <h3 className={`text-xs font-bold mb-3 border-b pb-2 font-serif ${isDarkMode ? 'text-slate-200 border-neutral-800Pin' : 'text-natural-brand border-natural-accent/20'}`}>{isArabic ? 'الخط الزمني التاريخي' : 'Chronological Timeline'}</h3>
              <div className={`space-y-4 relative border-l ml-2.5 pl-3.5 ${isDarkMode ? 'border-neutral-800' : 'border-natural-accent/15'}`}>
                {chronologicalTimeline.map((ev, idx) => (
                  <div key={idx} className="relative group">
                    {/* Ring indicator anchor */}
                    <span className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full bg-natural-accent border border-white group-hover:scale-125 transition-transform" />
                    <span className="text-[10px] font-bold text-natural-accent block font-mono">{ev.yearAH} هـ • {ev.yearCE} م</span>
                    <h4 className="text-xs font-bold text-natural-brand mt-0.5 font-serif">{isArabic ? ev.titleAr : ev.titleEn}</h4>
                    <p className={`text-[10.5px] mt-1 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-neutral-600 font-serif'}`}>{isArabic ? ev.descAr : ev.descEn}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Relationships subnetwork navigatable list */}
            <div className={`border rounded-2xl p-4 shadow-sm ${isDarkMode ? 'bg-natural-dark-bg/65 border-neutral-850' : 'bg-[#FAF9F5] border-natural-accent/25'}`}>
              <h3 className={`text-xs font-bold mb-3 border-b pb-2 flex items-center justify-between font-serif ${isDarkMode ? 'text-slate-200 border-neutral-800' : 'text-natural-brand border-natural-accent/20'}`}>
                <span>{isArabic ? 'شبكة العلاقات المتصلة' : 'Connected Network Links'}</span>
                <Users className="w-4 h-4 text-natural-accent/75" />
              </h3>
              <p className={`text-[10.5px] mb-3 leading-relaxed ${isDarkMode ? 'text-slate-450' : 'text-neutral-600'}`}>
                {isArabic ? 'انقر على رفيق الدرب من الصحابة للانتقال والبحث عن سيرته:' : 'Click on a companion link to explore their biography:'}
              </p>
              {companionRelations.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic text-center py-2">{isArabic ? 'لا توجد روابط مسجلة حالياً' : 'No recorded relations mapped yet.'}</p>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {companionRelations.map(rel => (
                    <div
                      key={rel.id}
                      onClick={() => rel.peer && onSelectCompanion(rel.peer)}
                      className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all active:scale-97 ${isDarkMode ? 'border-neutral-750 bg-natural-dark-panel hover:bg-[#323326] text-slate-200' : 'bg-white border-natural-accent/20 hover:bg-natural-accent/5 hover:border-natural-accent/40 text-natural-text font-serif shadow-sm'}`}
                    >
                      <div className="w-6 h-6 rounded-lg bg-natural-brand/10 text-natural-brand flex items-center justify-center text-xs font-bold font-serif border border-natural-brand/15">
                        {rel.peer?.nameAr.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-bold truncate" lang="ar" dir="rtl">{rel.peer?.nameAr}</h4>
                        <span className={`text-[9.5px] block ${isDarkMode ? 'text-slate-405' : 'text-natural-accent/80 font-sans'}`}>{isArabic ? rel.peerRelationText : rel.peerRelationTextEn}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: KNOWLEDGE, NARRATED HADITHS AND ACADEMICS */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Box: Teachers / Students Lists */}
            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#1E1F1A] border-neutral-800' : 'bg-[#FAF9F5] border-natural-accent/20 shadow-sm'}`}>
              <h3 className={`text-xs font-bold mb-3 border-b pb-1.5 font-serif ${isDarkMode ? 'text-slate-200 border-neutral-800' : 'text-natural-brand border-natural-accent/25'}`}>{isArabic ? 'أساتذة الصحابي والمرجعية' : 'Teachers & Academic Mentors'}</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {companion.teachers.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">{isArabic ? 'غير مسجل' : 'Not recorded'}</span>
                ) : (
                  companion.teachers.map((t, idx) => (
                    <span key={idx} className={`text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 border ${isDarkMode ? 'bg-natural-dark-panel border-neutral-750 text-slate-200' : 'bg-white border-natural-accent/25 text-natural-text font-serif'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-natural-accent" />
                      {t}
                    </span>
                  ))
                )}
              </div>

              <h3 className={`text-xs font-bold mb-3 border-b pb-1.5 font-serif ${isDarkMode ? 'text-slate-200 border-neutral-800' : 'text-natural-brand border-natural-accent/25'}`}>{isArabic ? 'أبرز الآخذين من تلامذة وعلماء' : 'Famous Students / Narrators'}</h3>
              <div className="flex flex-wrap gap-2">
                {companion.students.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">{isArabic ? 'غير مسجل' : 'Not recorded'}</span>
                ) : (
                  companion.students.map((s, idx) => (
                    <span key={idx} className={`text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 border ${isDarkMode ? 'bg-natural-dark-panel border-neutral-750 text-slate-200' : 'bg-white border-natural-accent/25 text-natural-text font-serif'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-natural-brand/50" />
                      {s}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Right Box: Statistical Significance summary */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-[#1E1F1A] border-neutral-800' : 'bg-[#FAF9F5] border-natural-accent/20 shadow-sm'}`}>
              <div>
                <h3 className="text-sm font-bold text-natural-accent mb-2 font-serif">{isArabic ? 'الأثر والمكانة العلمية في الإسلام' : 'Significance in Islamic Jurisprudence'}</h3>
                <p className={`text-xs leading-relaxed mb-4 ${isDarkMode ? 'text-slate-300' : 'text-natural-text/90 font-serif'}`}>
                  {isArabic ? companion.historicalSignificanceAr : companion.historicalSignificanceEn}
                </p>
              </div>

              <div className={`p-4 rounded-xl text-[11px] border ${isDarkMode ? 'bg-natural-dark-panel/40 border-neutral-750 text-slate-300' : 'bg-natural-brand/5 border-natural-brand/10 text-natural-brand font-serif'}`}>
                <span className="font-bold text-natural-accent block mb-1">💡 {isArabic ? 'إحصاء مرويات مسند الصحابي' : 'Hadith Statistics'}</span>
                <span>
                  {isArabic
                    ? `روى الصحابي كمسند في الأثر والكتب التسعة ما يقارب ${companion.hadithCount} حديثاً نبوياً مسنداً، يتقاسم الإمامان البخاري ومسلم شطراً طيباً منها في صحيحيهما.`
                    : `This companion narrated approximately ${companion.hadithCount} recorded prophetic traditions across the core books of Hadith (Sihah al-Sittah).`}
                </span>
              </div>
            </div>
          </div>

          {/* Famous Narrations list */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-1.5 font-serif text-natural-brand">
              <span>✍️ {isArabic ? 'من مشاهير ودرر مرويات الصحابي الأثيرة' : 'Most Famous Traditions Narrated'}</span>
            </h3>
            {companion.famousHadiths.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-slate-950/20 p-4 rounded-xl text-center">{isArabic ? 'لا توجد مرويات مسجلة' : 'No classic narrations recorded'}</p>
            ) : (
              <div className="space-y-4">
                {companion.famousHadiths.map((hd, index) => (
                  <div key={index} className={`border p-5 rounded-2xl relative group transition duration-200 ${isDarkMode ? 'bg-[#1E1F1A]/60 border-neutral-800' : 'bg-white border-natural-accent/25 shadow-sm'}`}>
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <span className={`text-[10px] font-mono font-bold border px-2.5 py-0.5 rounded-full ${isDarkMode ? 'bg-natural-dark-panel text-natural-accent border-neutral-700' : 'bg-natural-accent/15 text-natural-brand border-natural-accent/30 font-bold'}`}>
                        {hd.reference}
                      </span>
                      <button
                        onClick={() => handleCopyHadith(hd.quoteAr, index)}
                        className={`p-1.5 rounded transition cursor-pointer ${isDarkMode ? 'text-slate-500 hover:text-slate-300 hover:bg-neutral-800' : 'text-slate-400 hover:text-natural-accent hover:bg-slate-100'}`}
                        title={isArabic ? 'نسخ النص الكلي' : 'Copy Hadith text'}
                      >
                        {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <p className="text-base font-bold text-natural-brand leading-relaxed mb-3 text-right font-serif diacritics">
                      « {hd.quoteAr} »
                    </p>
                    <p className={`text-xs italic pl-3 border-l-2 ${isDarkMode ? 'text-slate-400 border-neutral-750 font-sans' : 'text-neutral-700 border-natural-brand/50 font-serif'}`}>
                      " {hd.quoteEn} "
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: BATTLES PARTICIPATION CHRONICLES */}
      {activeTab === 'battles' && (
        <div className="space-y-6 flex flex-col">
          <div className={`border p-4 rounded-2xl flex items-start gap-3.5 ${isDarkMode ? 'bg-[#1E1F1A] border-neutral-800/80' : 'bg-[#FAF9F5] border-natural-accent/20'}`}>
            <span className="text-xl">🛡️</span>
            <div>
              <h3 className="text-xs font-bold text-natural-accent font-serif mb-1">{isArabic ? 'بيان رصيد الغزوات ومساندة حياض الدعوة' : 'Military Expedition Chronicles'}</h3>
              <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-neutral-600 font-serif'}`}>
                {isArabic
                  ? 'شارك السادة الصحابة رضي الله عنهم في رد كيد المعتدين وإعلاء كلمة التوحيد، ونميز من سجلات المعارك الحصينة السير الشريفة الكبرى التي وجه فيها رسول الله ﷺ راية الإسلام.'
                  : 'The companions served as the primary defenders of the state, engaging side-by-side with the Prophet ﷺ across crucial confrontations to ensure the preservation of Islam.'}
              </p>
            </div>
          </div>

          {companionBattles.length === 0 ? (
            <div className={`text-center py-12 rounded-2xl border ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800/70 text-slate-500' : 'bg-[#FAF9F5]/40 border-natural-accent/15 text-neutral-500'}`}>
              <ShieldAlert className="w-8 h-8 text-natural-accent/60 mx-auto mb-2" />
              <p className="text-xs font-serif leading-relaxed text-natural-brand/80">{isArabic ? 'لم تسجل مشاركات في المعارك الحربية الكبرى لهذا الصحابي.' : 'No major military campaigns recorded for this companion.'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {companionBattles.map(battle => (
                <div key={battle.id} className={`border p-5 rounded-2xl ${isDarkMode ? 'bg-[#1E1F1A] border-neutral-800' : 'bg-white border-natural-accent/25 shadow-sm'}`}>
                  <div className={`flex flex-wrap items-center justify-between border-b pb-2.5 mb-3 gap-2 ${isDarkMode ? 'border-neutral-805' : 'border-natural-accent/15'}`}>
                    <h3 className="text-sm font-bold text-natural-brand flex items-center gap-1.5 font-serif">
                      <span>⚔️</span>
                      <span>{isArabic ? battle.nameAr : battle.nameEn}</span>
                    </h3>
                    <div className="flex gap-2">
                      <span className={`text-[9.5px] border px-2.5 py-0.5 rounded-full font-mono font-bold ${isDarkMode ? 'bg-natural-dark-panel border-neutral-700 text-natural-accent' : 'bg-natural-accent/15 border-natural-accent/30 text-natural-brand'}`}>
                        {battle.yearAH} {isArabic ? 'هـ' : 'AH'}
                      </span>
                      <span className={`text-[9.5px] border px-2.5 py-0.5 rounded-full ${isDarkMode ? 'bg-natural-dark-panel border-neutral-700 text-slate-400' : 'bg-neutral-50 border-natural-accent/20 text-neutral-600 font-serif'}`}>
                        📍 {isArabic ? battle.locationAr : battle.locationEn}
                      </span>
                    </div>
                  </div>

                  <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-neutral-700 font-serif'}`}>
                    {isArabic ? battle.summaryAr : battle.summaryEn}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SOURCES, LIBRARIES AND MAP DETAILS */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-neutral-805">
            {/* Classical Reference Sources */}
            <div className="space-y-4">
              <h3 className={`text-sm font-bold border-b pb-2 flex items-center gap-1.5 font-serif ${isDarkMode ? 'text-slate-200 border-neutral-800' : 'text-natural-brand border-natural-accent/20'}`}>
                <Library className="w-4.5 h-4.5 text-natural-accent" />
                <span>{isArabic ? 'توثيق المصادر التراثية المسندة' : 'Classical Reference Documents'}</span>
              </h3>
              <p className={`text-[10.5px] leading-relaxed mb-3 ${isDarkMode ? 'text-slate-400' : 'text-neutral-600 font-serif'}`}>
                {isArabic
                  ? 'اعتُمدت هذه البيانات بفضل جهود الحفاظ والمؤرخين الأوائل الذين وثّقوا تراجم الصحابة والأسانيد النبوية الشريفة:'
                  : 'This encyclopedia aggregates records certified using historical consensus across senior classical documents of Islamic bibliography:'}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {companion.sources.map((s, idx) => (
                  <div key={idx} className={`rounded-xl px-3 py-2.5 border flex items-center gap-1.5 ${isDarkMode ? 'bg-natural-dark-bg/60 border-neutral-750 text-slate-350' : 'bg-[#FAF9F5] border-natural-accent/20 text-natural-text font-serif'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-natural-accent" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic & Modern Studies */}
            <div className="space-y-4">
              <h3 className={`text-sm font-bold border-b pb-2 flex items-center gap-1.5 font-serif ${isDarkMode ? 'text-slate-200 border-neutral-800' : 'text-natural-brand border-natural-accent/25'}`}>
                <BookOpen className="w-4.5 h-4.5 text-natural-accent" />
                <span>{isArabic ? 'مؤلفات ودراسات أكاديمية مضافة' : 'Academic & Modern Studies'}</span>
              </h3>
              <ul className="space-y-2 text-xs pr-1">
                {companion.library.map((l, idx) => (
                  <li key={idx} className={`flex gap-2 px-3 py-2 rounded-xl border ${isDarkMode ? 'bg-natural-dark-bg/40 border-neutral-750 text-slate-330' : 'bg-white border-natural-accent/15 text-neutral-700 font-serif'}`}>
                    <span className="text-slate-500">📖</span>
                    <span className="italic">{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-neutral-800 text-slate-400' : 'border-neutral-200 text-neutral-500 font-serif'} text-[10.5px] italic text-center`}>
            {isArabic
              ? `الموقع الجغرافي للاستقرار والوفاة: رُصد رضي الله عنه في ${companion.cityAr}`
              : `Verified place of final rest/death: ${companion.cityEn}`}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 3B. GLOBAL DEDICATED VIDEOS & LECTURES SECTION */}
      {/* ========================================== */}
      <div className={`mt-8 pt-6 border-t-2 ${isDarkMode ? 'border-neutral-800' : 'border-natural-accent/15'}`} id="companion-videos-lectures-section">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 font-serif text-natural-brand">
              <Tv className="w-5 h-5 text-natural-accent animate-pulse" />
              <span>{isArabic ? 'الفيديوهات والمحاضرات' : 'Videos & Lectures'}</span>
              <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-[#D9A752]/10 border border-[#D9A752]/20 text-[#D9A752]">
                {videos.length}
              </span>
            </h3>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-neutral-505 font-serif'}`}>
              {isArabic 
                ? 'مجموعة من الشروحات والمقاطع الوثائقية المعتمدة المستردة تلقائياً من قواعد البيانات.' 
                : 'Curated documentaries, audio-visual biographies, and lectures automatically synchronized from verified data streams.'}
            </p>
          </div>

          {/* View Toggles & Controls if videos exist */}
          {videos.length > 0 && (
            <div className={`flex items-center gap-1 p-1 rounded-lg border ${isDarkMode ? 'bg-[#1a1b15] border-neutral-850' : 'bg-stone-50 border-stone-200'}`}>
              <button
                onClick={() => setVideoViewMode('grid')}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  videoViewMode === 'grid' 
                    ? 'bg-[#D9A752] text-slate-950 font-bold' 
                    : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-550 hover:text-slate-900'
                }`}
                title={isArabic ? 'عرض شبكي' : 'Grid View'}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setVideoViewMode('list')}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  videoViewMode === 'list' 
                    ? 'bg-[#D9A752] text-slate-950 font-bold' 
                    : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-550 hover:text-slate-900'
                }`}
                title={isArabic ? 'عرض قائمة' : 'List View'}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {loadingVideos ? (
          <div className="flex items-center justify-center p-12 text-xs font-mono text-slate-450 gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-natural-accent border-t-transparent" />
            <span>{isArabic ? 'جاري استيراد المقاطع الصوتية المرئية...' : 'Loading media archives...'}</span>
          </div>
        ) : videos.length === 0 ? (
          <div className={`p-8 border border-dashed rounded-2xl text-center shadow-inner ${
            isDarkMode ? 'bg-[#131410]/50 border-neutral-800 text-slate-500' : 'bg-stone-50 border-stone-250 text-neutral-500 font-serif'
          }`}>
            <Play className="w-8 h-8 mx-auto mb-3 text-natural-accent/30 animate-pulse" />
            <p className="text-sm font-bold tracking-tight mb-1">
              {isArabic ? 'لا توجد فيديوهات متاحة حاليّاً' : 'No videos available at the moment.'}
            </p>
            <p className="text-xs text-slate-450 leading-relaxed max-w-sm mx-auto">
              {isArabic 
                ? 'سيتم عرض المواد المرئية والمحاضرات تلقائياً بمجرد إضافتها وتصنيفها من قبل المشرف العام في لوحة التحكم.' 
                : 'Educational YouTube references will appear dynamically as they are authorized by the Super Admin.'}
            </p>
          </div>
        ) : (
          /* Render layout based on viewMode grid vs list */
          <div className={
            videoViewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
          }>
            {[...videos]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((vid: any) => {
                let ytId = '';
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                const match = vid.youtubeUrl.match(regExp);
                if (match && match[2].length === 11) {
                  ytId = match[2];
                } else {
                  ytId = vid.youtubeUrl;
                }
                const thumbnailUrl = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;

                if (videoViewMode === 'grid') {
                  return (
                    <div 
                      key={vid.id}
                      className={`group border rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-lg ${
                        isDarkMode 
                          ? 'bg-[#181914] border-neutral-800/80 hover:border-amber-500/30' 
                          : 'bg-white border-stone-200/90 shadow-sm hover:border-amber-500/25'
                      }`}
                    >
                      {/* Thumbnail wrapper with play icon and duration */}
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-900 group-pointer">
                        {thumbnailUrl ? (
                          <img 
                            src={thumbnailUrl} 
                            alt={vid.titleAr} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#0d0e0a]">
                            <Tv className="w-8 h-8 text-slate-700 font-light" />
                          </div>
                        )}
                        
                        {/* Elegant Dark/Gold Glass Overlay */}
                        <div className="absolute inset-0 bg-neutral-950/20 group-hover:bg-neutral-950/40 transition-colors duration-300 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-amber-500/90 border border-amber-300/30 text-slate-950 group-hover:scale-110 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-black/40">
                            <Play className="w-5 h-5 fill-slate-950 text-slate-950 ml-0.5" />
                          </div>
                        </div>

                        {/* Top corner YouTube identity */}
                        <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-red-650 border border-red-500 text-white font-mono text-[8.5px] font-black tracking-wider flex items-center gap-1 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          YOUTUBE
                        </div>

                        {/* Duration badge if available */}
                        {vid.duration && (
                          <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/75 text-white font-mono text-[9px] font-bold">
                            {vid.duration}
                          </span>
                        )}
                      </div>

                      {/* Video Texts */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5 mb-4">
                          <h4 className="text-[13px] font-bold tracking-tight text-slate-150 font-serif leading-snug group-hover:text-[#D9A752] transition-colors duration-300">
                            {isArabic ? vid.titleAr : (vid.titleFr || vid.titleAr)}
                          </h4>
                          {vid.channelName && (
                            <div className="text-[10px] text-[#D9A752] font-semibold flex items-center gap-1 font-sans">
                              <span>🎥</span>
                              <span>{vid.channelName}</span>
                            </div>
                          )}
                        </div>

                        {/* Watch button and action stats */}
                        <div className="flex items-center justify-between border-t border-neutral-800/60 pt-3 text-[10px] text-slate-400 font-mono">
                          <span>{new Date(vid.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</span>
                          
                          <button
                            onClick={() => setPlayingVideo(vid)}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-455 text-slate-950 text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>{isArabic ? 'مشاهدة' : 'Watch'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  /* List View layout */
                  return (
                    <div 
                      key={vid.id}
                      className={`p-4 border rounded-xl flex flex-col sm:flex-row items-center gap-4 transition-all duration-300 hover:shadow-md ${
                        isDarkMode 
                          ? 'bg-[#181914] border-neutral-800 hover:border-amber-500/20' 
                          : 'bg-white border-stone-250 hover:border-amber-500/15'
                      }`}
                    >
                      {/* Left Side Thumbnail */}
                      <div className="relative aspect-video w-full sm:w-40 shrink-0 rounded-lg overflow-hidden bg-slate-900 group-pointer">
                        {thumbnailUrl ? (
                          <img 
                            src={thumbnailUrl} 
                            alt={vid.titleAr} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#0d0e0a]">
                            <Tv className="w-6 h-6 text-slate-700" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-neutral-950/20 hover:bg-neutral-950/30 flex items-center justify-center">
                          <div className="w-9 h-9 rounded-full bg-amber-500 border border-amber-300/20 text-slate-950 flex items-center justify-center shadow">
                            <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950 ml-0.5" />
                          </div>
                        </div>

                        {/* Duration badge is absolutely set */}
                        {vid.duration && (
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-white font-mono text-[8px] font-bold">
                            {vid.duration}
                          </span>
                        )}
                      </div>

                      {/* Right side textual notes */}
                      <div className="flex-1 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-100 font-serif">
                            {isArabic ? vid.titleAr : (vid.titleFr || vid.titleAr)}
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-mono">
                            {vid.channelName && (
                              <span className="text-[#D9A752] font-semibold">{vid.channelName}</span>
                            )}
                            <span className="text-slate-700">&bull;</span>
                            <span>{new Date(vid.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setPlayingVideo(vid)}
                          className="px-3.5 py-2 rounded-lg bg-[#D9A752]/10 border border-[#D9A752]/30 text-[#D9A752] hover:bg-[#D9A752] hover:text-slate-950 text-[10px] font-bold font-serif transition-colors cursor-pointer self-start sm:self-center flex items-center gap-1"
                        >
                          <span>{isArabic ? 'مشاهدة التسجيل' : 'Watch Lecture'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                }
              })}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* 3C. THEATER LIGHTBOX PLAYER MODAL OVERLAY */}
      {/* ========================================== */}
      {playingVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
          <div className="bg-[#031410] border-2 border-[#D9A752]/45 rounded-3xl overflow-hidden w-full max-w-4xl shadow-2xl relative">
            
            {/* Header Identity banner */}
            <div className="p-4 border-b border-neutral-850 flex justify-between items-center bg-[#020d0ad9]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-650 animate-pulse" />
                <h4 className="text-xs md:text-sm font-bold text-slate-200 font-serif leading-none">
                  {playingVideo.channelName ? `${playingVideo.channelName}: ` : ''} 
                  {isArabic ? playingVideo.titleAr : (playingVideo.titleFr || playingVideo.titleAr)}
                </h4>
              </div>
              <button
                onClick={() => setPlayingVideo(null)}
                className="p-1 px-3 rounded-full bg-red-650/10 hover:bg-red-600 border border-red-500/20 hover:border-red-500 text-red-500 hover:text-white font-bold text-xs font-mono transition-all cursor-pointer"
              >
                {isArabic ? 'إغلاق' : 'Close ✕'}
              </button>
            </div>

            {/* Video Canvas aspect player */}
            <div className="relative aspect-video bg-black w-full">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${
                  playingVideo.youtubeUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2] || playingVideo.youtubeUrl
                }?autoplay=1`}
                title={playingVideo.titleAr}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Bottom meta */}
            <div className="p-4 bg-[#0d0f0c] text-[11px] text-slate-400 font-mono flex flex-col sm:flex-row justify-between gap-3">
              <div className="flex items-center gap-2">
                <span>🔗 URL: </span>
                <a 
                  href={playingVideo.youtubeUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:underline text-amber-500 truncate max-w-xs md:max-w-md"
                >
                  {playingVideo.youtubeUrl}
                </a>
              </div>
              <div className="flex gap-4">
                {playingVideo.duration && (
                  <span>⏱ {playingVideo.duration}</span>
                )}
                <span>📅 {new Date(playingVideo.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. PRIVATE STUDY REFLECTIONS & NOTES FOR THIS COMPANION BLOCK */}
      <div className={`mt-8 pt-6 border-t-2 ${isDarkMode ? 'border-neutral-800' : 'border-natural-accent/15'}`} id="companion-private-notes-container">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2 font-serif text-natural-brand">
          <FileText className="w-4.5 h-4.5 text-natural-accent" />
          <span>{isArabic ? 'خاطرة وفائدة مضافة حول هذا الصحابي الجليل' : 'My Companion Reflections & Notes'}</span>
        </h3>

        {!user ? (
          <div className={`p-4 rounded-2xl border border-dashed flex items-center gap-3 ${
            isDarkMode ? 'bg-[#181914] border-neutral-800 text-slate-400' : 'bg-[#FAF8F5] border-natural-accent/20 text-stone-604'
          }`}>
            <Lock className="w-5 h-5 text-natural-accent" />
            <p className="text-[11px] font-serif">
              {isArabic
                ? 'سجِّل الدخول أو أنشئ حساباً مجانياً لتتمكن من كتابة وحفظ فوائدك البحثية وخواطرك حول السيرة العطرة في حسابك.'
                : 'Sign in or register a free account to compose and secure personal study reflections for this companion.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Form to add note */}
            <form onSubmit={handleAddCompanionNote} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={noteTitleInput}
                  onChange={(e) => setNoteTitleInput(e.target.value)}
                  placeholder={isArabic ? 'عنوان الملاحظة الفرعي (مثال: شجاعته يوم اليرموك)...' : 'Sub-heading (e.g. Heroism at Yarmouk)...'}
                  className={`sm:col-span-1 border rounded-xl p-2.5 focus:outline-none text-xs transition ${
                    isDarkMode ? 'bg-natural-dark-bg border-neutral-750 text-slate-100' : 'bg-white border-[#CFC5AD]/40 text-[#443825] focus:border-natural-brand'
                  }`}
                />
                <div className="sm:col-span-2 flex gap-2">
                  <input
                    type="text"
                    value={newNoteContent}
                    required
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder={isArabic ? 'اكتب تدوينتك أو دروسك العبرية هنا ليتم تخزينها بأمان...' : 'Jot down personal research study reflections to store safely...'}
                    className={`flex-1 border rounded-xl p-2.5 focus:outline-none text-xs transition ${
                      isDarkMode ? 'bg-natural-dark-bg border-neutral-750 text-slate-100' : 'bg-white border-[#CFC5AD]/40 text-[#443825] focus:border-natural-brand'
                    }`}
                  />
                  <button
                    type="submit"
                    className="bg-natural-brand hover:bg-natural-brand/90 text-white font-bold p-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition shadow"
                  >
                    <Plus className="w-3.5 h-3.5 animate-spin-slow" />
                    <span>{isArabic ? 'إضافة' : 'Add'}</span>
                  </button>
                </div>
              </div>
              {noteErrorMessage && (
                <p className="text-[10px] text-red-500 italic">{noteErrorMessage}</p>
              )}
            </form>

            {/* List notes added */}
            {loadingCompanionNotes ? (
              <p className="text-[10px] text-stone-500 italic">{isArabic ? 'جاري تحميل التدوينات المضافة...' : 'Syncing notes database...'}</p>
            ) : localCompanionNotes.length === 0 ? (
              <p className={`text-[10.5px] italic ${isDarkMode ? 'text-slate-500' : 'text-stone-450'} font-serif`}>
                {isArabic ? 'لا توجد ملاحظات مسجلة حول هذا الصحابي من حسابك حتى الآن.' : 'No notes written for this companion in your notebook.'}
              </p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {localCompanionNotes.map((nt) => (
                  <div
                    key={nt.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 transition ${
                      isDarkMode ? 'bg-[#181914] border-neutral-800 text-slate-205' : 'bg-[#FAFBF9] border-[#CFC5AD]/25 text-natural-text font-serif'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-extrabold text-natural-brand">
                          {nt.title || (isArabic ? 'ملاحظة بحثية' : 'Reflections')}
                        </span>
                        <span className="text-[9px] text-stone-500 font-mono">
                          {new Date(nt.createdAt).toLocaleDateString(isArabic ? 'ar' : 'en-US')}
                        </span>
                      </div>
                      <p className="text-[11.5px] leading-relaxed whitespace-pre-wrap">{nt.content}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteCompanionNote(nt.id)}
                      className="p-1 px-1.5 rounded-lg text-slate-400 hover:text-red-500 cursor-pointer hover:bg-red-50/5 transition shrink-0"
                      title={isArabic ? 'حذف من الحقيبة' : 'Remove reflection'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
