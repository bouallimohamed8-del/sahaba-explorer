/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Users, Trash2, Key, Shield, ShieldAlert, CheckCircle, RefreshCw, Plus } from 'lucide-react';

interface AdminUser {
  email: string;
  name: string;
  role: string;
}

interface AdminUsersProps {
  token: string;
  userRole: string;
  isArabic: boolean;
}

export default function AdminUsers({ token, userRole, isArabic }: AdminUsersProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [formRole, setFormRole] = useState('Editor');

  const isSuperAdmin = userRole === 'Super Admin';

  const fetchUsers = async () => {
    if (!token || userRole !== 'Super Admin') return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        setUsers(d);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token, userRole]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name || !formRole) {
      setError(isArabic ? 'الرجاء تعبئة كافة الحقول.' : 'Please fill all fields.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, password, name, role: formRole })
      });

      if (res.ok) {
        setSuccess(isArabic ? 'تم إضافة المستخدم الإداري بنجاح.' : 'Admin collaborator registered successfully.');
        setEmail('');
        setPassword('');
        setName('');
        fetchUsers();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to create user.');
      }
    } catch (e) {
      console.error(e);
      setError('Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userEmail: string) => {
    if (userEmail.toLowerCase() === 'superadmin@sahaba.org') {
      setError(isArabic ? 'حساب التأسيس الرئيسي محمي ولا يمكن حذفه.' : 'Bootstrap Super Admin account is system-protected.');
      return;
    }

    if (!window.confirm(isArabic ? `هل أنت متأكد من رغبتك بحذف المشرف ${userEmail}؟` : `Are you sure you want to unregister collaborator ${userEmail}?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setSuccess(isArabic ? 'تم إزالة حساب المشرف بنجاح.' : 'Collaborator removed successfully.');
        fetchUsers();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to delete user.');
      }
    } catch (e) {
      console.error(e);
      setError('Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-2xl text-xs text-red-400 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 flex-shrink-0" />
        <span>
          {isArabic
            ? 'غير مصرح للوصول. هذا القسم متاح حصرياً لحسابات Super Admin فقط.'
            : 'Access restricted! Collaboration manager is exclusively reserved for Super Admin accounts.'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              {isArabic ? 'إدارة حسابات المشرفين والمدققين' : 'Collaborators Directory'}
            </h3>
            <p className="text-[10px] text-slate-450">
              {isArabic ? 'تعديل الصلاحيات وإدارة أدوار المنظومة (المشرفين العامين والمحررين والمدققين)' : 'Manage administration credentials, define user roles, restrict access'}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Create Form */}
        <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl space-y-4 h-fit">
          <h4 className="font-bold text-xs text-slate-200 flex items-center gap-1.5 border-b border-slate-950 pb-2">
            <Plus className="w-4 h-4 text-amber-500" />
            <span>{isArabic ? 'التسجيل وتعيين دور إداري' : 'Add Collaborator'}</span>
          </h4>

          <form onSubmit={handleCreate} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">{isArabic ? 'اسم المشرف' : 'Full Name'}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Seerah Reviewer"
                className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">{isArabic ? 'البريد الإلكتروني' : 'Email Address'}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collaborator@sahaba.org"
                className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">{isArabic ? 'كلمة المرور' : 'Password'}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">{isArabic ? 'دور الصلاحية' : 'Permission Role'}</label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl focus:border-amber-500 focus:outline-none"
              >
                <option value="Super Admin">{isArabic ? 'Super Admin (كامل الصلاحيات الكلية)' : 'Super Admin (Full access)'}</option>
                <option value="Editor">{isArabic ? 'Editor (اقتراحات إدخال وتعديل معلق)' : 'Editor (Pending proposals insert)'}</option>
                <option value="Reviewer">{isArabic ? 'Reviewer (تدقيق جودة واعتماد تكرار)' : 'Reviewer (Validate & Publish)'}</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-extrabold py-2 rounded-xl transition cursor-pointer active:scale-95"
            >
              {isArabic ? 'إضافة وتثبيت الحساب' : 'Register Account'}
            </button>
          </form>
        </div>

        {/* Users List */}
        <div className="bg-slate-900/25 border border-slate-850 p-5 rounded-2xl lg:col-span-2 space-y-4">
          <h4 className="font-bold text-xs text-slate-200 flex items-center justify-between border-b border-slate-950 pb-2">
            <span>{isArabic ? 'فهرس المشرفين المسجلين' : 'Authorized Personnel List'}</span>
            <span className="text-[10px] text-slate-450 font-semibold">{users.length} Account(s)</span>
          </h4>

          {loading && users.length === 0 ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto max-h-[350px] pr-1">
              {users.map((u) => (
                <div
                  key={u.email}
                  className="bg-slate-950/40 border border-slate-850/60 p-3 rounded-xl flex items-center justify-between gap-4 text-xs hover:border-slate-800 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{u.name}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          u.role === 'Super Admin'
                            ? 'bg-red-950/20 text-red-400 border border-red-900/20'
                            : u.role === 'Reviewer'
                            ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/20'
                            : 'bg-cyan-950/20 text-cyan-400 border border-cyan-900/20'
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{u.email}</div>
                  </div>

                  {u.email.toLowerCase() !== 'superadmin@sahaba.org' ? (
                    <button
                      onClick={() => handleDelete(u.email)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950/30 text-slate-400 hover:text-red-400 border border-slate-850 hover:border-red-900/30 transition cursor-pointer"
                      title="Revoke access"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[9px] text-amber-500 italic font-bold select-none px-2 py-0.5 bg-amber-500/5 rounded">
                      {isArabic ? 'مؤسس المنظومة' : 'Bootstrap Root'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
