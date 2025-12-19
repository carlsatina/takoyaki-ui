<template>
  <div class="card border-0 home-container">
    <div class="card-body home-inner">
      <div class="d-flex align-items-center mb-3">
        <mdicon name="arrow-left" size="26" class="me-2" role="button" @click="router.back()" />
        <h5 class="mb-0 fw-bold">Sales Goals</h5>
      </div>

      <div class="row">
        <div class="col-md-6">
          <label class="form-label">Daily Sales Goal</label>
          <input type="number" class="form-control" v-model.number="form.daily_sales_goal" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Monthly Sales Goal</label>
          <input type="number" class="form-control" v-model.number="form.monthly_sales_goal" />
        </div>
      </div>

      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-success" @click="saveSettings" :disabled="saving">Save</button>
        <button class="btn btn-outline-secondary" @click="reload" :disabled="saving">Reload</button>
        <button class="btn btn-outline-danger ms-auto" v-if="currentId" @click="remove" :disabled="saving">Delete</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onBeforeMount, provide } from 'vue'
import { useRouter } from 'vue-router'
import store from '@/store'
import getSettings from '@/composables/settings/getSettings'
import addSettings from '@/composables/settings/addSettings'
import updateSettings from '@/composables/settings/updateSettings'
import deleteSettings from '@/composables/settings/deleteSettings'

export default {
  name: 'SalesSettingsWeb',
  setup() {
    const router = useRouter()
    provide('store', store)
    const form = ref({
      daily_sales_goal: 0,
      monthly_sales_goal: 0
    })
    const currentId = ref(null)
    const saving = ref(false)

    const load = async () => {
      const token = localStorage.getItem('token')
      const { response, error } = await getSettings(token)
      if (error.value === null && Array.isArray(response.value) && response.value.length > 0) {
        const first = response.value[0]
        currentId.value = first.id
        form.value.daily_sales_goal = first.daily_sales_goal || 0
        form.value.monthly_sales_goal = first.monthly_sales_goal || 0
      }
    }

    const saveSettings = async () => {
      saving.value = true
      const token = localStorage.getItem('token')
      if (currentId.value) {
        await updateSettings(currentId.value, form.value, token)
      } else {
        const { response, error } = await addSettings(form.value, token)
        if (error.value === null && response.value?.id) {
          currentId.value = response.value.id
        }
      }
      saving.value = false
    }

    const reload = async () => {
      await load()
    }

    const remove = async () => {
      if (!currentId.value) return
      const token = localStorage.getItem('token')
      await deleteSettings(currentId.value, token)
      currentId.value = null
      form.value = {
        daily_sales_goal: 0,
        monthly_sales_goal: 0
      }
    }

    onBeforeMount(load)

    return {
      router,
      form,
      saving,
      currentId,
      saveSettings,
      reload,
      remove
    }
  }
}
</script>

<style scoped>
.home-container {
  height: auto;
}
</style>
