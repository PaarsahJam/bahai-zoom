import React from 'react';
import { ShieldAlert, Home } from 'lucide-react';
import { Language, ThemeMode } from '../types';

interface AccessDeniedPageProps {
  language: Language;
  theme: ThemeMode;
  onDismiss: () => void;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  language,
  theme,
  onDismiss,
}) => {
  const isFa = language === 'fa';
  const isAr = language === 'ar';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-8 text-center ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-500 flex items-center justify-center shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h2 className="mt-5 text-2xl font-bold font-display">
          {isFa ? 'دسترسی غیرمجاز' : isAr ? 'تم رفض الوصول' : 'Access Denied'}
        </h2>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {isFa
            ? 'شما مجوز دسترسی به این بخش را ندارید. فقط مدیران سایت می‌توانند از پنل مدیریت و امکانات مدیریتی استفاده کنند.'
            : isAr
              ? 'لا تملك الإذن لعرض هذه الصفحة. يمكن للمسؤولين فقط الوصول إلى لوحة الإدارة.'
              : 'You do not have permission to view this page. Only authorized administrators can access the site management panel.'}
        </p>

        <div className="mt-6 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
          {isFa
            ? 'اگر مدیر سایت هستید، ابتدا با حساب مدیر وارد شوید.'
            : isAr
              ? 'إذا كنت مسؤولاً، يرجى تسجيل الدخول بحساب المسؤول أولاً.'
              : 'If you are an administrator, please sign in with your administrator account first.'}
        </div>

        <button
          onClick={onDismiss}
          className="mt-6 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
        >
          <Home className="w-4 h-4" />
          <span>{isFa ? 'بازگشت به صفحه اصلی' : isAr ? 'العودة إلى الصفحة الرئيسية' : 'Return to Homepage'}</span>
        </button>
      </div>
    </div>
  );
};
