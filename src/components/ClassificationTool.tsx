/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Companion, CompanionCategory } from '../types';
import { CATEGORY_CONFIG } from './NetworkGraph';
import { 
  Layers, 
  MapPin, 
  BookOpen, 
  Users, 
  Search, 
  ChevronRight, 
  TrendingUp, 
  Award, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface ClassificationToolProps {
  companions: Companion[];
  onSelectCompanion: (companion: Companion) => void;
  selectedCompanion: Companion | null;
  isArabic: boolean;
  lang: 'ar' | 'en' | 'fr';
  isDarkMode: boolean;
}

export default function ClassificationTool({
  companions,
  onSelectCompanion,
  selectedCompanion,
  isArabic,
  lang,
  isDarkMode
}: ClassificationToolProps) {
  // Classification views: 'category' | 'tribe' | 'city' | 'hadiths'
  const [classMode, setClassMode] = useState<'category' | 'tribe' | 'city' | 'hadiths'>('category');
  const [subSearch, setSubSearch] = useState('');

  // Localized general texts
  const t = {
    categoryTab: { ar: 'التصنيف الموضوعي', fr: 'Par Catégorie', en: 'Thematic Category' },
    tribeTab: { ar: 'الانتساب والقبائل', fr: 'Par Tribu & Clan', en: 'Tribe & Lineage' },
    cityTab: { ar: 'الحواضر والمواطن', fr: 'Par Ville d\'Heur', en: 'City & Geography' },
    hadithTab: { ar: 'مرويات الحديث الكبرى', fr: 'Par Récits (Hadiths)', en: 'Hadith Narrations' },
    title: { ar: 'أداة التصنيف والتوزيع المنهجي', fr: 'Outil de Classification Sages', en: 'Companion Classification Center' },
    subtitle: { ar: 'تصفح وتصنيف غني ومستند للصحابة الكرام رضي الله عنهم وعلاقاتهم على مر التابعين.', fr: 'Explorez la répartition structurée des Compagnons du Prophète ﷺ par cercles, lignées de sang, géographies d\'impact et transcription du Hadith.', en: 'Explore the structured classification of the Sahaba based on thematic titles, tribal bloodlines, geographical landmarks, and narration volume.' },
    searchPlace: { ar: 'تصفية داخل هذه الفئة...', fr: 'Filtrer dans cette catégorie...', en: 'Filter list...' },
    totalSahaba: { ar: 'إجمالي التراجم المتاحة', fr: 'Total des notices', en: 'Total available notices' },
    hadithVolume: { ar: 'روات الأكثر رواية', fr: 'Volumétrie des Hadiths', en: 'Hadith Transcription Level' },
    clickToView: { ar: 'انقر لفتح صفحة التفاصيل والسيرة الكبرى', fr: 'Cliquer pour examiner la biographie complète', en: 'Click to explore complete Seerah and historical resources' },
    noResults: { ar: 'لا توجد نتائج مطابقة للتصفية', fr: 'Aucune correspondance dans cette liste', en: 'No matching records in this view' },
    tribeLabel: { ar: 'القبيلة وبنو:', fr: 'Faction / Tribu :', en: 'Tribe / Clan:' },
    cityLabel: { ar: 'موطن السيرة / الاستقرار :', fr: 'Principale Cité d\'impact :', en: 'Primary City Hub:' },
    countBadge: { ar: 'صحابي', fr: 'compagnons', en: 'sahaba' },
  };

  const getTranslation = (item: Record<'ar' | 'en' | 'fr', string>) => {
    return item[lang] || item['fr'] || item['en'];
  };

  // Helper inside classification to filter list and match search query
  const searchFilter = (list: Companion[]) => {
    if (!subSearch.trim()) return list;
    const query = subSearch.toLowerCase();
    return list.filter(c => 
      c.nameAr.includes(query) || 
      c.nameEn.toLowerCase().includes(query) || 
      (c.nameFr && c.nameFr.toLowerCase().includes(query)) ||
      c.id.includes(query) ||
      (c.tribeAr && c.tribeAr.includes(query)) ||
      (c.tribeEn && c.tribeEn.toLowerCase().includes(query)) ||
      (c.cityAr && c.cityAr.includes(query)) ||
      (c.cityEn && c.cityEn.toLowerCase().includes(query))
    );
  };

  // Grouping 1: By Theme / Category
  const categoriesList = useMemo(() => {
    const groups: { category: CompanionCategory; count: number; sahaba: Companion[] }[] = [];
    const keys: CompanionCategory[] = [
      'Khulafa_Rashidun',
      'Ahl_al_Bayt',
      'Muhajirun',
      'Ansar',
      'Wives',
      'Hadith_Narrators',
      'Military',
      'Scholars',
      'Other'
    ];

    keys.forEach(k => {
      const sorted = companions.filter(c => c.category === k);
      if (sorted.length > 0) {
        groups.push({
          category: k,
          count: sorted.length,
          sahaba: sorted
        });
      }
    });

    return groups;
  }, [companions]);

  // Grouping 2: By Tribe Clan (curated major families)
  const tribesList = useMemo(() => {
    const groups: { nameAr: string; nameEn: string; count: number; sahaba: Companion[] }[] = [];
    
    // Factions list
    const majorTribes = [
      { id: 'quraysh_hashim', nameAr: 'بنو هاشم (قريش)', nameEn: 'Banu Hashim (Quraysh)' },
      { id: 'quraysh_taym', nameAr: 'بنو تيم (قريش)', nameEn: 'Banu Taym (Quraysh)' },
      { id: 'quraysh_adi', nameAr: 'بنو عدي (قريش)', nameEn: 'Banu Adi (Quraysh)' },
      { id: 'quraysh_umayyah', nameAr: 'بنو أمية (قريش)', nameEn: 'Banu Umayyah (Quraysh)' },
      { id: 'quraysh_general', nameAr: 'بطون قريش الأخرى', nameEn: 'Other Factions of Quraysh' },
      { id: 'ansar_aws', nameAr: 'الأوس (الأنصار)', nameEn: 'Al-Aws (Ansar)' },
      { id: 'ansar_khazraj', nameAr: 'الخزرج (الأنصار)', nameEn: 'Al-Khazraj (Ansar)' },
      { id: 'other_clans', nameAr: 'قبائل وعشائر شريفة أخرى', nameEn: 'Other Noble Clans & Tribes' },
    ];

    majorTribes.forEach(t => {
      const sahaba = companions.filter(c => {
        const tribeLower = (c.tribeEn || '').toLowerCase();
        const tribeAr = c.tribeAr || '';
        if (t.id === 'quraysh_hashim') {
          return tribeLower.includes('hashim') || tribeAr.includes('هاشم');
        } else if (t.id === 'quraysh_taym') {
          return tribeLower.includes('taym') || tribeAr.includes('تيم');
        } else if (t.id === 'quraysh_adi') {
          return tribeLower.includes('adi') || tribeAr.includes('عدي');
        } else if (t.id === 'quraysh_umayyah') {
          return tribeLower.includes('umayya') || tribeAr.includes('أمية');
        } else if (t.id === 'quraysh_general') {
          return (tribeLower.includes('quraysh') || tribeLower.includes('qoraych') || tribeAr.includes('قريش')) &&
            !tribeLower.includes('hashim') && !tribeLower.includes('taym') && !tribeLower.includes('adi') && !tribeLower.includes('umayya') &&
            !tribeAr.includes('هاشم') && !tribeAr.includes('تيم') && !tribeAr.includes('عدي') && !tribeAr.includes('أمية');
        } else if (t.id === 'ansar_aws') {
          return tribeLower.includes('aws') || tribeAr.includes('أوس') || tribeAr.includes('الأوس');
        } else if (t.id === 'ansar_khazraj') {
          return tribeLower.includes('khazraj') || tribeAr.includes('خزرج') || tribeAr.includes('الخزرج');
        } else {
          // Other clans
          return !tribeLower.includes('quraysh') && !tribeLower.includes('qoraych') && !tribeAr.includes('قريش') &&
                 !tribeLower.includes('aws') && !tribeAr.includes('الأوس') && !tribeAr.includes('أوس') &&
                 !tribeLower.includes('khazraj') && !tribeAr.includes('الخزرج') && !tribeAr.includes('خزرج');
        }
      });

      if (sahaba.length > 0) {
        groups.push({
          nameAr: t.nameAr,
          nameEn: t.nameEn,
          count: sahaba.length,
          sahaba
        });
      }
    });

    return groups;
  }, [companions]);

  // Grouping 3: By City Profile / Rest / Settlement
  const citiesList = useMemo(() => {
    const groups: { nameAr: string; nameEn: string; count: number; sahaba: Companion[] }[] = [];
    const mainCities = [
      { id: 'mecca', nameAr: 'مكة المكرمة', nameEn: 'Mecca Al-Mukarramah' },
      { id: 'medina', nameAr: 'المدينة المنورة', nameEn: 'Medina Al-Munawwarah' },
      { id: 'sham', nameAr: 'بلاد الشام (دمشق / حمص)', nameEn: 'The Levant (Bilad al-Sham)' },
      { id: 'iraq', nameAr: 'أكناف العراق (الكوفة / البصرة)', nameEn: 'Iraq (Kufa / Basra)' },
      { id: 'egypt', nameAr: 'ديار مصر والفسطاط', nameEn: 'Egypt (Al-Fustat)' },
      { id: 'abyssinia', nameAr: 'بلاد الحبشة', nameEn: 'Abyssinia (Al-Habashah)' },
      { id: 'other', nameAr: 'حواضر ورباطات أخرى', nameEn: 'Other Lands & Regions' },
    ];

    mainCities.forEach(city => {
      const sahaba = companions.filter(c => {
        const cityLower = (c.cityEn || '').toLowerCase();
        const cityAr = c.cityAr || '';
        if (city.id === 'mecca') {
          return cityLower.includes('mecca') || cityLower.includes('makkah') || cityAr.includes('مكة');
        } else if (city.id === 'medina') {
          return cityLower.includes('medina') || cityAr.includes('مدينة') || cityAr.includes('طيبة');
        } else if (city.id === 'sham') {
          return cityLower.includes('damascus') || cityLower.includes('syria') || cityLower.includes('homs') || cityLower.includes('levant') || cityAr.includes('شام') || cityAr.includes('دمشق') || cityAr.includes('حمص');
        } else if (city.id === 'iraq') {
          return cityLower.includes('kufa') || cityLower.includes('iraq') || cityLower.includes('basra') || cityAr.includes('عراق') || cityAr.includes('كوفة') || cityAr.includes('بصرة');
        } else if (city.id === 'egypt') {
          return cityLower.includes('egypt') || cityLower.includes('fustat') || cityAr.includes('مصر') || cityAr.includes('فسطاط');
        } else if (city.id === 'abyssinia') {
          return cityLower.includes('abyssinia') || cityLower.includes('habesha') || cityAr.includes('حبشة');
        } else {
          return !cityLower.includes('mecca') && !cityLower.includes('makkah') && !cityAr.includes('مكة') &&
                 !cityLower.includes('medina') && !cityAr.includes('مدينة') && !cityAr.includes('طيبة') &&
                 !cityLower.includes('damascus') && !cityLower.includes('syria') && !cityLower.includes('homs') && !cityLower.includes('levant') && !cityAr.includes('شام') &&
                 !cityLower.includes('kufa') && !cityLower.includes('iraq') && !cityLower.includes('basra') && !cityAr.includes('عراق') &&
                 !cityLower.includes('egypt') && !cityLower.includes('fustat') && !cityAr.includes('مصر') &&
                 !cityLower.includes('abyssinia') && !cityAr.includes('حبشة');
        }
      });

      if (sahaba.length > 0) {
        groups.push({
          nameAr: city.nameAr,
          nameEn: city.nameEn,
          count: sahaba.length,
          sahaba
        });
      }
    });

    return groups;
  }, [companions]);

  // Grouping 4: By Transcription/Hadith narration counts
  const hadithVolumeGroups = useMemo(() => {
    const list = [
      { id: 'high', nameAr: 'المكثرون (أكثر من 500 حديث)', nameEn: 'Major Narrators (>500 hadiths)', score: 3 },
      { id: 'medium', nameAr: 'المتوسطون (50 إلى 500 حديث)', nameEn: 'Moderate Narrators (50-500 hadiths)', score: 2 },
      { id: 'general', nameAr: 'الرواة الآخرون (أقل من 50 حديث)', nameEn: 'Other Blessed Narrators (<50 hadiths)', score: 1 },
    ];

    return list.map(g => {
      const sahaba = companions.filter(c => {
        if (g.id === 'high') return c.hadithCount >= 500;
        if (g.id === 'medium') return c.hadithCount >= 50 && c.hadithCount < 500;
        return c.hadithCount < 50;
      });

      return {
        ...g,
        count: sahaba.length,
        sahaba
      };
    }).filter(g => g.count > 0);
  }, [companions]);

  return (
    <div className={`p-6 rounded-3xl border shadow-lg transition duration-300 ${isDarkMode ? 'bg-natural-dark-panel border-neutral-800 text-slate-100' : 'bg-white border-natural-accent/35 text-natural-text'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Visual Header */}
      <div className="mb-6 pb-6 border-b border-natural-accent/15">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-natural-accent/10 border border-natural-accent/30 text-natural-accent">
                <Layers className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold text-natural-brand font-serif tracking-tight">{getTranslation(t.title)}</h2>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-neutral-500 font-serif'} leading-relaxed max-w-3xl`}>
              {getTranslation(t.subtitle)}
            </p>
          </div>
          <div className={`p-3 px-4 rounded-2xl text-center border font-mono ${isDarkMode ? 'bg-[#1E1F1A] border-neutral-800' : 'bg-[#FAF9F5] border-natural-accent/15'}`}>
            <span className="block text-2xl font-bold text-natural-accent mb-0.5">{companions.length}</span>
            <span className="text-[9.5px] uppercase text-slate-550 block font-bold">{getTranslation(t.totalSahaba)}</span>
          </div>
        </div>
      </div>

      {/* Primary Toggles for Classification Modes */}
      <div className={`flex flex-wrap p-1 gap-2 rounded-2xl border mb-6 max-w-4xl ${isDarkMode ? 'bg-natural-dark-bg border-neutral-750' : 'bg-[#FAF9F5] border-natural-accent/20'}`}>
        <button
          onClick={() => { setClassMode('category'); setSubSearch(''); }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-serif font-bold cursor-pointer flex items-center justify-center gap-2 transition active:scale-95 ${classMode === 'category' ? 'bg-natural-accent text-white shadow-md' : 'text-neutral-604 hover:bg-natural-brand/5'}`}
        >
          <Layers className="w-4 h-4" />
          <span>{getTranslation(t.categoryTab)}</span>
        </button>
        <button
          onClick={() => { setClassMode('tribe'); setSubSearch(''); }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-serif font-bold cursor-pointer flex items-center justify-center gap-2 transition active:scale-95 ${classMode === 'tribe' ? 'bg-natural-accent text-white shadow-md' : 'text-neutral-604 hover:bg-natural-brand/5'}`}
        >
          <Users className="w-4 h-4" />
          <span>{getTranslation(t.tribeTab)}</span>
        </button>
        <button
          onClick={() => { setClassMode('city'); setSubSearch(''); }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-serif font-bold cursor-pointer flex items-center justify-center gap-2 transition active:scale-95 ${classMode === 'city' ? 'bg-natural-accent text-white shadow-md' : 'text-neutral-604 hover:bg-natural-brand/5'}`}
        >
          <MapPin className="w-4 h-4" />
          <span>{getTranslation(t.cityTab)}</span>
        </button>
        <button
          onClick={() => { setClassMode('hadiths'); setSubSearch(''); }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-serif font-bold cursor-pointer flex items-center justify-center gap-2 transition active:scale-95 ${classMode === 'hadiths' ? 'bg-natural-accent text-white shadow-md' : 'text-neutral-604 hover:bg-natural-brand/5'}`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{getTranslation(t.hadithTab)}</span>
        </button>
      </div>

      {/* Internal Filter Search Input */}
      <div className="relative mb-6 max-w-xl">
        <Search className="w-4.5 h-4.5 text-slate-400 absolute top-3 left-3" />
        <input
          type="text"
          value={subSearch}
          onChange={(e) => setSubSearch(e.target.value)}
          placeholder={getTranslation(t.searchPlace)}
          className={`w-full border rounded-2xl p-2.5 pl-10 focus:outline-none text-xs transition ${
            isDarkMode 
              ? 'bg-natural-dark-bg border-neutral-750 text-slate-100 focus:border-natural-accent' 
              : 'bg-[#FAF9F5] border-[#CFC5AD]/40 text-[#443825] focus:border-natural-brand'
          }`}
        />
      </div>

      {/* GROUPING PANELS GRAPH */}
      <div className="space-y-8 animate-fade-in">
        {/* VIEW 1: CATEGORY SECTORS */}
        {classMode === 'category' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriesList.map(group => {
              const conf = CATEGORY_CONFIG[group.category] || CATEGORY_CONFIG.Other;
              const matches = searchFilter(group.sahaba);
              if (matches.length === 0 && subSearch) return null;

              return (
                <div key={group.category} className={`border rounded-2.5xl p-5 shadow-sm flex flex-col justify-between ${isDarkMode ? 'bg-[#1E1F1A]/80 border-neutral-800' : 'bg-[#FAF9F5]/45 border-natural-accent/20'}`}>
                  <div>
                    {/* Faction Title Block */}
                    <div className="flex items-center justify-between border-b pb-3 mb-4 border-natural-accent/10">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full`} style={{ backgroundColor: conf.color }} />
                        <h4 className="text-sm font-bold text-natural-brand font-serif shrink-0">
                          {isArabic ? conf.labelAr : conf.labelEn}
                        </h4>
                      </div>
                      <span className={`text-[9.5px] px-2.5 py-0.5 rounded-full font-bold uppercase font-mono bg-natural-accent/15 text-natural-brand border border-natural-brand/20`}>
                        {matches.length} {getTranslation(t.countBadge)}
                      </span>
                    </div>

                    {/* Small layout cards wrapper */}
                    {matches.length === 0 ? (
                      <p className="text-[10.5px] italic text-slate-500 py-3 text-center">{getTranslation(t.noResults)}</p>
                    ) : (
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                        {matches.map(comp => (
                          <div
                            key={comp.id}
                            onClick={() => onSelectCompanion(comp)}
                            title={getTranslation(t.clickToView)}
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition active:scale-[0.98] ${
                              selectedCompanion?.id === comp.id
                                ? 'bg-natural-accent/15 border-natural-accent text-natural-accent'
                                : isDarkMode
                                  ? 'bg-[#181914] border-neutral-750 hover:bg-[#1E1F1A] hover:border-neutral-700'
                                  : 'bg-white border-[#CFC5AD]/20 hover:border-natural-brand shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
                            }`}
                          >
                            <div className="min-w-0">
                              {/* Companion Name is ALWAYS written in ARABIC script as per User demand */}
                              <span className="font-serif font-extrabold text-sm block leading-tight text-natural-brand">
                                {comp.nameAr}
                              </span>
                              <span className="text-[10px] text-slate-500 font-serif leading-none mt-1 block">
                                {isArabic ? comp.tribeAr : comp.shortBioEn?.substring(0, 48)}...
                              </span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 font-bold justify-end" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: TRIBAL BLOODLINES */}
        {classMode === 'tribe' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tribesList.map(group => {
              const matches = searchFilter(group.sahaba);
              if (matches.length === 0 && subSearch) return null;

              return (
                <div key={group.nameEn} className={`border rounded-2.5xl p-5 shadow-sm flex flex-col justify-between ${isDarkMode ? 'bg-[#1E1F1A]/80 border-neutral-800' : 'bg-[#FAF9F5]/45 border-natural-accent/20'}`}>
                  <div>
                    {/* Clan Header */}
                    <div className="flex items-center justify-between border-b pb-3 mb-4 border-natural-accent/10">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-natural-accent" />
                        <h4 className="text-sm font-bold text-natural-brand font-serif">
                          {isArabic ? group.nameAr : group.nameEn}
                        </h4>
                      </div>
                      <span className="text-[9.5px] px-2.5 py-0.5 rounded-full font-mono bg-[#FAF8F5] border border-[#CFC5AD]/40 text-[#5A5A40] font-bold">
                        {matches.length} {getTranslation(t.countBadge)}
                      </span>
                    </div>

                    {/* Simple rows */}
                    {matches.length === 0 ? (
                      <p className="text-[10.5px] italic text-slate-500 py-3 text-center">{getTranslation(t.noResults)}</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                        {matches.map(comp => (
                          <div
                            key={comp.id}
                            onClick={() => onSelectCompanion(comp)}
                            title={getTranslation(t.clickToView)}
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition active:scale-[0.98] ${
                              selectedCompanion?.id === comp.id
                                ? 'bg-natural-accent/15 border-natural-accent text-natural-accent'
                                : isDarkMode
                                  ? 'bg-[#181914] border-neutral-750 hover:bg-[#1E1F1A]'
                                  : 'bg-white border-[#CFC5AD]/20 hover:border-natural-brand'
                            }`}
                          >
                            <div className="min-w-0">
                              {/* Sahaba Name in Arabic */}
                              <span className="font-serif font-extrabold text-xs block leading-tight text-natural-brand">
                                {comp.nameAr}
                              </span>
                              <span className="text-[9.5px] block font-sans text-slate-500 mt-1 truncate">
                                {lang === 'ar' ? comp.kunyaAr : comp.kunyaEn}
                              </span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 font-bold" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 3: CITIES & GEOGRAPHY */}
        {classMode === 'city' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {citiesList.map(group => {
              const matches = searchFilter(group.sahaba);
              if (matches.length === 0 && subSearch) return null;

              return (
                <div key={group.nameEn} className={`border rounded-2.5xl p-5 shadow-sm flex flex-col justify-between ${isDarkMode ? 'bg-[#1E1F1A]/80 border-neutral-800' : 'bg-[#FAF9F5]/45 border-natural-accent/20'}`}>
                  <div>
                    {/* City Header */}
                    <div className="flex items-center justify-between border-b pb-3 mb-4 border-natural-accent/10">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-400" />
                        <h4 className="text-sm font-bold text-natural-brand font-serif">
                          {isArabic ? group.nameAr : group.nameEn}
                        </h4>
                      </div>
                      <span className="text-[9.5px] px-2.5 py-0.5 rounded-full font-mono bg-amber-500/10 border border-amber-400/30 text-natural-accent font-extrabold">
                        {matches.length} {getTranslation(t.countBadge)}
                      </span>
                    </div>

                    {/* Simple rows */}
                    {matches.length === 0 ? (
                      <p className="text-[10.5px] italic text-slate-500 py-3 text-center">{getTranslation(t.noResults)}</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                        {matches.map(comp => (
                          <div
                            key={comp.id}
                            onClick={() => onSelectCompanion(comp)}
                            title={getTranslation(t.clickToView)}
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition active:scale-[0.98] ${
                              selectedCompanion?.id === comp.id
                                ? 'bg-natural-accent/15 border-natural-accent text-natural-accent'
                                : isDarkMode
                                  ? 'bg-[#181914] border-neutral-750 hover:bg-[#1E1F1A]'
                                  : 'bg-white border-[#CFC5AD]/20 hover:border-natural-brand shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                            }`}
                          >
                            <div className="min-w-0">
                              {/* ALWAYS IN ARABIC */}
                              <span className="font-serif font-extrabold text-xs block leading-tight text-natural-brand">
                                {comp.nameAr}
                              </span>
                              <span className="text-[9.5px] block font-sans text-rose-500 mt-1 uppercase font-bold text-[8.5px]">
                                {comp.hadithCount} Hadiths
                              </span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 4: HADITH TEXT NARRATIONS VOLUME */}
        {classMode === 'hadiths' && (
          <div className="space-y-6">
            {hadithVolumeGroups.map(group => {
              const matches = searchFilter(group.sahaba);
              if (matches.length === 0 && subSearch) return null;

              return (
                <div key={group.id} className={`border rounded-2.5xl p-5 shadow-sm ${isDarkMode ? 'bg-[#1E1F1A]/80 border-neutral-800' : 'bg-[#FAF9F5]/45 border-natural-accent/20'}`}>
                  {/* Hadith category title */}
                  <div className="flex items-center justify-between border-b pb-3 mb-4 border-natural-accent/10">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-violet-400 font-extrabold" />
                      <h4 className="text-sm font-bold text-natural-brand font-serif">
                        {isArabic ? group.nameAr : group.nameEn}
                      </h4>
                    </div>
                    <span className="text-[9.5px] px-2.5 py-0.5 rounded-full font-mono bg-violet-500/10 border border-violet-400/30 text-violet-400 font-bold">
                      {matches.length} {getTranslation(t.countBadge)}
                    </span>
                  </div>

                  {/* List out companions */}
                  {matches.length === 0 ? (
                    <p className="text-[10.5px] italic text-slate-500 py-3 text-center">{getTranslation(t.noResults)}</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {matches.map(comp => (
                        <div
                          key={comp.id}
                          onClick={() => onSelectCompanion(comp)}
                          title={getTranslation(t.clickToView)}
                          className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition active:scale-[0.98] ${
                            selectedCompanion?.id === comp.id
                              ? 'bg-natural-accent/15 border-natural-accent text-natural-accent'
                              : isDarkMode
                                ? 'bg-[#181914] border-neutral-750 hover:bg-[#1E1F1A]'
                                : 'bg-white border-[#CFC5AD]/20 hover:border-natural-brand shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                          }`}
                        >
                          <div>
                            {/* Sahaba Name strictly in beautiful Arabic script */}
                            <h5 className="font-serif font-extrabold text-xs text-natural-brand leading-snug">
                              {comp.nameAr}
                            </h5>
                            <p className="text-[10px] text-slate-500 font-serif leading-none mt-1.5 mb-2.5">
                              {isArabic ? comp.kunyaAr : comp.kunyaEn}
                            </p>
                          </div>
                          <div className="flex justify-between items-center border-t pt-2 border-dashed border-neutral-200/40">
                            <span className="text-[9px] font-mono text-slate-400">
                              {isArabic ? comp.cityAr : comp.cityEn}
                            </span>
                            <span className="text-[10px] font-mono font-extrabold text-natural-accent">
                              {comp.hadithCount} H
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
