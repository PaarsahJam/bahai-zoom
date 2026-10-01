import React, { useState } from 'react';
import { 
  Plus, Edit2, Trash2, Copy, Eye, Check, X, Search, Filter, 
  Video, Calendar as CalendarIcon, Clock, Link, Shield, Sparkles, AlertCircle
} from 'lucide-react';
import { Meeting, Host, Speaker, Language, ThemeMode } from '../../types';

interface MeetingsCmsTabProps {
  meetings: Meeting[];
  hosts: Host[];
  speakers: Speaker[];
  onSaveMeeting: (m: Meeting) => void;
  onDeleteMeeting: (id: string) => void;
  onDuplicateMeeting: (m: Meeting) => void;
  language: Language;
  theme: ThemeMode;
  currentUserRole: string;
}

export const MeetingsCmsTab: React.FC<MeetingsCmsTabProps> = ({
  meetings,
  hosts,
  speakers,
  onSaveMeeting,
  onDeleteMeeting,
  onDuplicateMeeting,
  language,
  theme,
  currentUserRole,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingMeeting, setEditingMeeting] = useState<Partial<Meeting> | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [previewMeeting, setPreviewMeeting] = useState<Meeting | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditingMeeting({
      id: `m-${Date.now()}`,
      title: { en: '', fa: '', ar: '' },
      subtitle: { en: '', fa: '', ar: '' },
      description: { en: '', fa: '', ar: '' },
      host: hosts[0]?.name || 'BahaiZoom Host',
      time: '19:00 UTC',
      dayOfWeek: 1,
      durationMinutes: 60,
      timezone: 'UTC',
      language: 'Persian',
      zoomUrl: 'https://zoom.us/j/1234567890',
      zoomMeetingId: '123 4567 890',
      passCode: '20262026',
      category: 'Devotional',
      meetingType: 'Zoom',
      recurrence: 'Weekly',
      isLive: false,
      isFeatured: false,
      isActive: true,
      displayOrder: meetings.length + 1,
    });
    setIsDrawerOpen(true);
  };

  const handleEdit = (m: Meeting) => {
    setEditingMeeting({ ...m });
    setIsDrawerOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeeting || !editingMeeting.title?.en) {
      alert('Please provide an English title at minimum.');
      return;
    }

    const fullMeeting: Meeting = {
      id: editingMeeting.id || `m-${Date.now()}`,
      title: editingMeeting.title || { en: 'Untitled Gathering', fa: 'جلسه بدون عنوان' },
      subtitle: editingMeeting.subtitle || { en: '' },
      description: editingMeeting.description || { en: 'Gathering description' },
      host: editingMeeting.host || 'BahaiZoom Host',
      hostRole: editingMeeting.hostRole || 'Host',
      time: editingMeeting.time || '19:00 UTC',
      dayOfWeek: editingMeeting.dayOfWeek ?? 1,
      durationMinutes: Number(editingMeeting.durationMinutes) || 60,
      timezone: editingMeeting.timezone || 'UTC',
      language: editingMeeting.language || 'Persian',
      zoomUrl: editingMeeting.zoomUrl || 'https://zoom.us',
      zoomMeetingId: editingMeeting.zoomMeetingId || '',
      passCode: editingMeeting.passCode || '2026',
      category: editingMeeting.category || 'Devotional',
      meetingType: editingMeeting.meetingType || 'Zoom',
      recurrence: editingMeeting.recurrence || 'Weekly',
      isLive: Boolean(editingMeeting.isLive),
      isFeatured: Boolean(editingMeeting.isFeatured),
      isActive: editingMeeting.isActive !== false,
      registrationLink: editingMeeting.registrationLink || '',
      maxAttendees: editingMeeting.maxAttendees ? Number(editingMeeting.maxAttendees) : undefined,
      thumbnailUrl: editingMeeting.thumbnailUrl || '',
      displayOrder: Number(editingMeeting.displayOrder) || 1,
    };

    onSaveMeeting(fullMeeting);
    setIsDrawerOpen(false);
    setEditingMeeting(null);
    showToast('Meeting configuration successfully saved and published!');
  };

  const filteredMeetings = meetings.filter(m => {
    const titleEn = m.title.en || '';
    const titleFa = m.title.fa || '';
    const host = m.host || '';
    const matchesSearch = titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          titleFa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          host.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Active' && m.isActive !== false) || 
      (statusFilter === 'Inactive' && m.isActive === false) ||
      (statusFilter === 'Live' && m.isLive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-2 animate-fade-in shadow-lg">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Action & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80">
        
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 rtl:right-3 rtl:left-auto" />
            <input
              type="text"
              placeholder="Search meetings by title, host, or language..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 rtl:pr-9 rtl:pl-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          >
            <option value="All" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Categories</option>
            <option value="Prayer" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Prayer & Devotional</option>
            <option value="Educational" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Educational</option>
            <option value="Youth" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Youth Empowerment</option>
            <option value="Devotional" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Devotional</option>
            <option value="Special Event" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Special Event</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          >
            <option value="All" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Statuses</option>
            <option value="Active" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Active Only</option>
            <option value="Inactive" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Inactive</option>
            <option value="Live" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Currently Live</option>
          </select>
        </div>

        {/* Add Meeting CTA */}
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Meeting</span>
        </button>
      </div>

      {/* Meetings Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left rtl:text-right text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Title & Language</th>
              <th className="p-3.5">Host</th>
              <th className="p-3.5">Schedule</th>
              <th className="p-3.5">Type & Category</th>
              <th className="p-3.5">Zoom Credentials</th>
              <th className="p-3.5 text-right rtl:text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredMeetings.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  No meetings matching your current filter criteria.
                </td>
              </tr>
            ) : (
              filteredMeetings.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5">
                      {m.isLive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                          LIVE NOW
                        </span>
                      ) : m.isActive !== false ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Draft
                        </span>
                      )}
                      {m.isFeatured && (
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" title="Featured on Hero" />
                      )}
                    </div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 dark:text-slate-100 max-w-xs truncate">
                      {m.title.en}
                    </div>
                    {m.title.fa && (
                      <div className="text-[11px] text-slate-400 font-persian truncate">
                        {m.title.fa}
                      </div>
                    )}
                    <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded font-semibold">
                      {m.language}
                    </span>
                  </td>

                  <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">
                    {m.host}
                  </td>

                  <td className="p-3.5">
                    <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200">
                      {m.time}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Day {m.dayOfWeek} ({m.durationMinutes} min)
                    </div>
                  </td>

                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 font-medium">
                      {m.category}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {m.meetingType || 'Zoom'} • {m.recurrence || 'Weekly'}
                    </div>
                  </td>

                  <td className="p-3.5 font-mono text-[11px]">
                    <div className="text-indigo-600 dark:text-indigo-400 truncate max-w-[120px]">
                      ID: {m.zoomMeetingId || 'Auto'}
                    </div>
                    <div className="text-slate-400">Pass: {m.passCode}</div>
                  </td>

                  <td className="p-3.5 text-right rtl:text-left space-x-1 rtl:space-x-reverse">
                    <button
                      onClick={() => setPreviewMeeting(m)}
                      title="Preview Card"
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDuplicateMeeting(m)}
                      title="Duplicate"
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(m)}
                      title="Edit"
                      className="p-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete meeting "${m.title.en}"?`)) {
                          onDeleteMeeting(m.id);
                          showToast('Meeting deleted.');
                        }
                      }}
                      title="Delete"
                      className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-over Drawer / Modal for Add & Edit Meeting */}
      {isDrawerOpen && editingMeeting && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
            
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-indigo-500" />
                  {editingMeeting.id ? 'Edit Zoom Meeting Schedule' : 'Create New Zoom Gathering'}
                </h3>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form id="meetingForm" onSubmit={handleSubmitForm} className="space-y-4 text-xs text-slate-800 dark:text-slate-200">
                
                {/* Titles Section */}
                <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">Meeting Titles (Multilingual)</label>
                  <input
                    type="text"
                    required
                    placeholder="English Title (e.g. Global Devotional & Peace Chants)"
                    value={editingMeeting.title?.en || ''}
                    onChange={(e) => setEditingMeeting({
                      ...editingMeeting,
                      title: { ...(editingMeeting.title || { en: '', fa: '', ar: '' }), en: e.target.value }
                    })}
                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Persian Title (عنوان به فارسی)"
                    value={editingMeeting.title?.fa || ''}
                    onChange={(e) => setEditingMeeting({
                      ...editingMeeting,
                      title: { ...(editingMeeting.title || { en: '', fa: '', ar: '' }), fa: e.target.value }
                    })}
                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-persian focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Arabic Title (العنوان بالعربية)"
                    value={editingMeeting.title?.ar || ''}
                    onChange={(e) => setEditingMeeting({
                      ...editingMeeting,
                      title: { ...(editingMeeting.title || { en: '', fa: '', ar: '' }), ar: e.target.value }
                    })}
                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Host & Speakers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Select Host</label>
                    <select
                      value={editingMeeting.host}
                      onChange={(e) => setEditingMeeting({ ...editingMeeting, host: e.target.value })}
                      className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      {hosts.map(h => (
                        <option key={h.id} value={h.name} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{h.name} ({h.country})</option>
                      ))}
                      <option value="BahaiZoom Host" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">BahaiZoom Spiritual Committee</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Primary Language</label>
                    <select
                      value={editingMeeting.language}
                      onChange={(e) => setEditingMeeting({ ...editingMeeting, language: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option value="Persian" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Persian</option>
                      <option value="English" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">English</option>
                      <option value="Bilingual" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Bilingual (English / Persian)</option>
                      <option value="Arabic" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Arabic</option>
                      <option value="Spanish" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Spanish</option>
                      <option value="French" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">French</option>
                      <option value="Turkish" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Turkish</option>
                    </select>
                  </div>
                </div>

                {/* Time & Recurrence */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Time (UTC)</label>
                    <input
                      type="text"
                      placeholder="e.g. 19:00 UTC"
                      value={editingMeeting.time || ''}
                      onChange={(e) => setEditingMeeting({ ...editingMeeting, time: e.target.value })}
                      className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Day of Week</label>
                    <select
                      value={editingMeeting.dayOfWeek}
                      onChange={(e) => setEditingMeeting({ ...editingMeeting, dayOfWeek: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option value={0} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Sunday</option>
                      <option value={1} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Monday</option>
                      <option value={2} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Tuesday</option>
                      <option value={3} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Wednesday</option>
                      <option value={4} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Thursday</option>
                      <option value={5} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Friday</option>
                      <option value={6} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Saturday</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Duration (Mins)</label>
                    <input
                      type="number"
                      value={editingMeeting.durationMinutes || 60}
                      onChange={(e) => setEditingMeeting({ ...editingMeeting, durationMinutes: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Zoom Credentials */}
                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                  <label className="font-bold text-indigo-700 dark:text-indigo-300 block">Zoom Integration & Credentials</label>
                  <div>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5">Zoom Join URL</span>
                    <input
                      type="url"
                      required
                      placeholder="https://zoom.us/j/..."
                      value={editingMeeting.zoomUrl || ''}
                      onChange={(e) => setEditingMeeting({ ...editingMeeting, zoomUrl: e.target.value })}
                      className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5">Meeting ID</span>
                      <input
                        type="text"
                        placeholder="910 820 3040"
                        value={editingMeeting.zoomMeetingId || ''}
                        onChange={(e) => setEditingMeeting({ ...editingMeeting, zoomMeetingId: e.target.value })}
                        className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 block mb-0.5">Passcode</span>
                      <input
                        type="text"
                        required
                        placeholder="191919"
                        value={editingMeeting.passCode || ''}
                        onChange={(e) => setEditingMeeting({ ...editingMeeting, passCode: e.target.value })}
                        className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Flags & Toggles */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/60 cursor-pointer text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={editingMeeting.isActive !== false}
                      onChange={(e) => setEditingMeeting({ ...editingMeeting, isActive: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <span className="font-semibold">Published (Active)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/60 cursor-pointer text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={Boolean(editingMeeting.isLive)}
                      onChange={(e) => setEditingMeeting({ ...editingMeeting, isLive: e.target.checked })}
                      className="rounded text-rose-600"
                    />
                    <span className="font-semibold text-rose-600 dark:text-rose-400">Broadcast LIVE</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/60 cursor-pointer text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={Boolean(editingMeeting.isFeatured)}
                      onChange={(e) => setEditingMeeting({ ...editingMeeting, isFeatured: e.target.checked })}
                      className="rounded text-amber-500"
                    />
                    <span className="font-semibold">Featured on Hero</span>
                  </label>
                </div>

              </form>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 rounded-xl border text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="meetingForm"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
              >
                Save & Apply to Public Site
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Preview Card Modal */}
      {previewMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Live Preview</span>
              <button onClick={() => setPreviewMeeting(null)} className="p-1 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">{previewMeeting.title.en}</h4>
              <p className="text-xs text-slate-500 mt-1">{previewMeeting.description?.en}</p>
              <div className="mt-3 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                Passcode: {previewMeeting.passCode} • Time: {previewMeeting.time}
              </div>
            </div>
            <button
              onClick={() => setPreviewMeeting(null)}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
