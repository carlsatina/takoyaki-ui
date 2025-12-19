import { ref, onMounted, onUnmounted } from 'vue'

export function usePullToRefresh(onRefresh) {
  const isRefreshing = ref(false)
  const startY = ref(0)
  const currentY = ref(0)
  const pullDistance = ref(0)
  const threshold = 80 // Minimum pull distance to trigger refresh

  let touchStartY = 0
  let touchCurrentY = 0

  const handleTouchStart = (e) => {
    // Only start tracking if at the top of the page
    if (window.scrollY === 0) {
      touchStartY = e.touches[0].clientY
      startY.value = touchStartY
    }
  }

  const handleTouchMove = (e) => {
    if (!startY.value || isRefreshing.value) return

    touchCurrentY = e.touches[0].clientY
    const diff = touchCurrentY - touchStartY

    // Only track downward pulls when at top
    if (diff > 0 && window.scrollY === 0) {
      pullDistance.value = Math.min(diff, threshold * 2)
      currentY.value = touchCurrentY

      // Prevent default scroll behavior during pull
      if (pullDistance.value > 10) {
        e.preventDefault()
      }
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance.value >= threshold && !isRefreshing.value) {
      isRefreshing.value = true
      
      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh failed:', error)
      } finally {
        setTimeout(() => {
          isRefreshing.value = false
          resetPull()
        }, 500)
      }
    } else {
      resetPull()
    }
  }

  const resetPull = () => {
    startY.value = 0
    currentY.value = 0
    pullDistance.value = 0
    touchStartY = 0
    touchCurrentY = 0
  }

  onMounted(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    document.removeEventListener('touchstart', handleTouchStart)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  })

  return {
    isRefreshing,
    pullDistance,
    threshold
  }
}
