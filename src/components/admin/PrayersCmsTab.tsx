import React, { useState } from 'react';
import { Plus, Edit2, Trash2, BookOpen, Music, FileText, Video, Search, Check, X } from 'lucide-react';
import { Prayer, Language, ThemeMode } from '../../types';

interface PrayersCmsTabProps {
  prayers: Prayer[];
  onSavePrayer: (p: Prayer) => void;
  onDeletePrayer: (id: string) => void;
  language: Language;
  theme: ThemeMode;
}

export const PrayersCmsTab: React.FC<PrayersCmsTabProps> = ({
  prayers,
  onSavePrayer,
  onDeletePrayer,
  language,
  theme,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editingPrayer, setEditingPrayer] = useState<Partial<Prayer> | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditingPrayer({
      id: `p-${Date.now()}`,
      title: { en: '', fa: '', ar: '' },
      author: 'Bahá\'u\'lláh',
      category: 'Persian Prayers',
      textEn: '',
      textFa: '',
      textAr: '',
      audioUrl: '',
      videoUrl: '',
      pdfUrl: '',
      audioChanter: '',
      tags: ['Devotional', 'Peace'],
      displayOrder: prayers.length + 1,
    });
    setIsDrawerOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrayer || (!editingPrayer.title?.en && !editingPrayer.title?.fa)) {
      alert('Please provide a title in English or Persian.');
      return;
    }

    const fullPrayer: Prayer = {
      id: editingPrayer.id || `p-${Date.now()}`,
      title: editingPrayer.title || { en: 'Prayer Title', fa: 'عنوان مناجات' },
      author: editingPrayer.author || 'Bahá\'u\'lláh',
      category: editingPrayer.category || 'Persian Prayers',
      textEn: editingPrayer.textEn || '',
      textFa: editingPrayer.textFa || '',
      textAr: editingPrayer.textAr || '',
      audioUrl: editingPrayer.audioUrl || '',
      videoUrl: editingPrayer.videoUrl || '',
      pdfUrl: editingPrayer.pdfUrl || '',
      audioChanter: editingPrayer.audioChanter || '',
      duration: editingPrayer.duration || '3:30',
      tags: editingPrayer.tags || ['Prayer'],
      isFeatured: Boolean(editingPrayer.isFeatured),
      displayOrder: Number(editingPrayer.displayOrder) || 1,
    };

    onSavePrayer(fullPrayer);
    setIsDrawerOpen(false);
    setEditingPrayer(null);
    showToast('Prayer text & audio chants published successfully!');
  };

  const filteredPrayers = prayers.filter(p => {
    const titleEn = p.title.en || '';
    const titleFa = p.title.fa || '';
    const matchesSearch = titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          titleFa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      
      {toastMsg && (
        <div className="p-3 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-2 shadow-lg animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 rtl:right-3 rtl:left-auto" />
            <input
              type="text"
              placeholder="Search prayers by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          >
            <option value="All" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Categories</option>
            <option value="Persian Prayers" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Persian Prayers</option>
            <option value="English Prayers" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">English Prayers</option>
            <option value="Arabic Prayers" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Arabic Prayers</option>
            <option value="Children's Prayers" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Children's Prayers</option>
            <option value="Healing" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Healing</option>
            <option value="Morning" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Morning</option>
          </select>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Prayer / Chant</span>
        </button>
      </div>

      {/* Prayers List Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left rtl:text-right text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Title & Author</th>
              <th className="p-3.5">Audio / Vocal Chanter</th>
              <th className="p-3.5">Text Excerpt</th>
              <th className="p-3.5 text-right rtl:text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredPrayers.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="p-3.5 font-semibold text-indigo-600 dark:text-indigo-400">
                  {p.category}
                </td>
                <td className="p-3.5">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{p.title.en}</div>
                  <div className="text-[11px] text-slate-400 font-persian">{p.title.fa}</div>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block mt-0.5">Author: {p.author}</span>
                </td>
                <td className="p-3.5">
                  {p.audioUrl ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <Music className="w-3.5 h-3.5" />
                      <span>{p.audioChanter || 'Audio Available'}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400">Text Only</span>
                  )}
                </td>
                <td className="p-3.5 max-w-xs truncate text-slate-500 dark:text-slate-400 font-persian">
                  {p.textFa || p.textEn}
                </td>
                <td className="p-3.5 text-right rtl:text-left space-x-1">
                  <button onClick={() => { setEditingPrayer(p); setIsDrawerOpen(true); }} className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => { if(confirm(`Delete prayer "${p.title.en}"?`)) onDeletePrayer(p.id); }} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Prayer Drawer */}
      {isDrawerOpen && editingPrayer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b mb-6">
                <h3 className="font-bold text-lg font-display flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  {editingPrayer.id ? 'Edit Prayer Entry' : 'Add New Prayer or Vocal Chant'}
                </h3>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-slate-400"><X className="w-5 h-5"/></button>
              </div>

              <form id="prayerForm" onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-800 dark:text-slate-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Author</label>
                    <select
                      value={editingPrayer.author}
                      onChange={(e) => setEditingPrayer({ ...editingPrayer, author: e.target.value })}
                      className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option value="Bahá'u'lláh" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Bahá'u'lláh</option>
                      <option value="The Báb" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">The Báb</option>
                      <option value="'Abdu'l-Bahá" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">'Abdu'l-Bahá</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                    <select
                      value={editingPrayer.category}
                      onChange={(e) => setEditingPrayer({ ...editingPrayer, category: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option value="Persian Prayers" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Persian Prayers</option>
                      <option value="English Prayers" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">English Prayers</option>
                      <option value="Arabic Prayers" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Arabic Prayers</option>
                      <option value="Children's Prayers" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Children's Prayers</option>
                      <option value="Healing" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Healing</option>
                      <option value="Morning" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Morning</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Title (English)</label>
                  <input
                    type="text"
                    required
                    value={editingPrayer.title?.en || ''}
                    onChange={(e) => setEditingPrayer({ ...editingPrayer, title: { ...(editingPrayer.title || { en: '', fa: '', ar: '' }), en: e.target.value } })}
                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Title (Persian - عنوان به فارسی)</label>
                  <input
                    type="text"
                    value={editingPrayer.title?.fa || ''}
                    onChange={(e) => setEditingPrayer({ ...editingPrayer, title: { ...(editingPrayer.title || { en: '', fa: '', ar: '' }), fa: e.target.value } })}
                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-persian"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Persian Text (متن مناجات)</label>
                  <textarea
                    rows={4}
                    value={editingPrayer.textFa || ''}
                    onChange={(e) => setEditingPrayer({ ...editingPrayer, textFa: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-persian leading-relaxed"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">English Translation</label>
                  <textarea
                    rows={4}
                    value={editingPrayer.textEn || ''}
                    onChange={(e) => setEditingPrayer({ ...editingPrayer, textEn: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Audio Chant MP3 URL</label>
                    <input
                      type="url"
                      placeholder="https://cdn..."
                      value={editingPrayer.audioUrl || ''}
                      onChange={(e) => setEditingPrayer({ ...editingPrayer, audioUrl: e.target.value })}
                      className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Audio Chanter Name</label>
                    <input
                      type="text"
                      placeholder="Roya & Choral Ensemble"
                      value={editingPrayer.audioChanter || ''}
                      onChange={(e) => setEditingPrayer({ ...editingPrayer, audioChanter: e.target.value })}
                      className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="pt-4 border-t flex justify-end gap-2">
              <button onClick={() => setIsDrawerOpen(false)} className="px-4 py-2 rounded-xl border">Cancel</button>
              <button type="submit" form="prayerForm" className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold">Publish Prayer</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
