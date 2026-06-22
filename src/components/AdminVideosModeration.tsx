/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Companion } from '../types';
import { Play, Plus, Trash2, Video, AlertCircle, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';

interface AdminVideosProps {
  companions: Companion[];
  isArabic: boolean;
  isDarkMode?: boolean;
}

export default function AdminVideosModeration({
  companions,
  isArabic,
  isDarkMode = true
}: AdminVideosProps) {
  const [videoList, setVideoList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ success: false, message: '' });

  // Form State
  const [selectedCompanionId, setSelectedCompanionId] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [titleFr, setTitleFr] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [channelName, setChannelName] = useState('');
  const [duration, setDuration] = useState('');

  const fetchVideos = async () => {
    setLoading(true);
    setStatus({ success: false, message: '' });
    try {
      const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
      const qSnap = await getDocs(q);
      const list: any[] = [];
      qSnap.forEach(snapshot => {
        list.push({ id: snapshot.id, ...snapshot.data() });
      });
      setVideoList(list);
    } catch (err: any) {
      console.error("Error loading videos:", err);
      setStatus({ success: false, message: isArabic ? 'حدث خطأ أثناء تحميل الفيديوهات.' : 'Error fetching video assets.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ success: false, message: '' });

    if (!selectedCompanionId) {
      setStatus({ success: false, message: isArabic ? 'يرجى اختيار الصحابي المعني.' : 'Please select a related companion.' });
      return;
    }
    if (!titleAr || !youtubeUrl) {
      setStatus({ success: false, message: isArabic ? 'يرجى تعبئة الحقول الأساسية (العنوان العربي والرابط).' : 'Please fill required Arabic Title & YouTube URL.' });
      return;
    }

    // Clean YouTube url format
    let cleanUrl = youtubeUrl.trim();
    if (!cleanUrl.includes('youtube.com') && !cleanUrl.includes('youtu.be')) {
      setStatus({ success: false, message: isArabic ? 'يرجى إدخال رابط يوتيوب صحيح.' : 'Please enter a valid YouTube link.' });
      return;
    }

    const videoId = `video_${Date.now()}`;
    const payload = {
      id: videoId,
      companionId: selectedCompanionId,
      titleAr: titleAr.trim(),
      titleFr: titleFr.trim() || titleAr.trim(),
      youtubeUrl: cleanUrl,
      createdAt: new Date().toISOString(),
      addedBy: 'bouallimohamed8@gmail.com', // Auth admin placeholder matching rules securely
      channelName: channelName.trim(),
      duration: duration.trim()
    };

    try {
      await setDoc(doc(db, 'videos', videoId), payload);
      setStatus({ success: true, message: isArabic ? 'تم إضافة الفيديو بنجاح لموسوعة سيرة الصحابي!' : 'YouTube reference synchronized and authorized!' });
      
      // Reset form
      setTitleAr('');
      setTitleFr('');
      setYoutubeUrl('');
      setChannelName('');
      setDuration('');
      
      // Refresh
      fetchVideos();
    } catch (err: any) {
      console.error("Error creating video:", err);
      setStatus({ success: false, message: err.message || 'Firestore Authorization Denied. Only configured admins can add resources.' });
    }
  };

  const handleDeleteVideo = async (vidId: string) => {
    const confirm = window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا التسجيل المرئي؟' : 'Are you sure you want to delete this YouTube entry?');
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, 'videos', vidId));
      setStatus({ success: true, message: isArabic ? 'تم حذف الفيديو.' : 'YouTube video deleted successfully.' });
      fetchVideos();
    } catch (err: any) {
      console.error(err);
      setStatus({ success: false, message: err.message || 'Deletion failed.' });
    }
  };

  // Associate companion helper
  const getCompanionName = (compId: string) => {
    const found = companions.find(c => c.id === compId);
    return found ? found.nameAr : compId;
  };

  return (
    <div className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Visual Tab Heading */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-amber-500 font-serif flex items-center gap-2">
            <Video className="w-5 h-5" />
            <span>{isArabic ? 'بوابة إدارة غرف المسموع والمرئي' : 'Educational Audiovisual & Video Moderation'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isArabic 
              ? 'تسمح هذه لوحة التحكم للمشرف بإضافة تسجيلات يوتيوب مرئية ووثائقية لكل صحابي لعرضها في صفحة السيرة.'
              : 'Approve and add quality YouTube video documentaries and lectures shown natively on Companion details view.'}
          </p>
        </div>
        <button
          onClick={fetchVideos}
          className="p-1.8 bg-slate-800 hover:bg-slate-755 rounded-lg text-slate-300 flex items-center gap-1 text-xs cursor-pointer"
          title="Refresh List"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isArabic ? 'تحديث' : 'Refresh'}</span>
        </button>
      </div>

      {/* Alert logs */}
      {status.message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-xs border ${
          status.success 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {status.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{status.message}</span>
        </div>
      )}

      {/* Grid: Form (Left) & Current Videos Table (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form: Add New Video Links */}
        <form onSubmit={handleAddVideo} className="lg:col-span-4 bg-slate-950/40 p-5 rounded-2xl border border-slate-850 space-y-4">
          <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isArabic ? 'إضافة وثائقي مرئي جديد' : 'Link New Documentary'}</span>
          </h4>

          {/* Related Companion Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400">{isArabic ? 'الصحابي المرتبط في سيرته :' : 'Target Companion Profile :'}</label>
            <select
              value={selectedCompanionId}
              required
              onChange={e => setSelectedCompanionId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-amber-500 outline-none"
            >
              <option value="">-- {isArabic ? 'اختر صحابياً شريفاً' : 'Select Companion'} --</option>
              {companions.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nameAr} ({c.nameEn})
                </option>
              ))}
            </select>
          </div>

          {/* YouTube Live URL */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400">{isArabic ? 'رابط ملف يوتيوب :' : 'YouTube Video URL / Link :'}</label>
            <input
              type="url"
              value={youtubeUrl}
              required
              onChange={e => setYoutubeUrl(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-amber-500 outline-none"
            />
          </div>

          {/* Video Title (Arabic) */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400">{isArabic ? 'عنوان الفيديو بالعربية :' : 'Video Title (Arabic) :'}</label>
            <input
              type="text"
              value={titleAr}
              required
              onChange={e => setTitleAr(e.target.value)}
              placeholder="e.g. سيرة بلال بن رباح بصوت عمر سليمان"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-amber-500 outline-none"
            />
          </div>

          {/* Video Title (French/English) */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400">{isArabic ? 'عنوان الفيديو بالفرنسية/الإنجليزية (اختياري) :' : 'Video Title (FR/EN - Optional) :'}</label>
            <input
              type="text"
              value={titleFr}
              onChange={e => setTitleFr(e.target.value)}
              placeholder="e.g. Bilal ibn Rabah documentary, Yaqeen series"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-amber-500 outline-none"
            />
          </div>

          {/* YouTube Channel Name */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400">{isArabic ? 'اسم القناة (اختياري) :' : 'Channel Name (Optional) :'}</label>
            <input
              type="text"
              value={channelName}
              onChange={e => setChannelName(e.target.value)}
              placeholder="e.g. Yaqeen Institute"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-amber-500 outline-none"
            />
          </div>

          {/* Video Duration */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400">{isArabic ? 'مدة الفيديو (اختياري، مثلاً 12:45) :' : 'Duration (Optional, e.g. 12:45) :'}</label>
            <input
              type="text"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              placeholder="e.g. 15:30"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-amber-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-455 text-slate-950 font-bold p-2.5 rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{isArabic ? 'تأكيد وحفظ بنظام الإباحة' : 'Authorize & Broadcast Video'}</span>
          </button>
        </form>

        {/* Existing Videos table/grid lists */}
        <div className="lg:col-span-8 space-y-3">
          <div className="bg-slate-950/20 p-4 border border-slate-850 rounded-2xl">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">
              {isArabic ? `قائمة الفيديوهات المفعلة (${videoList.length})` : `Authorized Audio-Visual Logs (${videoList.length})`}
            </h4>

            {loading ? (
              <div className="flex justify-center items-center py-10 text-xs font-mono text-slate-550">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                <span>{isArabic ? 'جاري استرداد الفيديوهات...' : 'Retrieving database assets...'}</span>
              </div>
            ) : videoList.length === 0 ? (
              <div className="text-center py-10 text-xs italic text-slate-500">
                {isArabic ? 'لا توجد فيديوهات مسجلة حالياً.' : 'No registered video documentation found. Add resources on the left!'}
              </div>
            ) : (
              <div className="max-h-[450px] overflow-y-auto space-y-2 pr-1">
                {videoList.map(v => (
                  <div key={v.id} className="p-3 bg-slate-900/50 border border-slate-850 hover:bg-slate-900/80 rounded-xl flex items-center justify-between text-xs gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="p-1 px-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9.5px] font-bold font-serif">
                          {getCompanionName(v.companionId)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: {v.id}
                        </span>
                      </div>
                      <div className="font-bold text-slate-200 truncate">{v.titleAr}</div>
                      <div className="text-[10.5px] text-slate-400 truncate italic">{v.titleFr}</div>
                      <div className="text-[9.5px] text-slate-550 font-mono flex items-center gap-1 mt-1">
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                        <a href={v.youtubeUrl} target="_blank" rel="noreferrer" className="hover:underline text-slate-400 truncate max-w-xs">{v.youtubeUrl}</a>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteVideo(v.id)}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition shrink-0 cursor-pointer"
                      title={isArabic ? 'حذف من النظام' : 'Revoke & Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
