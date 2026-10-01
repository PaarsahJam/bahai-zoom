import React, { useState } from 'react';
import { ShieldAlert, Search, RefreshCw, Clock, User, FileText } from 'lucide-react';
import { AuditLogEntry, Language, ThemeMode } from '../../types';

interface AuditLogsCmsTabProps {
  logs: AuditLogEntry[];
  language: Language;
  theme: ThemeMode;
}

export const AuditLogsCmsTab: React.FC<AuditLogsCmsTabProps> = ({
  logs,
  language,
  theme,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(l =>
    l.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.resourceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-xs">
      <div className="flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 rtl:right-3 rtl:left-auto" />
          <input
            type="text"
            placeholder="Search audit trail by user, action or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
        </div>
        <span className="font-mono text-slate-400">{filteredLogs.length} Records</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left rtl:text-right">
          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3.5">Timestamp</th>
              <th className="p-3.5">User</th>
              <th className="p-3.5">Action</th>
              <th className="p-3.5">Target Module</th>
              <th className="p-3.5">Activity Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="p-3.5 font-mono text-slate-400">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                  @{log.user}
                </td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 font-mono font-bold text-[10px]">
                    {log.action}
                  </span>
                </td>
                <td className="p-3.5 text-slate-500 font-medium">
                  {log.resourceType}
                </td>
                <td className="p-3.5 text-slate-600 dark:text-slate-300 font-sans">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
