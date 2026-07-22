// Converts a normal video/reel link into a usable form per platform.
// Supports YouTube and Instagram.

export function getEmbed(url) {
  if (!url) return ''

  if (url.includes('/embed')) {
    return url.includes('?')
      ? url + '&autoplay=1'
      : url + '?autoplay=1'
  }

  const yt = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/
  )

  if (yt) {
    return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`
  }

  const ig = url.match(
    /instagram\.com\/(reel|p|tv)\/([a-zA-Z0-9_-]+)/
  )

  if (ig) {
    return `https://www.instagram.com/${ig[1]}/${ig[2]}/embed`
  }

  return url
}

// Instagram fallback
export function getInstagramEmbedFallback(url) {
  if (!url) return ''
  if (url.includes('/embed')) return url
  return url.replace(/\/?(\?.*)?$/, '/embed')
}

export function getEmbedPlatform(url) {
  if (!url) return 'unknown'
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube'
  if (/instagram\.com/.test(url)) return 'instagram'
  return 'unknown'
}

// Supports both new fields and old field
export function getProductVideos(product) {
  const videos = []

  if (product.video_link_youtube) {
    videos.push({
      platform: 'youtube',
      embedUrl: getEmbed(product.video_link_youtube),
      rawUrl: product.video_link_youtube,
    })
  }

  if (product.video_link_instagram) {
    videos.push({
      platform: 'instagram',
      embedUrl: getEmbed(product.video_link_instagram),
      rawUrl: product.video_link_instagram,
    })
  }

  if (videos.length === 0 && product.video_link) {
    videos.push({
      platform: getEmbedPlatform(product.video_link),
      embedUrl: getEmbed(product.video_link),
      rawUrl: product.video_link,
    })
  }

  return videos
}