/**
 * Song Parser Utility for SongFess8
 * Supports YouTube and Spotify URL parsing and validation
 */

export type SongType = 'youtube' | 'spotify' | null;

export interface ParsedSong {
  type: SongType;
  id: string;
  embedUrl: string;
  originalUrl: string;
  isValid: boolean;
}

/**
 * Parse YouTube URL and extract video ID
 * Supports formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - https://music.youtube.com/watch?v=VIDEO_ID
 */
export function parseYouTubeUrl(url: string): { id: string | null; isValid: boolean } {
  try {
    const urlObj = new URL(url);
    
    // Standard YouTube URL: youtube.com/watch?v=...
    if (urlObj.hostname.includes('youtube.com')) {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return { id: videoId, isValid: true };
      }
    }
    
    // Short YouTube URL: youtu.be/...
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.slice(1).split('?')[0];
      if (videoId) {
        return { id: videoId, isValid: true };
      }
    }
    
    return { id: null, isValid: false };
  } catch {
    return { id: null, isValid: false };
  }
}

/**
 * Parse Spotify URL and extract track/album/playlist ID
 * Supports formats:
 * - https://open.spotify.com/track/TRACK_ID
 * - https://open.spotify.com/track/TRACK_ID?si=xxx
 * - https://open.spotify.com/album/ALBUM_ID
 * - https://open.spotify.com/playlist/PLAYLIST_ID
 * - https://open.spotify.com/intl-id/track/TRACK_ID
 * - https://spotify.link/xxx (short link - will be treated as valid)
 */
export function parseSpotifyUrl(url: string): { 
  id: string | null; 
  type: 'track' | 'album' | 'playlist' | null;
  isValid: boolean 
} {
  try {
    const urlObj = new URL(url);
    
    // Handle spotify.link short URLs - accept as valid track
    if (urlObj.hostname === 'spotify.link') {
      const shortId = urlObj.pathname.slice(1).split('?')[0];
      if (shortId) {
        return { id: shortId, type: 'track', isValid: true };
      }
    }
    
    // Handle open.spotify.com URLs (including intl-* subdomains)
    if (urlObj.hostname === 'open.spotify.com' || urlObj.hostname.endsWith('.spotify.com')) {
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      // Handle intl-xx prefix (e.g., /intl-id/track/xxx)
      let startIndex = 0;
      if (pathParts[0]?.startsWith('intl-')) {
        startIndex = 1;
      }
      
      if (pathParts.length >= startIndex + 2) {
        const contentType = pathParts[startIndex];
        const contentId = pathParts[startIndex + 1].split('?')[0];
        
        if (['track', 'album', 'playlist'].includes(contentType) && contentId) {
          return { 
            id: contentId, 
            type: contentType as 'track' | 'album' | 'playlist',
            isValid: true 
          };
        }
      }
    }
    
    return { id: null, type: null, isValid: false };
  } catch {
    return { id: null, type: null, isValid: false };
  }
}

/**
 * Auto-detect song type from URL and parse it
 */
export function parseSongUrl(url: string): ParsedSong {
  if (!url || url.trim() === '') {
    return {
      type: null,
      id: '',
      embedUrl: '',
      originalUrl: url,
      isValid: false,
    };
  }

  const trimmedUrl = url.trim();

  // Check if it's YouTube
  if (trimmedUrl.includes('youtube.com') || trimmedUrl.includes('youtu.be') || trimmedUrl.includes('music.youtube.com')) {
    const parsed = parseYouTubeUrl(trimmedUrl);
    
    if (parsed.isValid && parsed.id) {
      return {
        type: 'youtube',
        id: parsed.id,
        embedUrl: `https://www.youtube.com/embed/${parsed.id}`,
        originalUrl: trimmedUrl,
        isValid: true,
      };
    }
  }

  // Check if it's Spotify (including spotify.link short URLs)
  if (trimmedUrl.includes('spotify.com') || trimmedUrl.includes('spotify.link')) {
    const parsed = parseSpotifyUrl(trimmedUrl);
    
    if (parsed.isValid && parsed.id && parsed.type) {
      return {
        type: 'spotify',
        id: parsed.id,
        embedUrl: `https://open.spotify.com/embed/${parsed.type}/${parsed.id}`,
        originalUrl: trimmedUrl,
        isValid: true,
      };
    }
  }

  // URL not recognized
  return {
    type: null,
    id: '',
    embedUrl: '',
    originalUrl: trimmedUrl,
    isValid: false,
  };
}

/**
 * Validate if a song URL is valid
 */
export function isValidSongUrl(url: string): boolean {
  const parsed = parseSongUrl(url);
  return parsed.isValid;
}

/**
 * Get embed URL from original URL
 */
export function getEmbedUrl(url: string): string | null {
  const parsed = parseSongUrl(url);
  return parsed.isValid ? parsed.embedUrl : null;
}

/**
 * Get song type from URL
 */
export function getSongType(url: string): SongType {
  const parsed = parseSongUrl(url);
  return parsed.type;
}