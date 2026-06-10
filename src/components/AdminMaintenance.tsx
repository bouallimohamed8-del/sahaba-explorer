/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, Trash2, CheckCircle, RefreshCw, HelpCircle, ShieldAlert, Check, Layers, Sparkles } from 'lucide-react';
import { Companion } from '../types';

interface MaintenanceStats {
  companionsTotal: number;
  womenTotal: number;
  relationshipsTotal: number;
  pendingTotal: number;
  quality: {
    lineageCompleteness: number;
    sourcesCompleteness: number;
    shortBioCompleteness: number;
    kunyaCompleteness: number;
    hadithsCompleteness: number;
  };
  unreferencedIds: string[];
  incompleteIds: string[];
  suspectedDuplicates: {
    compA: { id: string; nameAr: string; nameEn: string };
    compB: { id: string; nameAr: string; nameEn: string };
    reason: string;
  }[];
}

interface AdminMaintenanceProps {
  companions: Companion[];
  token: string;
  userRole: string;
  isArabic: boolean;
  onRefreshAll: () => void;
}

export default function AdminMaintenance({ companions, token, userRole, isArabic, onRefreshAll }: AdminMaintenanceProps) {
  const [reports, setReports] = useState<MaintenanceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Merge Form Fields
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [mergeFields, setMergeFields] = useState({
    battles: true,
    titles: true,
    sources: true,
    library: true,
    teachers: true,
    students: true,
    hadiths: true
  });

  const isReviewerOrSuper = userRole === 'Super Admin' || userRole === 'Reviewer';

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats-reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReports();
    }
  }, [token, companions]);

  const handleMerge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId) {
      setActionError(isArabic ? 'الرجاء اختيار السجلين لإتمام الدمج.' : 'Please select both source and target records.');
      return;
    }
    if (sourceId === targetId) {
      setActionError(isArabic ? 'لا يمكن دمج الصحابي في نفسه.' : 'Source and Target records must be different.');
      return;
    }

    if (!window.confirm(isArabic ? 'هل أنت متأكد من رغبتك بدمج وحذف هذا السجل للتكرار؟ لا يمكن التراجع عن المرج.' : 'Are you sure you want to merge these records? The source companion will be permanently unregistered.')) {
      return;
    }

    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch('/api/admin/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sourceId, targetId, mergeFields })
      });

      if (res.ok) {
        setActionSuccess(isArabic ? 'تم دمج السجلين بنجاح وتوحيد العلاقات المتصلة.' : 'Records successfully merged! Relationships re-routed.');
        setSourceId('');
        setTargetId('');
        fetchReports();
        onRefreshAll();
      } else {
        const data = await res.json();
        setActionError(data.error || 'Failed to merge companions.');
      }
    } catch (e) {
      console.error(e);
      setActionError('Network error on merge invocation.');
    }
  };

  if (loading && !reports) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-xs text-slate-400 gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
        <span>{isArabic ? 'جاري فحص وتدقيق جودة قاعدة البيانات للقرابة...' : 'Analyzing registry databases and calculating matching rules...'}</span>
      </div>
    );
  }

  const reportsVal = reports || {
    companionsTotal: companions.length,
    womenTotal: 0,
    relationshipsTotal: 0,
    pendingTotal: 0,
    quality: { lineageCompleteness: 100, sourcesCompleteness: 100, shortBioCompleteness: 100, kunyaCompleteness: 100, hadithsCompleteness: 100 },
    unreferencedIds: [],
    incompleteIds: [],
    suspectedDuplicates: []
  };

  return (
    <div className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              {isArabic ? 'تدقيق الجودة وإزالة التكرار' : 'Data Integrity & De-duplication Panel'}
            </h3>
            <p className="text-[10px] text-slate-450">
              {isArabic ? 'فحص السجلات الناقصة، دمج الصحابة المكررين، ونسب التغطية' : 'Coverage analysis, auto suspected duplicates, merge profiles'}
            </p>
          </div>
        </div>
        <button
          onClick={fetchReports}
          className="text-slate-400 hover:text-white p-1 text-[10px] transition cursor-pointer flex items-center gap-1 bg-slate-850 rounded"
        >
          <RefreshCw className="w-3 h-3" />
          <span>{isArabic ? 'تحديث' : 'Recalculate'}</span>
        </button>
      </div>

      {actionError && (
        <div className="bg-red-950/25 border border-red-950/40 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="bg-emerald-950/25 border border-emerald-950/40 text-emerald-400 p-3 rounded-xl text-xs flex items-center gap-2 animate-pulse">
          <CheckCircle className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Grid quality progress bars */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: isArabic ? 'توثيق النسب' : 'Lineage Data', val: reportsVal.quality.lineageCompleteness },
          { label: isArabic ? 'مجموع المصادر' : 'Citation References', val: reportsVal.quality.sourcesCompleteness },
          { label: isArabic ? 'النص التعريفي' : 'Biography Text', val: reportsVal.quality.shortBioCompleteness },
          { label: isArabic ? 'الكنية والألقاب' : 'Kunya Records', val: reportsVal.quality.kunyaCompleteness },
          { label: isArabic ? 'رواية الحديث' : 'Hadith Narrations', val: reportsVal.quality.hadithsCompleteness },
        ].map((item, idx) => (
          <div key={idx} className="bg-slate-900/40 border border-slate-850 p-3 rounded-xl space-y-1.5 flex flex-col justify-between">
            <div className="text-[10px] text-slate-400 font-semibold">{item.label}</div>
            <div className="flex items-end justify-between gap-1">
              <span className="text-sm font-bold text-slate-100 font-mono">{item.val}%</span>
              <span className={`text-[9px] font-bold ${item.val >= 85 ? 'text-emerald-400' : item.val >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                {item.val >= 85 ? 'Excellent' : item.val >= 60 ? 'Standard' : 'Gap'}
              </span>
            </div>
            {/* progress line */}
            <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.val >= 85 ? 'bg-emerald-500' : item.val >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${item.val}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Duplicates and Incompleteness list drawers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Suspected Duplicates matching */}
        <div className="bg-slate-900/25 border border-slate-850 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>{isArabic ? 'الصحابة المحتمل تكرارهم (مطابقة ذكية)' : 'Suspected Duplicates (Deduplication engine)'}</span>
            </h4>
            <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">
              {reportsVal.suspectedDuplicates.length} Alert
            </span>
          </div>

          <p className="text-[9px] text-slate-450 leading-relaxed">
            {isArabic
              ? 'يتم تحديد المطابقات عن طريق تشابه الأحرف والجذور المعجمية للأسماء مع تقارب سنوات الوفاة في حدود 3 هجرية.'
              : 'Matched using phonetic similar letterings, name trunks, and close death years within 3 AH.'}
          </p>

          {reportsVal.suspectedDuplicates.length === 0 ? (
            <div className="text-center text-[10px] text-slate-500 py-6 bg-slate-950/20 border border-slate-900 border-dashed rounded-lg">
              {isArabic ? 'تهانينا! لا توجد سجلات مشابهة مشتبه بها.' : 'Awesome! No overlapping names detected.'}
            </div>
          ) : (
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {reportsVal.suspectedDuplicates.map((dup, i) => (
                <div key={i} className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-xl text-[10px] space-y-1.5 hover:border-slate-800 transition">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold text-amber-550">{isArabic ? dup.compA.nameAr : dup.compA.nameEn}</span>
                    <span className="text-slate-500">↔</span>
                    <span className="font-semibold text-cyan-400">{isArabic ? dup.compB.nameAr : dup.compB.nameEn}</span>
                  </div>
                  <div className="text-[9px] text-slate-450 italic">
                    {dup.reason}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSourceId(dup.compA.id);
                        setTargetId(dup.compB.id);
                      }}
                      className="text-[9px] text-amber-500 hover:underline font-bold cursor-pointer"
                    >
                      {isArabic ? 'تجهيز الدمج' : 'Prepare Merge form'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Database Gaps / Incompleteness files */}
        <div className="bg-slate-900/25 border border-slate-850 rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isArabic ? 'سجلات فجوات توثيق السير' : 'Incomplete Biographies checklist'}</span>
          </h4>
          <p className="text-[9px] text-slate-450">
            {isArabic ? 'صحابة مسجلين يفتقدون لتوثيق فروع النسب أو المصادر والتفاصيل الكلية:' : 'Profiles requiring citation additions, lineages, or translations:'}
          </p>

          <div className="grid grid-cols-2 gap-3 text-[10px]">
            <div className="space-y-1.5 bg-slate-950/30 p-2.5 rounded-xl border border-slate-850/50">
              <span className="text-[9px] text-slate-500 font-bold block">{isArabic ? 'ينقصها مراجع ومصادر:' : 'Missing Citation List:'}</span>
              <div className="max-h-[100px] overflow-y-auto space-y-1 text-slate-400 font-mono text-[9px]">
                {reportsVal.unreferencedIds.map(id => (
                  <div key={id} className="hover:text-amber-400 cursor-pointer">{id}</div>
                ))}
                {reportsVal.unreferencedIds.length === 0 && <div className="text-slate-500 italic">None</div>}
              </div>
            </div>

            <div className="space-y-1.5 bg-slate-950/30 p-2.5 rounded-xl border border-slate-850/50">
              <span className="text-[9px] text-slate-500 font-bold block">{isArabic ? 'ينقصها نسب/نص تعريفي:' : 'Missing Lineage/Bio:'}</span>
              <div className="max-h-[100px] overflow-y-auto space-y-1 text-slate-400 font-mono text-[9px]">
                {reportsVal.incompleteIds.map(id => (
                  <div key={id} className="hover:text-amber-400 cursor-pointer">{id}</div>
                ))}
                {reportsVal.incompleteIds.length === 0 && <div className="text-slate-500 italic">None</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Duplicates merging system */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
        <h4 className="text-xs font-bold text-slate-200">
          {isArabic ? 'دمج صحابيين وتجميع الحقول والمحفوظات' : 'Trigger Professional Record Merges'}
        </h4>

        <form onSubmit={handleMerge} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">
                {isArabic ? 'الصحابي المكرر المراد حذفه (سجل مكرر يمتص منه)' : 'Source Duplicate (Record to REMOVE)'}
              </label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-xl focus:border-amber-500 focus:outline-none"
              >
                <option value="">{isArabic ? '-- اختر الصحابي للتصفية --' : '-- Choose Duplicate Companion --'}</option>
                {companions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameEn} ({isArabic ? c.nameAr : c.cityEn}) [{c.id}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">
                {isArabic ? 'الصحابي الأساسي المعتمد (سجل الحفظ الدائم)' : 'Target Master keeper (Record to KEEP)'}
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-xl focus:border-amber-500 focus:outline-none"
              >
                <option value="">{isArabic ? '-- اختر الصحابي الحافظ --' : '-- Choose Keeper Companion --'}</option>
                {companions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameEn} ({isArabic ? c.nameAr : c.cityEn}) [{c.id}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Merge rules checkboxes */}
          <div className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl space-y-2.5">
            <div className="text-[10px] text-slate-400 font-bold block">
              {isArabic ? 'تجميع المحفوظات والعلاقات وضم حقول السجل المحذوف لصحاب السجل الحافظ:' : 'Specify fields to compile and inherit onto the Master keeper:'}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-350">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mergeFields.battles}
                  onChange={(e) => setMergeFields({ ...mergeFields, battles: e.target.checked })}
                />
                <span>{isArabic ? 'المعارك والأحداث' : 'Battles & events'}</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mergeFields.titles}
                  onChange={(e) => setMergeFields({ ...mergeFields, titles: e.target.checked })}
                />
                <span>{isArabic ? 'الألقاب والكنى' : 'Titles & kunyas'}</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mergeFields.sources}
                  onChange={(e) => setMergeFields({ ...mergeFields, sources: e.target.checked })}
                />
                <span>{isArabic ? 'المصادر والمراجع' : 'References lists'}</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mergeFields.teachers}
                  onChange={(e) => setMergeFields({ ...mergeFields, teachers: e.target.checked })}
                />
                <span>{isArabic ? 'الشيوخ والتلاميذ' : 'Teachers & students'}</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <span className="text-[10px] text-slate-500 leading-relaxed max-w-md">
              {isArabic
                ? 'ملاحظة: سيتم دمج كافة حواف وعلاقات المصاهرة والقرابة في السجل المعتمد بشكل كامل تلقائياً.'
                : 'All relationships, network edges, and companion links will be re-routed to point safely to keeper.'}
            </span>

            {isReviewerOrSuper ? (
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-extrabold px-5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1 flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isArabic ? 'دمج الصحابة المكررين' : 'Trigger De-duplicate merging'}</span>
              </button>
            ) : (
              <span className="text-[10px] text-slate-550 italic bg-slate-950/40 p-2 rounded">
                {isArabic ? 'المراجعة والدمج متاحة لـ Super Admin' : 'Reviewer or higher is required.'}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
