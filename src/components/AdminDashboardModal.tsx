import React, { useState, useEffect } from 'react';
import { 
  Shield, Calendar, Users, BookOpen, Video, Settings, Plus, Trash2, 
  Check, X, Activity, Globe, Rss, FileCode, Edit3, Lock, Key, LogOut,
  Folder, Layers, AlertCircle, Clock, Eye, UserCheck, RefreshCw
} from 'lucide-react';
import { 
  Meeting, Host, Speaker, Prayer, MediaItem, Resource, EventItem, 
  CmsUser, HomepageContent, SiteSettings, AuditLogEntry, MediaLibraryFile,
  Language, ThemeMode 
} from '../types';
import { 
  loadCmsData, saveCmsData, logCmsAudit,
  INITIAL_CMS_USERS, INITIAL_HOSTS, INITIAL_MEDIA_FILES, INITIAL_HOMEPAGE_CONTENT, 
  INITIAL_SITE_SETTINGS, INITIAL_AUDIT_LOGS 
} from '../utils/cmsStorage';
import { canAccessAdmin, assertAdminAccess } from '../utils/authPermissions';

import { MeetingsCmsTab } from './admin/MeetingsCmsTab';
import { HostsSpeakersCmsTab } from './admin/HostsSpeakersCmsTab';
import { PrayersCmsTab } from './admin/PrayersCmsTab';
import { MediaLibraryCmsTab } from './admin/MediaLibraryCmsTab';
import { ScheduleCalendarCmsTab } from './admin/ScheduleCalendarCmsTab';
import { SiteSettingsCmsTab } from './admin/SiteSettingsCmsTab';
import { UsersCmsTab } from './admin/UsersCmsTab';
import { AuditLogsCmsTab } from './admin/AuditLogsCmsTab';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  theme: ThemeMode;
  // Dynamic App State props & callbacks
  meetings: Meeting[];
  onSaveMeeting: (m: Meeting) => void;
  onDeleteMeeting: (id: string) => void;
  speakers: Speaker[];
  onSaveSpeaker: (s: Speaker) => void;
  onDeleteSpeaker: (id: string) => void;
  prayers: Prayer[];
  onSavePrayer: (p: Prayer) => void;
  onDeletePrayer: (id: string) => void;
  mediaItems?: MediaItem[];
  onSaveMedia?: (m: MediaItem) => void;
  onDeleteMedia?: (id: string) => void;
  events: EventItem[];
  onSaveEvent: (e: EventItem) => void;
  onDeleteEvent: (id: string) => void;
  homepageContent: HomepageContent;
  onSaveHomepageContent: (hp: HomepageContent) => void;
  siteSettings: SiteSettings;
  onSaveSiteSettings: (st: SiteSettings) => void;
  cmsUsers?: CmsUser[];
  onSaveCmsUser?: (u: CmsUser) => void;
  onDeleteCmsUser?: (id: string) => void;
  currentUser?: CmsUser | null;
  onUpdateCurrentUser?: (user: CmsUser | null) => void;
  initialTab?: string;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  language,
  theme,
  meetings,
  onSaveMeeting,
  onDeleteMeeting,
  speakers,
  onSaveSpeaker,
  onDeleteSpeaker,
  prayers,
  onSavePrayer,
  onDeletePrayer,
  mediaItems = [],
  onSaveMedia,
  onDeleteMedia,
  events,
  onSaveEvent,
  onDeleteEvent,
  homepageContent,
  onSaveHomepageContent,
  siteSettings,
  onSaveSiteSettings,
  cmsUsers: cmsUsersProp,
  onSaveCmsUser,
  onDeleteCmsUser,
  currentUser,
  onUpdateCurrentUser,
  initialTab = 'overview',
}) => {
  // Authorization gate: ONLY authenticated Administrators may use the CMS.
  const isAuthorizedAdmin = canAccessAdmin(currentUser);
  const adminUser = isAuthorizedAdmin ? currentUser : null;

  // Force Change Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passChangeError, setPassChangeError] = useState<string | null>(null);

  // CMS Persistent Datasets
  const [cmsUsers, setCmsUsers] = useState<CmsUser[]>(() => loadCmsData('bz_cms_users', INITIAL_CMS_USERS));
  const [hosts, setHosts] = useState<Host[]>(() => loadCmsData('bz_cms_hosts', INITIAL_HOSTS));
  const [mediaFiles, setMediaFiles] = useState<MediaLibraryFile[]>(() => loadCmsData('bz_cms_files', INITIAL_MEDIA_FILES));
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => loadCmsData('bz_cms_audit', INITIAL_AUDIT_LOGS));

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'meetings' | 'hosts_speakers' | 'prayers' | 'media' | 'schedule' | 'settings' | 'users' | 'audit'
  >(initialTab as any);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab as any);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    saveCmsData('bz_cms_users', cmsUsers);
  }, [cmsUsers]);

  useEffect(() => {
    saveCmsData('bz_cms_hosts', hosts);
  }, [hosts]);

  useEffect(() => {
    saveCmsData('bz_cms_files', mediaFiles);
  }, [mediaFiles]);

  if (!isOpen) return null;

  // Backend enforcement guard: unauthorized data mutations are rejected outright.
  const requireAdmin = (action: string) => {
    try {
      assertAdminAccess(adminUser, action);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return false;
    }
    return true;
  };

  const handleLogout = () => {
    localStorage.removeItem('bz_cms_auth_user');
    if (onUpdateCurrentUser) {
      onUpdateCurrentUser(null);
    }
    onClose();
  };

  // --- FORCE CHANGE PASSWORD HANDLER ---
  const handleForcePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassChangeError(null);

    if (!adminUser) return;

    if (newPassword.length < 8) {
      setPassChangeError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassChangeError('Passwords do not match.');
      return;
    }

    if (newPassword === 'ChangeMe123!') {
      setPassChangeError('Please choose a new password different from default.');
      return;
    }

    const updatedUser: CmsUser = {
      ...adminUser,
      mustChangePassword: false,
    };

    const updatedCmsUsers = cmsUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
    setCmsUsers(updatedCmsUsers);
    saveCmsData('bz_cms_auth_user', updatedUser);
    if (onUpdateCurrentUser) {
      onUpdateCurrentUser(updatedUser);
    }

    logCmsAudit(updatedUser.username, 'PASSWORD_CHANGE', 'Auth', 'Administrator updated initial password');
  };

  // --- CRUD DISPATCHERS WITH AUDIT LOGS ---
  const handleSaveMeetingWithAudit = (m: Meeting) => {
    if (!requireAdmin('save meeting')) return;
    onSaveMeeting(m);
    logCmsAudit(adminUser?.username || 'admin', 'SAVE_MEETING', 'Meeting', `Saved meeting: ${m.title.en}`);
  };

  const handleDeleteMeetingWithAudit = (id: string) => {
    if (!requireAdmin('delete meeting')) return;
    onDeleteMeeting(id);
    logCmsAudit(adminUser?.username || 'admin', 'DELETE_MEETING', 'Meeting', `Deleted meeting ID: ${id}`);
  };

  const handleDuplicateMeeting = (m: Meeting) => {
    if (!requireAdmin('duplicate meeting')) return;
    const dup: Meeting = {
      ...m,
      id: `m-${Date.now()}`,
      title: {
        en: `${m.title.en} (Copy)`,
        fa: `${m.title.fa || m.title.en} (کپی)`,
        ar: `${m.title.ar || m.title.en}`,
      },
      isLive: false,
    };
    onSaveMeeting(dup);
    logCmsAudit(adminUser?.username || 'admin', 'DUPLICATE_MEETING', 'Meeting', `Duplicated meeting: ${m.title.en}`);
  };

  const handleSaveHost = (h: Host) => {
    if (!requireAdmin('save host')) return;
    const existingIdx = hosts.findIndex(item => item.id === h.id);
    if (existingIdx >= 0) {
      const next = [...hosts];
      next[existingIdx] = h;
      setHosts(next);
    } else {
      setHosts([h, ...hosts]);
    }
    logCmsAudit(adminUser?.username || 'admin', 'SAVE_HOST', 'Host', `Saved host profile: ${h.name}`);
  };

  const handleDeleteHost = (id: string) => {
    if (!requireAdmin('delete host')) return;
    setHosts(hosts.filter(h => h.id !== id));
    logCmsAudit(adminUser?.username || 'admin', 'DELETE_HOST', 'Host', `Deleted host ID: ${id}`);
  };

  const handleSaveSpeakerWithAudit = (s: Speaker) => {
    if (!requireAdmin('save speaker')) return;
    onSaveSpeaker(s);
    logCmsAudit(adminUser?.username || 'admin', 'SAVE_SPEAKER', 'Speaker', `Saved speaker profile: ${s.name}`);
  };

  const handleDeleteSpeakerWithAudit = (id: string) => {
    if (!requireAdmin('delete speaker')) return;
    onDeleteSpeaker(id);
    logCmsAudit(adminUser?.username || 'admin', 'DELETE_SPEAKER', 'Speaker', `Deleted speaker ID: ${id}`);
  };

  const handleSavePrayerWithAudit = (p: Prayer) => {
    if (!requireAdmin('save prayer')) return;
    onSavePrayer(p);
    logCmsAudit(adminUser?.username || 'admin', 'SAVE_PRAYER', 'Prayer', `Saved prayer: ${p.title.en}`);
  };

  const handleDeletePrayerWithAudit = (id: string) => {
    if (!requireAdmin('delete prayer')) return;
    onDeletePrayer(id);
    logCmsAudit(adminUser?.username || 'admin', 'DELETE_PRAYER', 'Prayer', `Deleted prayer ID: ${id}`);
  };

  const handleUploadMediaFile = (file: MediaLibraryFile) => {
    if (!requireAdmin('upload media file')) return;
    setMediaFiles([file, ...mediaFiles]);
    logCmsAudit(adminUser?.username || 'admin', 'UPLOAD_FILE', 'MediaLibrary', `Uploaded file: ${file.name}`);
  };

  const handleDeleteMediaFile = (id: string) => {
    if (!requireAdmin('delete media file')) return;
    setMediaFiles(mediaFiles.filter(f => f.id !== id));
    logCmsAudit(adminUser?.username || 'admin', 'DELETE_FILE', 'MediaLibrary', `Deleted file ID: ${id}`);
  };

  const handleSaveUser = (u: CmsUser) => {
    if (!requireAdmin('save user')) return;
    if (onSaveCmsUser) {
      onSaveCmsUser(u);
    } else {
      const existing = cmsUsers.findIndex(x => x.id === u.id);
      if (existing >= 0) {
        const next = [...cmsUsers];
        next[existing] = u;
        setCmsUsers(next);
      } else {
        setCmsUsers([u, ...cmsUsers]);
      }
    }
    logCmsAudit(adminUser?.username || 'admin', 'SAVE_USER', 'Users', `Saved user account: ${u.name} (${u.email})`);
  };

  const handleDeleteUser = (id: string) => {
    if (!requireAdmin('delete user')) return;
    if (onDeleteCmsUser) {
      onDeleteCmsUser(id);
    } else {
      setCmsUsers(cmsUsers.filter(u => u.id !== id));
    }
    logCmsAudit(adminUser?.username || 'admin', 'DELETE_USER', 'Users', `Deleted user ID: ${id}`);
  };

  // KPIs
  const totalMeetings = meetings.length;
  const activeMeetings = meetings.filter(m => m.isActive !== false).length;
  const liveMeetings = meetings.filter(m => m.isLive).length;
  const totalHosts = hosts.length;
  const totalSpeakers = speakers.length;
  const totalPrayers = prayers.length;
  const totalFiles = mediaFiles.length;
  const totalUsers = cmsUsers.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className={`w-full max-w-7xl h-[92vh] rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>

        {/* --- ACCESS RESTRICTED: NON-ADMIN USERS NEVER SEE THE CMS --- */}
        {!isAuthorizedAdmin && (
          <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white">
            <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/95 border border-amber-500/30 shadow-2xl space-y-6 relative text-center">
              <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-amber-400">Administrator Privileges Required</h3>
                <p className="text-xs text-slate-300">
                  {currentUser
                    ? <>You are currently signed in as <strong className="text-white">{currentUser.name}</strong> (<span className="text-amber-300">{currentUser.role}</span>).</>
                    : 'You are not signed in. Please sign in with an administrator account to access the CMS.'}
                </p>
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 text-start space-y-1">
                  <p className="font-bold text-slate-300">🔒 Security Control Policy:</p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                    <li>Only <strong>Administrator</strong> accounts can access CMS site management, user administration, and system controls.</li>
                    <li>As a registered member, you can edit your own profile, avatar, gender, and credentials via the user profile menu.</li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg cursor-pointer transition-all"
                >
                  Return to Homepage
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- FORCE PASSWORD CHANGE SCREEN (Administrators only) --- */}
        {isAuthorizedAdmin && adminUser && adminUser.mustChangePassword && (
          <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white">
            <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/90 border border-amber-500/40 shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
                  <Key className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold font-display text-amber-300">Initial Password Change Required</h2>
                <p className="text-xs text-slate-300">For security compliance, you must set a custom password for account @{adminUser.username} before accessing the CMS.</p>
              </div>

              {passChangeError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs text-center">
                  {passChangeError}
                </div>
              )}

              <form onSubmit={handleForcePasswordChange} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs cursor-pointer shadow-lg"
                >
                  Save New Password & Continue
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- MAIN CMS ADMIN DASHBOARD WORKSPACE (Administrators only) --- */}
        {isAuthorizedAdmin && adminUser && !adminUser.mustChangePassword && (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Top Navigation Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold font-display flex items-center gap-2">
                    <span>BahaiZoom Content Management System</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      v2.8 Live
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400">Authorized Session: {adminUser.name} ({adminUser.role})</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ⚡ Autosave Active
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sidebar + Main Content Layout */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Left Sidebar Menu */}
              <div className="w-56 bg-slate-950 text-slate-300 border-r border-slate-800 flex flex-col p-3 gap-1 overflow-y-auto">
                
                {[
                  { id: 'overview', label: 'Dashboard Overview', icon: Activity },
                  { id: 'meetings', label: 'Zoom Meetings', icon: Video, badge: totalMeetings },
                  { id: 'hosts_speakers', label: 'Hosts & Speakers', icon: Users, badge: totalHosts + totalSpeakers },
                  { id: 'prayers', label: 'Prayer Chants', icon: BookOpen, badge: totalPrayers },
                  { id: 'media', label: 'Media Library', icon: Folder, badge: totalFiles },
                  { id: 'schedule', label: 'Schedule & Calendar', icon: Calendar },
                  { id: 'settings', label: 'Homepage & Settings', icon: Settings },
                  { id: 'users', label: 'User Management', icon: UserCheck, badge: totalUsers },
                  { id: 'audit', label: 'Security Audit Logs', icon: Lock },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                          : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                <div className="mt-auto pt-4 border-t border-slate-800 text-[10px] text-slate-500 space-y-1 p-2">
                  <span className="block font-bold text-slate-400">BahaiZoom Security System</span>
                  <span>CSRF & XSS Safeguarded</span>
                  <span className="block">Role: {adminUser?.role}</span>
                </div>
              </div>

              {/* Main Workspace Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50">
                
                {/* VIEW 1: DASHBOARD OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    
                    {/* KPI Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                      <div className="p-3.5 rounded-2xl bg-indigo-950 text-white border border-indigo-800 shadow-sm">
                        <span className="text-2xl font-extrabold font-mono text-amber-300 block">{liveMeetings}</span>
                        <span className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">Live Now</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm">
                        <span className="text-2xl font-extrabold font-mono text-white block">{totalMeetings}</span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Meetings</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm">
                        <span className="text-2xl font-extrabold font-mono text-white block">{totalHosts}</span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Hosts</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm">
                        <span className="text-2xl font-extrabold font-mono text-white block">{totalSpeakers}</span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Speakers</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm">
                        <span className="text-2xl font-extrabold font-mono text-white block">{totalPrayers}</span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Prayers</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm">
                        <span className="text-2xl font-extrabold font-mono text-white block">{totalFiles}</span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Media Files</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm">
                        <span className="text-2xl font-extrabold font-mono text-white block">{events.length}</span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Calendar</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm">
                        <span className="text-2xl font-extrabold font-mono text-white block">{totalUsers}</span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Admins</span>
                      </div>
                    </div>

                    {/* Quick Overview Panels */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Active Meetings Overview */}
                      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                          <h3 className="font-bold text-sm font-display flex items-center gap-2">
                            <Video className="w-4 h-4 text-indigo-500" />
                            <span>Active Meetings & Zoom Links</span>
                          </h3>
                          <button onClick={() => setActiveTab('meetings')} className="text-xs font-bold text-indigo-500 hover:underline">
                            Manage All ({totalMeetings})
                          </button>
                        </div>
                        <div className="space-y-2">
                          {meetings.slice(0, 4).map(m => (
                            <div key={m.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                              <div>
                                <strong className="block font-bold text-slate-900 dark:text-slate-100">{m.title.en}</strong>
                                <span className="text-slate-400">{m.time} • Host: {m.host}</span>
                              </div>
                              <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-500 font-mono font-bold">
                                PASS: {m.passCode}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recent Audit Log Activity */}
                      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                          <h3 className="font-bold text-sm font-display flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span>Recent Audit Trail</span>
                          </h3>
                          <button onClick={() => setActiveTab('audit')} className="text-xs font-bold text-amber-500 hover:underline">
                            View Full Logs
                          </button>
                        </div>
                        <div className="space-y-2">
                          {auditLogs.slice(0, 4).map(log => (
                            <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                              <div>
                                <span className="font-bold text-slate-900 dark:text-slate-100">@{log.user}</span>
                                <span className="text-slate-400 block text-[11px]">{log.details}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>
                )}

                {/* VIEW 2: MEETINGS CMS TAB */}
                {activeTab === 'meetings' && (
                  <MeetingsCmsTab
                    meetings={meetings}
                    hosts={hosts}
                    speakers={speakers}
                    onSaveMeeting={handleSaveMeetingWithAudit}
                    onDeleteMeeting={handleDeleteMeetingWithAudit}
                    onDuplicateMeeting={handleDuplicateMeeting}
                    language={language}
                    theme={theme}
                    currentUserRole={adminUser?.role}
                  />
                )}

                {/* VIEW 3: HOSTS & SPEAKERS CMS TAB */}
                {activeTab === 'hosts_speakers' && (
                  <HostsSpeakersCmsTab
                    hosts={hosts}
                    speakers={speakers}
                    onSaveHost={handleSaveHost}
                    onDeleteHost={handleDeleteHost}
                    onSaveSpeaker={handleSaveSpeakerWithAudit}
                    onDeleteSpeaker={handleDeleteSpeakerWithAudit}
                    language={language}
                    theme={theme}
                  />
                )}

                {/* VIEW 4: PRAYERS CMS TAB */}
                {activeTab === 'prayers' && (
                  <PrayersCmsTab
                    prayers={prayers}
                    onSavePrayer={handleSavePrayerWithAudit}
                    onDeletePrayer={handleDeletePrayerWithAudit}
                    language={language}
                    theme={theme}
                  />
                )}

                {/* VIEW 5: MEDIA LIBRARY CMS TAB */}
                {activeTab === 'media' && (
                  <MediaLibraryCmsTab
                    files={mediaFiles}
                    onUploadFile={handleUploadMediaFile}
                    onDeleteFile={handleDeleteMediaFile}
                    mediaItems={mediaItems}
                    meetings={meetings}
                    speakers={speakers}
                    onSaveMediaItem={(m) => {
                      if (onSaveMedia) onSaveMedia(m);
                      logCmsAudit(adminUser?.username || 'admin', 'SAVE_MEDIA', 'Media', `Saved media metadata: ${m.title.en || m.externalUrl}`);
                    }}
                    onDeleteMediaItem={(id) => {
                      if (onDeleteMedia) onDeleteMedia(id);
                      logCmsAudit(adminUser?.username || 'admin', 'DELETE_MEDIA', 'Media', `Deleted media metadata ID: ${id}`);
                    }}
                    language={language}
                    theme={theme}
                  />
                )}

                {/* VIEW 6: SCHEDULE & CALENDAR CMS TAB */}
                {activeTab === 'schedule' && (
                  <ScheduleCalendarCmsTab
                    meetings={meetings}
                    events={events}
                    onSaveMeeting={handleSaveMeetingWithAudit}
                    onSaveEvent={onSaveEvent}
                    onDeleteEvent={onDeleteEvent}
                    language={language}
                    theme={theme}
                  />
                )}

                {/* VIEW 7: SITE SETTINGS & HOMEPAGE CONTENT */}
                {activeTab === 'settings' && (
                  <SiteSettingsCmsTab
                    homepage={homepageContent}
                    settings={siteSettings}
                    onSaveHomepage={onSaveHomepageContent}
                    onSaveSettings={onSaveSiteSettings}
                    language={language}
                    theme={theme}
                  />
                )}

                {/* VIEW 8: USER MANAGEMENT */}
                {activeTab === 'users' && (
                  <UsersCmsTab
                    users={cmsUsersProp || cmsUsers}
                    onSaveUser={handleSaveUser}
                    onDeleteUser={handleDeleteUser}
                    language={language}
                    theme={theme}
                    currentUserRole={adminUser?.role}
                  />
                )}

                {/* VIEW 9: AUDIT LOGS */}
                {activeTab === 'audit' && (
                  <AuditLogsCmsTab
                    logs={auditLogs}
                    language={language}
                    theme={theme}
                  />
                )}

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
