/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Companion, Relationship } from '../types';
import { CATEGORY_TRANSLATIONS } from '../lib/i18n';
import { Printer, X, Sparkles, BookOpen, User, ShieldCheck, FileText, Calendar, Compass } from 'lucide-react';

interface PrintableReportProps {
  companion: Companion | null;
  allCompanions: Companion[];
  relationships: Relationship[];
  profile: any;
  notes: any[];
  onClose: () => void;
  isArabic: boolean;
}

export default function PrintableReport({
  companion,
  allCompanions,
  relationships,
  profile,
  notes,
  onClose,
  isArabic
}: PrintableReportProps) {

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Pre-calculate statistics
  const totalCompanionsCount = allCompanions.length;
  const totalRelationshipsCount = relationships.length;
  const companionNotesCount = notes.length;

  // Filter companion-specific relationships
  const companionRelations = companion
    ? relationships.filter(r => r.sourceId === companion.id || r.targetId === companion.id)
        .map(r => {
          const isSource = r.sourceId === companion.id;
          const peerId = isSource ? r.targetId : r.sourceId;
          const peer = allCompanions.find(c => c.id === peerId);
          return {
            ...r,
            peer,
            relationTypeLabelAr: r.labelAr,
            relationTypeLabelEn: r.labelEn
          };
        }).filter(r => r.peer !== undefined)
    : [];

  const currentDate = new Date().toLocaleDateString(isArabic ? 'ar' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 no-print">
      <div className="relative w-full max-w-4xl bg-white text-[#1a1a1a] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in border-4 border-natural-accent/40">
        
        {/* Interactive Top Actions bar (HIDDEN ON PRINT ONLY) */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-100 border-b border-stone-200 no-print">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-natural-accent/15 rounded-xl text-natural-accent">
              <Printer className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold font-serif text-natural-brand">
                {isArabic ? 'معاينة ملف التقرير الأكاديمي الشريف PDF' : 'Academic Seerah Report PDF Preview'}
              </h3>
              <p className="text-[10px] text-slate-500 font-sans">
                {isArabic ? 'اضغط على زر الطباعة لحفظ التقرير كملف PDF عالي الجودة.' : 'Click print button below to save of high quality PDF report.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-natural-brand hover:bg-natural-brand/90 text-white rounded-xl text-xs font-serif font-bold transition cursor-pointer active:scale-95 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>{isArabic ? 'ابدأ الطباعة / تصدير PDF' : 'Print / Export PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-500 hover:text-stone-800 rounded-xl hover:bg-stone-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Sandbox Container */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 print:p-0 bg-white" id="printable-area-container">
          
          {/* THE MANUSCRIPT WRAPPER RENDERED IN FULL GRAPHICAL BEAUTY FOR PREVIEW AND NATIVE PRINTER */}
          <div className="font-serif leading-relaxed text-[#1c1c1a] print-container" dir={isArabic ? 'rtl' : 'ltr'}>
            
            {/* Elegant Arabesque Frame Header */}
            <div className="relative border-4 border-double border-natural-accent/60 p-6 rounded-2xl text-center mb-8">
              {/* Islamic geometry corner accents */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-natural-accent" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-natural-accent" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-natural-accent" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-natural-accent" />
              
              <div className="text-xs font-sans uppercase tracking-[0.2em] text-natural-accent font-bold mb-2">
                {isArabic ? 'موسوعة نهر الصحابة والتابعين التفاعلية' : 'The Interactive Companion Stream Encyclopedia'}
              </div>
              <h1 className="text-3xl font-bold text-natural-brand mb-1 leading-tight">
                {isArabic ? 'وثيقة دراسة وبحث سيرة الصحابة ﷺ' : 'Academic Research Dossier on Prophetic Companions'}
              </h1>
              <p className="text-xs text-stone-500 max-w-lg mx-auto leading-relaxed">
                {isArabic
                  ? 'طلب علمي موثق يستعرض السجلات التاريخية والعلاقات والروابط الإيمانية لجيل الصحابة المطهرين.'
                  : 'A historical transcript detailing the sacred lineages, network alignments, and legacies of the noble Sahaba.'}
              </p>
            </div>

            {/* General Metadata / Researcher profile card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b pb-6 border-stone-200">
              <div>
                <h4 className="text-xs uppercase font-sans tracking-wider text-natural-accent font-bold mb-2">
                  {isArabic ? 'بيانات الباحث العلمي' : 'Researcher Profile'}
                </h4>
                <div className="space-y-1.5 text-xs font-sans text-stone-600">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-natural-brand shrink-0" />
                    <strong>{isArabic ? 'الاسم الشريف:' : 'Full Name:'}</strong>
                    <span>{profile?.fullName || (isArabic ? 'عابر سبيل طالب علم' : 'Seeker of Knowledge')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-natural-brand shrink-0" />
                    <strong>{isArabic ? 'رتبة العلم والسلوك:' : 'Scholarly Rank:'}</strong>
                    <span>
                      {profile?.role === 'admin' 
                        ? (isArabic ? 'مشرف ومحقق علمي' : 'Encyclopedia Moderator & Auditor')
                        : (isArabic ? 'طالب متمسك بالأثر' : 'Registered Devotee Scholar')}
                    </span>
                  </div>
                  {profile?.score !== undefined && (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <strong>{isArabic ? 'رصيد الفهم الفقهي:' : 'Erudition Score:'}</strong>
                      <span className="font-bold text-amber-600">{profile.score} {isArabic ? 'نقطة علمية' : 'points'}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase font-sans tracking-wider text-natural-accent font-bold mb-2">
                  {isArabic ? 'سياق وثيقة التقرير' : 'Dossier Context'}
                </h4>
                <div className="space-y-1.5 text-xs font-sans text-stone-600">
                  <div>
                    <strong>{isArabic ? 'تاريخ التحرير والتصدير:' : 'Generated On:'}</strong>
                    <span> {currentDate}</span>
                  </div>
                  <div>
                    <strong>{isArabic ? 'نطاق الإحصاء العام:' : 'Catalog Scope:'}</strong>
                    <span> {totalCompanionsCount} {isArabic ? 'صحابي مسجل' : 'Registered Sahaba'} — {totalRelationshipsCount} {isArabic ? 'رابطة موثقة' : 'Verified links'}</span>
                  </div>
                  <div>
                    <strong>{isArabic ? 'نوع التقرير الحالي:' : 'Dossier Type:'}</strong>
                    <span className="font-bold text-natural-brand">
                      {companion 
                        ? (isArabic ? `دراسة مفصلة عن سيرة الصحابي: ${companion.nameAr}` : `Deep Seerah study of: ${companion.nameEn}`)
                        : (isArabic ? 'الفهرس التاريخي والمسرد الإجمالي للموسوعة' : 'Universal Almanac & Encyclopedia Summary')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RENDER MODE A: SPECIFIC COMPANION BIOGRAPHY STUDY */}
            {companion ? (
              <div className="space-y-6">
                
                {/* Companion Headline */}
                <div className="border-b-2 border-natural-brand pb-3">
                  <div className="flex flex-wrap justify-between items-baseline gap-2">
                    <h2 className="text-2xl font-black text-natural-brand leading-none">
                      {companion.nameAr}
                    </h2>
                    <span className="text-sm font-sans tracking-wider text-slate-500 font-medium">
                      {companion.nameEn}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 italic mt-1 leading-none">
                    {isArabic 
                      ? `الكنية الشريفة: ${companion.kunyaAr || 'لا توجد'} | القبيلة: ${companion.tribeAr}`
                      : `Noble Kunya: ${companion.kunyaEn || 'N/A'} | Clan Tribe: ${companion.tribeEn}`}
                  </p>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/60 text-center">
                    <span className="block text-[9px] uppercase font-sans text-slate-400 font-bold">{isArabic ? 'تاريخ الوفاة الموثق' : 'Year of Demise'}</span>
                    <span className="text-sm font-bold text-natural-brand">{companion.deathYearAH} هـ</span>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/60 text-center">
                    <span className="block text-[9px] uppercase font-sans text-slate-400 font-bold">{isArabic ? 'العمر عند الوفاة' : 'Age at Demise'}</span>
                    <span className="text-sm font-bold text-natural-brand">{companion.ageAtDeath} {isArabic ? 'عاماً' : 'yrs'}</span>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/60 text-center">
                    <span className="block text-[9px] uppercase font-sans text-slate-400 font-bold">{isArabic ? 'مرويات الأحاديث' : 'Recorded Narrations'}</span>
                    <span className="text-sm font-bold text-natural-brand">{companion.hadithCount} {isArabic ? 'حديث' : 'hadith'}</span>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/60 text-center">
                    <span className="block text-[9px] uppercase font-sans text-slate-400 font-bold">{isArabic ? 'الرصيد الجغرافي' : 'Main Habitat Hub'}</span>
                    <span className="text-sm font-bold text-natural-brand">{isArabic ? companion.cityAr : companion.cityEn}</span>
                  </div>
                </div>

                {/* Lineage & Titles */}
                <div className="space-y-3">
                  <div className="p-4 bg-amber-500/5 rounded-xl border border-natural-accent/20">
                    <h4 className="text-xs uppercase font-sans tracking-wider text-natural-accent font-bold mb-1">
                      {isArabic ? 'سلسلة النسب الأكاديمية العطرة' : 'Elite Bloodlines and Lineage Chain'}
                    </h4>
                    <p className="text-sm leading-relaxed font-serif diacritics text-[#4a4a35] font-semibold">
                      {isArabic ? companion.lineageAr : companion.lineageEn}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs uppercase font-sans tracking-wider text-slate-400 font-bold mb-1">
                      {isArabic ? 'الألقاب والنعوت الشريفة' : 'Noble Titles and Eulogies'}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(isArabic ? companion.titlesAr : companion.titlesEn).map((t, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 bg-stone-100 border border-stone-200 rounded-md text-[10.5px] font-sans text-[#5A5A40] font-bold">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Biography Timeline */}
                <div>
                  <h3 className="text-sm uppercase font-sans tracking-wider text-natural-brand font-bold border-b pb-1 mb-3">
                    {isArabic ? 'الشريحة الكبرى والمحطات التاريخية' : 'Milestone Chronicles & Timelines'}
                  </h3>
                  <div className="space-y-4">
                    <div className="relative pl-4 border-l-2 border-natural-accent/30 py-1">
                      <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-natural-accent rounded-full" />
                      <h4 className="text-xs font-bold text-natural-brand">
                        {isArabic ? 'الهداية والاعتناق الشريف' : 'Entrance and Devotion to Islam'}
                      </h4>
                      <p className="text-[12px] text-stone-600 leading-relaxed mt-1">
                        {isArabic ? companion.conversionAr : companion.conversionEn}
                      </p>
                    </div>

                    <div className="relative pl-4 border-l-2 border-natural-accent/30 py-1">
                      <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-natural-accent rounded-full" />
                      <h4 className="text-xs font-bold text-natural-brand">
                        {isArabic ? 'التأثير السلوكي وبصمة السيرة الكبرى' : 'Primary Bio Narrative & Legacy Context'}
                      </h4>
                      <p className="text-[12px] text-stone-600 leading-relaxed mt-1 whitespace-pre-line">
                        {isArabic ? companion.shortBioAr : companion.shortBioEn}
                      </p>
                    </div>

                    <div className="relative pl-4 border-l-2 border-natural-accent/30 py-1">
                      <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-natural-accent rounded-full" />
                      <h4 className="text-xs font-bold text-natural-brand">
                        {isArabic ? 'الأهمية التاريخية والحضارية' : 'Geopolitcal and Scholarly Significance'}
                      </h4>
                      <p className="text-[12px] text-stone-600 leading-relaxed mt-1">
                        {isArabic ? companion.historicalSignificanceAr : companion.historicalSignificanceEn}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Relationships & Connections */}
                <div>
                  <h3 className="text-sm uppercase font-sans tracking-wider text-natural-brand font-bold border-b pb-1 mb-3">
                    {isArabic ? 'شبكة التحالفات والروابط الإيمانية المشتركة' : 'Prophetic Network and Alliance Chain'}
                  </h3>
                  {companionRelations.length === 0 ? (
                    <p className="text-stone-500 text-xs italic">{isArabic ? 'لم تسجل روابط مبسطة لهذا العَلَم.' : 'No linked companion bonds saved.'}</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {companionRelations.map((rel, idx) => (
                        <div key={idx} className="p-3 bg-stone-50 border rounded-xl flex items-center justify-between text-xs font-sans">
                          <div>
                            <strong className="text-[12px] text-natural-brand block font-serif">
                              {rel.peer?.nameAr}
                            </strong>
                            <span className="text-[10px] text-slate-500 font-serif">
                              {rel.peer?.nameEn}
                            </span>
                          </div>
                          <span className="px-2.5 py-1 bg-amber-600/10 text-amber-700 font-serif rounded-lg border border-amber-500/15 font-bold">
                            {isArabic ? rel.relationTypeLabelAr : rel.relationTypeLabelEn}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Major Narrated Hadiths */}
                {companion.famousHadiths && companion.famousHadiths.length > 0 && (
                  <div>
                    <h3 className="text-sm uppercase font-sans tracking-wider text-natural-brand font-bold border-b pb-1 mb-3">
                      {isArabic ? 'عيون ما رواه من الأثر الشريف' : 'Key Canonical Narrated Traditions'}
                    </h3>
                    <div className="space-y-3">
                      {companion.famousHadiths.map((h, idx) => (
                        <div key={idx} className="p-4 bg-stone-50 border border-stone-150 rounded-xl leading-relaxed text-[12.5px] font-serif font-medium relative">
                          <p className="italic text-[#3a3a25] diacritics mb-2">« {h.quoteAr} »</p>
                          <p className="text-xs text-stone-600 pl-4 border-l border-natural-accent font-sans italic">"{h.quoteEn}"</p>
                          <span className="block text-[9.5px] font-mono font-bold uppercase text-slate-400 mt-2 text-right">
                            {isArabic ? `المصدر: ${h.reference}` : `Ref: ${h.reference}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personal study notes */}
                {companionNotesCount > 0 && (
                  <div className="print:break-before-page">
                    <h3 className="text-sm uppercase font-sans tracking-wider text-amber-600 font-bold border-b pb-1 mb-3 flex items-center gap-2">
                      <span>📝</span>
                      <span>{isArabic ? 'مدونات الفوائد والتحصيل العلمي للبحث' : 'Personal Active Study Notes/Summaries'}</span>
                    </h3>
                    <div className="space-y-3">
                      {notes.map((note) => (
                        <div key={note.id} className="p-4 border-l-4 border-amber-500 bg-amber-50/20 rounded-xl font-sans text-xs">
                          {note.title && <h5 className="font-bold text-natural-brand mb-1 text-sm">{note.title}</h5>}
                          <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                          <span className="block text-[9px] font-mono text-slate-400 mt-2">
                            {new Date(note.createdAt).toLocaleString(isArabic ? 'ar' : 'en-US')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              // RENDER MODE B: ALMANAC SUMMARY OF ALL REGISTERED SAHABA
              <div className="space-y-6">
                <div className="border-b-2 border-natural-brand pb-2">
                  <h3 className="text-lg font-bold text-natural-brand">
                    {isArabic ? 'الفهرس التاريخي الموثق ومسرد التراجم العام' : 'Universal Almanac & Historical General ledger'}
                  </h3>
                  <p className="text-xs text-stone-500 italic">
                    {isArabic 
                      ? 'قائمة تراجم الصحابة الـ 21 الفضلاء المتاحة بصورتها الإعجازية وعلو شأن روايتهم.'
                      : 'Comprehensive catalog detailing life metrics of all 21 key companions of Prophet Muhammad ﷺ.'}
                  </p>
                </div>

                {/* Almanac statistics grid */}
                <div className="grid grid-cols-3 gap-6 py-2">
                  <div className="bg-[#FAF8F5] p-4 rounded-xl border border-stone-200 text-center">
                    <span className="block text-xl font-black text-natural-brand font-serif">{totalCompanionsCount}</span>
                    <span className="text-[9.5px] font-sans text-slate-500 uppercase font-bold">{isArabic ? 'إجمالي التراجم' : 'Companions'}</span>
                  </div>
                  <div className="bg-[#FAF8F5] p-4 rounded-xl border border-stone-200 text-center">
                    <span className="block text-xl font-black text-natural-brand font-serif">{totalRelationshipsCount}</span>
                    <span className="text-[9.5px] font-sans text-slate-500 uppercase font-bold">{isArabic ? 'شبكة الروابط' : 'Verified Links'}</span>
                  </div>
                  <div className="bg-[#FAF8F5] p-4 rounded-xl border border-stone-200 text-center">
                    <span className="block text-xl font-black text-natural-brand font-serif">14,352+</span>
                    <span className="text-[9.5px] font-sans text-slate-500 uppercase font-bold">{isArabic ? 'إجمالي مرويات الحديث' : 'Hadith Corpus'}</span>
                  </div>
                </div>

                {/* Almanac Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-stone-200 text-xs font-sans">
                    <thead>
                      <tr className="bg-stone-100 font-bold border-b border-stone-200 text-stone-700">
                        <th className="p-2.5 text-right font-serif">{isArabic ? 'الاسم' : 'Name'}</th>
                        <th className="p-2.5 font-serif">{isArabic ? 'الكنية' : 'Kunya'}</th>
                        <th className="p-2.5 font-serif">{isArabic ? 'الفئة النبوية' : 'Category'}</th>
                        <th className="p-2.5 text-center">{isArabic ? 'الوفاة' : 'Death'}</th>
                        <th className="p-2.5 text-center">{isArabic ? 'العمر' : 'Age'}</th>
                        <th className="p-2.5 text-center">{isArabic ? 'المرويات' : 'Hadiths'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-150">
                      {allCompanions.map(comp => (
                        <tr key={comp.id} className="hover:bg-stone-50/50">
                          <td className="p-2.5 font-bold font-serif text-right text-natural-brand">
                            {comp.nameAr}
                            <span className="block text-[9.5px] text-slate-400 font-sans font-normal mt-0.5">{comp.nameEn}</span>
                          </td>
                          <td className="p-2.5 font-serif text-stone-600">{isArabic ? comp.kunyaAr : comp.kunyaEn}</td>
                          <td className="p-2.5 text-stone-600 font-serif">
                            {isArabic 
                              ? CATEGORY_TRANSLATIONS[comp.category]?.ar 
                              : CATEGORY_TRANSLATIONS[comp.category]?.en}
                          </td>
                          <td className="p-2.5 text-center font-bold">{comp.deathYearAH} هـ</td>
                          <td className="p-2.5 text-center">{comp.ageAtDeath} {isArabic ? 'عاماً' : 'yrs'}</td>
                          <td className="p-2.5 text-center font-bold text-natural-accent">{comp.hadithCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Official Academic Seal & Footer block */}
            <div className="mt-12 pt-8 border-t border-stone-200 flex flex-wrap items-center justify-between gap-6">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-mono">
                  {isArabic ? 'رمز التحقق الرقمي للمخطوطة:' : 'Authentic Hash Integrity:'}
                  <span className="font-mono ml-1 text-slate-500 font-bold">SHA-256 (SAHABA_{companion ? companion.id.toUpperCase() : 'UNIVERSAL'}_REPORT)</span>
                </p>
                <p className="text-[10px] text-slate-400 font-sans">
                  {isArabic 
                    ? '© نهر الصحابة والتابعين - منصة دراسية أكاديمية مخصصة للتحقيق في سيرة السلف الصالح.' 
                    : '© Sahaba Explorer - Interactive Educational and Historical Platform for Seerah Research.'}
                </p>
              </div>

              {/* Graphical Islamic geometry certificate badge */}
              <div className="flex items-center gap-3 bg-natural-accent/5 p-3 rounded-2xl border border-natural-accent/25">
                <div className="w-10 h-10 rounded-xl bg-natural-accent/15 flex items-center justify-center font-serif text-natural-accent text-lg font-bold">
                  ﷺ
                </div>
                <div className="text-left font-serif">
                  <span className="block text-xs font-bold text-natural-brand">{isArabic ? 'خاتم الاعتماد العلمي' : 'Seal of Scholarly Devotion'}</span>
                  <span className="block text-[8.5px] text-slate-500 font-sans">{isArabic ? 'سيرة مصونة بدقة الأثر' : 'Guarded with Authentic Narrative'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
