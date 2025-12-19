<template>
<nav class="navbar sticky-top navbar-expand-lg" style="background-color: #17a589; height: 40px;">
    <div class="container-fluid" v-if="platformIsMobile">
        <div class="d-flex flex-row justify-content-start align-items-center">
            <img src="@/assets/takoyaki-circle.png" width="30" style="border-radius: 50%;">
            <div class="d-flex flex-column justify-content-start align-items-start ms-3 text-light">
                <div>
                    <span class="fw-bold" v-if="user && user.userInfo">{{user.userInfo.full_name}}</span>
                </div>
            </div>
        </div>
        <div class="app-version text-light me-3" style="font-size: 12px;">version {{packageVersion}}</div>
    </div>

    <!-- Platform is web here -->
    <div class="container-fluid" v-else>
        <div class="d-flex flex-row justify-content-start align-items-center">
            <img src="@/assets/takoyaki-circle.png" width="60" style="border-radius: 50%;">
            <div class="d-flex flex-column justify-content-start align-items-center ms-3 text-light">
                <div>
                    <span class="fw-bold" v-if="user && user.userInfo">{{user.userInfo.full_name}}</span>
                </div>
            </div>
        </div>
        <div class="app-version text-light me-3" style="font-size: 12px;">version {{ packageVersion }}</div>
    </div>
</nav>
</template>

<script>
import { ref, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import store from '@/store'
import getProfile from '@/composables/getProfile'
import { googleLogout } from 'vue3-google-login'
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Device } from '@capacitor/device'
import pkg from '../../../package.json'
import isPlatformMobile from '@/composables/platform'

export default {
    name: "AccountTop",
    setup () {
        const router = useRouter()
        const route = useRoute()
        const userToken = localStorage.getItem('token')
        const user = ref({})
        const packageVersion = ref(pkg.version)
        const platformIsMobile = ref(false);

        if (userToken) {
            store.methods.loginUser(userToken)
            getProfile(userToken)
            .then((data) => {
                if (data.error.value === null) {
                    store.methods.setUserAdmin(data.response.value.userInfo.is_admin)
                    user.value = data.response.value
                }
            })
        }
        provide('store', store)

        const logout = async () => {
            store.methods.logoutUser()
            // FB.logout(function(reponse) {
            //     console.log("FB Logout")
            // })
            // googleLogout()
            const device = await Device.getInfo()
            if (device.platform === 'android') {
                GoogleAuth.signOut()
            }
            router.push('/')
        }

        isPlatformMobile()
        .then((data) => {
            platformIsMobile.value = data
        })

        return {
            route,
            router,
            store,
            logout,
            platformIsMobile,
            user,
            packageVersion
        }
    }
}

</script>

<style scoped>
.signout:hover {
    background-color: #c8dbbe;
    border-radius: 5px;
}

.signout {
    color: white;
    font-weight: bold;
}
.app-version {
    position: absolute;
    top: 0;
    right:0;
}
</style>