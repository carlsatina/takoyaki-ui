<template>
    <AddPackagingWeb v-if="!platformIsMobile"/>
    <AddPackagingMobile v-else/>
</template>


<script>
import { ref, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import store from '@/store'
import AddPackagingWeb from '@/views/web/Packaging/AddPackaging.vue'
import AddPackagingMobile from '@/views/mobile/Packaging/AddPackaging.vue'
import isPlatformMobile from '@/composables/platform'

export default {
    name: "AddPackaging",
    components: {
        AddPackagingWeb,
        AddPackagingMobile
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
