<template>
    <!-- <TopNav/> -->
    <router-view/>
    <BottomNav v-if="store.state.isUserLoggedIn" />
    <!-- <BottomNav /> -->
</template>


<script>
import { ref, provide, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import store from '@/store'
import BottomNav from '@/components/Navigation/BottomNav.vue'
import TopNav from '@/components/Navigation/TopNav.vue'
import { Device } from '@capacitor/device'

export default {
    name: "App",
    components: {
        BottomNav,
        TopNav
    },
    setup () {
        const route = useRoute()
        const router = useRouter()
        provide('store', store)

        const userToken = localStorage.getItem('token')
        const isMobile = ref(false)

        if (userToken) {
            store.methods.loginUser(userToken)
        }

        // Check if running on mobile device
        const checkPlatform = async () => {
            try {
                const info = await Device.getInfo()
                isMobile.value = info.platform === 'android' || info.platform === 'ios'
            } catch (error) {
                isMobile.value = false
            }
        }

        // Check internet connection (works for both web and mobile)
        const checkConnection = async () => {
            try {
                // Try to fetch a small resource with timeout
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 3000)
                
                await fetch('https://www.google.com/favicon.ico', {
                    mode: 'no-cors',
                    cache: 'no-cache',
                    signal: controller.signal
                })
                
                clearTimeout(timeoutId)
                return true
            } catch (error) {
                return false
            }
        }

        // Handle offline state
        const handleOffline = async () => {
            console.log('Connection lost - redirecting to no-connection page')
            if (router.currentRoute.value.path !== '/no-connection') {
                router.push('/no-connection')
            }
        }

        // Handle online state
        const handleOnline = async () => {
            console.log('Connection restored')
            
            // Verify connection with actual request
            const isConnected = await checkConnection()
            
            if (isConnected && router.currentRoute.value.path === '/no-connection') {
                // Redirect back to appropriate dashboard
                const userRole = localStorage.getItem('role')
                if (userRole === 'admin') {
                    router.push('/admin')
                } else {
                    router.push('/')
                }
            }
        }

        // Periodic connection check for mobile (since events may not fire reliably)
        let connectionCheckInterval = null

        const startConnectionMonitoring = () => {
            if (isMobile.value) {
                // Check connection every 3 seconds on mobile
                connectionCheckInterval = setInterval(async () => {
                    const isConnected = await checkConnection()
                    const currentPath = router.currentRoute.value.path
                    
                    if (!isConnected && currentPath !== '/no-connection') {
                        handleOffline()
                    } else if (isConnected && currentPath === '/no-connection') {
                        handleOnline()
                    }
                }, 3000)
            }
        }

        onMounted(async () => {
            await checkPlatform()
            
            // Add event listeners for connection changes (works on web)
            window.addEventListener('online', handleOnline)
            window.addEventListener('offline', handleOffline)

            // Initial check on mount
            const isConnected = await checkConnection()
            if (!isConnected && router.currentRoute.value.path !== '/no-connection') {
                router.push('/no-connection')
            }

            // Start periodic monitoring for mobile
            startConnectionMonitoring()
        })

        onUnmounted(() => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
            
            if (connectionCheckInterval) {
                clearInterval(connectionCheckInterval)
            }
        })

        document.querySelector('body').style.height = '60%'
        return {
            store,
            route,
            router
        }
    }
}
</script>

<style>
@font-face {
    /* font-family: "Montserrat";
    src: local("Montserrat"),
        url(@/assets/fonts/Montserrat/Montserrat-VariableFont_wght.ttf) format("truetype"); */
}
/* html, body {
    font-family: "Montserrat", "Poppins";
} */
#app {
    /* font-family: Montserrat, Avenir, Helvetica, Arial, sans-serif; */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    height: 88vh;
    overflow: scroll;
}


</style>
