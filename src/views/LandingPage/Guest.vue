<template>
    <GuestWeb v-if="!platformIsMobile"/>
    <GuestMobile v-else/>
</template>


<script>
import { ref, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import store from '@/store'
import GuestWeb from '@/views/web/Account/Guest.vue'
import GuestMobile from '@/views/mobile/Account/Guest.vue'
import isPlatformMobile from '@/composables/platform'

export default {
    name: "Login",
    components: {
        GuestWeb,
        GuestMobile
    },
    setup () {
        const route = useRoute()
        const router = useRouter()
        provide('store', store)
        const platformIsMobile = ref(false);

        isPlatformMobile()
        .then((data) => {
            platformIsMobile.value = data
        })

        document.querySelector('body').style.height = '60%'
        return {
            store,
            route,
            router,
            platformIsMobile
        }
    }
}
</script>

<style>
#app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    height: 88vh;
    overflow: scroll;
}


</style>
