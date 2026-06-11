/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../context/AuthContext';
import { Search, ShieldAlert, CheckCircle, RefreshCw, UserCheck, UserX, Trash2, ArrowUpDown, Shield } from 'lucide-react';

interface FirebaseUsersManagerProps {
  isArabic: boolean;
  isDarkMode: boolean;
  currentUserUid?: string;
}

export default function FirebaseUsersManager({ isArabic, isDarkMode, currentUserUid }: FirebaseUsersManagerProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Real-time listener for Firestore Users
  useEffect(() => {
    setLoading(true);
    setError(null);
    const usersCollectionRef = collection(db, 'users');
    const q = query(usersCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList: UserProfile[] = [];
      snapshot.forEach((doc) => {
        usersList.push(doc.data() as UserProfile);
      });
      setUsers(usersList);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError(
        isArabic
          ? 'فشل جلب المستخدمين من قاعدة البيانات. يرجى التأكد من صلاحيات المشرف.'
          : 'Failed to retrieve users. Ensure you have administrator privileges.'
      );
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isArabic]);

  // Handle role transition
  const handleToggleRole = async (targetUser: UserProfile) => {
    if (targetUser.uid === currentUserUid) {
      setError(isArabic ? 'عذراً، لا يمكنك سحب رتبة المشرف من حسابك الحالي.' : 'Sorry, you cannot demote yourself.');
      return;
    }

    // Protect bootstrap account
    if (targetUser.email === 'bouallimohamed8@gmail.com') {
      setError(isArabic ? 'حساب التأسيس الرئيسي محمي ولا يمكن المساس بصلاحياته.' : 'Bootstrap root account is system-protected.');
      return;
    }

    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
    setError(null);
    setSuccess(null);

    try {
      const userDocRef = doc(db, 'users', targetUser.uid);
      await updateDoc(userDocRef, { role: nextRole });
      setSuccess(
        isArabic
          ? `تم تحديث رتبة ${targetUser.fullName} إلى ${nextRole === 'admin' ? 'مشرف' : 'مستخدم عادي'}.`
          : `Success! Role for ${targetUser.fullName} updated to ${nextRole}.`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${targetUser.uid}`);
    }
  };

  // Handle suspension/disabling
  const handleToggleDisabled = async (targetUser: UserProfile) => {
    if (targetUser.uid === currentUserUid) {
      setError(isArabic ? 'لا يمكنك حظر أو تجميد حسابك الحالي.' : 'You cannot suspend your own account.');
      return;
    }

    // Protect bootstrap account
    if (targetUser.email === 'bouallimohamed8@gmail.com') {
      setError(isArabic ? 'لا يمكن حظر حساب التأسيس الرئيسي.' : 'Bootstrap root account cannot be suspended.');
      return;
    }

    const nextStatus = !targetUser.disabled;
    setError(null);
    setSuccess(null);

    const confirmationText = nextStatus
      ? (isArabic ? `هل تريد فعلاً تجميد حساب ${targetUser.fullName}؟` : `Are you sure you want to suspend default access for ${targetUser.fullName}?`)
      : (isArabic ? `هل تريد إلغاء تجميد حساب ${targetUser.fullName}؟` : `Are you sure you want to reactivate access for ${targetUser.fullName}?`);

    if (!window.confirm(confirmationText)) return;

    try {
      const userDocRef = doc(db, 'users', targetUser.uid);
      await updateDoc(userDocRef, { disabled: nextStatus });
      setSuccess(
        isArabic
          ? `تم ${nextStatus ? 'حظر وتجميد' : 'إعادة تنشيط'} حساب ${targetUser.fullName} بنجاح.`
          : `Successfully ${nextStatus ? 'suspended' : 'reactivated'} account of ${targetUser.fullName}.`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${targetUser.uid}`);
    }
  };

  // Handle physical deletion of registry
  const handleDeleteUser = async (targetUser: UserProfile) => {
    if (targetUser.uid === currentUserUid) {
      setError(isArabic ? 'لا يمكنك حذف سيرة حسابك الفاعل حالياً.' : 'You cannot delete your own account registry.');
      return;
    }

    if (targetUser.email === 'bouallimohamed8@gmail.com') {
      setError(isArabic ? 'لا يمكن حذف حساب التأسيس الرئيسي.' : 'Bootstrap root account cannot be deleted.');
      return;
    }

    setError(null);
    setSuccess(null);

    const question = isArabic
      ? `هل أنت متأكد من حذف مستند العضوية لـ ${targetUser.fullName}؟ سيتم حذف بيانات بروفايله من فيرستور.`
      : `Are you completely sure you want to delete profile document for ${targetUser.fullName} from Firestore?`;

    if (!window.confirm(question)) return;

    try {
      const userDocRef = doc(db, 'users', targetUser.uid);
      await deleteDoc(userDocRef);
      setSuccess(
        isArabic
          ? `تم حذف سجل المستخدم ${targetUser.fullName} من قاعدة البيانات.`
          : `Successfully deleted profile document for ${targetUser.fullName}.`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${targetUser.uid}`);
    }
  };

  // Filtered lists
  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.uid.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Alert panels */}
      {error && (
        <div className="bg-red-500/5 border border-red-500/15 text-red-500 p-4 rounded-2xl text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="font-sans leading-relaxed">{error}</div>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/5 border border-emerald-500/15 text-emerald-600 p-4 rounded-2xl text-xs flex items-start gap-2.5">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
          <div className="font-sans leading-relaxed">{success}</div>
        </div>
      )}

      {/* Control bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-natural-accent/15 pb-4">
        <div>
          <h3 className="text-sm font-bold text-natural-brand font-serif">
            {isArabic ? 'إدارة أعضاء ومستخدمي المنصة الكلية' : 'Ecosystem User Registry'}
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5 font-sans">
            {isArabic
              ? 'تفعيل وتجميد حسابات الدخول، تعديل الأدوار ومنح رتب المدققين والمشرفين للمستخدمين المسجلين'
              : 'Monitor user profiles, toggle active status, delegate roles, revoke credentials'}
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder={isArabic ? 'ابحث عبر الاسم، البريد، أو الرتبة...' : 'Filter/search by email, name, role...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full text-xs font-sans border rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-natural-brand transition ${
              isDarkMode 
                ? 'bg-natural-dark-bg border-neutral-750 text-slate-200' 
                : 'bg-white border-natural-accent/40 text-natural-text'
            }`}
          />
          <Search className={`absolute top-2.5 w-3.5 h-3.5 ${isArabic ? 'left-3' : 'right-3'} text-gray-400`} />
        </div>
      </div>

      {loading && users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-xs text-natural-brand/70 font-sans">
          <RefreshCw className="w-6 h-6 animate-spin text-natural-accent" />
          <span>{isArabic ? 'جاري جلب قائمة الأعضاء التفاعلية...' : 'Querying Firestore directory profiles...'}</span>
        </div>
      ) : (
        <div className={`border rounded-2xl overflow-hidden shadow-sm transition ${
          isDarkMode ? 'border-neutral-800 bg-natural-dark-panel/40' : 'border-natural-accent/20 bg-white/40'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right md:text-right border-collapse">
              <thead className={`text-[10px] uppercase font-bold text-natural-brand border-b ${
                isDarkMode ? 'bg-natural-dark-header border-neutral-800' : 'bg-natural-accent/10 border-natural-accent/20'
              }`}>
                <tr>
                  <th className="p-3 text-center w-12">#</th>
                  <th className="p-3">{isArabic ? 'الاسم والعضو' : 'User profile name'}</th>
                  <th className="p-3">{isArabic ? 'البريد الإلكتروني' : 'Secure email'}</th>
                  <th className="p-3 text-center">{isArabic ? 'تاريخ التسجيل' : 'Registered date'}</th>
                  <th className="p-3 text-center">{isArabic ? 'رتبة الصلاحية' : 'Privilege role'}</th>
                  <th className="p-3 text-center">{isArabic ? 'حالة الحساب' : 'Account state'}</th>
                  <th className="p-3 text-center w-28">{isArabic ? 'إجراءات التحكم' : 'Actions admin'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-natural-accent/10">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500 font-sans">
                      {isArabic ? 'لم يعثر على سجلات مستخدمين مطابقة للبحث.' : 'No matching registered users located.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, index) => (
                    <tr
                      key={u.uid}
                      className={`hover:bg-natural-accent/5 transition duration-150 ${
                        u.disabled 
                          ? (isDarkMode ? 'bg-red-950/5 text-gray-500' : 'bg-red-50/20 text-gray-400') 
                          : ''
                      }`}
                    >
                      {/* Number index */}
                      <td className="p-3 text-center font-mono text-gray-500 font-medium">
                        {index + 1}
                      </td>

                      {/* Photo and FullName */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full border border-natural-accent/20 bg-natural-brand/5 flex items-center justify-center text-xs font-bold font-serif text-natural-brand shrink-0 overflow-hidden">
                            {u.photoURL ? (
                              <img src={u.photoURL} alt={u.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              u.fullName.charAt(0)
                            )}
                          </div>
                          <div>
                            <span className="font-bold block text-natural-brand">{u.fullName}</span>
                            <span className="text-[9px] font-mono text-gray-500 select-all">{u.uid}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="p-3 font-mono" style={{ direction: 'ltr', textAlign: isArabic ? 'right' : 'left' }}>
                        {u.email}
                      </td>

                      {/* Registration Date */}
                      <td className="p-3 text-center font-mono text-[10.5px]">
                        {new Date(u.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      {/* Privilege role */}
                      <td className="p-3 text-center">
                        <span
                          className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full inline-block ${
                            u.role === 'admin'
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          }`}
                        >
                          {u.role === 'admin' ? (isArabic ? 'مشرف عام' : 'Admin') : (isArabic ? 'قارئ ومستكشف' : 'User')}
                        </span>
                      </td>

                      {/* Account status */}
                      <td className="p-3 text-center">
                        <span
                          className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full inline-block ${
                            u.disabled
                              ? 'bg-red-500/15 text-red-500 border border-red-500/20'
                              : 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20'
                          }`}
                        >
                          {u.disabled ? (isArabic ? 'مجمد / محظور' : 'Suspended') : (isArabic ? 'نشط بالتكامل' : 'Active')}
                        </span>
                      </td>

                      {/* Control keys */}
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Toggle role */}
                          <button
                            onClick={() => handleToggleRole(u)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              isDarkMode
                                ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-750 text-amber-500'
                                : 'bg-white border-neutral-300 hover:bg-slate-50 text-amber-600'
                            }`}
                            title={isArabic ? 'تعديل الصلاحيات الممنوحة' : 'Toggle user/admin role'}
                          >
                            <Shield className="w-3.5 h-3.5" />
                          </button>

                          {/* Suspension toggle */}
                          <button
                            onClick={() => handleToggleDisabled(u)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              u.disabled
                                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 hover:bg-emerald-500/20'
                                : 'bg-red-500/10 border-red-500/25 text-red-500 hover:bg-red-500/20'
                            }`}
                            title={u.disabled ? (isArabic ? 'إلغاء حظر الحساب' : 'Reactivate credentials') : (isArabic ? 'حظر وتجميد الحساب' : 'Suspend credentials')}
                          >
                            {u.disabled ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete profile */}
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className={`p-1.5 rounded-lg border hover:bg-rose-500/10 hover:border-rose-500/30 text-gray-500 hover:text-rose-500 transition cursor-pointer ${
                              isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-300'
                            }`}
                            title={isArabic ? 'إزالة مستند العضو من المنصة' : 'Delete user documentary profiles'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
