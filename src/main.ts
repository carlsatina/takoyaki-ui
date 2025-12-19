import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

import "css-ripple-effect/dist/ripple.min.css"

import mdiVue from 'mdi-vue/v3'
import * as mdijs from '@mdi/js'

const app = createApp(App)
    .use(mdiVue, {icons: mdijs})
    .use(router)
    .mount('#app')
