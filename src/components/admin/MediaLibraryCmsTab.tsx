import React, { useState } from 'react';
import { 
  UploadCloud, FileText, Trash2, Copy, Check, Search, Eye, Plus, Edit3, 
  Video, Music, Link2, Shield, Info, Play, ExternalLink, RefreshCw, CheckCircle2,
  AlertCircle, Sparkles, Layers, Tag, User, Calendar, Folder
} from 'lucide-react';
import { MediaLibraryFile, MediaItem, Meeting, Speaker, Language, ThemeMode, MediaProvider, MediaType } from '../../types';
import { 
  validateMediaUrl, detectMediaProvider, extractEmbedUrl, 
  autoGenerateThumbnail, getProviderInfo 
} from '../../utils/mediaUtils';
import { mediaConfig } from '../../config/mediaConfig';

interface MediaLibraryCmsTabProps {
  files: MediaLibraryFile[];
  onUploadFile: (f: MediaLibraryFile) => void;
  onDeleteFile: (id: string) => void;
  mediaItems?: MediaItem[];
  meetings?: Meeting[];
  speakers?: Speaker[];
  onSaveMediaItem?: (m: MediaItem) => void;
  onDeleteMediaItem?: (id: string) => void;
  language: Language;
  theme: ThemeMode;
}

export const MediaLibraryCmsTab: React.FC<MediaLibraryCmsTabProps> = ({
  files,
  onUploadFile,
  onDeleteFile,
  mediaItems = [],
  meetings = [],
  speakers = [],
  onSaveMediaItem,
  onDeleteMediaItem,
  language,
  theme,
}) => {
  const [subTab, setSubTab] = useState<'metadata' | 'files'>('metadata');
  
  // Static Files Filters & States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Media Metadata Items Filters & Form Modal State
  const [mediaSearch, setMediaSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [previewModalItem, setPreviewModalItem] = useState<MediaItem | null>(null);

  // Form State
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formTitleFa, setFormTitleFa] = useState('');
  const [formTitleAr, setFormTitleAr] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formMediaType, setFormMediaType] = useState<MediaType>('video');
  const [formExternalUrl, setFormExternalUrl] = useState('');
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
  const [formSpeakerName, setFormSpeakerName] = useState('');
  const [formDuration, setFormDuration] = useState('30 min');
  const [formLanguage, setFormLanguage] = useState<any>('English');
  const [formCategory, setFormCategory] = useState<any>('Talks');
  const [formRelatedMeetingId, setFormRelatedMeetingId] = useState('');
  const [formRelatedSpeakerId, setFormRelatedSpeakerId] = useState('');
  const [formTags, setFormTags] = useState('Education, Fellowship');

  // Real-time URL check
  const urlValidation = validateMediaUrl(formExternalUrl);
  const detectedProvider = detectMediaProvider(formExternalUrl);
  const providerInfo = getProviderInfo(detectedProvider);

  // Open Form for New Media Item
  const handleOpenNewForm = () => {
    setEditingMedia(null);
    setFormTitleEn('');
    setFormTitleFa('');
    setFormTitleAr('');
    setFormDescription('');
    setFormMediaType('video');
    setFormExternalUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    setFormThumbnailUrl('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
    setFormSpeakerName(speakers[0]?.name || 'Dr. Nader Saiedi');
    setFormDuration('45 min');
    setFormLanguage('English');
    setFormCategory('Talks');
    setFormRelatedMeetingId(meetings[0]?.id || '');
    setFormRelatedSpeakerId(speakers[0]?.id || '');
    setFormTags('Talk, Lecture');
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const handleOpenEditForm = (item: MediaItem) => {
    setEditingMedia(item);
    setFormTitleEn(item.title.en || '');
    setFormTitleFa(item.title.fa || '');
    setFormTitleAr(item.title.ar || '');
    setFormDescription(typeof item.description === 'string' ? item.description : item.description?.en || '');
    setFormMediaType(item.mediaType || (item.type as any) || 'video');
    setFormExternalUrl(item.externalUrl || item.embedUrl || '');
    setFormThumbnailUrl(item.thumbnailUrl || '');
    setFormSpeakerName(item.speakerName || '');
    setFormDuration(item.duration || '30 min');
    setFormLanguage(item.language || 'English');
    setFormCategory(item.category || 'Talks');
    setFormRelatedMeetingId(item.relatedMeetingId || '');
    setFormRelatedSpeakerId(item.relatedSpeakerId || '');
    setFormTags(item.tags ? item.tags.join(', ') : 'Talk');
    setIsFormOpen(true);
  };

  // Auto-fill thumbnail when external URL changes
  const handleUrlChange = (url: string) => {
    setFormExternalUrl(url);
    if (url.trim()) {
      const autoThumb = autoGenerateThumbnail(url, formMediaType);
      if (autoThumb) {
        setFormThumbnailUrl(autoThumb);
      }
    }
  };

  // Handle Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlValidation.isValid) return;

    const embedUrl = extractEmbedUrl(formExternalUrl, detectedProvider);
    const tagArray = formTags.split(',').map(t => t.trim()).filter(Boolean);

    const newItem: MediaItem = {
      id: editingMedia ? editingMedia.id : `med-${Date.now()}`,
      title: {
        en: formTitleEn || 'Untitled Media',
        fa: formTitleFa || formTitleEn || 'بدون عنوان',
        ar: formTitleAr || formTitleEn || 'بدون عنوان',
      },
      description: formDescription,
      mediaType: formMediaType,
      provider: detectedProvider,
      externalUrl: formExternalUrl.trim(),
      thumbnailUrl: formThumbnailUrl.trim() || autoGenerateThumbnail(formExternalUrl, formMediaType),
      embedUrl,
      speakerName: formSpeakerName || 'BahaiZoom Presenter',
      duration: formDuration || '30 min',
      language: formLanguage,
      category: formCategory,
      relatedMeetingId: formRelatedMeetingId || undefined,
      relatedSpeakerId: formRelatedSpeakerId || undefined,
      dateAdded: editingMedia?.dateAdded || new Date().toISOString().split('T')[0],
      tags: tagArray.length > 0 ? tagArray : ['General'],
      views: editingMedia ? editingMedia.views : 0,
      year: editingMedia ? editingMedia.year : new Date().getFullYear(),
      type: formMediaType === 'audio' ? 'audio' : formMediaType === 'document' ? 'document' : 'video',
    };

    if (onSaveMediaItem) {
      onSaveMediaItem(newItem);
    }
    setIsFormOpen(false);
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSimulatedDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const category: any = droppedFile.type.startsWith('image/')
        ? 'Images'
        : droppedFile.type.startsWith('video/')
        ? 'Videos'
        : droppedFile.type.startsWith('audio/')
        ? 'Audio'
        : 'Documents';

      const newMediaFile: MediaLibraryFile = {
        id: `file-${Date.now()}`,
        name: droppedFile.name,
        category,
        fileType: droppedFile.type || 'application/octet-stream',
        url: URL.createObjectURL(droppedFile),
        sizeMb: Number((droppedFile.size / (1024 * 1024)).toFixed(2)),
        uploadDate: new Date().toISOString().split('T')[0],
      };
      onUploadFile(newMediaFile);
    }
  };

  const filteredMediaItems = mediaItems.filter(m => {
    const titleStr = (m.title?.en || '') + (m.title?.fa || '') + (m.speakerName || '') + (m.tags?.join(' ') || '');
    const matchesSearch = !mediaSearch || titleStr.toLowerCase().includes(mediaSearch.toLowerCase());
    const matchesProvider = providerFilter === 'All' || m.provider === providerFilter;
    const matchesType = typeFilter === 'All' || m.mediaType === typeFilter || m.type === typeFilter;
    return matchesSearch && matchesProvider && matchesType;
  });

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'All' || f.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 text-xs">
      
      {/* Top Banner explaining Provider Independence & Architecture */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-500/20 text-slate-300">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              Flexible Provider-Independent Media Architecture
            </h3>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              No media binaries or videos are stored inside the database. The system stores only media metadata and external links (YouTube, Vimeo, Internet Archive, Cloudflare R2 / S3, Google Drive, or Direct HTTPS streams). Switching hosting providers requires zero code or schema updates.
            </p>
          </div>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('metadata')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'metadata'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Media Metadata Index ({mediaItems.length})</span>
          </button>

          <button
            onClick={() => setSubTab('files')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'files'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>Static Asset Files ({files.length})</span>
          </button>
        </div>

        {subTab === 'metadata' && (
          <button
            onClick={handleOpenNewForm}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-lg transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add External Media Item</span>
          </button>
        )}
      </div>

      {/* SUBTAB 1: MEDIA METADATA INDEX */}
      {subTab === 'metadata' && (
        <div className="space-y-6">
          
          {/* Search & Provider Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full sm:w-auto">
              <span className="font-bold text-slate-400 text-[11px] whitespace-nowrap">Provider:</span>
              {['All', 'youtube', 'vimeo', 'archive_org', 'r2_s3', 'google_drive'].map(prov => (
                <button
                  key={prov}
                  onClick={() => setProviderFilter(prov)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    providerFilter === prov
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {prov === 'All' ? 'All Providers' : getProviderInfo(prov as any).name}
                </button>
              ))}
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search media title, speaker, tags..."
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Media Items Table / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMediaItems.map(m => {
              const provInfo = getProviderInfo(m.provider || detectMediaProvider(m.externalUrl || m.embedUrl));
              const relMeeting = meetings.find(x => x.id === m.relatedMeetingId);
              const relSpeaker = speakers.find(x => x.id === m.relatedSpeakerId);

              return (
                <div 
                  key={m.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-3">
                    
                    {/* Thumbnail Preview with Provider Badge */}
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                      <img 
                        src={m.thumbnailUrl || mediaConfig.thumbnailFallback} 
                        alt={m.title.en} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                        loading="lazy"
                      />
                      
                      {/* Provider Badge */}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/80 text-amber-300 backdrop-blur-xs flex items-center gap-1 border border-amber-500/30">
                        <span>{provInfo.icon}</span>
                        <span>{provInfo.name}</span>
                      </span>

                      {/* Media Type & Duration */}
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-950/80 text-white backdrop-blur-xs">
                        {m.duration}
                      </span>
                    </div>

                    {/* Metadata Content */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold mb-1">
                        <span className="uppercase tracking-wider">{m.category}</span>
                        <span>{m.language}</span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-amber-400 transition-colors">
                        {m.title.en || m.title.fa}
                      </h4>

                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {typeof m.description === 'string' ? m.description : m.description?.en}
                      </p>
                    </div>

                    {/* Relational References */}
                    <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400">
                      {m.speakerName && (
                        <div className="flex items-center gap-1 text-slate-300">
                          <User className="w-3 h-3 text-indigo-400" />
                          <span>Speaker: <strong>{m.speakerName}</strong></span>
                        </div>
                      )}
                      {relMeeting && (
                        <div className="flex items-center gap-1 text-slate-400 truncate">
                          <Calendar className="w-3 h-3 text-emerald-400" />
                          <span>Linked Meeting: <strong className="text-emerald-300">{relMeeting.title.en}</strong></span>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setPreviewModalItem(m)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-300 font-bold text-[11px] flex items-center gap-1 hover:bg-slate-700 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Preview</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyUrl(m.externalUrl || m.embedUrl, m.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-300 cursor-pointer"
                        title="Copy External URL"
                      >
                        {copiedId === m.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleOpenEditForm(m)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 cursor-pointer"
                        title="Edit Metadata"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete media item "${m.title.en}"?`)) {
                            if (onDeleteMediaItem) onDeleteMediaItem(m.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-950 text-rose-400 cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* SUBTAB 2: STATIC ASSET FILES */}
      {subTab === 'files' && (
        <div className="space-y-6">
          
          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleSimulatedDrop}
            className={`p-8 border-2 border-dashed rounded-3xl text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-indigo-400'
            }`}
          >
            <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Drag & Drop static media files</h4>
              <p className="text-slate-400 mt-0.5">Images, MP3 Audio, MP4 Videos, and PDFs</p>
            </div>
            <label className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer transition-colors">
              Browse Local Machine
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const category: any = file.type.startsWith('image/')
                      ? 'Images'
                      : file.type.startsWith('audio/')
                      ? 'Audio'
                      : 'Documents';

                    const newMediaFile: MediaLibraryFile = {
                      id: `file-${Date.now()}`,
                      name: file.name,
                      category,
                      fileType: file.type || 'application/octet-stream',
                      url: URL.createObjectURL(file),
                      sizeMb: Number((file.size / (1024 * 1024)).toFixed(2)),
                      uploadDate: new Date().toISOString().split('T')[0],
                    };
                    onUploadFile(newMediaFile);
                  }
                }}
              />
            </label>
          </div>

          {/* Files Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredFiles.map(f => (
              <div key={f.id} className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-32 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                  {f.category === 'Images' ? (
                    <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                  ) : f.category === 'Audio' ? (
                    <Music className="w-10 h-10 text-emerald-500" />
                  ) : (
                    <FileText className="w-10 h-10 text-indigo-500" />
                  )}
                </div>

                <div>
                  <strong className="block font-bold truncate text-slate-900 dark:text-slate-100">{f.name}</strong>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>{f.sizeMb} MB</span>
                    <span>{f.uploadDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleCopyUrl(f.url, f.id)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === f.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === f.id ? 'Copied' : 'Copy URL'}</span>
                  </button>

                  <button
                    onClick={() => { if(confirm(`Delete file "${f.name}"?`)) onDeleteFile(f.id); }}
                    className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500 cursor-pointer"
                    title="Delete File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* FORM MODAL: ADD / EDIT MEDIA METADATA ITEM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 my-8 shadow-2xl">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-amber-400" />
                <span>{editingMedia ? 'Edit External Media Metadata' : 'Add External Media Metadata'}</span>
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Media Title (EN, FA, AR) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Title (English)*</label>
                  <input
                    type="text"
                    required
                    value={formTitleEn}
                    onChange={(e) => setFormTitleEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500"
                    placeholder="Progressive Revelation..."
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Title (Persian)</label>
                  <input
                    type="text"
                    value={formTitleFa}
                    onChange={(e) => setFormTitleFa(e.target.value)}
                    dir="rtl"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 font-persian"
                    placeholder="مفهوم تکامل..."
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Title (Arabic)</label>
                  <input
                    type="text"
                    value={formTitleAr}
                    onChange={(e) => setFormTitleAr(e.target.value)}
                    dir="rtl"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 font-arabic"
                    placeholder="مفهوم التقدم..."
                  />
                </div>
              </div>

              {/* Media Type & Category & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Media Type</label>
                  <select
                    value={formMediaType}
                    onChange={(e) => setFormMediaType(e.target.value as MediaType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="video">Video Stream</option>
                    <option value="audio">Audio / Chant / MP3</option>
                    <option value="document">PDF / Document</option>
                    <option value="podcast">Podcast Series</option>
                    <option value="livestream">Live Broadcast Stream</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="Talks">Talks & Lectures</option>
                    <option value="Music & Chants">Music & Chants</option>
                    <option value="Children">Children & Youth</option>
                    <option value="History">Documentary History</option>
                    <option value="Education">Education & Courses</option>
                    <option value="Health">Spiritual Health</option>
                    <option value="Books">Books & Literature</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Language</label>
                  <select
                    value={formLanguage}
                    onChange={(e) => setFormLanguage(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="English">English</option>
                    <option value="Persian">Persian (فارسی)</option>
                    <option value="Bilingual">Bilingual</option>
                    <option value="Arabic">Arabic (العربية)</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                </div>
              </div>

              {/* External Media URL with Auto-Validation & Auto-Detection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold">External Media URL*</label>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Provider: {providerInfo.icon} {providerInfo.name}
                    </span>
                    {urlValidation.isValid ? (
                      <span className="text-emerald-400 text-[10px] flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Valid HTTPS URL
                      </span>
                    ) : (
                      <span className="text-rose-400 text-[10px] flex items-center gap-1 font-bold">
                        <AlertCircle className="w-3 h-3" /> {urlValidation.error}
                      </span>
                    )}
                  </div>
                </div>

                <input
                  type="url"
                  required
                  value={formExternalUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 font-mono text-xs"
                  placeholder="https://youtube.com/watch?v=... or https://archive.org/details/..."
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Supports YouTube, Vimeo, Internet Archive, Cloudflare R2 / S3, Google Drive, Dropbox, or any direct HTTPS MP4/MP3 link.
                </p>
              </div>

              {/* Thumbnail URL with Auto Generator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-400 font-semibold">Thumbnail URL</label>
                  <button
                    type="button"
                    onClick={() => setFormThumbnailUrl(autoGenerateThumbnail(formExternalUrl, formMediaType))}
                    className="text-[10px] text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Auto-Generate Thumbnail
                  </button>
                </div>
                <input
                  type="url"
                  value={formThumbnailUrl}
                  onChange={(e) => setFormThumbnailUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 text-xs font-mono"
                  placeholder="https://img.youtube.com/vi/..."
                />
              </div>

              {/* Speaker Name, Duration, Related Meeting, Related Speaker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Presenter / Speaker Name</label>
                  <input
                    type="text"
                    value={formSpeakerName}
                    onChange={(e) => setFormSpeakerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    placeholder="Dr. Nader Saiedi"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Duration</label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    placeholder="45 min"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Link to Scheduled Meeting</label>
                  <select
                    value={formRelatedMeetingId}
                    onChange={(e) => setFormRelatedMeetingId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="">None (Independent Media)</option>
                    {meetings.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.title.en} ({m.time})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Link to Speaker Profile</label>
                  <select
                    value={formRelatedSpeakerId}
                    onChange={(e) => setFormRelatedSpeakerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="">None</option>
                    {speakers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description & Tags */}
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  placeholder="Summary of presentation or audio chant..."
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  placeholder="Philosophy, Baha'u'llah, Youth"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!urlValidation.isValid}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  Save Media Item
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setPreviewModalItem(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              ✕
            </button>

            <div className="relative aspect-video bg-black">
              {previewModalItem.mediaType === 'audio' ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-900 text-center">
                  <Music className="w-12 h-12 text-amber-400 mb-3 animate-pulse" />
                  <h4 className="text-xl font-bold text-white mb-2">{previewModalItem.title.en}</h4>
                  <audio controls src={previewModalItem.externalUrl || previewModalItem.embedUrl} className="w-full max-w-md mt-4" autoPlay />
                </div>
              ) : (
                <iframe
                  src={extractEmbedUrl(previewModalItem.externalUrl || previewModalItem.embedUrl, previewModalItem.provider)}
                  title={previewModalItem.title.en}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            <div className="p-5">
              <h3 className="text-lg font-bold text-white mb-1">{previewModalItem.title.en}</h3>
              <p className="text-xs text-slate-300 mb-3">{typeof previewModalItem.description === 'string' ? previewModalItem.description : previewModalItem.description?.en}</p>
              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
                <span>Provider: {getProviderInfo(previewModalItem.provider).name}</span>
                <span>Language: {previewModalItem.language}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
