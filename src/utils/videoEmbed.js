// Converts a normal video/reel link into an embeddable iframe URL.
// Supports YouTube (watch/shorts/youtu.be) and Instagram (reel/post/tv).
//
// Note on Instagram: their "official" embed.js script (which auto-sizes to
// real content) was tried and abandoned. When it's blocked by an ad-blocker
// or X-Frame-Options, the failure is invisible to JavaScript — the <iframe>
// tag still exists in the DOM, it just silently refuses to render content,
// so there's no reliable way to detect the failure and fall back. This
// simpler /embed iframe is less perfectly sized but actually, reliably works.
export function getEmbed(url) {
  if (!url) return ''

  if (url.includes('/embed/') || url.includes('/embed')) {
    return url.includes('?') ? url + '&autoplay=1' : url + '?autoplay=1'
  }

  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`

  const ig = url.match(/instagram\.com\/(reel|p|tv)\/([a-zA-Z0-9_-]+)/)
  if (ig) return `https://www.instagram.com/${ig[1]}/${ig[2]}/embed`

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

// Resolves the playable video(s) for a product into a consistent shape:
// [{ platform: 'youtube'|'instagram', embedUrl, rawUrl }, ...]
//
// Prefers the new video_link_youtube / video_link_instagram fields (a
// product can have both, shown as two separate buttons). Falls back to the
// old single `video_link` field for products added before this feature
// existed — those keep working exactly as before, just as a single button
// with the platform auto-detected from the URL.
export function getProductVideos(product) {
  const videos = []
  if (product.video_link_youtube) {
    videos.push({ platform: 'youtube', embedUrl: getEmbed(product.video_link_youtube), rawUrl: product.video_link_youtube })
  }
  if (product.video_link_instagram) {
    videos.push({ platform: 'instagram', embedUrl: getEmbed(product.video_link_instagram), rawUrl: product.video_link_instagram })
  }
  if (videos.length === 0 && product.video_link) {
    videos.push({ platform: getEmbedPlatform(product.video_link), embedUrl: getEmbed(product.video_link), rawUrl: product.video_link })
  }
  return videos
}
