/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Companion, Relationship, BattleInfo } from '../types';
import { DEFAULT_BATTLES } from '../data/defaultDataset';
import { BookOpen, Calendar, Award, Copy, Check, Users, ShieldAlert, ArrowRight, ArrowLeft, Landmark, History, Library, Compass } from 'lucide-react';

interface CompanionDetailProps {
  companion: Companion;
  relationships: Relationship[];
  allCompanions: Companion[];
  onSelectCompanion: (companion: Companion) => void;
  isArabic: boolean;
  isDarkMode?: boolean;
  onBack: () => void;
}

export default function CompanionDetail({
  companion,
  relationships,
  allCompanions,
  onSelectCompanion,
  isArabic,
  isDarkMode = false,
  onBack
}: CompanionDetailProps) {
  const [activeTab, setActiveTab] = useState<'seerah' | 'knowledge' | 'battles' | 'sources'>('seerah');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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
            <h1 className="text-2xl md:text-3xl font-extrabold text-natural-brand tracking-tight font-serif">{isArabic ? companion.nameAr : companion.nameEn}</h1>
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
                        <h4 className="text-[11px] font-bold truncate">{isArabic ? rel.peer?.nameAr : rel.peer?.nameEn}</h4>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-neutral-805">
          {/* Classical Reference Sources */}
          <div className="space-y-4">
            <h3 className={`text-sm font-bold border-b pb-2 flex items-center gap-1.5 font-serif ${isDarkMode ? 'text-slate-200 border-neutral-800' : 'text-natural-brand border-natural-accent/20'}`}>
              <Library className="w-4.5 h-4.5 text-natural-accent" />
              <span>{isArabic ? 'توثيق المصادر التراثية المسندة' : 'Classical Reference Documents'}</span>
            </h3>
            <p className={`text-[10.5px] leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-neutral-600 font-serif'}`}>
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

            {/* Academic library and study references */}
            <h3 className={`text-sm font-bold border-b pt-3 pb-2 flex items-center gap-1.5 font-serif ${isDarkMode ? 'text-slate-200 border-neutral-800' : 'text-natural-brand border-natural-accent/25'}`}>
              <BookOpen className="w-4.5 h-4.5 text-natural-accent" />
              <span>{isArabic ? 'مؤلفات ودراسات أكاديمية مضافة' : 'Academic & Modern Studies'}</span>
            </h3>
            <ul className="space-y-2 text-xs pr-1">
              {companion.library.map((l, idx) => (
                <li key={idx} className={`flex gap-2 px-3 py-2 rounded-xl border ${isDarkMode ? 'bg-natural-dark-bg/40 border-neutral-750 text-slate-300' : 'bg-white border-natural-accent/15 text-neutral-700 font-serif'}`}>
                  <span className="text-slate-500">📖</span>
                  <span className="italic">{l}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive media map & travel coordinates */}
          <div className={`border p-5 rounded-2xl flex flex-col justify-between ${isDarkMode ? 'bg-[#1E1F1A] border-neutral-800' : 'bg-[#FAF9F5] border-natural-accent/20 shadow-sm'}`}>
            <div>
              <h3 className={`text-sm font-bold border-b pb-2 flex items-center gap-1.5 font-serif ${isDarkMode ? 'text-slate-200 border-neutral-800' : 'text-natural-brand border-natural-accent/25'}`}>
                <Compass className="w-4.5 h-4.5 text-natural-accent" />
                <span>{isArabic ? 'مسارات تنقل الصحابي ومواطن السيرة-خريطة' : 'Geographic Journeys & Milestones'}</span>
              </h3>
              <p className={`text-[10.5px] leading-relaxed mt-2 mb-4 ${isDarkMode ? 'text-slate-400' : 'text-neutral-600 font-serif'}`}>
                {isArabic
                  ? 'تمثل هذه الخريطة البيانية خطوط تنقل الصحابي وهجراته بين الأقطار لقول الحق أو نصرة الغزوات وتعليم التابعين.'
                  : 'Map representing key geopolitical routes this companion paced, from initial Meccan days, Medina migrations, to Damascus, Iraq, or Abyssinia.'}
              </p>

              {/* Geographic graphic plot visualizer */}
              <div className={`relative w-full h-[140px] border rounded-xl overflow-hidden flex items-center justify-center ${isDarkMode ? 'bg-natural-dark-panel border-neutral-750' : 'bg-[#FAF9F5] border-natural-accent/25'}`}>
                {/* Simulated old map pattern background */}
                <div className="absolute inset-0 opacity-10 bg-radial from-slate-500 to-transparent pointer-events-none" />
                <svg className="w-full h-full p-2 text-slate-500">
                  {/* Draw connection route vectors */}
                  <line x1="40" y1="90" x2="100" y2="40" stroke="#8c6a46" strokeWidth="1" strokeDasharray="2,3" />
                  <line x1="100" y1="40" x2="180" y2="70" stroke="#8c6a46" strokeWidth="1" strokeDasharray="2,3" />
                  {companion.id === 'bilal_bin_rabah' && (
                    <line x1="100" y1="40" x2="240" y2="30" stroke="#BF7F4B" strokeWidth="1.5" />
                  )}
                  {companion.id === 'ali_bin_abi_talib' && (
                    <line x1="100" y1="40" x2="220" y2="60" stroke="#BF7F4B" strokeWidth="1.5" />
                  )}

                  {/* Draw key historic geographic hubs */}
                  <g transform="translate(40, 90)">
                    <circle r="3.5" fill="#8c6a46" />
                    <text x="-15" y="-10" className={`text-[7.5px] ${isDarkMode ? 'fill-slate-400' : 'fill-natural-brand font-serif'}`}>{isArabic ? 'مكة المكرمة' : 'Mecca'}</text>
                  </g>
                  <g transform="translate(100, 40)">
                    <circle r="4.5" fill="#BF7F4B" />
                    <circle r="6" fill="none" stroke="#BF7F4B" strokeWidth="0.5" className="animate-pulse" />
                    <text x="8" y="12" className="text-[7.5px] fill-natural-brand font-bold font-serif">{isArabic ? 'المدينة المنورة' : 'Medina'}</text>
                  </g>
                  <g transform="translate(180, 70)">
                    <circle r="3" fill="#8c6a46" />
                    <text x="6" y="-3" className="text-[7px] fill-neutral-600 font-serif">{isArabic ? 'البحرين/عُمان' : 'Eastern Arabia'}</text>
                  </g>
                  <g transform="translate(240, 30)">
                    <circle r="3.5" fill={companion.cityEn.includes('Damascus') || companion.cityEn.includes('Homs') ? '#BF7F4B' : '#8c6a46'} />
                    <text x="-5" y="-10" className="text-[7px] fill-neutral-600 font-serif">{isArabic ? 'شام دمشق' : 'Syria'}</text>
                  </g>
                  <g transform="translate(220, 60)">
                    <circle r="3.5" fill={companion.cityEn.includes('Kufa') || companion.cityEn.includes('Basra') ? '#BF7F4B' : '#8c6a46'} />
                    <text x="-5" y="12" className="text-[7px] fill-neutral-600 font-serif">{isArabic ? 'العراق (الكوفة)' : 'Iraq (Kufa)'}</text>
                  </g>
                </svg>
              </div>
            </div>

            <div className={`mt-4 text-[10px] italic text-center ${isDarkMode ? 'text-slate-400' : 'text-neutral-500 font-serif'}`}>
              {isArabic
                ? `الموقع الحالي للوفاة أو الدفن: رُصد رضي الله عنه في ${companion.cityAr}`
                : `Verified place of final rest/death: ${companion.cityEn}`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
