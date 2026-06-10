/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Upload, ShieldAlert, FileText, CheckCircle, HelpCircle } from 'lucide-react';

interface AdminImportExportProps {
  token: string;
  userRole: string;
  isArabic: boolean;
  onRefreshAll: () => void;
}

export default function AdminImportExport({ token, userRole, isArabic, onRefreshAll }: AdminImportExportProps) {
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [dataText, setDataText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isReviewerOrSuper = userRole === 'Super Admin' || userRole === 'Reviewer';

  const handleExport = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const str = JSON.stringify(data, null, 2);
        const blob = new Blob([str], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sahaba-explorer-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setSuccess(isArabic ? 'تم تصدير نسخة قاعدة البيانات بنجاح في ملف JSON.' : 'Database exported successfully.');
      } else {
        setError('Export failed.');
      }
    } catch (e) {
      console.error(e);
      setError('Connection failed.');
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataText.trim()) {
      setError(isArabic ? 'الرجاء لصق البيانات المطلوبة في الحقل المخصص.' : 'Please paste CSV or JSON data details.');
      return;
    }

    if (!window.confirm(isArabic ? 'هل أنت متأكد من رغبتك في استيراد هذه النسخة للتعديل؟ هذا التغيير مباشر وسيتم تطبيقه على قاعدة البيانات.' : 'Proceeding will modify the active database. Continue?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ format, data: dataText })
      });

      if (res.ok) {
        const d = await res.json();
        setSuccess(
          isArabic
            ? `تم استيراد النسخة بنجاح! تم تسجيل وتحديث ${d.companionsAdded || 0} صحابة جديد.`
            : `Imported successfully! Integrated ${d.companionsAdded || 0} companions.`
        );
        setDataText('');
        onRefreshAll();
      } else {
        const d = await res.json();
        setError(d.error || 'Import parsed failed.');
      }
    } catch (e: any) {
      console.error(e);
      setError('Connection failure: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.csv')) {
      setFormat('csv');
    } else {
      setFormat('json');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setDataText(event.target?.result as string || '');
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
            <Download className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              {isArabic ? 'استيراد وتصدير قاعدة بيانات المخطط' : 'Import & Export Database'}
            </h3>
            <p className="text-[10px] text-slate-450">
              {isArabic ? 'إدارة وتصدير النسخ الإحتياطية الكلية وصيانة السجلات المتكاملة' : 'Export JSON models, restore tables, upload CSV formats'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/25 border border-red-950/40 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-950/25 border border-emerald-950/40 text-emerald-400 p-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Export Column */}
        <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-1.5 text-xs text-slate-350">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-amber-500" />
              <span>{isArabic ? 'تنزيل نسخة احتياطية (JSON)' : 'Database Registry backup'}</span>
            </h4>
            <p className="leading-relaxed text-[11px] text-slate-450">
              {isArabic
                ? 'قم بتنزيل كافة بيانات الصحابة، العلاقات، السجلات ومقترحات المراجعة وسجل العمليات في ملف JSON واحد متكامل.'
                : 'Download all companions, social network relations, workflow suggestions, and user accounts in a single, comprehensive JSON file.'}
            </p>
          </div>

          <button
            onClick={handleExport}
            className="w-full bg-slate-950 hover:bg-slate-900 text-slate-200 border border-slate-800 hover:border-slate-700 py-2.5 rounded-xl font-bold transition text-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>{isArabic ? 'تحميل ملف JSON الاحتياطي' : 'Request Registry JSON backup'}</span>
          </button>
        </div>

        {/* CSV/Excel Template Help column */}
        <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl space-y-3 text-xs text-slate-350">
          <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>{isArabic ? 'دليل وبنية ملفات الاستيراد' : 'Registry Schema guidelines'}</span>
          </h4>
          <p className="text-[11px] text-slate-450 leading-relaxed">
            {isArabic
              ? 'صيغة الاستيراد تدعم JSON الاحتياطي الكلاسيكي، أو ملفات جداول البيانات (CSV).'
              : 'Our parser reads database structured backups (JSON) or direct raw spreadsheet logs (CSV/Excel).'}
          </p>

          <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[9px] text-slate-450 overflow-x-auto leading-relaxed border border-slate-850">
            {isArabic ? '# ترويسة ملف CSV النموذجي:' : '# Expected CSV Headers:'}
            <br />
            id,nameAr,nameEn,kunyaAr,kunyaEn,lineageAr,lineageEn,birthYearAH,deathYearAH,category,cityAr,cityEn,hadithCount,shortBioAr,shortBioEn,gender
          </div>

          <p className="text-[10px] text-slate-500">
            {isArabic ? 'يسهم استيراد CSV في توليد السجلات دفعة واحدة.' : 'Importing spreadsheet records will bulk overwrite matching IDs and generate brand new ones.'}
          </p>
        </div>

        {/* File Select Upload column */}
        <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-1.5 text-xs text-slate-350">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-500" />
              <span>{isArabic ? 'مستكشف الملفات' : 'Bulk spreadsheet trigger'}</span>
            </h4>
            <p className="leading-relaxed text-[11px] text-slate-450">
              {isArabic ? 'اختر ملف CSV أو JSON مباشرة من جهازك وعبيء المخرجات تلقائياً.' : 'Optionally trigger direct CSV or JSON document paths to autofill the structural text field below.'}
            </p>
          </div>

          <div className="relative">
            <input
              type="file"
              accept=".json,.csv"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-full bg-slate-950 hover:bg-slate-950/80 border border-dashed border-slate-800 text-slate-400 py-3 rounded-xl text-center text-[10px] font-semibold transition flex flex-col items-center justify-center gap-1">
              <Upload className="w-4 h-4 text-slate-500" />
              <span>{isArabic ? 'اختر أو اسحب ملفاً (CSV/JSON)' : 'Drag and drop file here'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Import Form */}
      <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-5 space-y-3">
        <h4 className="font-bold text-xs text-slate-200">
          {isArabic ? 'تجهيز وحقن المفرش والنسخة في قاعدة البيانات' : 'Structural Text Import Formulator'}
        </h4>

        <form onSubmit={handleImportSubmit} className="space-y-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-medium">{isArabic ? 'صيغة البيانات المراد استيرادها:' : 'Format selector:'}</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  checked={format === 'json'}
                  onChange={() => setFormat('json')}
                />
                <span className="font-mono">JSON</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  checked={format === 'csv'}
                  onChange={() => setFormat('csv')}
                />
                <span className="font-mono">CSV</span>
              </label>
            </div>
          </div>

          <div>
            <textarea
              rows={8}
              value={dataText}
              onChange={(e) => setDataText(e.target.value)}
              placeholder={
                format === 'json'
                  ? '{\n  "companions": [\n    { "id": "abu_bakr", "nameAr": "أبو بكر الصديق", "nameEn": "Abu Bakr" }\n  ]\n}'
                  : 'id,nameAr,nameEn,category,gender\nabu_bakr,أبو بكر الصديق,Abu Bakr,Al-Khulafa,Male'
              }
              className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl text-[10px] font-mono text-slate-350 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-950 pt-3">
            <span className="text-[10px] text-slate-500">
              {isArabic ? 'يرجى مراجعة الصلاحية قبل النشر.' : 'Importing replaces duplicate keys and creates non-existing ones.'}
            </span>

            {isReviewerOrSuper ? (
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-extrabold px-6 py-2.5 rounded-xl transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent animate-spin rounded-full" />
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'بدء المعالجة والاستيراد الفوري' : 'Compile & Inject into Database'}</span>
                  </>
                )}
              </button>
            ) : (
              <span className="text-[10px] text-slate-550 italic bg-slate-950/40 p-2 rounded">
                {isArabic ? 'المراجعة والاستيراد متاحة لـ Reviewer أو أعلى' : 'Reviewer or higher account authority required.'}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
