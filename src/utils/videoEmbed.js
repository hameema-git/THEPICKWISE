// Converts a normal video/reel link into a form each platform's embed
// method needs. YouTube gets a ready-to-use iframe URL. Instagram gets
// its canonical permalink — Instagram's official embed script (loaded in
// VideoModal) takes the plain URL and builds its own properly-sized embed,
// which avoids the black-bar letterboxing a raw /embed iframe produces.
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

// Instagram embeds render tall/vertical (reel aspect ratio) — VideoModal can
// use this to pick a sensible iframe aspect ratio per platform.
export function getEmbedPlatform(url) {
  if (!url) return 'unknown'
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube'
  if (/instagram\.com/.test(url)) return 'instagram'
  return 'unknown'
}