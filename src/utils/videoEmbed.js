// Converts a normal video/reel link into an embeddable iframe URL.
// Supports YouTube (watch/shorts/youtu.be) and Instagram (reel/post/tv).
// Anything else is returned as-is (won't embed, but won't crash either).
export function getEmbed(url) {
  if (!url) return ''

  // Already an embed URL (either platform) — just ensure autoplay where relevant.
  if (url.includes('youtube.com/embed/')) {
    return url.includes('?') ? url + '&autoplay=1' : url + '?autoplay=1'
  }
  if (/instagram\.com\/(reel|p|tv)\/[a-zA-Z0-9_-]+\/embed/.test(url)) {
    return url
  }

  // YouTube — watch / shorts / youtu.be
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`

  // Instagram — reel / post / tv. Instagram blocks plain URLs in an iframe;
  // the /embed suffix is their supported basic-embed endpoint (no login,
  // no JS widget needed, just an iframe).
  const ig = url.match(/instagram\.com\/(reel|p|tv)\/([a-zA-Z0-9_-]+)/)
  if (ig) return `https://www.instagram.com/${ig[1]}/${ig[2]}/embed`

  // Unknown platform — return as-is rather than throwing; VideoModal will
  // just show whatever loads (or doesn't) rather than crashing the page.
  return url
}

// Instagram embeds render tall/vertical (reel aspect ratio) — VideoModal can
// use this to pick a sensible iframe aspect ratio per platform.
export function getEmbedPlatform(url) {
  if (!url) return 'unknown'
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube'
  if (/instagram\.com/.test(url)) return 'instagram'
  return 'unknown'
}