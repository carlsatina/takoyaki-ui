<template>
  <div class="center-screen">
    <div class="content">
        <div class="d-flex flex-column">
            <span>Access restricted: Your account has not yet been approved.</span>
            <button type="button" class="btn btn-danger mt-2" @click="handleLogout">Logout</button>
        </div>
    </div>
  </div>
</template>

<style scoped>
.center-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Full screen height */
}

.content {
  padding: 20px;
  background: #f0f0f0;
  border-radius: 8px;
}
</style>


<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Loading from '@/components/Loading.vue'

import store from '@/store'
export default {
    name: "GuestWeb",
    components: {
        Loading,
    },
    setup() {
        const router = useRouter()

        const handleLogout = () => {
            store.methods.logoutUser()
            router.push('/login')
        }
        return {
            router,
            handleLogout
        }
    }
}
</script>