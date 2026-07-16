// Converts a normal video/reel link into a usable form per platform.
// YouTube gets a ready embed iframe URL. Instagram gets its canonical
// permalink — VideoModal tries Instagram's official embed script first
// (auto-sizes to real content) and only falls back to a manual /embed
// iframe if that script fails to load (e.g. blocked by an ad-blocker).
export function getEmbed(url) {
  if (!url) return ''

  if (url.includes('youtube.com/embed/')) {
    return url.includes('?') ? url + '&autoplay=1' : url + '?autoplay=1'
  }

  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`

  const ig = url.match(/instagram\.com\/(reel|p|tv)\/([a-zA-Z0-9_-]+)/)
  if (ig) return `https://www.instagram.com/${ig[1]}/${ig[2]}/`

  return url
}

// Builds the fallback /embed iframe URL from a canonical Instagram permalink.
// Only used when the official embed script fails to load.
export function getInstagramEmbedFallback(url) {
  if (url.includes('/embed')) return url
  return url.replace(/\/?(\?.*)?$/, '/embed')
}

// Instagram embeds render tall/vertical (reel aspect ratio) — VideoModal can
// use this to pick a sensible iframe aspect ratio per platform.
export function getEmbedPlatform(url) {
  if (!url) return 'unknown'
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube'
  if (/instagram\.com/.test(url)) return 'instagram'
  return 'unknown'
}