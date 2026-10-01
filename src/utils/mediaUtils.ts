import { MediaProvider, MediaType } from '../types';
import { MEDIA_PROVIDERS, mediaConfig } from '../config/mediaConfig';

/**
 * Validates if string is a well-formed HTTP/HTTPS URL
 */
export function validateMediaUrl(url: string): { isValid: boolean; error?: string } {
  if (!url || !url.trim()) {
    return { isValid: false, error: 'URL cannot be empty' };
  }
  const cleanUrl = url.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    return { isValid: false, error: 'URL must begin with http:// or https://' };
  }
  try {
    new URL(cleanUrl);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

/**
 * Detects the external media provider from a given URL
 */
export function detectMediaProvider(url: string): MediaProvider {
  if (!url) return 'other';
  const cleanUrl = url.trim().toLowerCase();

  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    return 'youtube';
  }
  if (cleanUrl.includes('vimeo.com')) {
    return 'vimeo';
  }
  if (cleanUrl.includes('archive.org')) {
    return 'archive_org';
  }
  if (
    cleanUrl.includes('r2.cloudflarestorage.com') ||
    cleanUrl.includes('r2.dev') ||
    cleanUrl.includes('s3.amazonaws.com') ||
    cleanUrl.includes('s3-') ||
    cleanUrl.includes('.s3.')
  ) {
    return 'r2_s3';
  }
  if (cleanUrl.includes('storage.googleapis.com') || cleanUrl.includes('gcs.')) {
    return 'google_cloud';
  }
  if (cleanUrl.includes('dropbox.com') || cleanUrl.includes('dl.dropboxusercontent.com')) {
    return 'dropbox';
  }
  if (cleanUrl.includes('drive.google.com')) {
    return 'google_drive';
  }
  if (
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.mp3') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.m4a') ||
    cleanUrl.endsWith('.wav') ||
    cleanUrl.endsWith('.ogg') ||
    cleanUrl.endsWith('.pdf') ||
    cleanUrl.endsWith('.m3u8')
  ) {
    return 'direct_url';
  }

  return 'other';
}

/**
 * Extracts YouTube Video ID from various link formats
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

/**
 * Extracts Vimeo Video ID
 */
export function extractVimeoId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
  return match && match[3] ? match[3] : null;
}

/**
 * Extracts Archive.org Item ID
 */
export function extractArchiveOrgId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/archive\.org\/(?:details|embed|download)\/([^\/\?#]+)/);
  return match && match[1] ? match[1] : null;
}

/**
 * Generates responsive embed or playback URL for the media provider
 */
export function extractEmbedUrl(url: string, provider?: MediaProvider): string {
  if (!url) return '';
  const cleanUrl = url.trim();
  const detectedProvider = provider || detectMediaProvider(cleanUrl);

  switch (detectedProvider) {
    case 'youtube': {
      const ytId = extractYouTubeId(cleanUrl);
      if (ytId) {
        return `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1`;
      }
      return cleanUrl;
    }

    case 'vimeo': {
      const vimeoId = extractVimeoId(cleanUrl);
      if (vimeoId) {
        return `https://player.vimeo.com/video/${vimeoId}`;
      }
      return cleanUrl;
    }

    case 'archive_org': {
      const archiveId = extractArchiveOrgId(cleanUrl);
      if (archiveId) {
        return `https://archive.org/embed/${archiveId}`;
      }
      return cleanUrl;
    }

    case 'google_drive': {
      // Convert view links to preview links for iframe embed
      if (cleanUrl.includes('/file/d/')) {
        const fileIdMatch = cleanUrl.match(/\/file\/d\/([^\/]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
          return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
        }
      }
      return cleanUrl;
    }

    case 'dropbox': {
      // Convert dropbox share link to direct download stream
      if (cleanUrl.includes('dropbox.com') && cleanUrl.includes('dl=0')) {
        return cleanUrl.replace('dl=0', 'raw=1');
      }
      return cleanUrl;
    }

    case 'r2_s3':
    case 'google_cloud':
    case 'direct_url':
    case 'other':
    default:
      return cleanUrl;
  }
}

/**
 * Auto-generates thumbnail preview URL for supported providers or returns fallback
 */
export function autoGenerateThumbnail(url: string, mediaType: MediaType = 'video', provider?: MediaProvider): string {
  if (!url) return mediaConfig.thumbnailFallback;
  const cleanUrl = url.trim();
  const detectedProvider = provider || detectMediaProvider(cleanUrl);

  if (detectedProvider === 'youtube') {
    const ytId = extractYouTubeId(cleanUrl);
    if (ytId) {
      return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }
  }

  if (detectedProvider === 'archive_org') {
    const archiveId = extractArchiveOrgId(cleanUrl);
    if (archiveId) {
      return `https://archive.org/services/img/${archiveId}`;
    }
  }

  if (mediaType === 'audio') {
    return mediaConfig.audioPlaceholderThumbnail;
  }

  if (mediaType === 'document') {
    return mediaConfig.documentPlaceholderThumbnail;
  }

  return mediaConfig.thumbnailFallback;
}

/**
 * Gets human readable provider metadata
 */
export function getProviderInfo(provider: MediaProvider) {
  return MEDIA_PROVIDERS[provider] || MEDIA_PROVIDERS.other;
}
