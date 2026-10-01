import React, { useState } from 'react';
import { 
  Sun, Moon, Search, Calendar, BookOpen, Users, 
  Video, FolderArchive, HelpCircle, Shield, Menu, X, Sparkles, Heart,
  User, LogOut, UserCheck, Clock, AlertCircle, ChevronDown, Key,
  LayoutDashboard, Settings, Folder
} from 'lucide-react';
import { Language, ThemeMode, CmsUser } from '../types';
import { translations } from '../data/translations';
import { LanguageSwitcher } from './LanguageSwitcher';
import { getUserAvatar } from '../utils/avatarHelper';
import { canAccessAdmin } from '../utils/authPermissions';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
  activeSection: string;
  onSectionSelect: (sectionId: string) => void;
  onOpenSearch: () => void;
  onOpenAdmin: (tab?: string) => void;
  favoritesCount: number;
  currentUser: CmsUser | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenProfile?: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  theme,
  onThemeToggle,
  activeSection,
  onSectionSelect,
  onOpenSearch,
  onOpenAdmin,
  favoritesCount,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const t = translations[language] || translations.en;
  const isFa = language === 'fa';

  const isAdmin = canAccessAdmin(currentUser);

  const navItems = [
    { id: 'hero', label: t.home, icon: Sparkles },
    { id: 'meetings', label: t.weeklySchedule, icon: Calendar },
    { id: 'prayers', label: t.prayerCenter, icon: BookOpen },
    { id: 'speakers', label: t.featuredSpeakers, icon: Users },
    { id: 'media', label: t.mediaLibrary, icon: Video },
    { id: 'archive', label: t.archive, icon: FolderArchive },
    { id: 'resources', label: t.communityResources, icon: HelpCircle },
  ];

  // Administrator-only navigation (Site Management, Dashboard, CMS, User/Meeting/Media Management, Settings, Analytics)
  const adminNavItems = [
    { tab: 'overview', label: isFa ? 'داشبورد مدیریت' : 'Admin Dashboard', icon: LayoutDashboard },
    { tab: 'meetings', label: isFa ? 'مدیریت جلسات' : 'Meeting Management', icon: Calendar },
    { tab: 'cms', label: isFa ? 'مدیریت سایت / CMS' : 'Site Management / CMS', icon: Folder },
    { tab: 'users', label: isFa ? 'مدیریت کاربران' : 'User Management', icon: UserCheck },
    { tab: 'media', label: isFa ? 'مدیریت رسانه' : 'Media Management', icon: Video },
    { tab: 'settings', label: isFa ? 'تنظیمات سایت' : 'Site Settings', icon: Settings },
    { tab: 'analytics', label: isFa ? 'تحلیل‌ها' : 'Analytics', icon: Sparkles },
  ];

  const handleNavClick = (id: string) => {
    onSectionSelect(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAdminNavClick = (tab: string) => {
    setMobileMenuOpen(false);
    setAdminMenuOpen(false);
    onOpenAdmin(tab);
  };

  const isApproved = currentUser?.status === 'Approved' || isAdmin;
  const isPending = currentUser?.status === 'Pending' && !isAdmin;

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* PENDING APPROVAL NOTICE BAR (If logged in user is pending) */}
      {isPending && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-amber-50 text-xs py-2 px-4 text-center flex items-center justify-center gap-2 font-medium shadow-inner">
          <Clock className="w-4 h-4 text-amber-200 shrink-0 animate-pulse" />
          <span>
            {isFa
              ? 'حساب شما با موفقیت ایجاد شد و در انتظار تأیید مدیریت است. لینک‌های مستقیم زوم پس از تأیید فعال خواهند شد.'
              : 'Your account has been created successfully and is awaiting approval by an administrator. Zoom direct links will unlock upon approval.'}
          </span>
        </div>
      )}

      {/* Top Banner Notice */}
      {!isPending && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-amber-900 text-amber-100 text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2 font-medium tracking-wide">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-amber-400/20 text-amber-200 border border-amber-300/30 font-semibold animate-pulse">
            {t.liveNow}
          </span>
          <span>{t.tagline}</span>
        </div>
      )}

      {/* Main Glass Navbar */}
      <nav className={`w-full border-b transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-slate-900/85 border-slate-800 text-slate-100 backdrop-blur-md' 
          : 'bg-white/85 border-slate-200/80 text-slate-800 backdrop-blur-md shadow-xs'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Brand Logo */}
          <button 
            onClick={() => handleNavClick('hero')}
            className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-amber-500 to-sky-400 p-0.5 shadow-md group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-amber-300 font-display font-bold text-lg tracking-wider">
                BZ
              </div>
            </div>
            <div>
              <span className={`text-xl font-bold font-display tracking-tight block ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                {t.siteTitle}
              </span>
              <span className="text-[10px] tracking-widest text-amber-600 uppercase font-semibold block -mt-1">
                Bahá'í Fellowship
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? theme === 'dark'
                        ? 'bg-indigo-950/80 text-amber-300 border border-indigo-700/50'
                        : 'bg-indigo-50 text-indigo-900 border border-indigo-200/60 font-semibold'
                      : theme === 'dark'
                        ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        : 'text-slate-600 hover:text-indigo-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-75" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Action Tools & Auth Controls */}
          <div className="flex items-center gap-2">
            
            {/* Quick Command Search Trigger */}
            <button
              onClick={onOpenSearch}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100/80 border-slate-200 text-slate-600 hover:bg-slate-200/80'
              }`}
              title={t.commandKHint}
            >
              <Search className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">{t.searchPlaceholder.slice(0, 15)}...</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Language Switcher */}
            <LanguageSwitcher
              currentLanguage={language}
              onLanguageChange={onLanguageChange}
              theme={theme}
              variant="dropdown"
            />

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onThemeToggle}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200'
              }`}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Direct Admin Portal Menu (Administrators ONLY) */}
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                  className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                      : 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-100'
                  }`}
                  title={t.adminDashboard || 'Admin Portal'}
                  aria-expanded={adminMenuOpen}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden xl:inline">{t.adminDashboard || 'Admin Portal'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Admin Dropdown Menu */}
                {adminMenuOpen && (
                  <div className={`absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-72 rounded-2xl border shadow-2xl p-2 z-50 animate-fade-in ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                  }`}>
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-1">
                      <p className="font-bold text-xs flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-amber-500" />
                        <span>{isFa ? 'پنل مدیریت' : 'Site Management'}</span>
                      </p>
                      <p className="text-[11px] text-slate-400">{isFa ? 'فقط مدیران مجاز' : 'Authorized Administrators Only'}</p>
                    </div>
                    <div className="pt-1.5">
                      {adminNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.tab}
                            onClick={() => handleAdminNavClick(item.tab)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-700 dark:hover:text-amber-300 cursor-pointer transition-colors"
                          >
                            <Icon className="w-4 h-4 text-amber-500" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Favorites Badge */}
            {favoritesCount > 0 && (
              <button 
                onClick={() => handleNavClick('prayers')}
                className="relative p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 cursor-pointer"
                title={t.favorites}
              >
                <Heart className="w-4 h-4 fill-amber-500" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-900 font-bold text-[10px] rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              </button>
            )}

            {/* AUTHENTICATION CONTROLS / USER AVATAR MENU */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    isPending
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-300'
                      : isAdmin
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <img
                    src={getUserAvatar(currentUser)}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover border border-amber-400/50"
                  />
                  <span className="hidden md:inline font-bold max-w-[100px] truncate">
                    {currentUser.firstName || currentUser.name.split(' ')[0]}
                  </span>

                  {/* Status Pills */}
                  {isPending && (
                    <span className="hidden sm:inline-flex px-1.5 py-0.2 rounded-md text-[10px] bg-amber-500 text-slate-950 font-extrabold">
                      Pending
                    </span>
                  )}
                  {isAdmin && (
                    <span className="hidden sm:inline-flex px-1.5 py-0.2 rounded-md text-[10px] bg-amber-400 text-slate-950 font-extrabold">
                      Admin
                    </span>
                  )}

                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className={`absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-64 rounded-2xl border shadow-2xl p-2 z-50 animate-fade-in ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                  }`}>
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-1">
                      <p className="font-bold text-xs truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>

                      <div className="pt-1 flex items-center gap-1.5">
                        {isApproved && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-600 font-bold flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-emerald-500" />
                            Approved Member
                          </span>
                        )}
                        {isPending && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-600 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-500" />
                            Awaiting Admin Approval
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Edit Profile Button */}
                    {onOpenProfile && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenProfile();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer my-1 transition-colors"
                      >
                        <User className="w-4 h-4 text-indigo-500" />
                        <span>{isFa ? 'ویرایش پروفایل من' : 'Edit My Profile'}</span>
                      </button>
                    )}

                    {/* Admin Dashboard shortcut (Admins only) */}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAdmin();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-slate-800 cursor-pointer my-1 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-amber-500" />
                        <span>{t.adminDashboard}</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{isFa ? 'خروج از حساب کاربری' : 'Sign Out'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* GUEST STATE BUTTONS */
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuth('login')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700'
                      : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isFa ? 'ورود' : 'Sign In'}
                </button>

                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition-all cursor-pointer hidden sm:block"
                >
                  {isFa ? 'ثبت‌نام اعضا' : 'Register'}
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className={`lg:hidden border-t px-4 py-4 space-y-2 shadow-2xl ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    activeSection === item.id
                      ? 'bg-indigo-600 text-white font-semibold'
                      : theme === 'dark'
                        ? 'text-slate-300 hover:bg-slate-800'
                        : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <LanguageSwitcher
                currentLanguage={language}
                onLanguageChange={(lang) => {
                  onLanguageChange(lang);
                  setMobileMenuOpen(false);
                }}
                theme={theme}
                variant="mobile"
              />

              {!currentUser ? (
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                      className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center font-bold text-xs"
                    >
                      {isFa ? 'ورود' : 'Sign In'}
                    </button>
                    <button
                      onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                      className="py-2.5 rounded-xl bg-amber-500 text-slate-950 text-center font-bold text-xs"
                    >
                      {isFa ? 'ثبت‌نام جدید' : 'Register'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  {onOpenProfile && (
                    <button
                      onClick={() => {
                        onOpenProfile();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm"
                    >
                      <User className="w-4 h-4" />
                      <span>{isFa ? 'ویرایش پروفایل من' : 'Edit My Profile'}</span>
                    </button>
                  )}
                  {isAdmin && (
                    <div className="pt-1 space-y-2">
                      <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        <span>{isFa ? 'پنل مدیریت' : 'Site Management'}</span>
                      </p>
                      {adminNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.tab}
                            onClick={() => handleAdminNavClick(item.tab)}
                            className="w-full flex items-center gap-2.5 py-2.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                          >
                            <Icon className="w-4 h-4 text-amber-500" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <button
                    onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                    className="w-full py-2 rounded-xl border border-rose-500/30 text-rose-500 text-center font-bold text-xs"
                  >
                    {isFa ? 'خروج' : 'Sign Out'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
