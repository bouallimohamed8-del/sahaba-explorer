/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Companion, Relationship, CompanionCategory, RelationshipType } from '../types';
import { CATEGORY_CONFIG, RELATION_CONFIG } from './NetworkGraph';
import {
  Plus,
  Sparkles,
  Trash2,
  Database,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Save,
  HelpCircle,
  Landmark,
  Shield,
  Users,
  History,
  ClipboardCheck,
  FileSpreadsheet,
  Upload,
  LogOut,
  X,
  FileText,
  Link as LinkIcon
} from 'lucide-react';

// Import our cohesive subunits
import AdminLogin from './AdminLogin';
import AdminProposals from './AdminProposals';
import AdminMaintenance from './AdminMaintenance';
import AdminImportExport from './AdminImportExport';
import AdminUsers from './AdminUsers';
import FirebaseUsersManager from './FirebaseUsersManager';

interface AdminDashboardProps {
  companions: Companion[];
  relationships: Relationship[];
  isArabic: boolean;
  isDarkMode?: boolean;
  onRefreshData: () => void;
}

export default function AdminDashboard({
  companions,
  relationships,
  isArabic,
  isDarkMode = true,
  onRefreshData
}: AdminDashboardProps) {
  // Authentication & Persistent State
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('admin_token'));
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(() => {
    const saved = sessionStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'stats' | 'companion_form' | 'relation_form' | 'proposals' | 'maintenance' | 'import_export' | 'users'>('stats');
  const [usersSubTab, setUsersSubTab] = useState<'firebase' | 'classic'>('firebase');

  // Backend Stats
  const [stats, setStats] = useState<{ companionsCount: number; relationshipsCount: number; categoriesCount: Record<string, number> } | null>(null);
  const [proposals, setProposals] = useState<any[]>([]);

  // AI Research
  const [searchQuery, setSearchQuery] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [researchError, setResearchError] = useState('');

  // Companion form state
  const [formCompanion, setFormCompanion] = useState<Partial<Companion>>({
    id: '',
    nameAr: '',
    nameEn: '',
    kunyaAr: '',
    kunyaEn: '',
    lineageAr: '',
    lineageEn: '',
    titlesAr: [],
    titlesEn: [],
    tribeAr: '',
    tribeEn: '',
    birthYearAH: -40,
    deathYearAH: 15,
    ageAtDeath: 60,
    category: 'Other',
    cityAr: 'المدينة المنورة',
    cityEn: 'Medina',
    hadithCount: 0,
    shortBioAr: '',
    shortBioEn: '',
    longBioAr: '',
    longBioEn: '',
    conversionAr: '',
    conversionEn: '',
    achievementsAr: [],
    achievementsEn: [],
    battles: [],
    teachers: ['الرسول محمد ﷺ'],
    students: [],
    famousHadiths: [],
    sources: ['صحيح البخاري', 'سير أعلام النبلاء'],
    library: [],
    historicalSignificanceAr: '',
    historicalSignificanceEn: '',
    confidenceLevel: 'High',
    gender: 'Male',
    alternativeNamesAr: [],
    alternativeNamesEn: [],
    birthPlaceAr: '',
    birthPlaceEn: '',
    deathPlaceAr: '',
    deathPlaceEn: '',
    externalLinks: [],
    mediaUrls: []
  });

  const [companionStatus, setCompanionStatus] = useState({ success: false, message: '' });
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [reason, setReason] = useState('Added/Updated Companion Profile entries');

  // Multi-input helpers text states
  const [inputAltAr, setInputAltAr] = useState('');
  const [inputAltEn, setInputAltEn] = useState('');
  const [inputTitleAr, setInputTitleAr] = useState('');
  const [inputTitleEn, setInputTitleEn] = useState('');
  const [inputAchievementAr, setInputAchievementAr] = useState('');
  const [inputAchievementEn, setInputAchievementEn] = useState('');
  const [inputBattle, setInputBattle] = useState('');
  const [inputTeacher, setInputTeacher] = useState('');
  const [inputStudent, setInputStudent] = useState('');
  const [inputSource, setInputSource] = useState('');
  const [inputLinkTitle, setInputLinkTitle] = useState('');
  const [inputLinkUrl, setInputLinkUrl] = useState('');

  // File upload refs
  const [fileLoading, setFileLoading] = useState(false);

  // Relationship Form State
  const [newRelation, setNewRelation] = useState({
    sourceId: '',
    targetId: '',
    type: 'friendship' as RelationshipType,
    labelAr: '',
    labelEn: ''
  });
  const [relationStatus, setRelationStatus] = useState({ success: false, message: '' });
  const [relationReason, setRelationReason] = useState('Linked companion relationships');

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProposals = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProposals(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
    if (token) {
      fetchProposals();
    }
  }, [companions, relationships, token]);

  const handleLoginSuccess = (newToken: string, newUser: { email: string; name: string; role: string }) => {
    setToken(newToken);
    setUser(newUser);
    sessionStorage.setItem('admin_token', newToken);
    sessionStorage.setItem('admin_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    if (token) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
    setToken(null);
    setUser(null);
    sessionStorage.clear();
  };

  // AI Research Core using server key proxy
  const handleAiResearch = async () => {
    if (!searchQuery.trim()) {
      setResearchError(isArabic ? 'الرجاء إدخال اسم صحابي للبحث.' : 'Please enter a companion name to research.');
      return;
    }

    setIsResearching(true);
    setResearchError('');
    setCompanionStatus({ success: false, message: '' });

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });

      if (res.ok) {
        const data = await res.json();
        const generated: Partial<Companion> = data.companion;

        // Auto-generate safe lowercase ID
        const id = searchQuery.toLowerCase().replace(/[^a-z0-9]/g, '_').trim();

        setFormCompanion({
          ...formCompanion,
          ...generated,
          id: id,
          alternativeNamesAr: generated.alternativeNamesAr || [],
          alternativeNamesEn: generated.alternativeNamesEn || [],
          gender: generated.gender || 'Male',
          birthPlaceAr: generated.birthPlaceAr || '',
          birthPlaceEn: generated.birthPlaceEn || '',
          deathPlaceAr: generated.deathPlaceAr || '',
          deathPlaceEn: generated.deathPlaceEn || '',
          externalLinks: generated.externalLinks || [],
          mediaUrls: generated.mediaUrls || []
        });

        setIsEditingExisting(false);
        setActiveTab('companion_form');
        setCompanionStatus({
          success: true,
          message: isArabic
            ? 'تم إيجاد معلومات أولية وتعبئتها في الاستمارة بالأسفل للمراجعة والتدقيق.'
            : 'AI successfully synthesized. Review the fields below before submitting!'
        });
      } else {
        const err = await res.json();
        setResearchError(err.error || 'AI generation failed due to API limits.');
      }
    } catch (e) {
      console.error(e);
      setResearchError('Connection to AI Generator failed.');
    } finally {
      setIsResearching(false);
    }
  };

  // Populate form for Editing
  const handleEditSelect = (c: Companion) => {
    setFormCompanion({
      ...c,
      alternativeNamesAr: c.alternativeNamesAr || [],
      alternativeNamesEn: c.alternativeNamesEn || [],
      gender: c.gender || 'Male',
      birthPlaceAr: c.birthPlaceAr || '',
      birthPlaceEn: c.birthPlaceEn || '',
      deathPlaceAr: c.deathPlaceAr || '',
      deathPlaceEn: c.deathPlaceEn || '',
      externalLinks: c.externalLinks || [],
      mediaUrls: c.mediaUrls || []
    });
    setIsEditingExisting(true);
    setReason(`Updated ${c.nameEn} details`);
    setActiveTab('companion_form');
  };

  // Propose change or direct write
  const handleCompanionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompanion.id || !formCompanion.nameAr || !formCompanion.nameEn) {
      setCompanionStatus({
        success: false,
        message: isArabic ? 'الرجاء ملء الحقول الإلزامية الاسم والمعرف الفريد.' : 'ID and Name in both languages are required.'
      });
      return;
    }

    setCompanionStatus({ success: false, message: '' });

    const isCreating = !isEditingExisting;
    const type = isCreating ? 'create_companion' : 'edit_companion';
    const itemId = formCompanion.id;
    const previousValue = isCreating ? null : companions.find(exc => exc.id === formCompanion.id);

    try {
      const res = await fetch('/api/admin/pending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type,
          itemId,
          previousValue,
          newValue: formCompanion,
          reason
        })
      });

      if (res.ok) {
        const data = await res.json();
        const autoApproved = data.status === 'approved';

        setCompanionStatus({
          success: true,
          message: autoApproved
            ? (isArabic ? 'تم حفظ وتعديل بيانات الصحابي ونشرها فوراً!' : 'Master companion entry published successfully!')
            : (isArabic ? 'تم تسجيل التعديل واقتراحه بنجاح في نظام المراجعة.' : 'Changes proposed! Sent to review queue.')
        });

        if (autoApproved) {
          onRefreshData();
        }
        fetchProposals();

        // reset
        setFormCompanion({
          id: '',
          nameAr: '',
          nameEn: '',
          kunyaAr: '',
          kunyaEn: '',
          lineageAr: '',
          lineageEn: '',
          titlesAr: [],
          titlesEn: [],
          tribeAr: '',
          tribeEn: '',
          birthYearAH: -40,
          deathYearAH: 15,
          ageAtDeath: 60,
          category: 'Other',
          cityAr: 'المدينة المنورة',
          cityEn: 'Medina',
          hadithCount: 0,
          shortBioAr: '',
          shortBioEn: '',
          longBioAr: '',
          longBioEn: '',
          conversionAr: '',
          conversionEn: '',
          achievementsAr: [],
          achievementsEn: [],
          battles: [],
          teachers: ['الرسول محمد ﷺ'],
          students: [],
          famousHadiths: [],
          sources: ['صحيح البخاري', 'سير أعلام النبلاء'],
          library: [],
          historicalSignificanceAr: '',
          historicalSignificanceEn: '',
          confidenceLevel: 'High',
          gender: 'Male',
          alternativeNamesAr: [],
          alternativeNamesEn: [],
          birthPlaceAr: '',
          birthPlaceEn: '',
          deathPlaceAr: '',
          deathPlaceEn: '',
          externalLinks: [],
          mediaUrls: []
        });
        setIsEditingExisting(false);
      } else {
        const err = await res.json();
        setCompanionStatus({ success: false, message: err.error || 'Submit request failed.' });
      }
    } catch (e) {
      console.error(e);
      setCompanionStatus({ success: false, message: 'Server communication error.' });
    }
  };

  // Propose Relationship Creator
  const handleRelationSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!newRelation.sourceId || !newRelation.targetId) {
       setRelationStatus({ success: false, message: isArabic ? 'الرجاء تحديد كلا الصحابيين للتوصيل.' : 'Select both companions.' });
       return;
     }

     const generatedId = `rel_${newRelation.sourceId}_${newRelation.targetId}_${Date.now().toString().slice(-4)}`;
     const relationValue = {
       id: generatedId,
       ...newRelation
     };

     try {
       const res = await fetch('/api/admin/pending', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
         },
         body: JSON.stringify({
           type: 'create_relationship',
           itemId: generatedId,
           newValue: relationValue,
           reason: relationReason
         })
       });

       if (res.ok) {
         const d = await res.json();
         const autoApproved = d.status === 'approved';

         setRelationStatus({
           success: true,
           message: autoApproved
             ? (isArabic ? 'تم إنشاء علاقة الترابط والقرابة ونشرها بنجاح!' : 'Relationship link established!')
             : (isArabic ? 'تم اقتراح علاقة القرابة بنجاح وبانتظار الموافقة.' : 'Relationship link proposed! Pending Review.')
         });

         if (autoApproved) {
           onRefreshData();
         }
         fetchProposals();

         setNewRelation({ sourceId: '', targetId: '', type: 'friendship', labelAr: '', labelEn: '' });
       } else {
         const err = await res.json();
         setRelationStatus({ success: false, message: err.error || 'Request failure.' });
       }
     } catch (e) {
       console.error(e);
       setRelationStatus({ success: false, message: 'Connection issue.' });
     }
  };

  // Proposal delete companion
  const handleDeleteCompanion = async (id: string, nameEn: string) => {
    if (!window.confirm(isArabic ? `هل أنت متأكد من رغبتك في حذف السجل ${nameEn}؟` : `Are you sure you want to trigger delete for ${nameEn}?`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/pending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'delete_companion',
          itemId: id,
          newValue: { id, nameEn },
          reason: `Deleted companion id: ${id}`
        })
      });

      if (res.ok) {
        onRefreshData();
        fetchProposals();
        alert(isArabic ? 'تم معالجة طلب الحذف.' : 'Delete request processed.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Proposal delete link relationship
  const handleDeleteRelation = async (id: string) => {
    try {
      const res = await fetch('/api/admin/pending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'delete_relationship',
          itemId: id,
          newValue: { id },
          reason: 'Deleted relationship'
        })
      });

      if (res.ok) {
        onRefreshData();
        fetchProposals();
        alert(isArabic ? 'تم معالجة حذف العلاقة.' : 'Delete relationship submitted.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // File handling to Base64
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Content = event.target?.result?.toString().split(',')[1];
      if (!base64Content) return;

      try {
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fileName: file.name,
            content: base64Content,
            fileType: file.type.startsWith('image/') ? 'photo' : 'document'
          })
        });

        if (response.ok) {
          const res = await response.json();
          // append to media list!
          setFormCompanion({
            ...formCompanion,
            mediaUrls: [...(formCompanion.mediaUrls || []), {
              title: res.title,
              url: res.url,
              type: res.type
            }]
          });
        } else {
          alert('Failed to upload file.');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFileLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!token || !user) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} isArabic={isArabic} />;
  }

  const pendingCount = proposals.filter(p => p.status === 'pending').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 lg:p-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Session greeting bar */}
      <div className="bg-slate-900 border border-slate-850 rounded-2xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-500" />
          <span className="text-slate-400">
            {isArabic ? 'مرحبًا بك، ' : 'Welcome, '}
            <strong className="text-slate-100">{user.name}</strong>
            <span className="px-2 py-0.5 rounded bg-slate-950 font-mono text-[9px] text-cyan-400 border border-slate-850 mx-1">
              {user.role}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-mono text-[10px] hidden md:inline">
            UTC: {new Date().toISOString().replace('T', ' ').slice(0, 19)}
          </span>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-400 transition flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isArabic ? 'تسجيل الخروج' : 'Sign Out'}</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation row */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-850 pb-2 overflow-x-auto">
        {[
          { key: 'stats', label: isArabic ? 'الإحصائيات والأبحاث' : 'Statistics & Research', icon: Database },
          { key: 'companion_form', label: isArabic ? 'محرر السير والصحابة' : 'Companion Registry Form', icon: Plus },
          { key: 'relation_form', label: isArabic ? 'تربيط العلاقات' : 'Relationship linker', icon: LinkIcon },
          { key: 'proposals', label: `${isArabic ? 'طلبات المراجعة' : 'Approvals queue'} (${pendingCount})`, icon: ClipboardCheck },
          { key: 'maintenance', label: isArabic ? 'مراقبة الجودة والدمج' : 'Quality checks & Merges', icon: AlertCircle },
          { key: 'import_export', label: isArabic ? 'استيراد وتصدير' : 'JSON/CSV Backups', icon: FileSpreadsheet },
          { key: 'users', label: isArabic ? 'المشرفون المنظمون' : 'Administrators manager', icon: Users, reqSuper: true }
        ].map((tab) => {
          if (tab.reqSuper && user.role !== 'Super Admin') return null;
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-1.8 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                active
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-900 border border-slate-850/60 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Primary tab views switcher */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 md:p-6 shadow-xl">
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stats overview card */}
              <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl space-y-4">
                <h4 className="font-bold text-xs text-slate-200">{isArabic ? 'نظرة عامة على قاعدة بيانات سيرة الصحابة' : 'Historical Dataset Summary'}</h4>
                {!stats ? (
                  <div className="text-xs text-slate-500">Loading...</div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">{isArabic ? 'إجمالي الصحابة المقيدين' : 'Total Registered Sahaba'}</div>
                      <div className="text-2xl font-black text-amber-500 font-mono mt-1">{stats.companionsCount}</div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">{isArabic ? 'الروابط والعلاقات المتشابكة' : 'Relationship Edges'}</div>
                      <div className="text-2xl font-black text-cyan-400 font-mono mt-1">{stats.relationshipsCount}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Research generator card */}
              <div className="bg-slate-905 border border-slate-850 p-5 rounded-2xl space-y-4 relative overflow-hidden">
                <div className="absolute -right-3 -top-3 w-16 h-16 bg-amber-500/10 rounded-full blur-xl" />
                <div>
                  <h4 className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{isArabic ? 'استكشاف وتوليد السيرة بالذكاء الاصطناعي (Gemini)' : 'AI Companion Research Proxy'}</span>
                  </h4>
                  <p className="text-[10px] text-slate-450 mt-1">
                    {isArabic
                      ? 'اكتب اسم الصحابي كاملاً، وسيتولى محرك الاستكشاف جمع وتحليل مراجع الكتب النموذجية والمصادر وتوصيف النسب تلقائياً لتعبئته.'
                      : 'Type the absolute correct name of any companion to synthesize their entire biographical parameters instantly.'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isArabic ? 'مثال: سلمان الفارسي' : 'e.g. Salman al-Farsi'}
                    className="flex-1 bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
                  />
                  <button
                    onClick={handleAiResearch}
                    disabled={isResearching}
                    className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-extrabold px-4 text-xs rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0 active:scale-95"
                  >
                    {isResearching ? (
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent animate-spin rounded-full" />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'أبحاث ذكية' : 'Synthesize Research'}</span>
                      </>
                    )}
                  </button>
                </div>

                {researchError && <p className="text-[10px] text-red-400 mt-1">{researchError}</p>}
              </div>
            </div>

            {/* Quick action: Edit existing list table */}
            <div className="bg-slate-950/20 border border-slate-850 p-5 rounded-2xl space-y-3">
              <h4 className="font-bold text-xs text-slate-200">{isArabic ? 'تعديل وحذف سريع من الفهرس الساكن' : 'Registered Companions Quick Manager'}</h4>
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto pr-1">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-850 text-[11px] text-slate-450">
                      <th className="py-2 text-right pr-2">{isArabic ? 'الصحابي' : 'Name'}</th>
                      <th className="py-2">{isArabic ? 'المعرف' : 'ID'}</th>
                      <th className="py-2">{isArabic ? 'القرية/المدينة' : 'Homeland'}</th>
                      <th className="py-2 text-center">{isArabic ? 'الكنية' : 'Kunya'}</th>
                      <th className="py-2 text-right pl-2">{isArabic ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companions.map((c) => (
                      <tr key={c.id} className="border-b border-slate-900 hover:bg-slate-950/20">
                        <td className="py-3 font-semibold text-slate-200 pr-2">
                          <div className="text-slate-200">{isArabic ? c.nameAr : c.nameEn}</div>
                          <div className="text-[10px] text-slate-500">{isArabic ? c.nameEn : c.nameAr}</div>
                        </td>
                        <td className="py-3 font-mono text-[10px] text-slate-450">{c.id}</td>
                        <td className="py-3 text-slate-400">{isArabic ? c.cityAr : c.cityEn}</td>
                        <td className="py-3 text-center text-[11px] text-slate-400">{isArabic ? c.kunyaAr || '—' : c.kunyaEn || '—'}</td>
                        <td className="py-3 text-right pl-2">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditSelect(c)}
                              className="text-amber-500 hover:underline font-bold text-[11px] px-2 py-0.5 bg-amber-500/5 hover:bg-amber-500/15 border border-amber-500/20 rounded-md cursor-pointer transition"
                            >
                              {isArabic ? 'تعديل الحقول' : 'Edit Fields'}
                            </button>
                            <button
                              onClick={() => handleDeleteCompanion(c.id, c.nameEn)}
                              className="text-red-400 hover:text-red-300 font-bold p-1 bg-red-950/10 hover:bg-red-900/30 border border-red-900/20 rounded-md cursor-pointer transition"
                              title="Delete Companion"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'companion_form' && (
          <form onSubmit={handleCompanionSubmit} className="space-y-6">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  {isEditingExisting ? (isArabic ? 'تعديل ملف الصحابي ومطابقة الحواف' : 'Edit Companion Parameters') : (isArabic ? 'إضافة وتشييد سيرة صحابي جديد' : 'Construct New Sahaba Profile')}
                </h3>
                <p className="text-[10px] text-slate-450">
                  {isArabic ? 'جميع حقول التوثيق والنسب والمصادر المتكاملة والملحقات' : 'All citation arrays, custom lineage descriptors, and image uploads'}
                </p>
              </div>

              {isEditingExisting && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingExisting(false);
                    setFormCompanion({ id: '', nameAr: '', nameEn: '', teachers: ['الرسول محمد ﷺ'] });
                  }}
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 px-3 py-1 rounded text-[10px] text-slate-400 transition cursor-pointer"
                >
                  {isArabic ? 'إلغاء التعديل والعودة للإنشاء' : 'Reset form to create mode'}
                </button>
              )}
            </div>

            {companionStatus.message && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${companionStatus.success ? 'bg-emerald-950/25 border border-emerald-950/40 text-emerald-400' : 'bg-red-950/25 border border-red-950/40 text-red-400'}`}>
                {companionStatus.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{companionStatus.message}</span>
              </div>
            )}

            {/* Core Identification row */}
            <div className="p-4 bg-slate-950/30 border border-slate-850 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'المعرف الفريد (ID ساكن إنجليزي)' : 'Unique String Key ID'}</label>
                <input
                  type="text"
                  value={formCompanion.id}
                  onChange={(e) => setFormCompanion({ ...formCompanion, id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  placeholder="e.g. musab_bin_umayr"
                  disabled={isEditingExisting}
                  className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 text-xs rounded-xl focus:border-amber-500 focus:outline-none font-mono disabled:text-slate-650"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'الاسم باللغة العربية' : 'Arabic Display Name'}</label>
                <input
                  type="text"
                  value={formCompanion.nameAr}
                  onChange={(e) => setFormCompanion({ ...formCompanion, nameAr: e.target.value })}
                  placeholder="مصعب بن عمير"
                  className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 text-xs rounded-xl focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'الاسم بالإنكليزية' : 'English Transliteration Name'}</label>
                <input
                  type="text"
                  value={formCompanion.nameEn}
                  onChange={(e) => setFormCompanion({ ...formCompanion, nameEn: e.target.value })}
                  placeholder="Mus'ab bin Umayr"
                  className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 text-xs rounded-xl focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Gender, birth and dates stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'الجنس' : 'Gender'}</label>
                <select
                  value={formCompanion.gender || 'Male'}
                  onChange={(e) => setFormCompanion({ ...formCompanion, gender: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 text-xs rounded-xl focus:border-amber-500 focus:outline-none"
                >
                  <option value="Male">{isArabic ? 'ذكر' : 'Male'}</option>
                  <option value="Female">{isArabic ? 'أنثى' : 'Female'}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'القبيلة' : 'Tribe'}</label>
                <input
                  type="text"
                  value={formCompanion.tribeEn || ''}
                  onChange={(e) => setFormCompanion({ ...formCompanion, tribeEn: e.target.value, tribeAr: e.target.value ? (isArabic ? formCompanion.tribeAr : '') : '' })}
                  placeholder="Banu Hashim"
                  className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 text-xs rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'سنة الوفاة (هجرية)' : 'Death Year AH'}</label>
                <input
                  type="number"
                  value={formCompanion.deathYearAH || ''}
                  onChange={(e) => setFormCompanion({ ...formCompanion, deathYearAH: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 text-xs rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'العمر عند الوفاة' : 'Age at Death'}</label>
                <input
                  type="number"
                  value={formCompanion.ageAtDeath || ''}
                  onChange={(e) => setFormCompanion({ ...formCompanion, ageAtDeath: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 text-xs rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Geographical places of birth and death */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-950/20 border border-slate-850 rounded-2xl">
              <div>
                <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'محل الميلاد (عربي)' : 'Birth Place (AR)'}</label>
                <input
                  type="text"
                  value={formCompanion.birthPlaceAr || ''}
                  onChange={(e) => setFormCompanion({ ...formCompanion, birthPlaceAr: e.target.value })}
                  placeholder="مكة المكرمة"
                  className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 text-xs rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'محل الميلاد (إنجليزي)' : 'Birth Place (EN)'}</label>
                <input
                  type="text"
                  value={formCompanion.birthPlaceEn || ''}
                  onChange={(e) => setFormCompanion({ ...formCompanion, birthPlaceEn: e.target.value })}
                  placeholder="Mecca"
                  className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 text-xs rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'محل الوفاة (عربي)' : 'Death Place (AR)'}</label>
                <input
                  type="text"
                  value={formCompanion.deathPlaceAr || ''}
                  onChange={(e) => setFormCompanion({ ...formCompanion, deathPlaceAr: e.target.value })}
                  placeholder="المدينة المنورة"
                  className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 text-xs rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'محل الوفاة (إنجليزي)' : 'Death Place (EN)'}</label>
                <input
                  type="text"
                  value={formCompanion.deathPlaceEn || ''}
                  onChange={(e) => setFormCompanion({ ...formCompanion, deathPlaceEn: e.target.value })}
                  placeholder="Medina"
                  className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 text-xs rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Kunyas, Lineages as block textareas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'الكنية (عربي)' : 'Kunya (AR)'}</label>
                <input
                  type="text"
                  value={formCompanion.kunyaAr || ''}
                  onChange={(e) => setFormCompanion({ ...formCompanion, kunyaAr: e.target.value })}
                  placeholder="أبو يحيى"
                  className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 text-xs rounded-xl focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'الكنية (إنجليزي)' : 'Kunya (EN)'}</label>
                <input
                  type="text"
                  value={formCompanion.kunyaEn || ''}
                  onChange={(e) => setFormCompanion({ ...formCompanion, kunyaEn: e.target.value })}
                  placeholder="Abu Yahya"
                  className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 text-xs rounded-xl focus:border-amber-500"
                />
              </div>
            </div>

            {/* Lineages and summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'النسب والامتداد العرقي (عربي)' : 'Silsilah Lineage (AR)'}</label>
                <textarea
                  rows={2}
                  value={formCompanion.lineageAr || ''}
                  onChange={(e) => setFormCompanion({ ...formCompanion, lineageAr: e.target.value })}
                  placeholder="مصعب بن عمير بن هاشم بن عبد مناف بن عبد الدار..."
                  className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 text-xs rounded-xl focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'النسب والامتداد العرقي (إنجليزي)' : 'Silsilah Lineage (EN)'}</label>
                <textarea
                  rows={2}
                  value={formCompanion.lineageEn || ''}
                  onChange={(e) => setFormCompanion({ ...formCompanion, lineageEn: e.target.value })}
                  placeholder="Mus'ab bin Umayr bin Hashim bin Abd Manaf..."
                  className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 text-xs rounded-xl focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'الملخص التعريفي القصير (عربي)' : 'Brief Summary Bio (AR)'}</label>
                <textarea
                  rows={2}
                  value={formCompanion.shortBioAr || ''}
                  onChange={(e) => setFormCompanion({ ...formCompanion, shortBioAr: e.target.value })}
                  placeholder="مبعوث الرسول ﷺ الأول للمدينة لتوصيل الإسلام ورائد سفارات الدعوة..."
                  className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 text-xs rounded-xl focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'الملخص التعريفي القصير (إنجليزي)' : 'Brief Summary Bio (EN)'}</label>
                <textarea
                  rows={2}
                  value={formCompanion.shortBioEn || ''}
                  onChange={(e) => setFormCompanion({ ...formCompanion, shortBioEn: e.target.value })}
                  placeholder="The first ambassador of Islam sent by the Prophet ﷺ to Yathrib (Medina)..."
                  className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 text-xs rounded-xl focus:border-amber-500"
                />
              </div>
            </div>

            {/* Media Uploads drag-and-drop simulated block */}
            <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl space-y-4">
              <h4 className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-500" />
                <span>{isArabic ? 'الملحقات الإعلامية والصور والخرائط الموثقة' : 'Media attachments, historical maps & images'}</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload drag block */}
                <div className="relative border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-6 h-6 text-slate-500 mb-1" />
                  <span className="text-[10px] font-bold text-slate-400">{isArabic ? 'اضغط لرفع صورة أو وثيقة' : 'Choose photograph, map artwork or PDF document'}</span>
                  <span className="text-[9px] text-slate-500 mt-1">Accepts images & docs. Converted to Base64 schema.</span>
                  {fileLoading && <RefreshCw className="w-4 h-4 animate-spin text-amber-500 mt-2" />}
                </div>

                {/* List uploaded media elements */}
                <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                  <span className="text-[9px] text-slate-500 font-bold block">{isArabic ? 'الملفات المرفقة حالياً:' : 'Active attachments list:'}</span>
                  {(formCompanion.mediaUrls || []).length === 0 ? (
                    <span className="text-[10px] text-slate-600 italic">{isArabic ? 'لا توجد مرفقات.' : 'No attached media assets.'}</span>
                  ) : (
                    (formCompanion.mediaUrls || []).map((med, idx) => (
                      <div key={idx} className="bg-slate-950 p-2 rounded-lg text-[10px] border border-slate-850 flex items-center justify-between gap-2">
                        <div className="truncate space-y-0.5">
                          <strong className="text-slate-350 block truncate">{med.title}</strong>
                          <span className="font-mono text-[9px] text-slate-550 truncate block">{med.url}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...(formCompanion.mediaUrls || [])];
                            updated.splice(idx, 1);
                            setFormCompanion({ ...formCompanion, mediaUrls: updated });
                          }}
                          className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Arrays managers (Alternative names and items lists) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-950/20 border border-slate-850 rounded-2xl">
              {/* Alternative Names AR */}
              <div className="space-y-2">
                <span className="block text-slate-400 text-xs font-semibold">{isArabic ? 'أسماء ومسميات بديلة (عربي)' : 'Alternative names (AR)'}</span>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={inputAltAr}
                    onChange={(e) => setInputAltAr(e.target.value)}
                    placeholder="مثال: مصعب الخير"
                    className="flex-1 bg-slate-950 border border-slate-850 text-xs p-1.5 rounded focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!inputAltAr) return;
                      setFormCompanion({ ...formCompanion, alternativeNamesAr: [...(formCompanion.alternativeNamesAr || []), inputAltAr] });
                      setInputAltAr('');
                    }}
                    className="bg-slate-850 hover:bg-slate-800 text-[10px] px-2.5 rounded cursor-pointer transition font-bold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {(formCompanion.alternativeNamesAr || []).map((n, i) => (
                    <span key={i} className="bg-slate-950 border border-slate-850 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>{n}</span>
                      <X className="w-3 h-3 text-red-400 cursor-pointer" onClick={() => {
                        const filt = (formCompanion.alternativeNamesAr || []).filter((_, idx) => idx !== i);
                        setFormCompanion({ ...formCompanion, alternativeNamesAr: filt });
                      }} />
                    </span>
                  ))}
                </div>
              </div>

              {/* Alternative Names EN */}
              <div className="space-y-2">
                <span className="block text-slate-400 text-xs font-semibold">{isArabic ? 'أسماء ومسميات بديلة (إنجليزي)' : 'Alternative names (EN)'}</span>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={inputAltEn}
                    onChange={(e) => setInputAltEn(e.target.value)}
                    placeholder="e.g. Mus'ab the Blessed"
                    className="flex-1 bg-slate-950 border border-slate-850 text-xs p-1.5 rounded focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!inputAltEn) return;
                      setFormCompanion({ ...formCompanion, alternativeNamesEn: [...(formCompanion.alternativeNamesEn || []), inputAltEn] });
                      setInputAltEn('');
                    }}
                    className="bg-slate-850 hover:bg-slate-800 text-[10px] px-2.5 rounded cursor-pointer transition font-bold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {(formCompanion.alternativeNamesEn || []).map((n, i) => (
                    <span key={i} className="bg-slate-950 border border-slate-850 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>{n}</span>
                      <X className="w-3 h-3 text-red-400 cursor-pointer" onClick={() => {
                        const filt = (formCompanion.alternativeNamesEn || []).filter((_, idx) => idx !== i);
                        setFormCompanion({ ...formCompanion, alternativeNamesEn: filt });
                      }} />
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom external links integration helper */}
            <div className="p-4 bg-slate-950/25 border border-slate-850 rounded-2xl space-y-3">
              <span className="block text-slate-400 text-xs font-semibold flex items-center gap-1 text-slate-200">
                <LinkIcon className="w-4 h-4 text-cyan-400" />
                <span>{isArabic ? 'المصادر والروابط الرقمية الخارجية (الموسوعات المعيارية)' : 'Additional Standard Web URLs & references'}</span>
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="e.g. Encyclopedia Britannica article"
                  value={inputLinkTitle}
                  onChange={(e) => setInputLinkTitle(e.target.value)}
                  className="bg-slate-950 border border-slate-850 text-xs p-2 rounded-xl focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="e.g. https://www.britannica.com/topic/..."
                  value={inputLinkUrl}
                  onChange={(e) => setInputLinkUrl(e.target.value)}
                  className="bg-slate-950 border border-slate-850 text-xs p-2 rounded-xl focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!inputLinkTitle || !inputLinkUrl) return;
                    setFormCompanion({
                      ...formCompanion,
                      externalLinks: [...(formCompanion.externalLinks || []), { title: inputLinkTitle, url: inputLinkUrl }]
                    });
                    setInputLinkTitle('');
                    setInputLinkUrl('');
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs py-2 rounded-xl cursor-pointer"
                >
                  {isArabic ? 'إضافة رابط مرجعي' : 'Add Web Link'}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 text-[10px]">
                {(formCompanion.externalLinks || []).map((link, idx) => (
                  <span key={idx} className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-850 flex items-center gap-1">
                    <span className="text-slate-300 font-semibold">{link.title}</span>:
                    <span className="text-cyan-400 truncate max-w-[120px] font-mono">{link.url}</span>
                    <X className="w-3.5 h-3.5 text-red-400 cursor-pointer" onClick={() => {
                      const updated = (formCompanion.externalLinks || []).filter((_, i) => i !== idx);
                      setFormCompanion({ ...formCompanion, externalLinks: updated });
                    }} />
                  </span>
                ))}
              </div>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'تصنيف رتب طبقات الصحابة' : 'Historical layer Category'}</label>
              <select
                value={formCompanion.category}
                onChange={(e) => setFormCompanion({ ...formCompanion, category: e.target.value as CompanionCategory })}
                className="w-full bg-slate-950 border border-slate-850 p-2.5 text-slate-200 text-xs rounded-xl focus:border-amber-500 focus:outline-none"
              >
                {Object.keys(CATEGORY_CONFIG).map((cat) => (
                  <option key={cat} value={cat}>
                    {isArabic ? CATEGORY_CONFIG[cat as CompanionCategory]?.labelAr : CATEGORY_CONFIG[cat as CompanionCategory]?.labelEn} [{cat}]
                  </option>
                ))}
              </select>
            </div>

            {/* Rationale and Save action */}
            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-3">
              <div>
                <label className="block text-slate-400 text-xs mb-1 font-semibold">
                  {isArabic ? 'مسوّغات ومصادر تعديل السيرة (للرصد والتدقيق)' : 'Edit justification / Historical source citations'}
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={isArabic ? 'مثال: تحديث مراجع معركة بدر من كتاب سير أعلام النبلاء' : 'e.g. Corrected death year based on Ibn Ishaq chronicles'}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2 rounded-xl focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-900 pt-3">
                <span className="text-[10px] text-slate-500">
                  {user.role === 'Editor'
                    ? (isArabic ? 'بصفتك محررًا، سيتم إرسال هذا المقترح لقسم المراجعة للموافقة عليه.' : 'As an Editor, this edit will trigger approval log suggestions.')
                    : (isArabic ? 'بصفتك مراجعًا، سيتم نشر وحفظ التعديلات فوراً وتوثيقها.' : 'Will write immediately as an authorized administrator.')}
                </span>

                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isEditingExisting
                      ? (isArabic ? 'اقتراح وحفظ التعديلات' : 'Submit Profile Updates')
                      : (isArabic ? 'إنشاء واقتراح الصحابي' : 'Submit New Companion')}
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}

        {activeTab === 'relation_form' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200">
                {isArabic ? 'نظام ربط وبناء حواف القرابة والمصاهرة' : 'Relationship linker'}
              </h3>
              <p className="text-[10px] text-slate-450">
                {isArabic ? 'إنشاء علاقات قرابة ومصاهرة وألفة اجتماعية لتغذية شبكة الرسم التفاعلي التلقائي' : 'Define biological, fraternal or companion connections to feed the network canvas'}
              </p>
            </div>

            {relationStatus.message && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${relationStatus.success ? 'bg-emerald-950/25 border border-emerald-950/40 text-emerald-400' : 'bg-red-950/25 border border-red-950/40 text-red-400'}`}>
                {relationStatus.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{relationStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleRelationSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'الصحابي الأول (المصدر)' : 'Companion A (Source)'}</label>
                  <select
                    value={newRelation.sourceId}
                    onChange={(e) => setNewRelation({ ...newRelation, sourceId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 text-xs rounded-xl focus:border-amber-500 focus:outline-none"
                    required
                  >
                    <option value="">{isArabic ? '-- اختر الصحابي المصدر --' : '-- Choose Source Companion --'}</option>
                    {companions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {isArabic ? c.nameAr : c.nameEn} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'الصحابي الثاني (الهدف)' : 'Companion B (Target)'}</label>
                  <select
                    value={newRelation.targetId}
                    onChange={(e) => setNewRelation({ ...newRelation, targetId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 text-xs rounded-xl focus:border-amber-500 focus:outline-none"
                    required
                  >
                    <option value="">{isArabic ? '-- اختر الصحابي الهدف --' : '-- Choose Target Companion --'}</option>
                    {companions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {isArabic ? c.nameAr : c.nameEn} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'تصنيف الرابط والقرابة الاجتماعية' : 'Relationship Type'}</label>
                  <select
                    value={newRelation.type}
                    onChange={(e) => setNewRelation({ ...newRelation, type: e.target.value as RelationshipType })}
                    className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 text-xs rounded-xl focus:border-amber-500 focus:outline-none"
                  >
                    {Object.keys(RELATION_CONFIG).map((t) => (
                      <option key={t} value={t}>
                        {isArabic ? RELATION_CONFIG[t as RelationshipType]?.labelAr : RELATION_CONFIG[t as RelationshipType]?.labelEn} [{t}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'وصف التسمية (بالعربية)' : 'Connection Label (Arabic)'}</label>
                  <input
                    type="text"
                    value={newRelation.labelAr}
                    onChange={(e) => setNewRelation({ ...newRelation, labelAr: e.target.value })}
                    placeholder="مثال: صهر الرسول"
                    className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 text-xs rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'وصف التسمية (بالإنكليزية)' : 'Connection Label (Translatiion)'}</label>
                  <input
                    type="text"
                    value={newRelation.labelEn}
                    onChange={(e) => setNewRelation({ ...newRelation, labelEn: e.target.value })}
                    placeholder="e.g. Son-in-law"
                    className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 text-xs rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1 font-semibold">{isArabic ? 'مبررات ربط العلاقة ومصادره' : 'Link justification & sources'}</label>
                <input
                  type="text"
                  value={relationReason}
                  onChange={(e) => setRelationReason(e.target.value)}
                  placeholder={isArabic ? 'تزويج عثمان بن عفان من رقية بنت الرسول موثق في الكتب' : 'e.g. Uthman married Ruqayya bint Muhammad according to classical historiography'}
                  className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 text-xs rounded-xl focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{isArabic ? 'إنشاء واقتراح رابط القرابة' : 'Submit Relationship Edge'}</span>
              </button>
            </form>

            {/* List active links */}
            <div className="bg-slate-950/20 border border-slate-850 p-5 rounded-2xl space-y-3">
              <h4 className="font-bold text-xs text-slate-200">{isArabic ? 'روابط العلاقات المقترنة الحالية' : 'Registered Social Link edges'}</h4>
              <div className="overflow-x-auto max-h-[250px] overflow-y-auto pr-1">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-850 text-[10px] text-slate-450 uppercase">
                      <th className="py-2 text-right pr-2">{isArabic ? 'الطرف الأول' : 'Companion A'}</th>
                      <th className="py-2">{isArabic ? 'الرابط العلاقي' : 'Association Edge'}</th>
                      <th className="py-2">{isArabic ? 'الطرف الثاني' : 'Companion B'}</th>
                      <th className="py-2 text-right pl-2">{isArabic ? 'التحكم' : 'Unlink'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relationships.map((rel) => (
                      <tr key={rel.id} className="border-b border-slate-900/60 hover:bg-slate-950/10">
                        <td className="py-2.5 font-semibold text-slate-250 pr-2">{rel.sourceId}</td>
                        <td className="py-2.5 font-mono text-[10px]">
                          <span className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-850 text-slate-400">
                            {isArabic ? rel.labelAr || rel.type : rel.labelEn || rel.type}
                          </span>
                        </td>
                        <td className="py-2.5 font-semibold text-slate-250">{rel.targetId}</td>
                        <td className="py-2.5 text-right pl-2">
                          <button
                            onClick={() => handleDeleteRelation(rel.id)}
                            className="text-red-400 hover:text-red-300 p-1 bg-red-950/5 hover:bg-red-950/20 border border-red-950/10 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'proposals' && (
          <AdminProposals
            proposals={proposals}
            token={token}
            userRole={user.role}
            isArabic={isArabic}
            onRefresh={() => {
              onRefreshData();
              fetchProposals();
            }}
          />
        )}

        {activeTab === 'maintenance' && (
          <AdminMaintenance
            companions={companions}
            token={token}
            userRole={user.role}
            isArabic={isArabic}
            onRefreshAll={() => {
              onRefreshData();
              fetchStats();
            }}
          />
        )}

        {activeTab === 'import_export' && (
          <AdminImportExport
            token={token}
            userRole={user.role}
            isArabic={isArabic}
            onRefreshAll={() => {
              onRefreshData();
              fetchStats();
            }}
          />
        )}

        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            <div className={`p-1 rounded-xl border flex w-fit gap-2 h-fit ${isDarkMode ? 'bg-natural-dark-panel border-natural-accent/15' : 'bg-slate-900 border-slate-800'}`}>
              <button
                onClick={() => setUsersSubTab('firebase')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${usersSubTab === 'firebase' ? 'bg-natural-accent text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {isArabic ? 'أعضاء ومقرئي المنصة (فييرستور)' : 'Ecosystem View (Firestore)'}
              </button>
              <button
                onClick={() => setUsersSubTab('classic')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${usersSubTab === 'classic' ? 'bg-natural-accent text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {isArabic ? 'طاقم المشرفين الكلاسيكيين (لوكال)' : 'Classic Team (Local)'}
              </button>
            </div>

            {usersSubTab === 'firebase' ? (
              <FirebaseUsersManager isArabic={isArabic} isDarkMode={isDarkMode} />
            ) : (
              <AdminUsers
                token={token}
                userRole={user.role}
                isArabic={isArabic}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
