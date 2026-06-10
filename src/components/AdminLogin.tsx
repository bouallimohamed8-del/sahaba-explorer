/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, ShieldAlert, Key, HelpCircle } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (token: string, user: { email: string; name: string; role: string }) => void;
  isArabic: boolean;
}

export default function AdminLogin({ onLoginSuccess, isArabic }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(isArabic ? 'الرجاء كتابة البريد الإلكتروني وكلمة المرور.' : 'Please enter email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        onLoginSuccess(data.token, data.user);
      } else {
        const data = await res.json();
        setError(data.error || (isArabic ? 'بريد إلكتروني أو كلمة مرور غير صحيحة.' : 'Invalid email or password.'));
      }
    } catch (e) {
      console.error(e);
      setError(isArabic ? 'تعذر الاتصال بخادم المصادقة.' : 'Failed to reach the authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="bg-slate-900 border border-slate-850 rounded-3xl p-8 shadow-xl text-slate-100 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-amber-500 to-cyan-500 opacity-60 rounded-full blur-sm" />

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-550/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-amber-500" />
          </div>
          <h2 className="text-lg font-serif font-bold text-slate-100">
            {isArabic ? 'بوابة دخول إدارة الموسوعة' : 'Sahaba Registry Portal Login'}
          </h2>
          <p className="text-xs text-slate-450 mt-1">
            {isArabic ? 'أدخل بيانات الاعتماد للمتابعة والمراجعة' : 'Enter authorized credentials to proceed'}
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-950/25 border border-red-950/40 text-red-400 p-3 rounded-xl text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sahaba.org"
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-amber-500 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              {isArabic ? 'كلمة المرور' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-amber-500 focus:outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-extrabold py-2.5 rounded-xl transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent animate-spin rounded-full" />
            ) : (
              <>
                <Key className="w-3.5 h-3.5" />
                <span>{isArabic ? 'تسجيل الدخول الآمن' : 'Authenticate Secure Session'}</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Roles Guide */}
        <div className="mt-6 border-t border-slate-850 pt-4">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-full text-center text-[10px] text-slate-450 hover:text-amber-500 transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{isArabic ? 'ملاحظة: حسابات وبوابات المراجعة التجريبية' : 'Demo accounts and role guides'}</span>
          </button>

          {showGuide && (
            <div className="mt-3 bg-slate-950/40 border border-slate-850 p-3 rounded-xl text-[10px] text-slate-400 space-y-2 leading-relaxed">
              <p>
                {isArabic
                  ? 'يمكنك استخدام هذه الحسابات الافتراضية لاختبار الصلاحيات وبنية الموافقة المتدرجة:'
                  : 'You can test the system role scopes with these default accounts:'}
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                <div>
                  <strong className="text-amber-400 font-mono">Super Admin:</strong>
                  <div className="font-mono text-[9px] text-slate-450">superadmin@sahaba.org / admin123</div>
                  <div className="text-[9px] text-slate-500">
                    {isArabic ? 'صلاحية كاملة وإدارة المشرفين وتصدير النسخ.' : 'Full access, manage users, backups, direct publishing.'}
                  </div>
                </div>
                <div>
                  <strong className="text-cyan-400 font-mono">Editor:</strong>
                  <div className="font-mono text-[9px] text-slate-450">editor@sahaba.org / editor123</div>
                  <div className="text-[9px] text-slate-500">
                    {isArabic ? 'اقتراح إضافات وتعديلات تظل "قيد المراجعة" حتى يتم اعتمادها.' : 'Suggest additions/edits. Stored "Pending Review" until approved.'}
                  </div>
                </div>
                <div>
                  <strong className="text-emerald-400 font-mono">Reviewer:</strong>
                  <div className="font-mono text-[9px] text-slate-450">reviewer@sahaba.org / reviewer123</div>
                  <div className="text-[9px] text-slate-500">
                    {isArabic ? 'مراجعة طلبات المحررين والموافقة أو الرفض وتجفيف التكرار.' : 'Review proposals, approve/reject edits, merge duplicate rows.'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
