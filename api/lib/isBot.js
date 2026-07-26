// Known crawlers and link-preview bots that DON'T execute JavaScript, so
// they need server-rendered meta tags instead of the client-rendered SPA.
// This list intentionally mirrors the pattern used in vercel.json's rewrite
// condition — kept here too so this module is independently testable and
// usable even if something hits this function directly (not just via the
// vercel.json-routed path).
const BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /facebookexternalhit/i,
  /facebot/i,
  /twitterbot/i,
  /linkedinbot/i,
  /whatsapp/i,
  /telegrambot/i,
  /slackbot/i,
  /discordbot/i,
  /applebot/i,
  /pinterest/i,
  /redditbot/i,
  /skypeuripreview/i,
]

export function isBot(userAgent) {
  if (!userAgent) return false
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent))
}
