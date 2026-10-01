import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Users, User, Globe, Mail, Check, X, Search, Sparkles } from 'lucide-react';
import { Host, Speaker, Language, ThemeMode } from '../../types';

interface HostsSpeakersCmsTabProps {
  hosts: Host[];
  speakers: Speaker[];
  onSaveHost: (h: Host) => void;
  onDeleteHost: (id: string) => void;
  onSaveSpeaker: (s: Speaker) => void;
  onDeleteSpeaker: (id: string) => void;
  language: Language;
  theme: ThemeMode;
}

export const HostsSpeakersCmsTab: React.FC<HostsSpeakersCmsTabProps> = ({
  hosts,
  speakers,
  onSaveHost,
  onDeleteHost,
  onSaveSpeaker,
  onDeleteSpeaker,
  language,
  theme,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'hosts' | 'speakers'>('hosts');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingHost, setEditingHost] = useState<Partial<Host> | null>(null);
  const [editingSpeaker, setEditingSpeaker] = useState<Partial<Speaker> | null>(null);
  const [isHostDrawerOpen, setIsHostDrawerOpen] = useState(false);
  const [isSpeakerDrawerOpen, setIsSpeakerDrawerOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleOpenNewHost = () => {
    setEditingHost({
      id: `h-${Date.now()}`,
      name: '',
      country: 'United States',
      email: '',
      bio: { en: '', fa: '', ar: '' },
      languages: ['English', 'Persian'],
      topics: ['Unity', 'Devotions'],
      isActive: true,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    });
    setIsHostDrawerOpen(true);
  };

  const handleOpenNewSpeaker = () => {
    setEditingSpeaker({
      id: `sp-${Date.now()}`,
      name: '',
      nameFa: '',
      title: { en: 'Bahá\'í Scholar', fa: 'پژوهشگر آیین بهائی', ar: 'باحث بهائي' },
      bio: { en: '', fa: '', ar: '' },
      topics: ['Unity', 'History'],
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      recentTalksCount: 1,
      language: 'Bilingual',
    });
    setIsSpeakerDrawerOpen(true);
  };

  const handleSaveHostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHost || !editingHost.name) return;

    const fullHost: Host = {
      id: editingHost.id || `h-${Date.now()}`,
      name: editingHost.name,
      country: editingHost.country || 'International',
      email: editingHost.email || '',
      websiteUrl: editingHost.websiteUrl || '',
      telegramUrl: editingHost.telegramUrl || '',
      youtubeUrl: editingHost.youtubeUrl || '',
      facebookUrl: editingHost.facebookUrl || '',
      instagramUrl: editingHost.instagramUrl || '',
      linkedinUrl: editingHost.linkedinUrl || '',
      bio: editingHost.bio || { en: 'Host biography', fa: 'بیوگرافی میزبان' },
      languages: editingHost.languages || ['English', 'Persian'],
      topics: editingHost.topics || ['Fellowship'],
      isActive: editingHost.isActive !== false,
      photoUrl: editingHost.photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    };

    onSaveHost(fullHost);
    setIsHostDrawerOpen(false);
    setEditingHost(null);
    showToast('Host profile saved!');
  };

  const handleSaveSpeakerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpeaker || !editingSpeaker.name) return;

    const fullSpeaker: Speaker = {
      id: editingSpeaker.id || `sp-${Date.now()}`,
      name: editingSpeaker.name,
      nameFa: editingSpeaker.nameFa || editingSpeaker.name,
      title: editingSpeaker.title || { en: 'Guest Speaker', fa: 'سخنران مهمان' },
      bio: editingSpeaker.bio || { en: 'Speaker biography', fa: 'بیوگرافی سخنران' },
      topics: editingSpeaker.topics || ['Spiritual Growth'],
      photoUrl: editingSpeaker.photoUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      youtubeUrl: editingSpeaker.youtubeUrl || '',
      telegramUrl: editingSpeaker.telegramUrl || '',
      websiteUrl: editingSpeaker.websiteUrl || '',
      recentTalksCount: editingSpeaker.recentTalksCount || 1,
      language: editingSpeaker.language || 'Bilingual',
    };

    onSaveSpeaker(fullSpeaker);
    setIsSpeakerDrawerOpen(false);
    setEditingSpeaker(null);
    showToast('Speaker profile saved!');
  };

  const filteredHosts = hosts.filter(h =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSpeakers = speakers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.nameFa && s.nameFa.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-2 shadow-lg animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('hosts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeSubTab === 'hosts'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Hosts Directory ({hosts.length})
          </button>
          <button
            onClick={() => setActiveSubTab('speakers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeSubTab === 'speakers'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Featured Speakers ({speakers.length})
          </button>
        </div>

        <button
          onClick={activeSubTab === 'hosts' ? handleOpenNewHost : handleOpenNewSpeaker}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>{activeSubTab === 'hosts' ? 'Add New Host' : 'Add New Speaker'}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 rtl:right-3 rtl:left-auto" />
        <input
          type="text"
          placeholder={`Search ${activeSubTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
        />
      </div>

      {/* HOSTS GRID */}
      {activeSubTab === 'hosts' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHosts.map(h => (
            <div key={h.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-3 shadow-sm">
              <img
                src={h.photoUrl}
                alt={h.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{h.name}</h4>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingHost(h); setIsHostDrawerOpen(true); }} className="p-1 text-slate-400 hover:text-indigo-500">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { if(confirm(`Delete ${h.name}?`)) onDeleteHost(h.id); }} className="p-1 text-slate-400 hover:text-rose-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 block">{h.country}</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{h.bio.en}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {h.languages.map(lang => (
                    <span key={lang} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-semibold">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SPEAKERS GRID */}
      {activeSubTab === 'speakers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpeakers.map(sp => (
            <div key={sp.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-3 shadow-sm">
              <img
                src={sp.photoUrl}
                alt={sp.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{sp.name}</h4>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingSpeaker(sp); setIsSpeakerDrawerOpen(true); }} className="p-1 text-slate-400 hover:text-indigo-500">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { if(confirm(`Delete ${sp.name}?`)) onDeleteSpeaker(sp.id); }} className="p-1 text-slate-400 hover:text-rose-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block">{sp.title.en}</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{sp.bio.en}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Host Drawer */}
      {isHostDrawerOpen && editingHost && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b mb-4">
                <h3 className="font-bold text-base">Host Profile Manager</h3>
                <button onClick={() => setIsHostDrawerOpen(false)} className="p-1 text-slate-400"><X className="w-5 h-5"/></button>
              </div>
              <form id="hostForm" onSubmit={handleSaveHostSubmit} className="space-y-3 text-xs text-slate-800 dark:text-slate-200">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Host Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Nader Saiedi"
                    value={editingHost.name || ''}
                    onChange={(e) => setEditingHost({ ...editingHost, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Country / Region</label>
                  <input
                    type="text"
                    placeholder="United States"
                    value={editingHost.country || ''}
                    onChange={(e) => setEditingHost({ ...editingHost, country: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Photo URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={editingHost.photoUrl || ''}
                    onChange={(e) => setEditingHost({ ...editingHost, photoUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Biography (English)</label>
                  <textarea
                    rows={3}
                    value={editingHost.bio?.en || ''}
                    onChange={(e) => setEditingHost({ ...editingHost, bio: { ...(editingHost.bio || { en: '', fa: '', ar: '' }), en: e.target.value } })}
                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Biography (Persian - فارسی)</label>
                  <textarea
                    rows={3}
                    value={editingHost.bio?.fa || ''}
                    onChange={(e) => setEditingHost({ ...editingHost, bio: { ...(editingHost.bio || { en: '', fa: '', ar: '' }), fa: e.target.value } })}
                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-persian"
                  />
                </div>
              </form>
            </div>
            <div className="pt-4 border-t flex justify-end gap-2">
              <button onClick={() => setIsHostDrawerOpen(false)} className="px-4 py-2 rounded-xl border">Cancel</button>
              <button type="submit" form="hostForm" className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold">Save Host</button>
            </div>
          </div>
        </div>
      )}

      {/* Speaker Drawer */}
      {isSpeakerDrawerOpen && editingSpeaker && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b mb-4">
                <h3 className="font-bold text-base">Speaker Profile Manager</h3>
                <button onClick={() => setIsSpeakerDrawerOpen(false)} className="p-1 text-slate-400"><X className="w-5 h-5"/></button>
              </div>
              <form id="speakerForm" onSubmit={handleSaveSpeakerSubmit} className="space-y-3 text-xs text-slate-800 dark:text-slate-200">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Speaker Name (English)</label>
                  <input
                    type="text"
                    required
                    value={editingSpeaker.name || ''}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Speaker Name (Persian - نام به فارسی)</label>
                  <input
                    type="text"
                    value={editingSpeaker.nameFa || ''}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, nameFa: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-persian"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Academic Title / Role</label>
                  <input
                    type="text"
                    value={editingSpeaker.title?.en || ''}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, title: { ...(editingSpeaker.title || { en: '', fa: '', ar: '' }), en: e.target.value } })}
                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Photo URL</label>
                  <input
                    type="url"
                    value={editingSpeaker.photoUrl || ''}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, photoUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
              </form>
            </div>
            <div className="pt-4 border-t flex justify-end gap-2">
              <button onClick={() => setIsSpeakerDrawerOpen(false)} className="px-4 py-2 rounded-xl border">Cancel</button>
              <button type="submit" form="speakerForm" className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold">Save Speaker</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
