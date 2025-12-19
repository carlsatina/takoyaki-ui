<template>
    <Transition name="slide" appear>
    <div class="card border-0 home-container" @scroll="onScroll">
        <div class="card-body home-inner">
            <div class="row">
                <div class="col-md-2"></div>
                <div class="col-md-8  d-flex flex-row justify-content-between align-items-center">
                    <div class="d-flex flex-row justify-content-start align-items-center">
                        <mdicon name="arrow-left" @click="router.go(-1)" size="30"/>
                        <span class="ms-3 fw-bold">Account</span>
                    </div>
                </div>
                <div class="col-md-2"></div>
            </div>
            <hr>
            <div class="row p-1" v-if="user" style="font-size: 13px;">
                <div class="col-md-12 d-flex flex-column lh-1" style="color: lightslategray">
                    <span>{{user.full_name}}</span>
                    <span>Full name</span>
                </div>
            </div>
            <div class="row p-1 mt-2" v-if="user && user.email" style="font-size: 13px;">
                <div class="col-md-12 d-flex flex-column lh-1" style="color: lightslategray">
                    <span>{{ maskEmail(user.email) }}</span>
                    <span>Email</span>
                </div>
            </div>
            <div class="row mt-4 p-1">
                <div class="col-md-12 d-flex flex-row text-danger align-items-center p-2" style="color: lightslategray; cursor: pointer;" @click="logout">
                    <mdicon name="logout" size="30" />
                    <span class="ms-3">Logout</span>
                </div>
            </div>
        </div>
        <Loading v-if="loading"/>
    </div>
    </Transition>
</template>

<script>
import { ref, provide, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import store from '@/store'
import Loading from '@/components/Loading.vue'
import getProfile from '@/composables/getProfile'

export default {
    name: "AccountDetailsMobile",
    components: {
        Loading
    },
    setup() {
        const userToken = localStorage.getItem('token')
        const user = ref(null)
        const loading = ref(false)
        const router = useRouter()

        provide('store', store)

        onBeforeMount(async() => {
            loading.value = true
            const { response, error } = await getProfile(userToken)
            loading.value = false
            if (error.value === null) {
                user.value = response.value.userInfo
                console.log("profile: ", user.value)
            }
        })

        const logout = () => {
            store.methods.logoutUser()
            router.push('/login')
        }

        // Do not show the email address, mask with * on some characters.
        const maskEmail = (email) => {
            const i = email.indexOf('@')
            const startIndex = i * .2 | 0
            const endIndex = i * .9 | 0
            return email.slice(0, startIndex) + email.slice(startIndex, endIndex).replace(/./g, '*') + email.slice(endIndex)
        }
        return {
            user,
            loading,
            store,
            router,
            logout,
            maskEmail
        }
    }
}
</script>

<style scoped>

.slide-enter-active,
.slide-leave-active {
    transition: all 0.6s ease;
}

.slide-enter-from,
.slide-leave-to {
    opacity: 0;
    transform: translateX(60px);
}
</style>
