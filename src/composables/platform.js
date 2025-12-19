import { Device } from '@capacitor/device'

export const getPlatformFlags = async () => {
  const hasWindow = typeof window !== 'undefined'
  const isLandscape =
    hasWindow &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(orientation: landscape)').matches

  let isMobile = false
  if (hasWindow && window.innerWidth < 768) {
    isMobile = true
  } else {
    try {
      const info = await Device.getInfo()
      const platform = (info.platform || '').toLowerCase()
      if (platform === 'ios' || platform === 'android') {
        isMobile = true
      }
    } catch (err) {
      // ignore and fall back to window check
    }
  }

  return {
    isMobile,
    isMobileLandscape: isMobile && isLandscape
  }
}

const isPlatformMobile = async () => {
  const { isMobile, isMobileLandscape } = await getPlatformFlags()
  // Treat landscape on mobile as "not mobile" so views can fall back to web layouts.
  return isMobile && !isMobileLandscape
}

export default isPlatformMobile
