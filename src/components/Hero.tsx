import React from 'react';
import { Video, Calendar, PlayCircle, Sparkles, Clock, Lock, Shield } from 'lucide-react';
import { Language, ThemeMode, Meeting, CmsUser } from '../types';
import { translations } from '../data/translations';
import { getLocalizedText } from '../utils/localizedHelper';
import { formatLocalizedMeetingTime } from '../data/languageConfigs';
import { calculateMeetingStatus } from '../utils/meetingStatus';
import { getMeetingButtonState, canAccessAdmin } from '../utils/authPermissions';

interface HeroProps {
  language: Language;
  theme: ThemeMode;
  liveMeeting?: Meeting;
  onJoinMeeting: (meeting: Meeting) => void;
  onSelectSection: (sectionId: string) => void;
  currentUser?: CmsUser | null;
  onRequireLogin?: () => void;
  onOpenAdmin?: (tab?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  language,
  theme,
  liveMeeting,
  onJoinMeeting,
  onSelectSection,
  currentUser = null,
  onRequireLogin = () => {},
  onOpenAdmin = (_tab?: string) => {},
}) => {
  const t = translations[language];
  const isFa = language === 'fa';
  const isAr = language === 'ar';
  const isAdmin = canAccessAdmin(currentUser);

  // Role-aware CTA state for the primary "Join Today's Meeting" button
  const statusInfo = liveMeeting ? calculateMeetingStatus(liveMeeting, new Date(), language) : null;
  const joinBtnState = liveMeeting && statusInfo
    ? getMeetingButtonState(currentUser, statusInfo.status === 'LIVE', statusInfo.status === 'ENDED', language)
    : null;

  const isLive = !!statusInfo && statusInfo.status === 'LIVE';

  return (
    <section id="hero" className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24">
      {/* Background Sunrise Radial Glow & Subtle Floating Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none -z-10">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-br from-amber-300/30 via-indigo-300/20 to-sky-200/30 rounded-full blur-3xl opacity-70 animate-sunrise-glow" />
        <div className="absolute top-24 left-1/4 w-72 h-72 bg-amber-200/20 rounded-full blur-2xl animate-float-slow" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-sky-300/20 rounded-full blur-2xl animate-float-slow" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        
        {/* Spiritual Welcome Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-sky-500/10 border border-amber-300/40 text-indigo-900 dark:text-amber-200 shadow-xs mb-6 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '8s' }} />
          <span>{t.heroBadge}</span>
        </div>

        {/* Hero Title */}
        <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display tracking-tight leading-tight max-w-4xl mx-auto mb-6 ${
          theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
        }`}>
          {t.heroTitle}
        </h1>

        {/* Subtitle */}
        <p className={`text-lg sm:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed ${
          theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
        }`}>
          {t.heroSubtitle}
        </p>

        {/* Main CTA Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto mb-14">
          
          {/* Join Today's Meeting Primary CTA — role-aware */}
          {liveMeeting && joinBtnState ? (
            joinBtnState.type === 'LOGIN_REQUIRED' ? (
              <button
                onClick={onRequireLogin}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-base shadow-lg shadow-amber-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <Lock className="w-5 h-5" />
                <span>{joinBtnState.label}</span>
              </button>
            ) : !joinBtnState.enabled ? (
              <button
                disabled
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-300 dark:bg-slate-800 text-slate-500 font-bold text-base flex items-center justify-center gap-3 cursor-not-allowed opacity-80"
              >
                <Lock className="w-5 h-5 text-slate-400" />
                <span>{joinBtnState.label}</span>
              </button>
            ) : (
              <button
                onClick={() => onJoinMeeting(liveMeeting)}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white font-bold text-base shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <Video className="w-5 h-5 text-amber-300 group-hover:animate-bounce" />
                <span>{t.joinTodayMeeting}</span>
                {isLive && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
                  </span>
                )}
              </button>
            )
          ) : (
            <button
              onClick={() => onSelectSection('meetings')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white font-bold text-base shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Calendar className="w-5 h-5 text-amber-300" />
              <span>{t.viewSchedule}</span>
            </button>
          )}

          {/* Administrator Controls — visible ONLY to Administrators */}
          {isAdmin && (
            <button
              onClick={() => onOpenAdmin('meetings')}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl border-2 border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-sm transition-all hover:bg-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="w-5 h-5 text-amber-500" />
              <span>{isFa ? 'مدیریت جلسات' : isAr ? 'إدارة الاجتماعات' : 'Manage Meetings'}</span>
            </button>
          )}

          {/* Secondary Buttons */}
          <button
            onClick={() => onSelectSection('meetings')}
            className={`w-full sm:w-auto px-6 py-4 rounded-2xl border font-semibold text-base transition-all flex items-center justify-center gap-2 cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-xs'
            }`}
          >
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-amber-400" />
            <span>{t.viewSchedule}</span>
          </button>

          <button
            onClick={() => onSelectSection('media')}
            className={`w-full sm:w-auto px-6 py-4 rounded-2xl border font-semibold text-base transition-all flex items-center justify-center gap-2 cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-xs'
            }`}
          >
            <PlayCircle className="w-5 h-5 text-indigo-600 dark:text-amber-400" />
            <span>{t.watchRecordings}</span>
          </button>
        </div>

        {/* Live Meeting Spotlight Card if Active */}
        {liveMeeting && (
          <div className={`max-w-3xl mx-auto rounded-3xl p-6 sm:p-8 border text-left rtl:text-right shadow-xl transition-all ${
            theme === 'dark'
              ? 'bg-slate-900/90 border-indigo-500/30 text-slate-100'
              : 'bg-white/90 border-indigo-200 text-slate-800 shadow-indigo-100'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  {t.liveNow}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatLocalizedMeetingTime(liveMeeting.time, language)}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {liveMeeting.language}
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-xl sm:text-2xl font-bold font-display text-indigo-950 dark:text-indigo-200 mb-2">
                {getLocalizedText(liveMeeting.title, language)}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4">
                {getLocalizedText(liveMeeting.description, language)}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {t.host}: <strong className="text-slate-800 dark:text-slate-200">{liveMeeting.host}</strong>
              </div>
              {joinBtnState && joinBtnState.type === 'LOGIN_REQUIRED' ? (
                <button
                  onClick={onRequireLogin}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                >
                  <Lock className="w-4 h-4" />
                  <span>{joinBtnState.label}</span>
                </button>
              ) : (
                <button
                  onClick={() => onJoinMeeting(liveMeeting)}
                  disabled={!!joinBtnState && !joinBtnState.enabled}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-transform ${
                    joinBtnState && !joinBtnState.enabled
                      ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer hover:scale-105'
                  }`}
                >
                  <Video className="w-4 h-4 text-amber-300" />
                  <span>{joinBtnState && !joinBtnState.enabled ? joinBtnState.label : t.joinZoom}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Peaceful Quote Banner */}
        <div className="mt-12 text-center text-sm font-medium text-slate-500 dark:text-slate-400 italic max-w-xl mx-auto font-display">
          {t.peaceText}
        </div>

      </div>
    </section>
  );
};
