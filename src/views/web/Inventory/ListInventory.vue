<template>
    <AccountTop />
    <div class="card border-0 home-container">
        <!-- New UI starts here -->
        <div class="card-body home-inner">

            <div class="card-title">
                <div class="d-flex align-items-center mb-2">
                    <button class="btn btn-outline-secondary btn-sm me-3" @click="router.back()" style="display: flex; align-items: center;">
                        <mdicon name="arrow-left" size="20"/>
                    </button>
                    <h4 class="mb-0 fw-bold">Inventory Lists</h4>
                </div>
                <div class="row p-1">
                    <hr>
                    <div class="col-md-1"></div>
                    <div class="col-md-10">
                        
                        <div class="mb-3 d-flex justify-content-center align-items-center gap-3 flex-wrap">
                            <button class="nav-pill shadow-sm" @click="prevPeriod">
                                <mdicon name="chevron-left" size="18"/>
                            </button>
                            <button class="date-pill shadow-sm" @click="showDateModal = true">
                                <mdicon name="calendar" size="18" class="me-2"/>
                                <span class="fw-semibold">{{ formattedRange }}</span>
                            </button>
                            <button class="nav-pill shadow-sm" @click="nextPeriod">
                                <mdicon name="chevron-right" size="18"/>
                            </button>
                        </div>
                        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                            <div class="d-flex align-items-center gap-2">
                                <label class="form-label mb-0 small text-muted">Show</label>
                                <select class="form-select form-select-sm" style="width: 90px" v-model.number="itemsPerPage">
                                    <option :value="5">5</option>
                                    <option :value="10">10</option>
                                    <option :value="25">25</option>
                                    <option :value="50">50</option>
                                </select>
                            </div>
                            <div class="ms-auto" style="min-width: 200px;">
                                <input type="search" class="form-control form-control-sm" placeholder="Search inventory..." v-model="searchTerm">
                            </div>
                        </div>
                        <table class="table tight-table">
                            <thead class="thead-dark">
                                <tr>
                                    <th style="width: 50%;">Inventory Item</th>
                                    <th class="text-center">Unit</th>
                                    <th class="text-center">Current Stock</th>
                                    <th class="text-center">Stock (used)</th>
                                </tr>
                            </thead>
                            <tbody >
                                <tr v-for="item in paginatedData" :key="item.id" @click="openEdit(item)" style="cursor:pointer;">

                                    <td>{{item.name}}</td>
                                    <td class="text-center">{{item.unit || '-'}}</td>
                                    <td class="text-center">{{formatNumber(item.current_stock)}}</td>
                                    <td class="text-center">{{formatNumber(item.used_quantity)}}</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <!-- pagination part -->
                        <Pagination
                            :currentPage="currentPage"
                            :itemsPerPage="itemsPerPage"
                            :numberOfEntries="filteredList.length"
                            :totalPages="totalPages"
                            @update-page="currentPage = $event"
                        />
                    </div>
                    <div class="col-md-1"></div>
                </div>
            </div>
        </div>
        <!-- New UI ends here -->

        <!-- Loading Modal -->
        <Loading v-if="loading"/>
    </div>

    <div v-if="editItem" class="modal-overlay" @click="closeEdit">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h5 class="modal-title">Update Stock</h5>
                <button type="button" class="btn-close" @click="closeEdit"></button>
            </div>
            <div class="modal-body">
                <div class="mb-2"><strong>{{ editItem.name }}</strong></div>
                <label class="form-label">Current Stock ({{ editItem.unit || '-' }})</label>
                <input type="number" class="form-control" v-model.number="editStock" step="0.001" />
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" @click="closeEdit">Cancel</button>&nbsp;
                <button class="btn btn-primary" @click="saveStock" :disabled="loading">Save</button>
            </div>
        </div>
    </div>

    <!-- <div v-else>
        loading...
    </div> -->

    <!-- Date Range Modal -->
    <div v-if="showDateModal" class="modal-overlay" @click="showDateModal = false">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h5 class="modal-title">Select Date Range</h5>
                <button type="button" class="btn-close" @click="showDateModal = false"></button>
            </div>
        <div class="modal-body">
                <div class="date-option-buttons">
                    <button
                        class="btn btn-outline-success w-100 mb-3"
                        :class="{ 'active': isTodaySelected }"
                        @click="selectToday">
                        <mdicon name="calendar-check" size="20" class="me-2"/>
                        Today
                    </button>
                    <button
                        class="btn btn-outline-primary w-100 mb-2"
                        :class="{ 'active': viewMode === 'daily' }"
                        @click="selectViewMode('daily')">
                        <mdicon name="calendar-today" size="20" class="me-2"/>
                        Daily
                    </button>
                    <button
                        class="btn btn-outline-primary w-100 mb-2"
                        :class="{ 'active': viewMode === 'weekly' }"
                        @click="selectViewMode('weekly')">
                        <mdicon name="calendar-week" size="20" class="me-2"/>
                        Weekly
                    </button>
                    <button
                        class="btn btn-outline-primary w-100 mb-2"
                        :class="{ 'active': viewMode === 'monthly' }"
                        @click="selectViewMode('monthly')">
                        <mdicon name="calendar-month" size="20" class="me-2"/>
                        Monthly
                    </button>
                    <div class="custom-range mt-3">
                        <div class="d-flex gap-2 mb-2">
                            <input type="date" class="form-control form-control-sm" v-model="customStart" />
                            <input type="date" class="form-control form-control-sm" v-model="customEnd" />
                        </div>
                        <button
                            class="btn btn-outline-secondary w-100"
                            :class="{ 'active': viewMode === 'custom' }"
                            @click="applyCustomRange">
                            <mdicon name="calendar" size="20" class="me-2"/>
                            Custom Range
                        </button>
                    </div>
                    <button
                        class="btn btn-outline-secondary w-100 mt-3"
                        :class="{ 'active': viewMode === 'all' }"
                        @click="selectViewMode('all')">
                        <mdicon name="calendar" size="20" class="me-2"/>
                        All
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, provide, onBeforeMount, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import Loading from '@/components/Loading.vue'
import getInventoryUsage from '@/composables/inventory/getInventoryUsage'
import updateInventoryStock from '@/composables/inventory/updateInventoryStock'
import store from '@/store'
import Pagination from '@/components/Table/Pagination.vue'
import AccountTop from '@/components/Accounts/AccountTop.vue'

export default {
    name: "ListInventoryWeb",
    components: {
        Loading,
        Pagination,
        AccountTop
    },
    setup() {
        const router = useRouter()
        const loading = ref(false)
        const user = ref(null)
        const usageList = ref([])
        const searchTerm = ref('')

        const userToken = localStorage.getItem('token')
        const currentPage = ref(1)
        const itemsPerPage = ref(10)
        const viewMode = ref('daily')
        const baseDate = ref(new Date())
        const showDateModal = ref(false)
        const customStart = ref('')
        const customEnd = ref('')
        const editItem = ref(null)
        const editStock = ref(0)

        if (!userToken) {
            router.push('/login')
        }

        provide('store', store)

        onBeforeMount(async() => {
            if (!store.state.isUserLoggedIn) {
                router.push('/login')
            }

            loading.value = true
            await fetchUsage()
            loading.value = false
        })

        const formatNumber = (value) => {
            const num = Number(value) || 0
            return num.toFixed(3)
        }

        const startOfWeek = (d) => {
            const date = new Date(d)
            const diff = date.getDay()
            date.setDate(date.getDate() - diff)
            date.setHours(0,0,0,0)
            return date
        }

        const filteredList = computed(() => {
            const q = (searchTerm.value || '').toLowerCase()
            if (!q) return usageList.value || []
            return (usageList.value || []).filter((item) =>
                (item.name || '').toLowerCase().includes(q) ||
                (item.unit || '').toLowerCase().includes(q)
            )
        })

        const paginatedData = computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage.value
            const end = start + itemsPerPage.value

            return filteredList.value?.slice(start, end) || []
        })

        const totalPages = computed(() => {
            return Math.max(1, Math.ceil((filteredList.value?.length || 0) / itemsPerPage.value) || 1)
        })

        const formattedRange = computed(() => {
            const base = new Date(baseDate.value)
            if (viewMode.value === 'all') return 'All dates'
            if (viewMode.value === 'daily') return base.toLocaleDateString()
            if (viewMode.value === 'weekly') {
                const start = startOfWeek(base)
                const end = new Date(start)
                end.setDate(start.getDate() + 6)
                return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
            }
            if (viewMode.value === 'monthly') {
                return base.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
            }
            if (viewMode.value === 'custom' && customStart.value && customEnd.value) {
                return `${new Date(customStart.value).toLocaleDateString()} - ${new Date(customEnd.value).toLocaleDateString()}`
            }
            return ''
        })

        const buildRange = () => {
            if (viewMode.value === 'all') return { start: null, end: null }
            if (viewMode.value === 'daily') {
                const start = new Date(baseDate.value)
                start.setHours(0,0,0,0)
                const end = new Date(start)
                end.setHours(23,59,59,999)
                return { start, end }
            }
            if (viewMode.value === 'weekly') {
                const start = startOfWeek(baseDate.value)
                start.setHours(0,0,0,0)
                const end = new Date(start)
                end.setDate(start.getDate() + 6)
                end.setHours(23,59,59,999)
                return { start, end }
            }
            if (viewMode.value === 'monthly') {
                const start = new Date(baseDate.value.getFullYear(), baseDate.value.getMonth(), 1)
                start.setHours(0,0,0,0)
                const end = new Date(baseDate.value.getFullYear(), baseDate.value.getMonth() + 1, 0)
                end.setHours(23,59,59,999)
                return { start, end }
            }
            if (viewMode.value === 'custom' && customStart.value && customEnd.value) {
                const start = new Date(customStart.value)
                start.setHours(0,0,0,0)
                const end = new Date(customEnd.value)
                end.setHours(23,59,59,999)
                return { start, end }
            }
            return { start: null, end: null }
        }

        const fetchUsage = async () => {
            const token = localStorage.getItem('token')
            const { start, end } = buildRange()
            const startStr = start ? start.toISOString() : ''
            const endStr = end ? end.toISOString() : ''
            const { response, error } = await getInventoryUsage(token, startStr, endStr)
            if (error.value === null && Array.isArray(response.value)) {
                usageList.value = response.value
            } else {
                usageList.value = []
            }
        }

        const shiftPeriod = (dir) => {
            const mult = dir === 'next' ? 1 : -1
            const base = new Date(baseDate.value)
            if (viewMode.value === 'daily') {
                base.setDate(base.getDate() + mult)
            } else if (viewMode.value === 'weekly') {
                base.setDate(base.getDate() + mult * 7)
            } else if (viewMode.value === 'monthly') {
                base.setMonth(base.getMonth() + mult)
            }
            baseDate.value = base
        }

        const prevPeriod = () => shiftPeriod('prev')
        const nextPeriod = () => shiftPeriod('next')
        const toggleMode = () => {
            const order = ['all', 'daily', 'weekly', 'monthly']
            const idx = order.indexOf(viewMode.value)
            viewMode.value = order[(idx + 1) % order.length]
        }

        const selectViewMode = (mode) => {
            viewMode.value = mode
            showDateModal.value = false
            fetchUsage()
        }

        const selectToday = () => {
            baseDate.value = new Date()
            viewMode.value = 'daily'
            showDateModal.value = false
            fetchUsage()
        }

        const applyCustomRange = () => {
            if (customStart.value && customEnd.value) {
                viewMode.value = 'custom'
                showDateModal.value = false
                fetchUsage()
            }
        }

        const isTodaySelected = computed(() => viewMode.value === 'daily' && new Date(baseDate.value).toDateString() === new Date().toDateString())
        
        const openEdit = (item) => {
            editItem.value = item
            editStock.value = Number(item.current_stock) || 0
        }

        const closeEdit = () => {
            editItem.value = null
            editStock.value = 0
        }

        const saveStock = async () => {
            if (!editItem.value) return
            loading.value = true
            const token = localStorage.getItem('token')
            await updateInventoryStock(editItem.value.id, editStock.value, token)
            loading.value = false
            closeEdit()
            await fetchUsage()
        }
        
        // Reset to first page when filters change
        watch([itemsPerPage, viewMode, baseDate, searchTerm], () => {
            currentPage.value = 1
            fetchUsage()
        })

        return {
            router,
            loading,
            user,
            usageList,
            formatNumber,
            itemsPerPage,
            currentPage,
            totalPages,
            paginatedData,
            filteredList,
            viewMode,
            baseDate,
            formattedRange,
            prevPeriod,
            nextPeriod,
            toggleMode,
            showDateModal,
            selectViewMode,
            customStart,
            customEnd,
            applyCustomRange,
            selectToday,
            isTodaySelected,
            openEdit,
            closeEdit,
            saveStock,
            editItem,
            editStock,
            searchTerm
        }
    }
}
</script>

<style scoped>

select,
select option {
  font-size: 13px;
}

@media (max-width: 768px) {
    select,
    select option {
    font-size: 13px;
    }
  .home-container {
    font-family: 'Helvetica', sans-serif;
    font-size: 14px;
  }

  .view-selector label,
  .date-label,
  .card .value,
  .card .label,
  .items-container {
    font-family: 'Helvetica Neue', sans-serif;
    font-size: 13px;
  }

  .items-container {
    grid-template-columns: 25% 50% 25%;
  }

  .dashboard {
    flex-direction: column;
    gap: 10px;
  }
}
.tight-table {
    font-size: 13px;
}

.tight-table th,
.tight-table td {
    padding: 0.3rem 0.5rem; /* reduce vertical and horizontal spacing */
    vertical-align: middle;
}

.tight-table ul {
    padding-left: 1rem;
    margin: 0;
}

.tight-table li {
    margin: 0;
    padding: 0;
}
:deep(.dataTable.table tbody tr) {
  height: 24px !important;
  line-height: 1 !important;
}

:deep(.dataTable.table td),
:deep(.dataTable.table th) {
  font-size: 13px !important;
}

.suggestions {
    padding: 3px;
    border-radius: 5px;
    cursor: pointer;
    transition: .2s all;
}

.suggestions:hover{
    transform: scale(1.2)
}

.service-info {
    font-size: 14px;
}
.contact-info {
    font-size: 14px
}
.service-label {
    font-size: 12px;
}

.service-value {
    font-size: 14px;
}
.addr {
    white-space: nowrap;
    width: calc(100% - 20px);
    overflow: hidden;
    text-overflow: ellipsis;
}.serv {
    white-space: nowrap;
    width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
}

.persons {
    display: grid;
    grid-template-columns: 100px 1fr 50px;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
}

.service-table:hover {
    background-color: #F1F0E8;
}

.home-container {
    height: 90vh;
    overflow: scroll;
}

.home-inner {
    height: 90vh;
    font-family: Arial, Helvetica, sans-serif;
}

.popular-services-container::-webkit-scrollbar {
    display: none;
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.6s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.nav-pill, .date-pill {
  border: none;
  background: #fff;
  border-radius: 12px;
  padding: 8px 12px;
}
.date-pill {
  min-width: 220px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid #e5e7eb;
}
.nav-pill {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}
.modal-content {
  background: #fff;
  border-radius: 8px;
  width: 360px;
  max-width: 90vw;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
.edit-modal {
  padding: 12px;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}
.modal-body {
  padding: 16px;
}
.date-option-buttons .btn.active {
  background: #0d6efd;
  color: #fff;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}
.modal-content {
  background: #fff;
  border-radius: 8px;
  width: 320px;
  max-width: 90vw;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}
.modal-body {
  padding: 16px;
}
.date-option-buttons .btn.active {
  background: #0d6efd;
  color: #fff;
}

.modal-footer {
    padding: 12px;
}
</style>
