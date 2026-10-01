import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Language, ThemeMode } from '../types';
import { translations } from '../data/translations';

interface FAQProps {
  language: Language;
  theme: ThemeMode;
}

export const FAQSection: React.FC<FAQProps> = ({ language, theme }) => {
  const t = translations[language];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: {
        en: 'How do I join a BahaiZoom meeting?',
        fa: 'چگونه می‌توانم در جلسات بهائی‌زوم شرکت کنم؟',
        ar: 'كيف يمكنني الانضمام إلى اجتماعات بهائي زوم؟',
      },
      a: {
        en: 'Simply click the "Join Zoom Meeting" button next to any meeting listing. You will be redirected directly to Zoom with the passcode pre-configured.',
        fa: 'کافی است روی دکمه «ورود به جلسه زوم» در کنار هر برنامه کلیک کنید. شما مستقیماً به زوم با رمز ورود هدایت خواهید شد.',
        ar: 'ببساطة اضغط على زر "الانضمام عبر زوم" بجانب أي اجتماع وسوف يتم توجيهك مباشرة.',
      },
    },
    {
      q: {
        en: 'How do time zones work on the website?',
        fa: 'منطقه‌های زمانی در سایت چگونه محاسبه می‌شوند؟',
        ar: 'كيف تعمل المناطق الزمنية على الموقع؟',
      },
      a: {
        en: 'All times are listed in UTC by default, but you can use the timezone selector dropdown on the schedule to convert times to IRT (Tehran), EST, PST, CET, GST (Dubai), or local time.',
        fa: 'تمام زمان‌ها به‌طور پیش‌فرض به UTC هستند، اما می‌توانید با استفاده از منوی منطقه زمانی زمان‌ها را به وقت تهران، دبی، اروپا یا آمریکا تبدیل کنید.',
        ar: 'جميع الأوقات مدرجة بتوقيت UTC افتراضياً، ويمكنك استخدام القائمة لتحويل الأوقات إلى مكة، طهران، دبي أو أوروبا.',
      },
    },
    {
      q: {
        en: 'Are recordings available if I miss a live meeting?',
        fa: 'آیا در صورت از دست دادن جلسه، فایل ضبط‌شده آن موجود است؟',
        ar: 'هل التسجيلات متاحة إذا لم أتمكن من الحضور المباشر؟',
      },
      a: {
        en: 'Yes! Most educational lectures and public talks are recorded and uploaded to our Media Library and Youtube channel within 24 hours.',
        fa: 'بله! اکثر سخنرانی‌های آموزشی و جلسات عمومی ضبط شده و ظرف ۲۴ ساعت در «کتابخانه رسانه‌ای» قرار می‌گیرند.',
        ar: 'نعم! معظم المحاضرات العامة تُسجل وتُرفع إلى "المكتبة المرئية والصوتية" خلال 24 ساعة.',
      },
    },
    {
      q: {
        en: 'How can I host a meeting or present a talk?',
        fa: 'چگونه می‌توانم یک جلسه را میزبانی کنم یا سخنرانی ارائه دهم؟',
        ar: 'كيف يمكنني استضافة اجتماع أو تقديم محاضرة؟',
      },
      a: {
        en: 'We welcome educators and speakers! Please contact our coordination committee through the Contact form or Telegram channel.',
        fa: 'ما از استادان و ارائه دهندگان استقبال می‌کنیم! لطفاً از طریق فرم تماس یا کانال تلگرام با کمیته هماهنگی در ارتباط باشید.',
        ar: 'نرحب بالمربين والمحاضرين! يرجى التواصل معنا عبر نموذج الاتصال أو قناة التلغرام.',
      },
    },
  ];

  return (
    <section id="faq" className="py-16 md:py-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-3">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span>{t.faq}</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold font-display ${
            theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
          }`}>
            {t.faq}
          </h2>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const question = faq.q[language] || faq.q.en;
            const answer = faq.a[language] || faq.a.en;

            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-slate-900/80 border-slate-800 text-slate-100'
                    : 'bg-white border-slate-200 text-slate-900 shadow-xs'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm sm:text-base flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{question}</span>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-amber-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
                    {answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
