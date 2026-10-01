import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, AlertTriangle, Plus, Edit2, Trash2, Check, Sparkles } from 'lucide-react';
import { Meeting, EventItem, Language, ThemeMode } from '../../types';

interface ScheduleCalendarCmsTabProps {
  meetings: Meeting[];
  events: EventItem[];
  onSaveMeeting: (m: Meeting) => void;
  onSaveEvent: (e: EventItem) => void;
  onDeleteEvent: (id: string) => void;
  language: Language;
  theme: ThemeMode;
}

export const ScheduleCalendarCmsTab: React.FC<ScheduleCalendarCmsTabProps> = ({
  meetings,
  events,
  onSaveMeeting,
  onSaveEvent,
  onDeleteEvent,
  language,
  theme,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'weekly' | 'holydays'>('weekly');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-03-20');
  const [newEventCat, setNewEventCat] = useState<'Holy Day' | 'Feast' | 'Conference' | 'Workshop'>('Holy Day');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;

    const ev: EventItem = {
      id: `ev-${Date.now()}`,
      title: { en: newEventTitle, fa: newEventTitle, ar: newEventTitle },
      date: newEventDate,
      category: newEventCat,
      description: { en: 'Special spiritual commemoration event.', fa: 'مراسم و مناسبت ویژه معنوی.' },
      registrationOpen: true,
      isWorkSuspended: newEventCat === 'Holy Day',
    };

    onSaveEvent(ev);
    setNewEventTitle('');
    showToast('Calendar event created successfully!');
  };

  // Conflict Detection Logic
  const getConflicts = (dayIdx: number) => {
    const dayMeetings = meetings.filter(m => m.dayOfWeek === dayIdx && m.isActive !== false);
    const times = dayMeetings.map(m => m.time);
    const duplicates = times.filter((t, idx) => times.indexOf(t) !== idx);
    return duplicates;
  };

  return (
    <div className="space-y-6 text-xs">
      
      {toastMsg && (
        <div className="p-3 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-2 shadow-lg animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('weekly')}
          className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-colors ${
            activeSubTab === 'weekly' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
          }`}
        >
          Weekly Recurring Grid & Conflict Detector
        </button>
        <button
          onClick={() => setActiveSubTab('holydays')}
          className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-colors ${
            activeSubTab === 'holydays' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
          }`}
        >
          Badíʿ Calendar & Holy Days ({events.length})
        </button>
      </div>

      {/* WEEKLY GRID */}
      {activeSubTab === 'weekly' && (
        <div className="space-y-4">
          <p className="text-slate-400">
            Interactive weekly schedule overview. If two active meetings are scheduled for the exact same time on the same day, an automatic conflict alert is raised.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {daysOfWeek.map((dayName, dayIdx) => {
              const dayMeetings = meetings.filter(m => m.dayOfWeek === dayIdx && m.isActive !== false);
              const conflicts = getConflicts(dayIdx);

              return (
                <div key={dayName} className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{dayName}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono">
                      {dayMeetings.length}
                    </span>
                  </div>

                  {conflicts.length > 0 && (
                    <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] flex items-center gap-1 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Overlap Conflict!</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    {dayMeetings.map(m => (
                      <div key={m.id} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                        <strong className="block font-bold text-slate-900 dark:text-slate-100 truncate">{m.title.en}</strong>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>{m.time}</span>
                          <span className="text-indigo-500 font-semibold">{m.language}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* HOLY DAYS & CALENDAR */}
      {activeSubTab === 'holydays' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateEvent} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-bold text-sm">Add New Commemoration or Feast Event</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Event Title (e.g. Naw-Rúz / Festival of Ridván)"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              />
              <input
                type="date"
                required
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                className="p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
              <select
                value={newEventCat}
                onChange={(e) => setNewEventCat(e.target.value as any)}
                className="p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="Holy Day" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Holy Day (Work Suspended)</option>
                <option value="Feast" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Nineteen Day Feast</option>
                <option value="Conference" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Global Conference</option>
                <option value="Workshop" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Educational Workshop</option>
              </select>
            </div>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold cursor-pointer">
              Publish Event to Calendar
            </button>
          </form>

          <div className="space-y-2">
            {events.map(ev => (
              <div key={ev.id} className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="font-bold text-slate-900 dark:text-slate-100">{ev.title.en}</strong>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold">
                      {ev.category}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono mt-0.5 block">{ev.date}</span>
                </div>
                <button onClick={() => { if(confirm(`Delete event "${ev.title.en}"?`)) onDeleteEvent(ev.id); }} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
