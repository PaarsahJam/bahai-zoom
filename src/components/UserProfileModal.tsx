import React, { useState, useEffect } from 'react';
import { 
  X, User, Mail, Lock, Globe, Camera, Upload, Check, AlertCircle, Shield, CheckCircle2 
} from 'lucide-react';
import { CmsUser, Language, ThemeMode } from '../types';
import { getUserAvatar, DEFAULT_MALE_AVATAR, DEFAULT_FEMALE_AVATAR, DEFAULT_NEUTRAL_AVATAR } from '../utils/avatarHelper';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CmsUser | null;
  language: Language;
  theme: ThemeMode;
  onUpdateProfile: (updatedUser: CmsUser) => void;
  onShowToast: (msg: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  language,
  theme,
  onUpdateProfile,
  onShowToast,
}) => {
  const isFa = language === 'fa';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('United States');
  const [prefLang, setPrefLang] = useState<Language>(language);
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'unspecified'>('female');
  const [avatarType, setAvatarType] = useState<'preset_male' | 'preset_female' | 'preset_neutral' | 'custom_photo'>('preset_female');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName || currentUser.name.split(' ')[0] || '');
      setLastName(currentUser.lastName || currentUser.name.split(' ').slice(1).join(' ') || '');
      setEmail(currentUser.email || '');
      setCountry(currentUser.country || 'United States');
      setPrefLang(currentUser.preferredLanguage || language);
      setGender(currentUser.gender || 'female');
      setAvatarType(
        currentUser.avatarType || 
        (currentUser.gender === 'male' ? 'preset_male' : currentUser.gender === 'female' ? 'preset_female' : 'preset_neutral')
      );
      setAvatarUrl(currentUser.avatarUrl || '');
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsChangingPassword(false);
    setNewPassword('');
    setConfirmPassword('');
  }, [currentUser, isOpen, language]);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!firstName.trim()) {
      setErrorMsg(isFa ? 'لطفاً نام خود را وارد کنید.' : 'First name is required.');
      return;
    }

    if (isChangingPassword) {
      if (newPassword.length < 6) {
        setErrorMsg(isFa ? 'رمز عبور باید حداقل ۶ کاراکتر باشد.' : 'New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg(isFa ? 'رمزهای عبور جدید با هم مطابقت ندارند.' : 'New passwords do not match.');
        return;
      }
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    
    let finalAvatarUrl = avatarUrl;
    if (avatarType === 'preset_female') finalAvatarUrl = DEFAULT_FEMALE_AVATAR;
    if (avatarType === 'preset_male') finalAvatarUrl = DEFAULT_MALE_AVATAR;
    if (avatarType === 'preset_neutral') finalAvatarUrl = DEFAULT_NEUTRAL_AVATAR;

    const updatedUser: CmsUser = {
      ...currentUser,
      name: fullName,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      country: country.trim(),
      preferredLanguage: prefLang,
      gender,
      avatarType,
      avatarUrl: finalAvatarUrl,
    };

    onUpdateProfile(updatedUser);
    onShowToast(isFa ? 'پروفایل کاربری شما با موفقیت بروزرسانی شد.' : 'Your profile has been updated successfully!');
    setSuccessMsg(isFa ? 'تغییرات ذخیره شد.' : 'Changes saved successfully.');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const previewAvatarSrc = avatarType === 'custom_photo' && avatarUrl
    ? avatarUrl
    : avatarType === 'preset_female'
      ? DEFAULT_FEMALE_AVATAR
      : avatarType === 'preset_male'
        ? DEFAULT_MALE_AVATAR
        : DEFAULT_NEUTRAL_AVATAR;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        dir={isFa ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {isFa ? 'ویرایش پروفایل من' : 'Edit My Profile'}
              </h3>
              <p className="text-xs text-slate-300">
                {isFa ? 'مدیریت اطلاعات شخصی، جنسیت و تصویر آواتار' : 'Manage your personal details, gender & avatar photo'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* AVATAR & GENDER CUSTOMIZATION */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={previewAvatarSrc}
                  alt="Avatar Preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-md bg-white dark:bg-slate-800"
                />
                <span className="absolute bottom-0 right-0 p-1 rounded-full bg-indigo-600 text-white text-[10px]">
                  <Camera className="w-3 h-3" />
                </span>
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{currentUser.name}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-indigo-400" />
                  <span>{currentUser.role} Account</span>
                </p>
              </div>
            </div>

            {/* Gender Buttons */}
            <div>
              <label className="font-bold block mb-1.5 text-xs text-slate-700 dark:text-slate-300">
                {isFa ? 'جنسیت شما:' : 'Select Gender:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setGender('female');
                    if (avatarType !== 'custom_photo') setAvatarType('preset_female');
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    gender === 'female'
                      ? 'bg-pink-500/10 border-pink-500 text-pink-600 dark:text-pink-400 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>👩 {isFa ? 'خانم' : 'Female'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGender('male');
                    if (avatarType !== 'custom_photo') setAvatarType('preset_male');
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    gender === 'male'
                      ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>👨 {isFa ? 'آقا' : 'Male'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGender('other');
                    if (avatarType !== 'custom_photo') setAvatarType('preset_neutral');
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    gender === 'other' || gender === 'unspecified'
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>🧑 {isFa ? 'سایر' : 'Other'}</span>
                </button>
              </div>
            </div>

            {/* Avatar Style Picker */}
            <div>
              <label className="font-bold block mb-1.5 text-xs text-slate-700 dark:text-slate-300">
                {isFa ? 'سبک آواتار یا تصویر شخصی:' : 'Avatar Style or Photo:'}
              </label>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setAvatarType('preset_female')}
                  className={`px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                    avatarType === 'preset_female'
                      ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>👩 {isFa ? 'آواتار زنانه' : 'Female Vector'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAvatarType('preset_male')}
                  className={`px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                    avatarType === 'preset_male'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>👨 {isFa ? 'آواتار مردانه' : 'Male Vector'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAvatarType('preset_neutral')}
                  className={`px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                    avatarType === 'preset_neutral'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>🧑 Neutral</span>
                </button>

                <label className={`px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                  avatarType === 'custom_photo'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-500'
                }`}>
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isFa ? 'آپلود عکس' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          setErrorMsg(isFa ? 'حجم تصویر نباید بیشتر از ۵ مگابایت باشد.' : 'Image size must be under 5MB.');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) {
                            setAvatarUrl(ev.target.result as string);
                            setAvatarType('custom_photo');
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              {avatarType === 'custom_photo' && (
                <div className="mt-2">
                  <input
                    type="url"
                    value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                    onChange={(e) => {
                      setAvatarUrl(e.target.value);
                      setAvatarType('custom_photo');
                    }}
                    placeholder={isFa ? 'آدرس لینک عکس (URL): https://...' : 'Paste image URL (https://...)'}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* NAME FIELDS */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                {isFa ? 'نام:' : 'First Name:'}
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
              />
            </div>
            <div>
              <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                {isFa ? 'نام خانوادگی:' : 'Last Name:'}
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
              {isFa ? 'ایمیل:' : 'Email Address:'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
            />
          </div>

          {/* COUNTRY & LANGUAGE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                {isFa ? 'کشور:' : 'Country:'}
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
              />
            </div>
            <div>
              <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                {isFa ? 'زبان ترجیحی:' : 'Preferred Language:'}
              </label>
              <select
                value={prefLang}
                onChange={(e) => setPrefLang(e.target.value as Language)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
              >
                <option value="en">English</option>
                <option value="fa">فارسی (Persian)</option>
              </select>
            </div>
          </div>

          {/* PASSWORD CHANGE TOGGLE */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isChangingPassword ? (isFa ? 'انصراف از تغییر رمز' : 'Cancel Password Change') : (isFa ? 'تغییر رمز عبور' : 'Change Password')}</span>
            </button>

            {isChangingPassword && (
              <div className="mt-3 grid grid-cols-2 gap-3 animate-fade-in p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40">
                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300 text-xs">
                    {isFa ? 'رمز جدید:' : 'New Password:'}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300 text-xs">
                    {isFa ? 'تکرار رمز جدید:' : 'Confirm New Password:'}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isFa ? 'انصراف' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{isFa ? 'ذخیره پروفایل' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
