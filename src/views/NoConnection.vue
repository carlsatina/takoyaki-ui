<template>
  <div class="no-connection-container">
    <div class="content-wrapper">
      <!-- Offline State -->
      <div v-if="!isOnline" class="status-card offline">
        <div class="icon-wrapper offline-icon">
          <mdicon name="wifi-off" :size="80"/>
        </div>
        <h2 class="status-title">No Internet Connection</h2>
        <p class="status-message">
          Please check your internet connection and try again.
        </p>
        <button class="retry-btn" @click="checkConnection">
          <mdicon name="refresh" :size="20" class="me-2"/>
          Try Again
        </button>
      </div>

      <!-- Online State with Pull to Refresh -->
      <div v-else class="status-card online">
        <div class="icon-wrapper online-icon">
          <mdicon name="wifi-check" :size="80"/>
        </div>
        <h2 class="status-title">Connected</h2>
        <p class="status-message">
          You are connected to the internet.
        </p>
        <div class="pull-hint">
          <mdicon name="gesture-swipe-down" :size="24" class="me-2"/>
          Pull down to refresh
        </div>
      </div>

      <!-- Connection Status Indicator -->
      <div class="connection-indicator" :class="{ online: isOnline, offline: !isOnline }">
        <div class="indicator-dot"></div>
        <span class="indicator-text">{{ isOnline ? 'Online' : 'Offline' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isOnline = ref(navigator.onLine)
const isChecking = ref(false)

// Check connection status
const checkConnection = async () => {
  isChecking.value = true
  
  try {
    // Try to fetch a small resource to verify actual connectivity with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    
    await fetch('https://www.google.com/favicon.ico', {
      mode: 'no-cors',
      cache: 'no-cache',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    isOnline.value = true
    
    // If online, redirect to appropriate dashboard
    if (isOnline.value) {
      redirectToDashboard()
    }
  } catch (error) {
    isOnline.value = false
  } finally {
    isChecking.value = false
  }
}

// Redirect to appropriate dashboard based on user role
const redirectToDashboard = () => {
  const userRole = localStorage.getItem('role')
  
  if (userRole === 'admin') {
    router.push('/home')
  } else if (userRole === 'staff') {
    router.push('/sales')
  } else {
    // Default to home if no role is set
    router.push('/home')
  }
}

// Handle online/offline events
const handleOnline = () => {
  isOnline.value = true
  checkConnection()
}

const handleOffline = () => {
  isOnline.value = false
}

onMounted(() => {
  // Add event listeners for online/offline
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  // Initial connection check
  checkConnection()
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
</script>

<style scoped>
.no-connection-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
}

.content-wrapper {
  width: 100%;
  max-width: 500px;
  position: relative;
}

.status-card {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.icon-wrapper {
  width: 120px;
  height: 120px;
  margin: 0 auto 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.offline-icon {
  background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
  color: white;
}

.online-icon {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.status-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 15px;
}

.status-message {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 30px;
}

.retry-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.retry-btn:active {
  transform: translateY(0);
}

.pull-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
  margin-top: 20px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(5px);
  }
}

.connection-indicator {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  padding: 10px 20px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  font-weight: 600;
  z-index: 1000;
}

.indicator-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: blink 2s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.connection-indicator.online .indicator-dot {
  background: #28a745;
}

.connection-indicator.offline .indicator-dot {
  background: #dc3545;
}

.connection-indicator.online .indicator-text {
  color: #28a745;
}

.connection-indicator.offline .indicator-text {
  color: #dc3545;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .status-card {
    padding: 30px 20px;
  }

  .status-title {
    font-size: 24px;
  }

  .status-message {
    font-size: 14px;
  }

  .icon-wrapper {
    width: 100px;
    height: 100px;
  }

  .connection-indicator {
    top: 10px;
    right: 10px;
    padding: 8px 16px;
    font-size: 12px;
  }
}
</style>
