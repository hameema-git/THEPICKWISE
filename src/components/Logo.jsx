export default function Logo({ variant = 'dark', height = 40 }) {
  const textColor  = variant === 'dark' ? '#ffffff' : '#1a1a2e'
  const subColor   = variant === 'dark' ? '#6c6c8a' : '#94a3b8'

  return (
    <svg height={height} viewBox="0 0 340 80" xmlns="http://www.w3.org/2000/svg" aria-label="thePickWise logo">
      {/* P box */}
      <rect x="2" y="8" width="64" height="64" rx="14" fill="#e63946"/>
      <text x="34" y="52" textAnchor="middle" fontFamily="Arial Black, sans-serif"
        fontSize="36" fill="#ffffff" fontWeight="900">P</text>
      <polygon points="34,60 42,49 50,60" fill="#f4a261"/>
      {/* Wordmark */}
      <text x="78" y="46" fontFamily="Arial Black, sans-serif" fontSize="28"
        fill={textColor} fontWeight="900">the</text>
      <text x="122" y="46" fontFamily="Arial Black, sans-serif" fontSize="28"
        fill="#e63946" fontWeight="900">Pick</text>
      <text x="193" y="46" fontFamily="Arial Black, sans-serif" fontSize="28"
        fill="#f4a261" fontWeight="900">Wise</text>
      {/* Tagline */}
      <text x="78" y="64" fontFamily="Arial, sans-serif" fontSize="9.5"
        fill={subColor} fontWeight="600" letterSpacing="1.8">TESTED BY ME · TRUSTED FOR YOU</text>
    </svg>
  )
}
