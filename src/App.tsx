import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { WeeklyScheduleSection } from './components/WeeklyScheduleSection';
import { PrayerCenterSection } from './components/PrayerCenterSection';
import { FeaturedSpeakersSection } from './components/FeaturedSpeakersSection';
import { MediaLibrarySection } from './components/MediaLibrarySection';
import { CommunityResourcesSection } from './components/CommunityResourcesSection';
import { EventsSection } from './components/EventsSection';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { CommandPalette } from './components/CommandPalette';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { LanguageSuggestionBanner } from './components/LanguageSuggestionBanner';
import { WorldClockDashboard } from './components/WorldClockDashboard';
import { MeetingCalendarExportModal } from './components/MeetingCalendarExportModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AccessDeniedPage } from './components/AccessDeniedPage';

import { 
  Language, ThemeMode, Meeting, Prayer, Speaker, MediaItem, Resource, EventItem, 
  HomepageContent, SiteSettings, CmsUser 
} from './types';
import { 
  INITIAL_MEETINGS, INITIAL_PRAYERS, INITIAL_SPEAKERS, 
  INITIAL_MEDIA, INITIAL_RESOURCES, INITIAL_EVENTS 
} from './data/mockData';
import { 
  loadCmsData, saveCmsData, INITIAL_HOMEPAGE_CONTENT, INITIAL_SITE_SETTINGS, INITIAL_CMS_USERS 
} from './utils/cmsStorage';
import { 
  sanitizeMeetingsList, canUserAccessZoom, canAccessAdmin, 
  assertAdminAccess, isAdminRouteHash, getAdminTabFromHash, ADMIN_ROUTE_PREFIX
} from './utils/authPermissions';
import { translations } from './data/translations';
import { 
  detectInitialLanguage, 
  saveLanguagePreference, 
  checkGeographicSuggestion,
  LANGUAGE_MAP
} from './data/languageConfigs';
import { getLocalizedText } from './utils/localizedHelper';
import { calculateMeetingStatus, sortMeetingsByStatus } from './utils/meetingStatus';

export default function App() {
  const [language, setLanguage] = useState<Language>(() => detectInitialLanguage());
  const [suggestedLanguage, setSuggestedLanguage] = useState<Language | null>(() => checkGeographicSuggestion(language));
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Authentication & Users State
  const [currentUser, setCurrentUser] = useState<CmsUser | null>(() => loadCmsData('bz_cms_auth_user', null));
  const [cmsUsers, setCmsUsers] = useState<CmsUser[]>(() => loadCmsData('bz_cms_users', INITIAL_CMS_USERS));
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Application Data States
  const [meetings, setMeetings] = useState<Meeting[]>(() => loadCmsData('bz_cms_meetings', INITIAL_MEETINGS));
  const [prayers, setPrayers] = useState<Prayer[]>(() => loadCmsData('bz_cms_prayers', INITIAL_PRAYERS));
  const [speakers, setSpeakers] = useState<Speaker[]>(() => loadCmsData('bz_cms_speakers', INITIAL_SPEAKERS));
  const [media, setMedia] = useState<MediaItem[]>(() => loadCmsData('bz_cms_media', INITIAL_MEDIA));
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [events, setEvents] = useState<EventItem[]>(() => loadCmsData('bz_cms_events', INITIAL_EVENTS));
  const [homepageContent, setHomepageContent] = useState<HomepageContent>(() => loadCmsData('bz_cms_homepage', INITIAL_HOMEPAGE_CONTENT));
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => loadCmsData('bz_cms_settings', INITIAL_SITE_SETTINGS));

  useEffect(() => {
    saveCmsData('bz_cms_meetings', meetings);
  }, [meetings]);

  useEffect(() => {
    saveCmsData('bz_cms_prayers', prayers);
  }, [prayers]);

  useEffect(() => {
    saveCmsData('bz_cms_speakers', speakers);
  }, [speakers]);

  useEffect(() => {
    saveCmsData('bz_cms_media', media);
  }, [media]);

  useEffect(() => {
    saveCmsData('bz_cms_events', events);
  }, [events]);

  useEffect(() => {
    saveCmsData('bz_cms_homepage', homepageContent);
  }, [homepageContent]);

  useEffect(() => {
    saveCmsData('bz_cms_settings', siteSettings);
  }, [siteSettings]);

  useEffect(() => {
    saveCmsData('bz_cms_users', cmsUsers);
  }, [cmsUsers]);

  useEffect(() => {
    saveCmsData('bz_cms_auth_user', currentUser);
  }, [currentUser]);

  // User Favorites & Bookmarks
  const [favorites, setFavorites] = useState<string[]>(['p1', 'p3']);

  // Modals State
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);
  const [adminInitialTab, setAdminInitialTab] = useState<string>('overview');
  const [accessDeniedVisible, setAccessDeniedVisible] = useState<boolean>(false);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState<boolean>(false);
  const [calendarExportMeeting, setCalendarExportMeeting] = useState<Meeting | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Update root HTML attributes for RTL/LTR & dark mode & dir
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const config = LANGUAGE_MAP[language];
    const dir = config?.dir || 'ltr';
    root.setAttribute('dir', dir);
    root.setAttribute('lang', language);
  }, [theme, language]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    saveLanguagePreference(lang);
    setSuggestedLanguage(null);
    const nativeName = LANGUAGE_MAP[lang]?.nativeName || lang;
    showToast(`Language set to ${nativeName}`);
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Auth & Permissions Handlers
  const handleAuthSuccess = (user: CmsUser) => {
    setCurrentUser(user);
    // Ensure user exists in cmsUsers array
    const exists = cmsUsers.some(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (!exists) {
      setCmsUsers([user, ...cmsUsers]);
    } else {
      setCmsUsers(cmsUsers.map(u => u.id === user.id ? user : u));
    }
    showToast(`Welcome, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveCmsData('bz_cms_auth_user', null);
    if (isAdminRouteHash(window.location.hash)) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setAdminModalOpen(false);
    showToast('Signed out successfully.');
  };

  // --- ADMIN ROUTE PROTECTION (client-side) ---
  // Administrator routes live under the #/admin hash prefix. If a non-administrator
  // navigates to one, they are redirected home and shown a friendly Access Denied notice.
  const openAdminDashboard = (tab?: string) => {
    if (!canAccessAdmin(currentUser)) {
      setAccessDeniedVisible(true);
      showToast('Access denied. Only administrators may access the site management panel.');
      return;
    }
    const resolvedTab = tab ? getAdminTabFromHash(`${ADMIN_ROUTE_PREFIX}/${tab}`) : 'overview';
    setAdminModalOpen(true);
    setAdminInitialTab(resolvedTab);
    const target = tab ? `${ADMIN_ROUTE_PREFIX}/${tab}` : ADMIN_ROUTE_PREFIX;
    if (window.location.hash !== target) {
      window.location.hash = target;
    }
  };

  const handleCloseAdmin = () => {
    setAdminModalOpen(false);
    if (isAdminRouteHash(window.location.hash)) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  const handleDismissAccessDenied = () => {
    setAccessDeniedVisible(false);
  };

  useEffect(() => {
    const handleRouteChange = () => {
      const hash = window.location.hash;
      if (isAdminRouteHash(hash)) {
        if (canAccessAdmin(currentUser)) {
          setAdminInitialTab(getAdminTabFromHash(hash));
          setAdminModalOpen(true);
        } else {
          // Unauthorized access attempt: redirect to homepage + friendly message
          setAccessDeniedVisible(true);
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          showToast('Access denied. You do not have permission to view administrator pages.');
        }
      }
    };
    window.addEventListener('hashchange', handleRouteChange);
    handleRouteChange();
    return () => window.removeEventListener('hashchange', handleRouteChange);
  }, [currentUser]);

  const handleSaveCmsUser = (u: CmsUser) => {
    const idx = cmsUsers.findIndex(x => x.id === u.id);
    if (idx >= 0) {
      const next = [...cmsUsers];
      next[idx] = u;
      setCmsUsers(next);
    } else {
      setCmsUsers([u, ...cmsUsers]);
    }
    if (currentUser?.id === u.id) {
      setCurrentUser(u);
    }
  };

  const handleDeleteCmsUser = (id: string) => {
    if (!requireAdmin('delete user')) return;
    setCmsUsers(cmsUsers.filter(u => u.id !== id));
    if (currentUser?.id === id) {
      setCurrentUser(null);
    }
    showToast('User account deleted.');
  };

  // Backend authorization enforcement: admin data mutations are rejected for non-administrators.
  const requireAdmin = (action: string): boolean => {
    try {
      assertAdminAccess(currentUser, action);
      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setAccessDeniedVisible(true);
      return false;
    }
  };

  const handleToggleFavorite = (prayerId: string) => {
    if (favorites.includes(prayerId)) {
      setFavorites(favorites.filter((id) => id !== prayerId));
      showToast('Removed from favorites');
    } else {
      setFavorites([...favorites, prayerId]);
      showToast('Added to My Favorites!');
    }
  };

  const handleJoinMeeting = (meeting: Meeting) => {
    if (!canUserAccessZoom(currentUser)) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      showToast('Please sign in or register to join Zoom meetings.');
      return;
    }
    window.open(meeting.zoomUrl, '_blank');
    showToast(`Joining Zoom: ${getLocalizedText(meeting.title, language)}`);
  };

  const handleCopyMeetingLink = (meeting: Meeting) => {
    if (!canUserAccessZoom(currentUser)) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      showToast('Please sign in to view and copy Zoom meeting links.');
      return;
    }
    navigator.clipboard.writeText(`${meeting.zoomUrl} (Passcode: ${meeting.passCode})`);
    showToast('Zoom Meeting link and passcode copied!');
  };

  const handleSaveMeeting = (m: Meeting) => {
    if (!requireAdmin('save meeting')) return;
    const idx = meetings.findIndex(x => x.id === m.id);
    if (idx >= 0) {
      const next = [...meetings];
      next[idx] = m;
      setMeetings(next);
    } else {
      setMeetings([m, ...meetings]);
    }
    showToast('Meeting updated dynamically!');
  };

  const handleDeleteMeeting = (id: string) => {
    if (!requireAdmin('delete meeting')) return;
    setMeetings(meetings.filter(m => m.id !== id));
    showToast('Meeting removed.');
  };

  const handleSaveSpeaker = (s: Speaker) => {
    if (!requireAdmin('save speaker')) return;
    const idx = speakers.findIndex(x => x.id === s.id);
    if (idx >= 0) {
      const next = [...speakers];
      next[idx] = s;
      setSpeakers(next);
    } else {
      setSpeakers([s, ...speakers]);
    }
    showToast('Speaker updated!');
  };

  const handleDeleteSpeaker = (id: string) => {
    if (!requireAdmin('delete speaker')) return;
    setSpeakers(speakers.filter(s => s.id !== id));
    showToast('Speaker removed.');
  };

  const handleSavePrayer = (p: Prayer) => {
    if (!requireAdmin('save prayer')) return;
    const idx = prayers.findIndex(x => x.id === p.id);
    if (idx >= 0) {
      const next = [...prayers];
      next[idx] = p;
      setPrayers(next);
    } else {
      setPrayers([p, ...prayers]);
    }
    showToast('Prayer updated!');
  };

  const handleDeletePrayer = (id: string) => {
    if (!requireAdmin('delete prayer')) return;
    setPrayers(prayers.filter(p => p.id !== id));
    showToast('Prayer removed.');
  };

  const handleSaveMedia = (m: MediaItem) => {
    if (!requireAdmin('save media')) return;
    const idx = media.findIndex(x => x.id === m.id);
    if (idx >= 0) {
      const next = [...media];
      next[idx] = m;
      setMedia(next);
    } else {
      setMedia([m, ...media]);
    }
    showToast('Media metadata item saved!');
  };

  const handleDeleteMedia = (id: string) => {
    if (!requireAdmin('delete media')) return;
    setMedia(media.filter(m => m.id !== id));
    showToast('Media item deleted.');
  };

  const handleSaveEvent = (e: EventItem) => {
    if (!requireAdmin('save event')) return;
    const idx = events.findIndex(x => x.id === e.id);
    if (idx >= 0) {
      const next = [...events];
      next[idx] = e;
      setEvents(next);
    } else {
      setEvents([e, ...events]);
    }
    showToast('Calendar event saved!');
  };

  const handleDeleteEvent = (id: string) => {
    if (!requireAdmin('delete event')) return;
    setEvents(events.filter(e => e.id !== id));
    showToast('Calendar event deleted.');
  };

  // Backend Security Layer: Sanitize meetings list for non-authorized viewers
  const sanitizedMeetings = sanitizeMeetingsList(meetings, currentUser);

  // Find current live meeting or upcoming starting soon meeting
  const sortedMeetings = sortMeetingsByStatus(sanitizedMeetings, new Date(), language);
  const liveMeeting = sortedMeetings.find((m) => {
    const status = calculateMeetingStatus(m, new Date(), language);
    return status.status === 'LIVE' || status.status === 'STARTING_SOON';
  }) || sortedMeetings[0];

  const fontClass = language === 'fa' ? 'font-persian' : language === 'ar' ? 'font-arabic' : 'font-english';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${fontClass} ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-natural-light text-[#2d334a]'
    }`}>
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-amber-300 border border-amber-400/40 shadow-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Language Suggestion Banner */}
      {suggestedLanguage && (
        <LanguageSuggestionBanner
          currentLanguage={language}
          suggestedLanguage={suggestedLanguage}
          onAcceptSuggestion={(lang) => handleLanguageChange(lang)}
          onDismiss={() => setSuggestedLanguage(null)}
        />
      )}

      {/* Navigation Header */}
      <Navbar
        language={language}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        activeSection={activeSection}
        onSectionSelect={setActiveSection}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenAdmin={openAdminDashboard}
        favoritesCount={favorites.length}
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setAuthModalOpen(true);
        }}
        onOpenProfile={() => setUserProfileModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Layout */}
      <main>
        {/* Hero Section */}
        <Hero
          language={language}
          theme={theme}
          liveMeeting={liveMeeting}
          onJoinMeeting={handleJoinMeeting}
          onSelectSection={setActiveSection}
          currentUser={currentUser}
          onRequireLogin={() => {
            setAuthModalMode('login');
            setAuthModalOpen(true);
          }}
          onOpenAdmin={openAdminDashboard}
        />

        {/* Intelligent World Clock & Multi-Calendar Section */}
        <WorldClockDashboard
          language={language}
          theme={theme}
        />

        {/* Weekly Meetings Schedule Section */}
        <WeeklyScheduleSection
          meetings={sanitizedMeetings}
          language={language}
          theme={theme}
          onJoinMeeting={handleJoinMeeting}
          onCopyLink={handleCopyMeetingLink}
          onExportCalendar={(m) => setCalendarExportMeeting(m)}
          isAdmin={canAccessAdmin(currentUser)}
          onOpenAdminEdit={() => openAdminDashboard('meetings')}
          currentUser={currentUser}
          onRequireLogin={() => {
            setAuthModalMode('login');
            setAuthModalOpen(true);
          }}
        />

        {/* Prayer & Devotions Center */}
        <PrayerCenterSection
          prayers={prayers}
          language={language}
          theme={theme}
          onToggleFavorite={handleToggleFavorite}
          favorites={favorites}
        />

        {/* Featured Speakers & Lecturers */}
        <FeaturedSpeakersSection
          speakers={speakers}
          language={language}
          theme={theme}
        />

        {/* Recorded Media Library */}
        <MediaLibrarySection
          media={media}
          language={language}
          theme={theme}
        />

        {/* Community Resources & Study Circles */}
        <CommunityResourcesSection
          resources={resources}
          language={language}
          theme={theme}
        />

        {/* Events & Holy Days */}
        <EventsSection
          events={events}
          language={language}
          theme={theme}
        />

        {/* FAQ Accordions */}
        <FAQSection
          language={language}
          theme={theme}
        />
      </main>

      {/* Footer */}
      <Footer
        language={language}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onSelectSection={setActiveSection}
        currentUser={currentUser}
        onOpenAdmin={openAdminDashboard}
      />

      {/* Authentication & Member Registration Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        language={language}
        theme={theme}
        initialMode={authModalMode}
        onAuthSuccess={handleAuthSuccess}
        onLoginSuccess={handleAuthSuccess}
        onShowToast={showToast}
      />

      {/* Self Profile Management Modal for Members */}
      <UserProfileModal
        isOpen={userProfileModalOpen}
        onClose={() => setUserProfileModalOpen(false)}
        currentUser={currentUser}
        language={language}
        theme={theme}
        onUpdateProfile={(updatedUser) => {
          handleSaveCmsUser(updatedUser);
          setCurrentUser(updatedUser);
          saveCmsData('bz_cms_auth_user', updatedUser);
        }}
        onShowToast={showToast}
      />

      {/* Quick Search Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        language={language}
        theme={theme}
        meetings={sanitizedMeetings}
        prayers={prayers}
        speakers={speakers}
        media={media}
        resources={resources}
        onSelectMeeting={handleJoinMeeting}
        onSelectPrayer={(p) => {}}
        onSelectSpeaker={(s) => {}}
        onSelectSection={setActiveSection}
        onOpenAdmin={openAdminDashboard}
        isAdmin={canAccessAdmin(currentUser)}
      />

      {/* Admin Dashboard Management Modal (gated to Administrators) */}
      <AdminDashboardModal
        isOpen={adminModalOpen}
        onClose={handleCloseAdmin}
        language={language}
        theme={theme}
        currentUser={currentUser}
        initialTab={adminInitialTab}
        onUpdateCurrentUser={(u) => {
          setCurrentUser(u);
          saveCmsData('bz_cms_auth_user', u);
        }}
        meetings={meetings}
        onSaveMeeting={handleSaveMeeting}
        onDeleteMeeting={handleDeleteMeeting}
        speakers={speakers}
        onSaveSpeaker={handleSaveSpeaker}
        onDeleteSpeaker={handleDeleteSpeaker}
        prayers={prayers}
        onSavePrayer={handleSavePrayer}
        onDeletePrayer={handleDeletePrayer}
        mediaItems={media}
        onSaveMedia={handleSaveMedia}
        onDeleteMedia={handleDeleteMedia}
        events={events}
        onSaveEvent={handleSaveEvent}
        onDeleteEvent={handleDeleteEvent}
        homepageContent={homepageContent}
        onSaveHomepageContent={(hp) => {
          if (!requireAdmin('save homepage content')) return;
          setHomepageContent(hp);
          showToast('Homepage hero content updated!');
        }}
        siteSettings={siteSettings}
        onSaveSiteSettings={(st) => {
          if (!requireAdmin('save site settings')) return;
          setSiteSettings(st);
          showToast('Site settings updated!');
        }}
        cmsUsers={cmsUsers}
        onSaveCmsUser={handleSaveCmsUser}
        onDeleteCmsUser={handleDeleteCmsUser}
      />

      {/* Meeting Calendar Export Modal */}
      <MeetingCalendarExportModal
        meeting={calendarExportMeeting}
        isOpen={!!calendarExportMeeting}
        onClose={() => setCalendarExportMeeting(null)}
        language={language}
        theme={theme}
      />

      {/* Access Denied Notice (friendly message for unauthorized admin-route visits) */}
      {accessDeniedVisible && (
        <AccessDeniedPage
          language={language}
          theme={theme}
          onDismiss={handleDismissAccessDenied}
        />
      )}

    </div>
  );
}
