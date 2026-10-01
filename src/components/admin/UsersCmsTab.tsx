import React, { useState } from 'react';
import { 
  UserCheck, Shield, Key, Plus, Trash2, Edit2, Lock, Check, X, Search, 
  Mail, Clock, AlertCircle, Ban, RefreshCw, Send, Copy, Ticket, History, Eye, UserX,
  Camera, Upload, User
} from 'lucide-react';
import { CmsUser, AdminRole, Language, ThemeMode, AccountStatus, MemberInvitation } from '../../types';
import { loadCmsData, saveCmsData, logCmsAudit, INITIAL_INVITATIONS } from '../../utils/cmsStorage';
import { getUserAvatar, DEFAULT_MALE_AVATAR, DEFAULT_FEMALE_AVATAR, DEFAULT_NEUTRAL_AVATAR } from '../../utils/avatarHelper';

interface UsersCmsTabProps {
  users: CmsUser[];
  onSaveUser: (u: CmsUser) => void;
  onDeleteUser: (id: string) => void;
  language: Language;
  theme: ThemeMode;
  currentUserRole: AdminRole;
}

export const UsersCmsTab: React.FC<UsersCmsTabProps> = ({
  users,
  onSaveUser,
  onDeleteUser,
  language,
  theme,
  currentUserRole,
}) => {
  const isFa = language === 'fa';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AccountStatus | 'ADMIN'>('ALL');
  
  // Invitations state
  const [invitations, setInvitations] = useState<MemberInvitation[]>(() => loadCmsData('bz_cms_invitations', INITIAL_INVITATIONS));
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);

  // User Edit & History modals
  const [editingUser, setEditingUser] = useState<Partial<CmsUser> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resetPassModal, setResetPassModal] = useState<CmsUser | null>(null);
  const [newPassInput, setNewPassInput] = useState('');
  const [rejectModalUser, setRejectModalUser] = useState<CmsUser | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [historyModalUser, setHistoryModalUser] = useState<CmsUser | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // --- MEMBER APPROVAL WORKFLOW HANDLERS ---
  const handleApproveUser = (user: CmsUser) => {
    const updated: CmsUser = {
      ...user,
      status: 'Approved',
      isActive: true,
      activityHistory: [
        ...(user.activityHistory || []),
        {
          id: `act-${Date.now()}`,
          action: 'APPROVED_BY_ADMIN',
          timestamp: new Date().toISOString(),
          details: 'Account approved by administrator committee.',
        },
      ],
    };
    onSaveUser(updated);
    logCmsAudit('Administrator', 'MEMBER_APPROVED', 'UserAccount', `Approved member: ${user.name} (${user.email})`);
    showToast(`✅ Member Approved: Email notification sent to ${user.email}`);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalUser) return;

    const updated: CmsUser = {
      ...rejectModalUser,
      status: 'Rejected',
      isActive: true,
      rejectionReason: rejectReasonInput.trim() || 'Registration details could not be verified.',
      activityHistory: [
        ...(rejectModalUser.activityHistory || []),
        {
          id: `act-${Date.now()}`,
          action: 'REJECTED_BY_ADMIN',
          timestamp: new Date().toISOString(),
          details: `Account rejected. Reason: ${rejectReasonInput || 'Standard administrative review'}`,
        },
      ],
    };

    onSaveUser(updated);
    logCmsAudit('Administrator', 'MEMBER_REJECTED', 'UserAccount', `Rejected member: ${rejectModalUser.name} (${rejectModalUser.email})`);
    showToast(`Notice sent: Member registration marked as Rejected.`);
    setRejectModalUser(null);
    setRejectReasonInput('');
  };

  const handleSuspendUser = (user: CmsUser) => {
    const updated: CmsUser = {
      ...user,
      status: 'Suspended',
      isActive: false,
      activityHistory: [
        ...(user.activityHistory || []),
        {
          id: `act-${Date.now()}`,
          action: 'SUSPENDED_BY_ADMIN',
          timestamp: new Date().toISOString(),
          details: 'Account suspended by administrator.',
        },
      ],
    };
    onSaveUser(updated);
    logCmsAudit('Administrator', 'MEMBER_SUSPENDED', 'UserAccount', `Suspended account: ${user.name}`);
    showToast(`Account suspended: ${user.name}`);
  };

  const handleReactivateUser = (user: CmsUser) => {
    const updated: CmsUser = {
      ...user,
      status: 'Approved',
      isActive: true,
      activityHistory: [
        ...(user.activityHistory || []),
        {
          id: `act-${Date.now()}`,
          action: 'REACTIVATED_BY_ADMIN',
          timestamp: new Date().toISOString(),
          details: 'Account reactivated by administrator.',
        },
      ],
    };
    onSaveUser(updated);
    logCmsAudit('Administrator', 'MEMBER_REACTIVATED', 'UserAccount', `Reactivated account: ${user.name}`);
    showToast(`Account reactivated: ${user.name}`);
  };

  // --- MEMBER INVITATION CREATION ---
  const handleCreateInvitation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const code = `INV-${Math.floor(1000 + Math.random() * 9000)}-UNITY`;
    const newInvite: MemberInvitation = {
      id: `inv-${Date.now()}`,
      code,
      inviteeEmail: inviteEmail.trim().toLowerCase(),
      inviteeName: inviteName.trim() || 'Invited Member',
      createdByName: 'Administrator',
      createdByEmail: 'admin@bahaizoom.org',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      used: false,
    };

    const updated = [newInvite, ...invitations];
    setInvitations(updated);
    saveCmsData('bz_cms_invitations', updated);

    const link = `${window.location.origin}/?invite=${code}`;
    setGeneratedInviteLink(link);

    logCmsAudit('Administrator', 'INVITATION_CREATED', 'MemberInvitation', `Created invite code ${code} for ${inviteEmail}`);
    showToast(`Invitation generated for ${inviteEmail}!`);
  };

  // --- PASSWORD RESET ---
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassModal || !newPassInput) return;

    onSaveUser({
      ...resetPassModal,
      mustChangePassword: true,
    });
    setResetPassModal(null);
    setNewPassInput('');
    showToast(`Password reset instruction email triggered for ${resetPassModal.email}!`);
  };

  // --- EDIT USER ---
  const handleSaveUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const fullUser: CmsUser = {
      id: editingUser.id || `usr-${Date.now()}`,
      username: (editingUser.username || editingUser.email?.split('@')[0] || `user_${Date.now()}`).trim().toLowerCase(),
      name: editingUser.name || `${editingUser.firstName || ''} ${editingUser.lastName || ''}`.trim() || 'User',
      firstName: editingUser.firstName,
      lastName: editingUser.lastName,
      email: editingUser.email || 'user@example.com',
      role: editingUser.role || 'Member',
      adminRole: editingUser.adminRole,
      status: editingUser.status || 'Approved',
      emailVerified: true,
      isActive: editingUser.isActive !== false,
      country: editingUser.country || 'United States',
      preferredLanguage: editingUser.preferredLanguage || 'en',
      createdAt: editingUser.createdAt || new Date().toISOString(),
      registeredAt: editingUser.registeredAt || new Date().toISOString(),
    };

    onSaveUser(fullUser);
    setIsModalOpen(false);
    setEditingUser(null);
    showToast('User account saved successfully!');
  };

  // Filtered Users
  const pendingCount = users.filter((u) => u.status === 'Pending').length;
  const approvedCount = users.filter((u) => u.status === 'Approved').length;

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      (u.country && u.country.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ADMIN') return u.role === 'Administrator';
    return u.status === statusFilter;
  });

  return (
    <div className="space-y-6 text-xs">
      {toastMsg && (
        <div className="p-3 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-2 shadow-lg animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* PENDING APPROVAL ALERT BANNER IF PENDING USERS EXIST */}
      {pendingCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold animate-pulse">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">
                {isFa ? `${pendingCount} ثبت‌نام جدید در انتظار تأیید مدیریت` : `${pendingCount} New Member Registration(s) Awaiting Approval`}
              </h4>
              <p className="text-[11px] opacity-90">
                {isFa ? 'اعضایی که ایمیل خود را تأیید کرده‌اند و منتظر مجوز ورود به جلسات زوم هستند.' : 'Verified email registrations waiting for administrator review.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('Pending')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer shadow-sm self-start sm:self-auto"
          >
            {isFa ? 'بررسی درخواست‌ها' : 'Review Pending Queue'}
          </button>
        </div>
      )}

      {/* ACTION HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 rtl:right-3 rtl:left-auto" />
          <input
            type="text"
            placeholder="Search by name, email, country, username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] cursor-pointer ${
              statusFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All ({users.length})
          </button>
          <button
            onClick={() => setStatusFilter('Pending')}
            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] cursor-pointer flex items-center gap-1 ${
              statusFilter === 'Pending' ? 'bg-amber-500 text-slate-950' : 'text-amber-600 hover:bg-amber-500/10'
            }`}
          >
            <span>Pending</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-600 text-white font-extrabold">{pendingCount}</span>
            )}
          </button>
          <button
            onClick={() => setStatusFilter('Approved')}
            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] cursor-pointer ${
              statusFilter === 'Approved' ? 'bg-emerald-600 text-white' : 'text-emerald-600 hover:bg-emerald-500/10'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setStatusFilter('ADMIN')}
            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] cursor-pointer ${
              statusFilter === 'ADMIN' ? 'bg-indigo-900 text-white' : 'text-indigo-600 hover:bg-indigo-500/10'
            }`}
          >
            Admins
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              setInviteEmail('');
              setInviteName('');
              setGeneratedInviteLink(null);
              setInviteModalOpen(true);
            }}
            className="flex-1 md:flex-initial px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <Ticket className="w-4 h-4" />
            <span>Invite Member by Email</span>
          </button>

          <button
            onClick={() => {
              setEditingUser({
                id: `usr-${Date.now()}`,
                username: '',
                email: '',
                name: '',
                role: 'Administrator',
                adminRole: 'Editor',
                status: 'Approved',
                isActive: true,
                mustChangePassword: true,
                avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                createdAt: new Date().toISOString(),
              });
              setIsModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left rtl:text-right">
          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3.5">User Profile</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Approval Status</th>
              <th className="p-3.5">Country & Lang</th>
              <th className="p-3.5">Registration Date</th>
              <th className="p-3.5 text-right rtl:text-left">Actions & Workflow</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  No accounts found matching search or filter criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isPending = u.status === 'Pending';
                const isApproved = u.status === 'Approved';
                const isRejected = u.status === 'Rejected';
                const isSuspended = u.status === 'Suspended';

                return (
                  <tr key={u.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${isPending ? 'bg-amber-500/5' : ''}`}>
                    <td className="p-3.5 flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img
                          src={getUserAvatar(u)}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                        {u.gender === 'female' && (
                          <span className="absolute -bottom-1 -right-1 text-[10px]" title="Female">👩</span>
                        )}
                        {u.gender === 'male' && (
                          <span className="absolute -bottom-1 -right-1 text-[10px]" title="Male">👨</span>
                        )}
                      </div>
                      <div>
                        <strong className="block font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{u.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">(@{u.username})</span>
                        </strong>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {u.email}
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.role === 'Administrator'
                          ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}>
                        {u.role === 'Administrator' ? `Admin (${u.adminRole || 'Editor'})` : 'Member'}
                      </span>
                    </td>

                    <td className="p-3.5">
                      {isPending && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold border border-amber-500/30 flex items-center gap-1 w-fit animate-pulse">
                          <Clock className="w-3 h-3" />
                          Pending Approval
                        </span>
                      )}
                      {isApproved && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 w-fit">
                          <UserCheck className="w-3 h-3 text-emerald-500" />
                          Approved
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 w-fit" title={u.rejectionReason}>
                          <UserX className="w-3 h-3 text-rose-500" />
                          Rejected
                        </span>
                      )}
                      {isSuspended && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold flex items-center gap-1 w-fit">
                          <Ban className="w-3 h-3 text-slate-500" />
                          Suspended
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      <div>{u.country || 'Global'}</div>
                      <span className="text-[10px] text-slate-400 uppercase">{u.preferredLanguage || 'EN'}</span>
                    </td>

                    <td className="p-3.5 text-slate-400 text-[11px]">
                      <div>{u.registeredAt ? new Date(u.registeredAt).toLocaleDateString() : 'N/A'}</div>
                      {u.lastLoginAt && (
                        <div className="text-[10px] text-indigo-500">Last login: {new Date(u.lastLoginAt).toLocaleTimeString()}</div>
                      )}
                    </td>

                    <td className="p-3.5 text-right rtl:text-left space-x-1.5">
                      {/* Workflow Buttons for Pending Users */}
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleApproveUser(u)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer shadow-sm"
                            title="Approve Member Access"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectModalUser(u)}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] cursor-pointer shadow-sm"
                            title="Reject Registration"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {/* Reactivate or Suspend Actions */}
                      {isApproved && u.username !== 'admin' && (
                        <button
                          onClick={() => handleSuspendUser(u)}
                          className="p-1.5 text-slate-400 hover:text-amber-500"
                          title="Suspend Account"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}

                      {(isSuspended || isRejected) && (
                        <button
                          onClick={() => handleReactivateUser(u)}
                          className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] cursor-pointer"
                          title="Reactivate Account"
                        >
                          Reactivate
                        </button>
                      )}

                      <button
                        onClick={() => setResetPassModal(u)}
                        className="p-1.5 text-slate-400 hover:text-amber-500"
                        title="Reset Password"
                      >
                        <Lock className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setHistoryModalUser(u)}
                        className="p-1.5 text-slate-400 hover:text-indigo-500"
                        title="View Activity History"
                      >
                        <History className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-500"
                        title="Edit Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {u.username !== 'admin' && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete user account for ${u.name}?`)) onDeleteUser(u.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: INVITE MEMBER BY EMAIL */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-800 dark:text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm">Invite Member by Email</h3>
              </div>
              <button onClick={() => setInviteModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-xs">
              Invited members receive an invitation link. When they register using this link and verify their email, their account is <strong>automatically marked as Approved</strong>, bypassing the manual queue.
            </p>

            <form onSubmit={handleCreateInvitation} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1">Invitee Email Address *</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="member.friend@example.com"
                  className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Invitee Name (Optional)</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Navid Soltani"
                  className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Generate Secure Invitation Link</span>
              </button>
            </form>

            {generatedInviteLink && (
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 space-y-2">
                <span className="font-bold text-indigo-900 dark:text-indigo-200 block text-[11px]">
                  Generated Link (Auto-Approve Enabled):
                </span>
                <input
                  type="text"
                  readOnly
                  value={generatedInviteLink}
                  className="w-full p-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedInviteLink);
                    showToast('Invitation link copied to clipboard!');
                  }}
                  className="w-full py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Invitation Link</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: REJECT MEMBER REASON */}
      {rejectModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleRejectSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-slate-800 dark:text-slate-200">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Reject Registration for {rejectModalUser.name}</h3>
            <div>
              <label className="font-semibold block mb-1">Rejection Reason / Note (Sent via email notification)</label>
              <textarea
                value={rejectReasonInput}
                onChange={(e) => setRejectReasonInput(e.target.value)}
                placeholder="e.g. Registration details could not be verified by committee."
                rows={3}
                className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRejectModalUser(null)} className="px-3 py-1.5 rounded-xl border">Cancel</button>
              <button type="submit" className="px-4 py-1.5 rounded-xl bg-rose-600 text-white font-bold">Reject & Send Notice</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: VIEW USER ACTIVITY HISTORY */}
      {historyModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-slate-800 dark:text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-sm">Activity History for {historyModalUser.name}</h3>
              </div>
              <button onClick={() => setHistoryModalUser(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(!historyModalUser.activityHistory || historyModalUser.activityHistory.length === 0) ? (
                <p className="text-slate-400 text-center py-4">No logged activity recorded for this user yet.</p>
              ) : (
                historyModalUser.activityHistory.map((act) => (
                  <div key={act.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{act.action}</span>
                      <span className="text-slate-400">{new Date(act.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{act.details}</p>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => setHistoryModalUser(null)} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-sm">Manage Account Profile</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400"><X className="w-5 h-5"/></button>
            </div>

            <form onSubmit={handleSaveUserSubmit} className="space-y-3 text-slate-800 dark:text-slate-200">
              <div>
                <label className="font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Account Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Member">Member</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Approval Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as AccountStatus })}
                    className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* GENDER & AVATAR EDIT FIELDS */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1 text-xs">Gender</label>
                    <select
                      value={editingUser.gender || 'unspecified'}
                      onChange={(e) => {
                        const newGender = e.target.value as any;
                        setEditingUser({
                          ...editingUser,
                          gender: newGender,
                          avatarType: editingUser.avatarType === 'custom_photo'
                            ? 'custom_photo'
                            : newGender === 'female' ? 'preset_female' : newGender === 'male' ? 'preset_male' : 'preset_neutral'
                        });
                      }}
                      className="w-full p-2 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <option value="female">👩 Female</option>
                      <option value="male">👨 Male</option>
                      <option value="other">🧑 Other</option>
                      <option value="unspecified">Unspecified</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-xs">Avatar Style</label>
                    <select
                      value={editingUser.avatarType || 'preset_neutral'}
                      onChange={(e) => setEditingUser({ ...editingUser, avatarType: e.target.value as any })}
                      className="w-full p-2 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <option value="preset_female">👩 Female Vector</option>
                      <option value="preset_male">👨 Male Vector</option>
                      <option value="preset_neutral">🧑 Neutral Vector</option>
                      <option value="custom_photo">📷 Custom Photo</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={getUserAvatar(editingUser)}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover border border-indigo-400 bg-white dark:bg-slate-900 shrink-0"
                  />
                  <div className="flex-1">
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Custom Photo (Upload or URL)
                    </label>
                    <div className="flex gap-2">
                      <label className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-900 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5 text-amber-500" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result) {
                                  setEditingUser({
                                    ...editingUser,
                                    avatarUrl: ev.target.result as string,
                                    avatarType: 'custom_photo',
                                  });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <input
                        type="url"
                        value={editingUser.avatarUrl || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, avatarUrl: e.target.value, avatarType: 'custom_photo' })}
                        placeholder="Photo URL (https://...)"
                        className="flex-1 p-1.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {resetPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleResetPassword} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-slate-800 dark:text-slate-200">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Reset Password for {resetPassModal.name}</h3>
            <div>
              <label className="font-semibold block mb-1">New Temp Password</label>
              <input
                type="text"
                required
                value={newPassInput}
                onChange={(e) => setNewPassInput(e.target.value)}
                placeholder="e.g. TempPass2026!"
                className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setResetPassModal(null)} className="px-3 py-1.5 rounded-xl border">Cancel</button>
              <button type="submit" className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold">Trigger Reset Email</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
