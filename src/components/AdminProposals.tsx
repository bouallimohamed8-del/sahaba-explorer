/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClipboardCheck, Check, X, ShieldAlert, ArrowRight, User, Calendar, FileText } from 'lucide-react';

interface Proposal {
  id: string;
  type: string;
  editorEmail: string;
  editorName: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  itemId?: string;
  previousValue?: any;
  newValue?: any;
  reason: string;
  approverName?: string;
  approvedAt?: string;
}

interface AdminProposalsProps {
  proposals: Proposal[];
  token: string;
  userRole: string;
  isArabic: boolean;
  onRefresh: () => void;
}

export default function AdminProposals({ proposals, token, userRole, isArabic, onRefresh }: AdminProposalsProps) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isReviewerOrSuper = userRole === 'Super Admin' || userRole === 'Reviewer';

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/pending/${id}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setSuccess(
          isArabic
            ? `تم بنجاح ${action === 'approve' ? 'اعتماد' : 'رفض'} التعديل المقترح الحزمة.`
            : `Successfully ${action === 'approve' ? 'approved' : 'rejected'} proposal.`
        );
        onRefresh();
      } else {
        const d = await res.json();
        setError(d.error || 'Operation failed.');
      }
    } catch (e) {
      console.error(e);
      setError('Connection failure.');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingList = proposals.filter((p) => p.status === 'pending');
  const pastList = proposals.filter((p) => p.status !== 'pending');

  const renderDiff = (prop: Proposal) => {
    const prev = prop.previousValue || {};
    const next = prop.newValue || {};

    // Get all unique keys from both previous and new values, ignoring system IDs
    const allKeys = Array.from(new Set([...Object.keys(prev), ...Object.keys(next)]))
      .filter((k) => k !== 'id' && typeof prev[k] !== 'object' && typeof next[k] !== 'object');

    if (prop.type === 'delete_companion') {
      return (
        <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-3 text-red-400">
          {isArabic 
            ? `طلب حذف الصحابي: ${prev.nameAr || prev.nameEn} (${prop.itemId})` 
            : `Request to delete Companion: ${prev.nameAr || prev.nameEn || prop.itemId}`}
        </div>
      );
    }

    if (allKeys.length === 0) {
      return (
        <span className="text-slate-400 italic">
          {isArabic ? 'إنشاء سجل متكامل وجديد بالكامل' : 'Brand new record insertion.'}
        </span>
      );
    }

    return (
      <div className="space-y-1.5 mt-2 overflow-x-auto">
        <table className="w-full text-[11px] text-slate-350 border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-left">
              <th className="py-1 text-right">{isArabic ? 'الحقل' : 'Field'}</th>
              <th className="py-1 px-2">{isArabic ? 'القيمة القديمة' : 'Previous Value'}</th>
              <th className="py-1 px-2">{isArabic ? 'القيمة المقترحة' : 'Proposed Value'}</th>
            </tr>
          </thead>
          <tbody>
            {allKeys.map((k) => {
              const pv = prev[k] !== undefined ? String(prev[k]) : '—';
              const nv = next[k] !== undefined ? String(next[k]) : '—';
              const changed = pv !== nv;

              if (!changed) return null; // only show changed fields to save screen space

              return (
                <tr key={k} className="border-b border-slate-900/40 hover:bg-slate-950/20">
                  <td className="py-1.5 font-semibold text-amber-500/80 pr-2">{k}</td>
                  <td className="py-1.5 px-2 line-through text-red-400/80 max-w-[200px] overflow-hidden truncate">{pv}</td>
                  <td className="py-1.5 px-2 text-emerald-400 font-medium max-w-[200px] overflow-hidden truncate bg-emerald-500/5">{nv}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
            <ClipboardCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              {isArabic ? 'نظام مراجعة وتدقيق التعديلات' : 'Suggested Modifications Proposals'}
            </h3>
            <p className="text-[10px] text-slate-450">
              {isArabic ? 'صلاحيات لاعتماد التوصيفات وتوثيق السير' : 'Editor suggestions, version history logs'}
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-slate-850 px-2.5 py-1 rounded-full text-slate-400 font-semibold">
          {isArabic ? `${pendingList.length} في الانتظار` : `${pendingList.length} Pending`}
        </span>
      </div>

      {error && (
        <div className="bg-red-950/25 border border-red-950/40 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-950/25 border border-emerald-950/40 text-emerald-400 p-3 rounded-xl text-xs flex items-center gap-2 animate-pulse">
          <Check className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      {/* Pending proposals list */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-amber-500 flex items-center gap-1.5 uppercase tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
          {isArabic ? 'طلبات قيد المراجعة والمطابقة' : 'Pending Approvals Queue'}
        </h4>

        {pendingList.length === 0 ? (
          <div className="bg-slate-950/50 border border-slate-900 border-dashed rounded-2xl p-6 text-center text-xs text-slate-450">
            {isArabic ? 'لا توجد طلبات تعديل معلقة حالياً.' : 'Clear! No pending proposals found.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingList.map((prop) => (
              <div
                key={prop.id}
                className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 text-xs transition hover:border-slate-800 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-950 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="capitalize px-2 py-0.5 rounded bg-slate-950 text-amber-400 font-mono text-[9px] border border-slate-850">
                      {prop.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {prop.id}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-450 text-[10px]">
                    <User className="w-3 h-3 text-cyan-550" />
                    <span className="font-semibold text-slate-350">{prop.editorName}</span>
                    <span className="font-mono text-[9px]">({prop.editorEmail})</span>
                  </div>
                </div>

                <div className="space-y-1 bg-slate-950/40 p-3 rounded-xl border border-slate-850/50">
                  <div className="text-[10px] text-slate-500 font-semibold">{isArabic ? 'تقرير التحيز ومبرر التعديل:' : 'Source references & rationale:'}</div>
                  <p className="text-slate-300 italic text-[11px] leading-relaxed">"{prop.reason}"</p>
                </div>

                {/* Side-by-side properties comparative view */}
                <div className="bg-slate-950/20 p-3 rounded-xl border border-slate-850/40">
                  <div className="text-[10px] text-slate-500 font-semibold mb-2">{isArabic ? 'بيان الفروقات والمقارنة:' : 'Visual Differences comparator:'}</div>
                  {renderDiff(prop)}
                </div>

                {/* Actions bottom row */}
                <div className="flex items-center justify-between border-t border-slate-950 pt-3">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(prop.timestamp).toLocaleString()}
                  </span>

                  <div className="flex items-center gap-2">
                    {isReviewerOrSuper ? (
                      <>
                        <button
                          onClick={() => handleAction(prop.id, 'reject')}
                          disabled={processingId !== null}
                          className="bg-red-950/40 hover:bg-red-900 border border-red-900/30 font-bold text-red-400 hover:text-white px-3 py-1 text-[10px] rounded-lg transition cursor-pointer flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          <span>{isArabic ? 'رفض' : 'Reject'}</span>
                        </button>
                        <button
                          onClick={() => handleAction(prop.id, 'approve')}
                          disabled={processingId !== null}
                          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold px-3.5 py-1 text-[10px] rounded-lg transition cursor-pointer flex items-center gap-1 active:scale-95"
                        >
                          <Check className="w-3 h-3" />
                          <span>{isArabic ? 'اعتماد ونشر' : 'Approve & Publish'}</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic bg-slate-950 p-2 rounded">
                        {isArabic ? 'يتطلب موافقة Super Admin أو Reviewer' : 'Awaiting Reviewer authority approval'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical logs tracking */}
      <div className="space-y-3 pt-4 border-t border-slate-850">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
          {isArabic ? 'سجل العمليات السابقة والأرشيف' : 'Decision Archive & History'}
        </h4>

        {pastList.length === 0 ? (
          <div className="text-center text-xs text-slate-500 bg-slate-950/20 p-4 rounded-xl border border-slate-850 border-dashed">
            {isArabic ? 'لا توجد قرارات مؤرشفة سابقة.' : 'No archive records of previous rulings found.'}
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {pastList.map((prop) => (
              <div
                key={prop.id}
                className="bg-slate-950/45 border border-slate-850/60 rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="capitalize font-mono text-[9px] font-bold text-slate-400">
                      {prop.type.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        prop.status === 'approved' ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/30' : 'bg-red-950/20 text-red-400 border border-red-900/30'
                      }`}
                    >
                      {prop.status === 'approved' ? (isArabic ? 'معتمد' : 'Approved') : (isArabic ? 'مرفوض' : 'Rejected')}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-450">
                    <span>{prop.editorName}</span> • <span>{isArabic ? 'المسوّغ' : 'Rationale'}: "{prop.reason}"</span>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-450 font-mono">
                  <div>{prop.approvedAt ? new Date(prop.approvedAt).toLocaleDateString() : new Date(prop.timestamp).toLocaleDateString()}</div>
                  <div className="text-[9px] text-slate-500 font-semibold">By: {prop.approverName || 'System'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
