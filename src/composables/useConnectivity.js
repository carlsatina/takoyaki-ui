import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export function useConnectivity() {
  const isOnline = ref(navigator.onLine)
  const router = useRouter()

  const checkConnection = () => {
    isOnline.value = navigator.onLine
    
    if (!isOnline.value) {
      // Redirect to no-connection page
      router.push('/no-connection')
    }
    
    return isOnline.value
  }

  const handleOnline = () => {
    isOnline.value = true
    console.log('Connection restored')
  }

  const handleOffline = () => {
    isOnline.value = false
    console.log('Connection lost')
    router.push('/no-connection')
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Initial check
    checkConnection()
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return {
    isOnline,
    checkConnection
  }
}
