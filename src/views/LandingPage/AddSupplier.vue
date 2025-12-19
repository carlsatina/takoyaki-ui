<template>
    <AddSupplierWeb v-if="!platformIsMobile"/>
    <AddSupplierMobile v-else/>
</template>


<script>
import { ref, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import store from '@/store'
import AddSupplierWeb from '@/views/web/Supplier/AddSupplier.vue'
import AddSupplierMobile from '@/views/mobile/Supplier/AddSupplier.vue'
import isPlatformMobile from '@/composables/platform'

export default {
    name: "AddPurchase",
    components: {
        AddSupplierWeb,
        AddSupplierMobile
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
