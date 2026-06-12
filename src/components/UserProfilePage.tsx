/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Companion } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { 
  User as UserIcon, 
  Clock, 
  FileText, 
  Trash2, 
  Edit3, 
  Save, 
  Plus, 
  Search, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Check, 
  X,
  History as HistoryIcon
} from 'lucide-react';

interface UserProfilePageProps {
  allCompanions: Companion[];
  onSelectCompanion: (companion: Companion) => void;
  isArabic: boolean;
  isDarkMode?: boolean;
  onNavigateHome: () => void;
}

interface HistoryItem {
  id: string;
  companionId: string;
  companionNameAr: string;
  companionNameEn: string;
  viewedAt: string;
}

interface NoteItem {
  id: string;
  title?: string;
  content: string;
  companionId?: string;
  companionNameAr?: string;
  companionNameEn?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function UserProfilePage({
  allCompanions,
  onSelectCompanion,
  isArabic,
  isDarkMode = false,
  onNavigateHome
}: UserProfilePageProps) {
  const { user, profile, logout } = useAuth();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'notes'>('profile');
  
  // User profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState(profile?.fullName || '');
  const [profileMessage, setProfileMessage] = useState('');

  // History state
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Notes state
  const [notesList, setNotesList] = useState<NoteItem[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [noteSearchQuery, setNoteSearchQuery] = useState('');
  
  // Create / Edit note form state
  const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCompanionId, setNoteCompanionId] = useState('');

  // Fetch History from subcollection
  const fetchHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    const histPath = `users/${user.uid}/history`;
    try {
      const q = query(collection(db, 'users', user.uid, 'history'), orderBy('viewedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const items: HistoryItem[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          companionId: data.companionId,
          companionNameAr: data.companionNameAr || '',
          companionNameEn: data.companionNameEn || '',
          viewedAt: data.viewedAt,
        });
      });
      setHistoryList(items);
    } catch (e) {
      console.error("Error retrieving history logs: ", e);
      // Suppress full error blocking, just handle safely
    } finally {
      setLoadingHistory(false);
    }
  };

  // Fetch Notes from subcollection
  const fetchNotes = async () => {
    if (!user) return;
    setLoadingNotes(true);
    const notesPath = `users/${user.uid}/notes`;
    try {
      const q = query(collection(db, 'users', user.uid, 'notes'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const items: NoteItem[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          title: data.title,
          content: data.content,
          companionId: data.companionId,
          companionNameAr: data.companionNameAr,
          companionNameEn: data.companionNameEn,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      setNotesList(items);
    } catch (e) {
      console.error("Error retrieving study notes: ", e);
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
      fetchNotes();
      setEditFullName(profile?.fullName || '');
    }
  }, [user, profile]);

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editFullName.trim()) return;
    setProfileMessage('');
    const userDocPath = `users/${user.uid}`;
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        fullName: editFullName.trim()
      });
      setProfileMessage(isArabic ? '✅ تم تحديث الاسم التعريفي بنجاح!' : '✅ Display name updated successfully!');
      setIsEditingProfile(false);
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, userDocPath);
    }
  };

  // Handle Add / Edit Note Submit
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !noteContent.trim()) return;
    const writePath = `users/${user.uid}/notes`;

    const selectedCompanionData = allCompanions.find(c => c.id === noteCompanionId);
    
    try {
      if (editingNoteId) {
        // Edit existing note
        const noteDocRef = doc(db, 'users', user.uid, 'notes', editingNoteId);
        const updatedData = {
          title: noteTitle.trim() || '',
          content: noteContent.trim(),
          companionId: noteCompanionId || null,
          companionNameAr: selectedCompanionData?.nameAr || null,
          companionNameEn: selectedCompanionData?.nameEn || null,
          updatedAt: new Date().toISOString()
        };
        await updateDoc(noteDocRef, updatedData);
        setProfileMessage(isArabic ? '✅ تم تعديل الملاحظة البحثية بنجاح!' : '✅ Research note updated successfully!');
      } else {
        // Save new note
        const notesColRef = collection(db, 'users', user.uid, 'notes');
        const noteId = doc(notesColRef).id; // generate secure unique ID
        const newNoteData = {
          id: noteId,
          userId: user.uid,
          title: noteTitle.trim() || '',
          content: noteContent.trim(),
          companionId: noteCompanionId || null,
          companionNameAr: selectedCompanionData?.nameAr || null,
          companionNameEn: selectedCompanionData?.nameEn || null,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', user.uid, 'notes', noteId), newNoteData);
        setProfileMessage(isArabic ? '✅ تم إضافة الملاحظة البحثية بنجاح!' : '✅ Note added successfully!');
      }
      
      // Reset Note Form variables
      setIsNoteFormOpen(false);
      setEditingNoteId(null);
      setNoteTitle('');
      setNoteContent('');
      setNoteCompanionId('');
      fetchNotes();
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, writePath);
    }
  };

  // Trigger Edit Mode for a Note
  const triggerEditNote = (note: NoteItem) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title || '');
    setNoteContent(note.content);
    setNoteCompanionId(note.companionId || '');
    setIsNoteFormOpen(true);
    setActiveTab('notes');
  };

  // Handle Note Deletion
  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;
    const path = `users/${user.uid}/notes/${noteId}`;
    if (!window.confirm(isArabic ? 'هل تريد بالتأكيد حذف هذه الملاحظة البحثية؟' : 'Are you sure you want to delete this study note?')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'notes', noteId));
      fetchNotes();
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  };

  // Clear single history item
  const handleDeleteHistoryItem = async (histId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const path = `users/${user.uid}/history/${histId}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'history', histId));
      setHistoryList(prev => prev.filter(item => item.id !== histId));
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Filter notes based on noteSearchQuery
  const filteredNotes = notesList.filter(note => {
    if (!noteSearchQuery.trim()) return true;
    const q = noteSearchQuery.toLowerCase();
    const titleMatch = note.title?.toLowerCase().includes(q);
    const contentMatch = note.content.toLowerCase().includes(q);
    const compArMatch = note.companionNameAr?.toLowerCase().includes(q);
    const compEnMatch = note.companionNameEn?.toLowerCase().includes(q);
    return titleMatch || contentMatch || compArMatch || compEnMatch;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Premium Dashboard Title Banner */}
      <div className={`p-6 rounded-[2rem] border relative overflow-hidden transition-all duration-300 shadow-lg ${
        isDarkMode 
          ? 'bg-[#181914] border-[#2F3140] text-slate-100' 
          : 'bg-[#F2ECE0] border-[#DCD5C4] text-[#443825]'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-start" id="premium-avatar-section">
            <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center font-bold text-2xl shadow-md shrink-0 ${
              isDarkMode 
                ? 'bg-[#22231C] border-[#3B3D2C] text-natural-accent' 
                : 'bg-white border-[#D8CEB6] text-natural-brand'
            }`}>
              {profile?.fullName.charAt(0) || <UserIcon className="w-8 h-8" />}
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-natural-brand flex items-center gap-2">
                <span>{isArabic ? 'الملف الشخصي للباحث:' : 'Researcher Profile Dashboard:'}</span>
                <span className="text-natural-accent font-semibold text-lg">{profile?.fullName}</span>
              </h2>
              <p className="text-xs text-stone-500 font-mono mt-0.5">{profile?.email}</p>
              <div className="flex items-center justify-center md:justify-start gap-2.5 mt-2">
                <span className={`text-[10px] uppercase font-mono tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                  profile?.role === 'admin' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-natural-brand/10 text-natural-brand border border-natural-brand/15'
                }`}>
                  ★ {profile?.role === 'admin' ? (isArabic ? 'مشرف المنصة' : 'Admin') : (isArabic ? 'عضو مرخص' : 'Licensed member')}
                </span>
                <span className="text-[10.5px] font-serif text-stone-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-natural-accent" />
                  <span>{isArabic ? 'انضم تاريخ:' : 'Registred at:'}</span>
                  <span className="font-mono">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US') : ''}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onNavigateHome}
              className={`p-2.5 px-4 rounded-xl text-xs font-serif font-bold cursor-pointer transition active:scale-95 shadow flex items-center gap-1.5 ${
                isDarkMode ? 'bg-[#22231C] hover:bg-neutral-800 text-slate-200 border border-[#3E402F]' : 'bg-white hover:bg-[#F2ECE0] text-[#5A4830] border border-[#CFC5AD]'
              }`}
            >
              {isArabic ? '← العودة للمخطط' : '← Back to Map'}
            </button>
          </div>
        </div>

        {/* Global profile action message overlay */}
        {profileMessage && (
          <div className="absolute bottom-2 right-6 bg-green-500/15 border border-green-500/30 text-green-500 text-[11px] px-3 py-1 rounded-lg animate-pulse font-serif font-semibold">
            {profileMessage}
          </div>
        )}
      </div>

      {/* Main layout divider */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Navigation panel */}
        <div id="profile-side-sidebar" className="md:col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full p-3.5 rounded-2xl text-xs font-serif font-bold text-start flex items-center gap-2.5 cursor-pointer transition-all ${
              activeTab === 'profile'
                ? 'bg-natural-brand text-white shadow-md font-extrabold translate-x-1'
                : isDarkMode 
                  ? 'bg-natural-dark-panel/40 hover:bg-neutral-800 text-stone-400 hover:text-white border border-neutral-850'
                  : 'bg-white hover:bg-natural-brand/5 text-natural-text border border-natural-accent/15'
            }`}
          >
            <UserIcon className="w-4 h-4 text-natural-accent" />
            <span>{isArabic ? 'بيانات الحساب الشخصي' : 'Personal Profile Info'}</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`w-full p-3.5 rounded-2xl text-xs font-serif font-bold text-start flex items-center gap-2.5 cursor-pointer transition-all ${
              activeTab === 'notes'
                ? 'bg-natural-brand text-white shadow-md font-extrabold translate-x-1'
                : isDarkMode 
                  ? 'bg-natural-dark-panel/40 hover:bg-neutral-800 text-stone-400 hover:text-white border border-neutral-850'
                  : 'bg-white hover:bg-natural-brand/5 text-natural-text border border-natural-accent/15'
            }`}
          >
            <FileText className="w-4 h-4 text-natural-accent" />
            <span className="flex-1 text-right">{isArabic ? 'حقيبة الملاحظات والفوائد' : 'Study Notes'}</span>
            <span className="text-[10px] bg-natural-accent/15 text-natural-brand px-1.5 rounded-full font-mono">
              {notesList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`w-full p-3.5 rounded-2xl text-xs font-serif font-bold text-start flex items-center gap-2.5 cursor-pointer transition-all ${
              activeTab === 'history'
                ? 'bg-natural-brand text-white shadow-md font-extrabold translate-x-1'
                : isDarkMode 
                  ? 'bg-natural-dark-panel/40 hover:bg-neutral-800 text-stone-400 hover:text-white border border-neutral-850'
                  : 'bg-white hover:bg-natural-brand/5 text-natural-text border border-natural-accent/15'
            }`}
          >
            <HistoryIcon className="w-4 h-4 text-natural-accent" />
            <span className="flex-1 text-right">{isArabic ? 'سجل القراءة والتصفح' : 'Browse History'}</span>
            <span className="text-[10px] bg-natural-accent/15 text-natural-brand px-1.5 rounded-full font-mono">
              {historyList.length}
            </span>
          </button>
        </div>

        {/* Dynamic content work area */}
        <div className="md:col-span-3 space-y-6">

          {/* 1. COMPONENT STATE: PERSONAL DETAILS */}
          {activeTab === 'profile' && (
            <div className={`p-6 rounded-[2rem] border shadow-md space-y-6 ${
              isDarkMode ? 'bg-natural-dark-panel border-neutral-850' : 'bg-white border-[#D8CEB6]/50'
            }`}>
              <h3 className="text-sm font-bold border-b pb-2 mb-4 flex items-center gap-2 uppercase font-serif text-natural-brand border-natural-accent/15">
                <UserIcon className="w-4.5 h-4.5 text-natural-accent" />
                <span>{isArabic ? 'تعديل البيانات الأساسية' : 'Edit Personal Account Details'}</span>
              </h3>

              {!isEditingProfile ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 ${isDarkMode ? 'bg-[#1D1E16]' : 'bg-[#FAF9F5]'}`}>
                    <div>
                      <span className="block text-[10.5px] text-stone-500 font-serif">{isArabic ? 'الاسم المعروض بالمنصة' : 'Display Name'}</span>
                      <strong className="text-sm text-natural-brand font-serif">{profile?.fullName}</strong>
                    </div>
                    <div>
                      <span className="block text-[10.5px] text-stone-500 font-serif">{isArabic ? 'عنوان البريد الإلكتروني (غير قابل للتعديل)' : 'Email address (immutable)'}</span>
                      <strong className="text-sm text-stone-600 font-mono">{profile?.email}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditFullName(profile?.fullName || '');
                      setIsEditingProfile(true);
                    }}
                    className="p-3 bg-natural-brand hover:bg-natural-brand/90 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition shadow"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'تعديل اسم الحساب' : 'Modify Account Name'}</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-natural-brand font-serif">
                      {isArabic ? 'الاسم التعريفي الكامل الجديد:' : 'Enter brand-new full display name:'}
                    </label>
                    <input
                      type="text"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      required
                      placeholder={isArabic ? 'مثال: محمد بن علي الفهري' : 'e.g. Abdullah bin Ali'}
                      className={`w-full border rounded-xl p-2.5 focus:outline-none text-xs transition duration-200 ${
                        isDarkMode ? 'bg-natural-dark-bg border-neutral-750 text-slate-200' : 'bg-white border-natural-accent/40 text-natural-text focus:border-natural-brand'
                      }`}
                    />
                  </div>

                  <div className="flex gap-2 text-xs">
                    <button
                      type="submit"
                      className="bg-natural-brand hover:bg-natural-brand/90 text-white font-bold p-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'حفظ الأسم الجديد' : 'Save Name'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className={`p-2.5 px-3 border rounded-xl cursor-pointer ${
                        isDarkMode ? 'bg-natural-dark-bg border-neutral-700 text-slate-350' : 'bg-stone-50 border-neutral-250 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {isArabic ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 2. COMPONENT STATE: STUDY NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* Note Create/Edit Form (only shown if isNoteFormOpen) */}
              {isNoteFormOpen ? (
                <div className={`p-6 rounded-[2rem] border shadow-md space-y-4 ${
                  isDarkMode ? 'bg-[#1C1D15] border-neutral-800' : 'bg-[#FCFBFA] border-natural-accent/30'
                }`}>
                  <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h3 className="text-sm font-bold flex items-center gap-1.5 uppercase font-serif text-natural-brand">
                      <span>📝</span>
                      <span>
                        {editingNoteId 
                          ? (isArabic ? 'تعديل الفائدة البحثية' : 'Edit Study Note') 
                          : (isArabic ? 'إضافة فائدة كبرى جديدة' : 'Add Prestigious Study Note')}
                      </span>
                    </h3>
                    <button 
                      onClick={() => {
                        setIsNoteFormOpen(false);
                        setEditingNoteId(null);
                        setNoteTitle('');
                        setNoteContent('');
                        setNoteCompanionId('');
                      }} 
                      className="p-1 hover:bg-stone-200 dark:hover:bg-neutral-800 rounded-full cursor-pointer"
                    >
                      <X className="w-4 h-4 text-stone-500" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveNote} id="study-note-form" className="space-y-4">
                    {/* Companion selection anchor */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10.5px] font-bold text-natural-brand mb-1 font-serif">
                          {isArabic ? 'ربط الملاحظة بصحابي (اختياري):' : 'Explicite Companion association (optional):'}
                        </label>
                        <select
                          value={noteCompanionId}
                          onChange={(e) => setNoteCompanionId(e.target.value)}
                          className={`w-full border rounded-xl p-2 focus:outline-none text-xs transition duration-200 ${
                            isDarkMode ? 'bg-[#2E3024] border-neutral-700 text-slate-100' : 'bg-white border-natural-accent/40 text-[#443825] focus:border-natural-brand'
                          }`}
                        >
                          <option value="">-- {isArabic ? 'عام / لا توجد صلة' : 'General Notes'} --</option>
                          {allCompanions.map(c => (
                            <option key={c.id} value={c.id}>
                              {isArabic ? c.nameAr : c.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-natural-brand mb-1 font-serif">
                          {isArabic ? 'عنوان الملاحظة الفرعي (اختياري):' : 'Note Title subtitle (optional):'}
                        </label>
                        <input
                          type="text"
                          value={noteTitle}
                          onChange={(e) => setNoteTitle(e.target.value)}
                          placeholder={isArabic ? 'مثال: دفاعه يوم أُحد' : 'e.g. Heroism at Uhud'}
                          className={`w-full border rounded-xl p-2 focus:outline-none text-xs transition duration-200 ${
                            isDarkMode ? 'bg-[#2E3024] border-neutral-700 text-slate-100' : 'bg-white border-natural-accent/40 text-[#443825] focus:border-natural-brand'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10.5px] font-bold text-natural-brand font-serif">
                        {isArabic ? 'محتوى الفائدة البحثية التاريخية:' : 'Study notes content:'}
                      </label>
                      <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        required
                        rows={5}
                        placeholder={isArabic ? 'اكتب تدوينتك العلمية، الدروس المستخلصة، أو العبر التاريخية العطرة...' : 'Compile summaries, moral ethics learned, or historic details...'}
                        className={`w-full border rounded-xl p-3 focus:outline-none text-xs transition duration-200 ${
                          isDarkMode ? 'bg-[#2E3024] border-neutral-700 text-slate-100' : 'bg-white border-natural-accent/40 text-[#443825] focus:border-natural-brand'
                        }`}
                      />
                    </div>

                    <div className="flex gap-2 text-xs font-serif">
                      <button
                        type="submit"
                        className="bg-natural-brand hover:bg-natural-brand/90 text-white font-bold p-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow-md"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'حفظ الفائدة' : 'Save Note'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsNoteFormOpen(false);
                          setEditingNoteId(null);
                        }}
                        className={`p-2.5 px-3 border rounded-xl cursor-pointer ${
                          isDarkMode ? 'bg-natural-dark-bg border-neutral-700 text-slate-350' : 'bg-stone-50 border-neutral-250 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

              {/* Study Notes Search & Command Bar */}
              <div className={`p-4 rounded-3xl border flex flex-col sm:flex-row gap-4 items-center justify-between ${
                isDarkMode ? 'bg-natural-dark-panel border-neutral-850' : 'bg-white border-natural-accent/30'
              } shadow`}>
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={noteSearchQuery}
                    onChange={(e) => setNoteSearchQuery(e.target.value)}
                    placeholder={isArabic ? 'بحث في الفوائد...' : 'Filter study notes...'}
                    className={`w-full border rounded-xl py-2 pl-3.5 pr-8 focus:outline-none text-xs transition ${
                      isDarkMode 
                        ? 'bg-natural-dark-bg border-neutral-750 text-slate-200 focus:border-natural-accent' 
                        : 'bg-white border-[#CFC5AD]/55 text-natural-text focus:border-natural-brand'
                  }`}
                  />
                  <Search className="w-3.5 h-3.5 text-natural-accent absolute top-2.5 right-2 px-0" />
                </div>

                {!isNoteFormOpen && (
                  <button
                    onClick={() => setIsNoteFormOpen(true)}
                    className="w-full sm:w-auto p-2.5 px-4 bg-natural-brand hover:bg-natural-brand/90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 text-natural-accent" />
                    <span>{isArabic ? 'إضافة خاطرة / فائدة علمية' : 'New Study Note'}</span>
                  </button>
                )}
              </div>

              {/* Notes grid rendering */}
              {loadingNotes ? (
                <div className="text-center py-8">
                  <p className="text-xs text-stone-500 font-serif">{isArabic ? 'جاري استيراد فوائد الأثر من السير...' : 'Loading precious thoughts...'}</p>
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className={`border border-dashed rounded-3xl p-12 text-center ${
                  isDarkMode ? 'bg-[#181914]/40 border-neutral-800' : 'bg-white border-natural-accent/15'
                }`}>
                  <FileText className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs font-serif leading-relaxed text-natural-brand/80">
                    {isArabic
                      ? 'مذكرة الفوائد فارغة الآن. ابدأ بكتابة تدوينتك أو دروسك العبرية هنا!'
                      : 'You have not added any personal research study notes yet.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-5 rounded-3xl border shadow-sm transition-all relative overflow-hidden ${
                        isDarkMode ? 'bg-[#1D1E16] border-[#3B3D2C]' : 'bg-[#FAF8F5] border-natural-accent/20 hover:border-natural-accent/35'
                      }`}
                    >
                      {/* Ribbon banner if linked to a companion */}
                      {note.companionId && (
                        <div className="flex items-center gap-1 mb-2">
                          <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-serif font-bold ${
                            isDarkMode ? 'bg-neutral-800 text-natural-accent' : 'bg-natural-brand/5 border border-natural-brand/10 text-natural-brand'
                          }`}>
                            👤 {isArabic ? note.companionNameAr : note.companionNameEn}
                          </span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-serif font-bold text-natural-brand">
                            {note.title || (isArabic ? 'فائدة فرعية' : 'Reflections')}
                          </h4>
                          <span className="text-[9.5px] font-mono text-stone-500">
                            {new Date(note.createdAt).toLocaleDateString(isArabic ? 'ar' : 'en-US')}
                          </span>
                        </div>

                        <p className={`text-xs leading-relaxed font-sans ${isDarkMode ? 'text-slate-350' : 'text-neutral-700'} whitespace-pre-wrap`}>
                          {note.content}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-200/40 flex justify-between items-center text-xs">
                        {note.companionId ? (
                          <button
                            onClick={() => {
                              const foundComp = allCompanions.find(c => c.id === note.companionId);
                              if (foundComp) onSelectCompanion(foundComp);
                            }}
                            className="text-[10px] text-natural-accent font-serif font-bold hover:underline flex items-center gap-0.5"
                          >
                            <span>{isArabic ? 'عرض سيرة الصحابي ' : 'Jump to Seerah'}</span>
                            {isArabic ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          </button>
                        ) : (
                          <span className="text-[9.5px] text-stone-400 font-mono">
                            {isArabic ? 'دراسة عامة' : 'General study'}
                          </span>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => triggerEditNote(note)}
                            className="p-1 px-2 border rounded-md text-stone-500 hover:text-natural-accent hover:border-natural-accent/30 flex items-center gap-1 scale-90 cursor-pointer transition border-[#CFC5AD]/45"
                            title={isArabic ? 'تعديل المفاد' : 'Edit content'}
                          >
                            <Edit3 className="w-3 h-3" />
                            <span className="text-[9px]">{isArabic ? 'تعديل' : 'Edit'}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1 px-2 border rounded-md text-stone-500 hover:text-red-500 hover:border-red-500/35 flex items-center gap-1 scale-90 cursor-pointer transition border-[#CFC5AD]/45"
                            title={isArabic ? 'حذف من المذكرة' : 'Delete note'}
                          >
                            <Trash2 className="w-3 h-3" />
                            <span className="text-[9px]">{isArabic ? 'حذف' : 'Delete'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. COMPONENT STATE: NAVIGATION HISTORY */}
          {activeTab === 'history' && (
            <div className={`p-6 rounded-[2rem] border shadow-md space-y-4 ${
              isDarkMode ? 'bg-natural-dark-panel border-neutral-850' : 'bg-white border-[#D8CEB6]/50'
            }`}>
              <h3 className="text-sm font-bold border-b pb-2 mb-4 flex items-center gap-2 uppercase font-serif text-natural-brand border-natural-accent/15">
                <Clock className="w-4.5 h-4.5 text-natural-accent animate-pulse" />
                <span>{isArabic ? 'سجل تصفح مسارات الصحابة الأطهار' : 'Browse History Logs'}</span>
              </h3>

              {loadingHistory ? (
                <div className="text-center py-8">
                  <p className="text-xs text-stone-500 font-serif">{isArabic ? 'جاري استدعاء سجل التصفح الميمون...' : 'Retrieving navigation logs...'}</p>
                </div>
              ) : historyList.length === 0 ? (
                <div className={`border border-dashed rounded-3xl p-12 text-center ${
                  isDarkMode ? 'bg-neutral-[#181914]/40 border-neutral-800' : 'bg-white border-natural-accent/15'
                }`}>
                  <HistoryIcon className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs font-serif leading-relaxed text-natural-brand/80">
                    {isArabic
                      ? 'لا توجد سجلات تصفح سابقة حالياً. تصفح سيرة الصحابة لملء السجل تلقائياً!'
                      : 'No navigation history recorded yet. Open profiles to build history logs!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className={`text-[11px] font-sans ${isDarkMode ? 'text-slate-400' : 'text-stone-550'} italic`}>
                    {isArabic 
                      ? 'يتم تخزين القراءات والزيارات لتمكينك من متابعة المطالعة ومراجعة العقد بسهولة:' 
                      : 'Traces your visited companion paths to help you easily re-read your study routes:'}
                  </p>

                  <div className="divide-y divide-stone-200/40 max-h-[420px] overflow-y-auto pr-1">
                    {historyList.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          const foundComp = allCompanions.find(c => c.id === item.companionId);
                          if (foundComp) {
                            onSelectCompanion(foundComp);
                          }
                        }}
                        className={`py-3.5 flex items-center justify-between gap-4 transition-all duration-150 cursor-pointer px-2 rounded-xl border border-transparent ${
                          isDarkMode ? 'hover:bg-neutral-800/40 hover:border-neutral-800' : 'hover:bg-natural-brand/5'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-sm select-none ${
                            isDarkMode ? 'bg-neutral-800 border-neutral-700 text-natural-accent' : 'bg-stone-50 border-[#CFC5AD]/35 text-natural-brand'
                          }`}>
                            {item.companionNameAr.charAt(0)}
                          </div>
                          <div className="truncate">
                            <h4 className="text-xs font-serif font-bold text-natural-brand">
                              {isArabic ? item.companionNameAr : item.companionNameEn}
                            </h4>
                            <span className="text-[9.5px] text-stone-500 flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-stone-400" />
                              <span>{new Date(item.viewedAt).toLocaleString(isArabic? 'ar': 'en-US')}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                            className="p-1.5 rounded-lg border border-transparent text-stone-400 hover:text-red-500 hover:bg-red-50/10 cursor-pointer active:scale-95 transition"
                            title={isArabic ? 'إزالة السجل' : 'Remove log'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-natural-accent block pr-1 text-xs">
                            {isArabic ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
