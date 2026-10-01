import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Mail, User, Globe, CheckCircle2, AlertCircle, 
  Sparkles, Key, RefreshCw, Send, ShieldCheck, ArrowRight, Check, Ticket,
  Camera, Upload, Image as ImageIcon
} from 'lucide-react';
import { CmsUser, Language, ThemeMode, MemberInvitation } from '../types';
import { loadCmsData, saveCmsData, logCmsAudit, INITIAL_INVITATIONS } from '../utils/cmsStorage';
import { getUserAvatar, DEFAULT_MALE_AVATAR, DEFAULT_FEMALE_AVATAR, DEFAULT_NEUTRAL_AVATAR } from '../utils/avatarHelper';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  theme: ThemeMode;
  initialMode?: 'login' | 'register' | 'pending';
  invitationCodeFromUrl?: string | null;
  onLoginSuccess?: (user: CmsUser) => void;
  onAuthSuccess?: (user: CmsUser) => void;
  onShowToast?: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  language,
  theme,
  initialMode = 'login',
  invitationCodeFromUrl = null,
  onLoginSuccess,
  onAuthSuccess,
  onShowToast,
}) => {
  const isFa = language === 'fa';

  const notifyLoginSuccess = (user: CmsUser) => {
    if (onLoginSuccess) onLoginSuccess(user);
    if (onAuthSuccess) onAuthSuccess(user);
  };

  const notifyToast = (msg: string) => {
    if (onShowToast) onShowToast(msg);
  };

  const [mode, setMode] = useState<'login' | 'register' | 'verify_email' | 'pending_status' | 'forgot_pass'>(initialMode);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // CMS users state
  const [cmsUsers, setCmsUsers] = useState<CmsUser[]>(() => loadCmsData('bz_cms_users', []));
  const [invitations, setInvitations] = useState<MemberInvitation[]>(() => loadCmsData('bz_cms_invitations', INITIAL_INVITATIONS));

  // LOGIN FORM STATE
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // REGISTER FORM STATE
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCountry, setRegCountry] = useState('United States');
  const [regLanguage, setRegLanguage] = useState<Language>(language);
  const [regGender, setRegGender] = useState<'male' | 'female' | 'other' | 'unspecified'>('female');
  const [regAvatarType, setRegAvatarType] = useState<'preset_male' | 'preset_female' | 'preset_neutral' | 'custom_photo'>('preset_female');
  const [regAvatarUrl, setRegAvatarUrl] = useState<string>('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regInviteCode, setRegInviteCode] = useState(invitationCodeFromUrl || '');
  const [regError, setRegError] = useState<string | null>(null);

  useEffect(() => {
    if (invitationCodeFromUrl) {
      setRegInviteCode(invitationCodeFromUrl);
    }
  }, [invitationCodeFromUrl]);

  // EMAIL VERIFICATION STATE
  const [verificationCodeInput, setVerificationCodeInput] = useState('782910');
  const [pendingUserToVerify, setPendingUserToVerify] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    preferredLanguage: Language;
    gender?: 'male' | 'female' | 'other' | 'unspecified';
    avatarType?: 'preset_male' | 'preset_female' | 'preset_neutral' | 'custom_photo';
    avatarUrl?: string;
    password: string;
    inviteCode?: string;
  } | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // FORGOT PASSWORD STATE
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  if (!isOpen) return null;

  // --- SUBMIT LOGIN ---
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const emailOrUser = loginEmail.trim().toLowerCase();
    const targetUser = cmsUsers.find(
      (u) => u.email.toLowerCase() === emailOrUser || u.username.toLowerCase() === emailOrUser
    );

    if (!targetUser) {
      setLoginError(
        isFa
          ? 'حساب کاربری با این ایمیل یا نام کاربری یافت نشد. لطفاً ابتدا ثبت‌نام کنید.'
          : 'No account found with this email or username. Please register first.'
      );
      return;
    }

    if (targetUser.status === 'Suspended' || !targetUser.isActive) {
      setLoginError(
        isFa
          ? 'حساب کاربری شما معلق شده است. لطفاً با support@bahaizoom.org تماس بگیرید.'
          : 'Your account is currently suspended. Please contact support@bahaizoom.org for assistance.'
      );
      return;
    }

    const updatedUser: CmsUser = {
      ...targetUser,
      lastLoginAt: new Date().toISOString(),
    };

    saveCmsData('bz_cms_auth_user', updatedUser);
    notifyLoginSuccess(updatedUser);
    logCmsAudit(updatedUser.name, 'USER_LOGIN', 'Auth', `User logged in (${updatedUser.role})`);

    if (updatedUser.status === 'Pending') {
      notifyToast(
        isFa
          ? 'وارد شدید - حساب شما در انتظار تأیید مدیریت است.'
          : 'Logged in - Your account is awaiting administrator approval.'
      );
    } else if (updatedUser.status === 'Rejected') {
      notifyToast(
        isFa
          ? 'اطلاعیه: درخواست ثبت‌نام شما هنوز به تأیید نرسیده است.'
          : 'Notice: Your registration was not approved.'
      );
    } else {
      notifyToast(
        isFa ? `خوش آمدید، ${updatedUser.firstName || updatedUser.name}!` : `Welcome back, ${updatedUser.firstName || updatedUser.name}!`
      );
    }

    onClose();
  };

  // --- SUBMIT REGISTER (Step 1: Validate -> Go to Email Verification) ---
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regFirstName.trim() || !regLastName.trim() || !regEmail.trim()) {
      setRegError(isFa ? 'لطفاً تمامی فیلدهای ضروری را تکمیل نمایید.' : 'Please fill in all required fields.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError(isFa ? 'رمز عبور و تکرار آن یکسان نیستند.' : 'Passwords do not match.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError(isFa ? 'رمز عبور باید حداقل ۶ کاراکتر باشد.' : 'Password must be at least 6 characters.');
      return;
    }

    // Check if email already exists
    const existing = cmsUsers.find((u) => u.email.toLowerCase() === regEmail.trim().toLowerCase());
    if (existing) {
      setRegError(
        isFa
          ? 'این آدرس ایمیل قبلاً ثبت شده است. لطفاً وارد شوید.'
          : 'An account with this email address already exists. Please log in.'
      );
      return;
    }

    // Move to Verification step
    setPendingUserToVerify({
      firstName: regFirstName.trim(),
      lastName: regLastName.trim(),
      email: regEmail.trim().toLowerCase(),
      country: regCountry,
      preferredLanguage: regLanguage,
      gender: regGender,
      avatarType: regAvatarType,
      avatarUrl: regAvatarType === 'custom_photo' ? regAvatarUrl : getUserAvatar({ gender: regGender, avatarType: regAvatarType }),
      password: regPassword,
      inviteCode: regInviteCode.trim(),
    });

    setMode('verify_email');
    notifyToast(
      isFa
        ? `کد تأیید ایمیل به ${regEmail.trim()} ارسال شد.`
        : `Email verification code sent to ${regEmail.trim()}`
    );
  };

  // --- SUBMIT EMAIL VERIFICATION (Step 2) ---
  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(null);

    if (!pendingUserToVerify) return;

    if (!verificationCodeInput || verificationCodeInput.trim().length < 4) {
      setVerificationError(isFa ? 'کد تأیید وارد شده نامعتبر است.' : 'Invalid verification code entered.');
      return;
    }

    // Check if valid invitation code is present
    let isAutoApprovedByInvite = false;
    let validInvite: MemberInvitation | undefined;

    if (pendingUserToVerify.inviteCode) {
      const codeUpper = pendingUserToVerify.inviteCode.toUpperCase();
      validInvite = invitations.find(
        (inv) => inv.code.toUpperCase() === codeUpper && !inv.used
      );
      if (validInvite) {
        isAutoApprovedByInvite = true;
      }
    }

    // Determine initial account status
    const initialStatus = isAutoApprovedByInvite ? 'Approved' : 'Pending';

    const newUser: CmsUser = {
      id: `usr-${Date.now()}`,
      username: pendingUserToVerify.email.split('@')[0],
      email: pendingUserToVerify.email,
      name: `${pendingUserToVerify.firstName} ${pendingUserToVerify.lastName}`,
      firstName: pendingUserToVerify.firstName,
      lastName: pendingUserToVerify.lastName,
      country: pendingUserToVerify.country,
      preferredLanguage: pendingUserToVerify.preferredLanguage,
      gender: pendingUserToVerify.gender || 'unspecified',
      avatarType: pendingUserToVerify.avatarType || (pendingUserToVerify.gender === 'male' ? 'preset_male' : pendingUserToVerify.gender === 'female' ? 'preset_female' : 'preset_neutral'),
      avatarUrl: pendingUserToVerify.avatarUrl || getUserAvatar({ gender: pendingUserToVerify.gender, avatarType: pendingUserToVerify.avatarType }),
      role: 'Member',
      status: initialStatus,
      emailVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      registeredAt: new Date().toISOString(),
      invitedByCode: validInvite ? validInvite.code : undefined,
      activityHistory: [
        {
          id: `act-${Date.now()}`,
          action: 'REGISTER_VERIFIED',
          timestamp: new Date().toISOString(),
          details: isAutoApprovedByInvite
            ? `Email verified & automatically approved via invite code (${validInvite?.code})`
            : 'Email verified. Account pending administrator approval queue.',
        },
      ],
    };

    // Mark invitation as used if applicable
    if (validInvite) {
      const updatedInvites = invitations.map((inv) =>
        inv.id === validInvite!.id ? { ...inv, used: true, usedAt: new Date().toISOString(), usedByEmail: newUser.email } : inv
      );
      setInvitations(updatedInvites);
      saveCmsData('bz_cms_invitations', updatedInvites);
    }

    // Save to CMS users
    const updatedUsers = [newUser, ...cmsUsers];
    setCmsUsers(updatedUsers);
    saveCmsData('bz_cms_users', updatedUsers);
    saveCmsData('bz_cms_auth_user', newUser);

    logCmsAudit(
      newUser.name,
      'MEMBER_REGISTERED',
      'UserAccount',
      `New member registered (${newUser.email}). Status: ${newUser.status}`
    );

    notifyLoginSuccess(newUser);

    if (isAutoApprovedByInvite) {
      notifyToast(
        isFa
          ? '🎉 دعوت‌نامه شما تأیید شد! حساب کاربری شما فعال گردید.'
          : '🎉 Invitation verified! Your member account is now active.'
      );
      onClose();
    } else {
      setMode('pending_status');
      notifyToast(
        isFa
          ? 'ایمیل شما تأیید شد. حساب شما در انتظار بررسی مدیریت است.'
          : 'Email verified! Account created and sent for administrator review.'
      );
    }
  };

  // --- SUBMIT FORGOT PASSWORD ---
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setForgotSuccess(true);
    logCmsAudit('Guest', 'PASSWORD_RESET_REQUEST', 'Auth', `Password reset requested for ${forgotEmail}`);
    notifyToast(
      isFa
        ? `دستورالعمل بازیابی رمز به ${forgotEmail} ارسال شد.`
        : `Password reset instructions sent to ${forgotEmail}`
    );
  };

  // --- QUICK DEMO LOGINS ---
  const handleQuickLogin = (email: string) => {
    const found = cmsUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      const updated: CmsUser = { ...found, lastLoginAt: new Date().toISOString() };
      saveCmsData('bz_cms_auth_user', updated);
      onLoginSuccess(updated);
      logCmsAudit(updated.name, 'QUICK_DEMO_LOGIN', 'Auth', `Quick demo login as ${updated.role} (${updated.status})`);
      onShowToast(
        isFa ? `ورود سریع به عنوان ${updated.name} (${updated.status})` : `Quick Demo Login as ${updated.name} (${updated.status})`
      );
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display">
                {mode === 'login' && (isFa ? 'ورود اعضا و مدیریت' : 'Member & Admin Login')}
                {mode === 'register' && (isFa ? 'ثبت‌نام عضو جدید' : 'New Member Registration')}
                {mode === 'verify_email' && (isFa ? 'تأیید آدرس ایمیل' : 'Email Address Verification')}
                {mode === 'pending_status' && (isFa ? 'در انتظار تأیید مدیریت' : 'Account Pending Approval')}
                {mode === 'forgot_pass' && (isFa ? 'بازیابی رمز عبور' : 'Reset Password')}
              </h2>
              <p className="text-xs text-indigo-200">
                {isFa ? 'جامعه آنلاین زوم بهائی - دسترسی امن' : 'BahaiZoom Global Fellowship — Secure Access'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          {(mode === 'login' || mode === 'register') && (
            <div className="flex rounded-xl bg-slate-950/40 p-1 mt-4 text-xs font-semibold">
              <button
                onClick={() => { setMode('login'); setLoginError(null); }}
                className={`flex-1 py-2 rounded-lg text-center transition-all cursor-pointer ${
                  mode === 'login' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                {isFa ? 'ورود اعضا' : 'Member Login'}
              </button>
              <button
                onClick={() => { setMode('register'); setRegError(null); }}
                className={`flex-1 py-2 rounded-lg text-center transition-all cursor-pointer ${
                  mode === 'register' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                {isFa ? 'ثبت‌نام جدید' : 'Register New Account'}
              </button>
            </div>
          )}
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

          {/* MODE 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                  {isFa ? 'آدرس ایمیل یا نام کاربری' : 'Email Address or Username'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. admin@bahaizoom.org or tahereh.p@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isFa ? 'رمز عبور' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot_pass')}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {isFa ? 'رمز عبور را فراموش کرده‌اید؟' : 'Forgot Password?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-amber-300" />
                <span>{isFa ? 'ورود به حساب کاربری' : 'Sign In to Account'}</span>
              </button>

              {/* DEMO ACCOUNTS QUICK TEST PANEL */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{isFa ? 'حساب‌های نمونه برای تست سریع نقش‌ها:' : 'Quick Demo Role Testing Accounts:'}</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@bahaizoom.org')}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-amber-500/10 text-left cursor-pointer"
                  >
                    <div className="font-bold text-indigo-600 dark:text-indigo-400">👑 Primary Admin</div>
                    <div className="text-[10px] text-slate-500 truncate">admin@bahaizoom.org</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('tahereh.p@example.com')}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-500/10 text-left cursor-pointer"
                  >
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">✅ Approved Member</div>
                    <div className="text-[10px] text-slate-500 truncate">tahereh.p@example.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('arash.navidi@example.com')}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-amber-500/10 text-left cursor-pointer"
                  >
                    <div className="font-bold text-amber-600 dark:text-amber-400">⏳ Pending Member</div>
                    <div className="text-[10px] text-slate-500 truncate">arash.navidi@example.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('kaveh.s@example.com')}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-rose-500/10 text-left cursor-pointer"
                  >
                    <div className="font-bold text-rose-600 dark:text-rose-400">❌ Rejected Member</div>
                    <div className="text-[10px] text-slate-500 truncate">kaveh.s@example.com</div>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* MODE 2: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              {regError && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                    {isFa ? 'نام' : 'First Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    placeholder="e.g. Navid"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                    {isFa ? 'نام خانوادگی' : 'Last Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    placeholder="e.g. Soltani"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                  {isFa ? 'آدرس ایمیل' : 'Email Address'} *
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                    {isFa ? 'کشور محل سکونت' : 'Country'}
                  </label>
                  <input
                    type="text"
                    value={regCountry}
                    onChange={(e) => setRegCountry(e.target.value)}
                    placeholder="United States / Canada"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                    {isFa ? 'زبان ترجیحی' : 'Preferred Language'}
                  </label>
                  <select
                    value={regLanguage}
                    onChange={(e) => setRegLanguage(e.target.value as Language)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    <option value="en">English</option>
                    <option value="fa">فارسی (Persian)</option>
                    <option value="ar">العربية (Arabic)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </div>

              {/* GENDER & AVATAR SELECTION SECTION */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-3">
                <div>
                  <label className="font-bold block mb-1.5 text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{isFa ? 'جنسیت (جهت آواتار پیشنهادی):' : 'Gender (for profile avatar):'}</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRegGender('female');
                        if (regAvatarType !== 'custom_photo') setRegAvatarType('preset_female');
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        regGender === 'female'
                          ? 'bg-pink-500/10 border-pink-500 text-pink-600 dark:text-pink-400 shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span>👩 {isFa ? 'خانم' : 'Female'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRegGender('male');
                        if (regAvatarType !== 'custom_photo') setRegAvatarType('preset_male');
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        regGender === 'male'
                          ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span>👨 {isFa ? 'آقا' : 'Male'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRegGender('other');
                        if (regAvatarType !== 'custom_photo') setRegAvatarType('preset_neutral');
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        regGender === 'other' || regGender === 'unspecified'
                          ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span>🧑 {isFa ? 'سایر / ترجیح نمی‌دهم' : 'Other'}</span>
                    </button>
                  </div>
                </div>

                {/* AVATAR CHOICES */}
                <div>
                  <label className="font-bold block mb-1.5 text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isFa ? 'تصویر آواتار حساب کاربری:' : 'Profile Avatar Image:'}</span>
                  </label>

                  <div className="flex items-center gap-3">
                    {/* Live Avatar Preview */}
                    <div className="relative shrink-0">
                      <img
                        src={
                          regAvatarType === 'custom_photo' && regAvatarUrl
                            ? regAvatarUrl
                            : regAvatarType === 'preset_female'
                              ? DEFAULT_FEMALE_AVATAR
                              : regAvatarType === 'preset_male'
                                ? DEFAULT_MALE_AVATAR
                                : DEFAULT_NEUTRAL_AVATAR
                        }
                        alt="Avatar Preview"
                        className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500/50 shadow-md bg-white dark:bg-slate-800"
                      />
                      {regAvatarType === 'custom_photo' && (
                        <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-bold">
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setRegAvatarType('preset_female')}
                          className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 cursor-pointer ${
                            regAvatarType === 'preset_female'
                              ? 'bg-pink-500 text-white border-pink-500'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span>👩 Female Vector</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRegAvatarType('preset_male')}
                          className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 cursor-pointer ${
                            regAvatarType === 'preset_male'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span>👨 Male Vector</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRegAvatarType('preset_neutral')}
                          className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 cursor-pointer ${
                            regAvatarType === 'preset_neutral'
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span>🧑 Neutral</span>
                        </button>

                        <label className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                          regAvatarType === 'custom_photo'
                            ? 'bg-amber-500 text-slate-950 border-amber-500'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-500'
                        }`}>
                          <Upload className="w-3 h-3" />
                          <span>{isFa ? 'آپلود عکس' : 'Upload Photo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  setRegError(isFa ? 'حجم تصویر نباید بیشتر از ۵ مگابایت باشد.' : 'Image file size must be less than 5MB.');
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    setRegAvatarUrl(event.target.result as string);
                                    setRegAvatarType('custom_photo');
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>

                      {regAvatarType === 'custom_photo' && (
                        <input
                          type="url"
                          value={regAvatarUrl.startsWith('data:') ? '' : regAvatarUrl}
                          onChange={(e) => {
                            setRegAvatarUrl(e.target.value);
                            setRegAvatarType('custom_photo');
                          }}
                          placeholder={isFa ? 'یا آدرس تصویر (URL) را وارد کنید...' : 'Or paste Photo URL (https://...)'}
                          className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-[11px]"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                    {isFa ? 'رمز عبور' : 'Password'} *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                    {isFa ? 'تکرار رمز عبور' : 'Confirm Password'} *
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* INVITATION CODE OPTIONAL FIELD */}
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60">
                <label className="font-bold block mb-1 text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isFa ? 'کد دعوت مدیریت (اختیاری):' : 'Admin Invitation Code (Optional):'}</span>
                </label>
                <input
                  type="text"
                  value={regInviteCode}
                  onChange={(e) => setRegInviteCode(e.target.value)}
                  placeholder="e.g. BAHAI-ZOOM-2026-UNITY"
                  className="w-full p-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-xs"
                />
                <p className="text-[10px] text-indigo-600 dark:text-indigo-300 mt-1">
                  {isFa
                    ? '💡 با داشتن کد دعوت معتبر، حساب شما بلافاصله پس از تأیید ایمیل، به صورت خودکار فعال می‌شود.'
                    : '💡 If you hold a valid invitation code, your account will be automatically approved upon email verification.'}
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <Send className="w-4 h-4" />
                <span>{isFa ? 'مرحله بعد: ارسال کد تأیید ایمیل' : 'Next Step: Verify Email Address'}</span>
              </button>
            </form>
          )}

          {/* MODE 3: EMAIL VERIFICATION */}
          {mode === 'verify_email' && pendingUserToVerify && (
            <form onSubmit={handleVerifyEmail} className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg">
                  <ShieldCheck className="w-6 h-6 text-amber-300" />
                </div>
                <h3 className="font-bold text-sm text-indigo-950 dark:text-indigo-100">
                  {isFa ? 'کد تأیید به ایمیل شما ارسال شد' : 'Verification Code Sent'}
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {isFa
                    ? `کد ۶ رقمی تأیید برای ${pendingUserToVerify.email} ارسال گردید.`
                    : `We sent a 6-digit confirmation code to ${pendingUserToVerify.email}.`}
                </p>
              </div>

              {verificationError && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span>{verificationError}</span>
                </div>
              )}

              <div>
                <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300 text-center">
                  {isFa ? 'کد ۶ رقمی را وارد کنید' : 'Enter 6-Digit Verification Code'}
                </label>
                <input
                  type="text"
                  required
                  value={verificationCodeInput}
                  onChange={(e) => setVerificationCodeInput(e.target.value)}
                  className="w-full p-3 rounded-2xl border-2 border-indigo-500 text-center text-lg tracking-widest font-mono font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                <span>{isFa ? 'تأیید ایمیل و تکمیل ایجاد حساب' : 'Verify Email & Create Account'}</span>
              </button>
            </form>
          )}

          {/* MODE 4: PENDING STATUS EXPLANATION */}
          {mode === 'pending_status' && (
            <div className="space-y-4 text-xs text-center py-2">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center mx-auto shadow-inner">
                <RefreshCw className="w-7 h-7 animate-spin" />
              </div>

              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-slate-100">
                {isFa ? 'حساب شما با موفقیت ایجاد شد' : 'Account Created Successfully'}
              </h3>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 leading-relaxed text-left space-y-2">
                <p className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{isFa ? 'در انتظار بررسی مدیریت' : 'Awaiting Administrator Approval'}</span>
                </p>
                <p>
                  Your account has been created successfully and is awaiting approval by an administrator. You will receive an email once your account has been approved.
                </p>
                <p className="text-[11px] text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-2">
                  {isFa
                    ? 'تا زمان تأیید مدیریت می‌توانید از بخش‌های عمومی سایت استفاده کنید، اما لینک‌های مستقیم زوم پس از تأیید نمایه فعال می‌شوند.'
                    : 'While awaiting approval, you can browse all public schedules and resources. Zoom direct access will unlock automatically upon approval.'}
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                {isFa ? 'متوجه شدم (بازگشت به سایت)' : 'I Understand (Continue Browsing)'}
              </button>
            </div>
          )}

          {/* MODE 5: FORGOT PASSWORD */}
          {mode === 'forgot_pass' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
              {forgotSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="font-bold">{isFa ? 'دستورالعمل بازیابی ارسال شد' : 'Reset Instructions Sent'}</p>
                  <p className="text-[11px]">
                    {isFa
                      ? 'ایمیلی شامل لینک بازیابی رمز عبور برای شما ارسال گردید.'
                      : 'An email containing password reset instructions has been sent.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="mt-2 text-indigo-600 dark:text-indigo-400 underline font-bold cursor-pointer"
                  >
                    {isFa ? 'بازگشت به صفحه ورود' : 'Return to Login'}
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-slate-600 dark:text-slate-300">
                    {isFa
                      ? 'ایمیل حساب کاربری خود را وارد کنید تا لینک بازیابی ارسال شود.'
                      : 'Enter your registered email address to receive password reset instructions.'}
                  </p>
                  <div>
                    <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                      {isFa ? 'آدرس ایمیل' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                  >
                    {isFa ? 'ارسال لینک بازیابی' : 'Send Reset Link'}
                  </button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-xs text-slate-400 hover:underline cursor-pointer"
                    >
                      {isFa ? 'انصراف و بازگشت' : 'Cancel and Return'}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
