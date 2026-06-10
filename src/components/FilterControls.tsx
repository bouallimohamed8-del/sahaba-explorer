/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Companion, FilterState, CompanionCategory } from '../types';
import { CATEGORY_CONFIG, RELATION_CONFIG } from './NetworkGraph';
import { Search, Filter, RefreshCcw, Landmark, Award, ShieldAlert, SlidersHorizontal } from 'lucide-react';

interface FilterControlsProps {
  companions: Companion[];
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  isArabic: boolean;
  isDarkMode?: boolean;
  onReset: () => void;
}

export default function FilterControls({
  companions,
  filter,
  onFilterChange,
  isArabic,
  isDarkMode = false,
  onReset
}: FilterControlsProps) {
  // Extract unique tribes safely
  const uniqueTribes = useMemo(() => {
    const list = new Set<string>();
    companions.forEach(c => {
      const tribe = isArabic ? c.tribeAr : c.tribeEn;
      if (tribe) list.add(tribe);
    });
    return Array.from(list).sort();
  }, [companions, isArabic]);

  // Extract unique cities safely
  const uniqueCities = useMemo(() => {
    const list = new Set<string>();
    companions.forEach(c => {
      const city = isArabic ? c.cityAr : c.cityEn;
      if (city) list.add(city);
    });
    return Array.from(list).sort();
  }, [companions, isArabic]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, searchQuery: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filter, category: e.target.value });
  };

  const handleTribeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filter, tribe: e.target.value });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filter, city: e.target.value });
  };

  const handleBattleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filter, battle: e.target.value });
  };

  const handleRelationshipChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filter, relationshipType: e.target.value });
  };

  return (
    <div className={`border p-6 rounded-3xl shadow-lg relative transition duration-300 ${isDarkMode ? 'bg-natural-dark-panel border-neutral-800 text-slate-100' : 'bg-white/90 border-natural-accent/30 text-natural-text'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Title block */}
      <div className={`flex justify-between items-center border-b pb-3 mb-4 ${isDarkMode ? 'border-neutral-800' : 'border-natural-accent/15'}`}>
        <h2 className="text-xs font-bold uppercase flex items-center gap-1.5 font-serif text-natural-brand">
          <SlidersHorizontal className="w-4 h-4 text-natural-accent animate-spin-slow" />
          <span>{isArabic ? 'المرشحات المتقدمة والفرز السريع' : 'Advanced Filters & Explorer Criteria'}</span>
        </h2>
        <button
          onClick={onReset}
          className={`text-[11px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-neutral-800' : 'text-natural-brand/85 hover:text-natural-accent hover:bg-natural-accent/10 border border-natural-accent/15 bg-[#FAF9F5]'}`}
        >
          <RefreshCcw className="w-3 h-3 text-natural-accent" />
          <span>{isArabic ? 'إعادة تعيين' : 'Reset Filters'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs font-sans">
        {/* Search query input */}
        <div className="col-span-1 sm:col-span-2">
          <label className="block text-natural-brand/80 font-bold mb-1">{isArabic ? 'بحث باسم الصحابي المباشر' : 'Instant Name Search'}</label>
          <div className="relative">
            <input
              id="search-input-field"
              type="text"
              value={filter.searchQuery}
              onChange={handleSearchChange}
              placeholder={isArabic ? 'مثال: أبو بكر، عائشة، خالد...' : 'e.g. Abu Bakr, Aisha, Khalid...'}
              className={`w-full border rounded-xl py-2.5 pl-3.5 pr-8 focus:outline-none transition duration-150 ${isDarkMode ? 'bg-natural-dark-bg border-neutral-750 text-slate-100 focus:border-natural-accent hover:border-neutral-705' : 'bg-white border-natural-accent/40 text-natural-text focus:border-natural-brand hover:border-natural-accent/60'}`}
            />
            <Search className="w-3.5 h-3.5 text-natural-accent absolute top-3.5 right-3" />
          </div>
        </div>

        {/* Categories select criteria */}
        <div>
          <label className="block text-natural-brand/80 font-bold mb-1">{isArabic ? 'الفئات النبوية والنسب' : 'Prophetic Category'}</label>
          <select
            value={filter.category}
            onChange={handleCategoryChange}
            className={`w-full border rounded-xl py-2.5 px-2.5 focus:outline-none transition duration-150 cursor-pointer ${isDarkMode ? 'bg-natural-dark-bg border-neutral-750 text-slate-200 focus:border-natural-accent hover:border-neutral-705' : 'bg-white border-natural-accent/40 text-natural-text focus:border-natural-brand hover:border-natural-accent/60'}`}
          >
            <option value="">{isArabic ? '-- كل الفئات --' : '-- All Categories --'}</option>
            {Object.keys(CATEGORY_CONFIG).map(catKey => (
              <option key={catKey} value={catKey}>
                {isArabic ? CATEGORY_CONFIG[catKey as CompanionCategory].labelAr : CATEGORY_CONFIG[catKey as CompanionCategory].labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* Tribal lists */}
        <div>
          <label className="block text-natural-brand/80 font-bold mb-1">{isArabic ? 'بنو وعشيرة الصحابي' : 'Tribe Clan'}</label>
          <select
            value={filter.tribe}
            onChange={handleTribeChange}
            className={`w-full border rounded-xl py-2.5 px-2.5 focus:outline-none transition duration-150 cursor-pointer ${isDarkMode ? 'bg-natural-dark-bg border-neutral-750 text-slate-200 focus:border-natural-accent hover:border-neutral-705' : 'bg-white border-natural-accent/40 text-natural-text focus:border-natural-brand hover:border-natural-accent/60'}`}
          >
            <option value="">{isArabic ? '-- كل القبائل --' : '-- All Tribes --'}</option>
            {uniqueTribes.map(tr => (
              <option key={tr} value={tr}>{tr}</option>
            ))}
          </select>
        </div>

        {/* Battle participations */}
        <div>
          <label className="block text-natural-brand/80 font-bold mb-1">{isArabic ? 'المشاركة في الغزوة' : 'Battle Campaign'}</label>
          <select
            value={filter.battle}
            onChange={handleBattleChange}
            className={`w-full border rounded-xl py-2.5 px-2.5 focus:outline-none transition duration-150 cursor-pointer ${isDarkMode ? 'bg-natural-dark-bg border-neutral-750 text-slate-200 focus:border-natural-accent hover:border-neutral-705' : 'bg-white border-natural-accent/40 text-natural-text focus:border-natural-brand hover:border-natural-accent/60'}`}
          >
            <option value="">{isArabic ? '-- كل الغزوات --' : '-- All Battles --'}</option>
            <option value="badr">{isArabic ? 'غزوة بدر الكبرى' : 'Battle of Badr'}</option>
            <option value="uhud">{isArabic ? 'غزوة أحد' : 'Battle of Uhud'}</option>
            <option value="khandaq">{isArabic ? 'غزوة الخندق (الأحزاب)' : 'Battle of Trench'}</option>
            <option value="khaybar">{isArabic ? 'غزوة خيبر' : 'Battle of Khaybar'}</option>
            <option value="mutah">{isArabic ? 'غزوة مؤتة' : "Battle of Mu'tah"}</option>
            <option value="hunayn">{isArabic ? 'غزوة حنين' : 'Battle of Hunayn'}</option>
            <option value="tabuk">{isArabic ? 'غزوة تبوك (العسرة)' : 'Battle of Tabuk'}</option>
          </select>
        </div>

        {/* Origin / Resting City */}
        <div>
          <label className="block text-natural-brand/80 font-bold mb-1">{isArabic ? 'موطن السيرة / الوفاة' : 'City / Geography'}</label>
          <select
            value={filter.city}
            onChange={handleCityChange}
            className={`w-full border rounded-xl py-2.5 px-2.5 focus:outline-none transition duration-150 cursor-pointer ${isDarkMode ? 'bg-natural-dark-bg border-neutral-750 text-slate-200 focus:border-natural-accent hover:border-neutral-705' : 'bg-white border-natural-accent/40 text-natural-text focus:border-natural-brand hover:border-natural-accent/60'}`}
          >
            <option value="">{isArabic ? '-- كل الأقطار --' : '-- All Cities --'}</option>
            {uniqueCities.map(ct => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
