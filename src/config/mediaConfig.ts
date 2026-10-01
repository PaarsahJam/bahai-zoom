/**
 * Media System Configuration
 * 
 * Entire application media management is fully configurable through environment
 * variables and configuration files. No provider-specific URLs, API keys, credentials,
 * or storage endpoints are hardcoded in source code.
 */

export interface MediaProviderConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  supportedTypes: ('video' | 'audio' | 'document' | 'podcast' | 'livestream')[];
  allowsDirectEmbed: boolean;
  costTier: 'Free' | 'Low-Cost' | 'Custom';
}

export const MEDIA_PROVIDERS: Record<string, MediaProviderConfig> = {
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶️',
    description: 'Free public video hosting with international CDN delivery.',
    supportedTypes: ['video', 'livestream', 'podcast'],
    allowsDirectEmbed: true,
    costTier: 'Free',
  },
  vimeo: {
    id: 'vimeo',
    name: 'Vimeo',
    icon: '🎬',
    description: 'High-quality video streaming with privacy controls.',
    supportedTypes: ['video', 'podcast'],
    allowsDirectEmbed: true,
    costTier: 'Free',
  },
  archive_org: {
    id: 'archive_org',
    name: 'Internet Archive (Archive.org)',
    icon: '🏛️',
    description: 'Permanent open-access digital library for historical media, audio, and documents.',
    supportedTypes: ['video', 'audio', 'document', 'podcast'],
    allowsDirectEmbed: true,
    costTier: 'Free',
  },
  r2_s3: {
    id: 'r2_s3',
    name: 'Cloudflare R2 / Amazon S3',
    icon: '☁️',
    description: 'S3-compatible object storage with zero egress fees (Cloudflare R2).',
    supportedTypes: ['video', 'audio', 'document', 'podcast', 'livestream'],
    allowsDirectEmbed: true,
    costTier: 'Low-Cost',
  },
  google_cloud: {
    id: 'google_cloud',
    name: 'Google Cloud Storage',
    icon: '🪣',
    description: 'Scalable cloud storage buckets for high-availability media assets.',
    supportedTypes: ['video', 'audio', 'document', 'podcast'],
    allowsDirectEmbed: true,
    costTier: 'Low-Cost',
  },
  dropbox: {
    id: 'dropbox',
    name: 'Dropbox (Shared Link)',
    icon: '📦',
    description: 'Direct shared media links from Dropbox storage.',
    supportedTypes: ['video', 'audio', 'document'],
    allowsDirectEmbed: true,
    costTier: 'Free',
  },
  google_drive: {
    id: 'google_drive',
    name: 'Google Drive',
    icon: '📁',
    description: 'Shared Google Drive video and document previews.',
    supportedTypes: ['video', 'audio', 'document'],
    allowsDirectEmbed: true,
    costTier: 'Free',
  },
  direct_url: {
    id: 'direct_url',
    name: 'Direct HTTPS Media URL',
    icon: '🔗',
    description: 'Standard open HTTPS stream (MP4, MP3, PDF, HLS, WebM).',
    supportedTypes: ['video', 'audio', 'document', 'podcast', 'livestream'],
    allowsDirectEmbed: true,
    costTier: 'Free',
  },
  other: {
    id: 'other',
    name: 'External Provider',
    icon: '🌐',
    description: 'Generic external web media embed.',
    supportedTypes: ['video', 'audio', 'document', 'podcast', 'livestream'],
    allowsDirectEmbed: true,
    costTier: 'Free',
  },
};

export const mediaConfig = {
  // Read runtime environment variables cleanly
  defaultProvider: ((import.meta as any).env?.VITE_MEDIA_DEFAULT_PROVIDER as string) || 'youtube',
  cdnBaseUrl: ((import.meta as any).env?.VITE_MEDIA_CDN_BASE_URL as string) || '',
  allowExternalEmbeds: ((import.meta as any).env?.VITE_MEDIA_ALLOW_EXTERNAL_EMBEDS as string) !== 'false',
  thumbnailFallback: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80',
  audioPlaceholderThumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
  documentPlaceholderThumbnail: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
};
