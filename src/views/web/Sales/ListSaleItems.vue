<template>
    <AccountTop />
    <div class="card border-0 home-container">
        <!-- New UI starts here -->
        <div class="card-body home-inner">

            <div class="card-title">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <div class="d-flex align-items-center">
                        <button class="btn btn-outline-secondary btn-sm me-3" @click="router.back()" style="display: flex; align-items: center;">
                            <mdicon name="arrow-left" size="20"/>
                        </button>
                        <h4 class="mb-0 fw-bold">Sale Items</h4>
                    </div>
                    <span class="text-muted" style="font-size: 14px;">{{ currentDate }}</span>
                    <span v-if="currentCategory" class="badge bg-info ms-2 text-dark">Category: {{ currentCategory }}</span>
                    <span v-if="currentPaymentMode" class="badge bg-warning text-dark ms-2">Payment: {{ currentPaymentMode }}</span>
                </div>
                <div class="row p-1">
                    <hr>
                    <div class="col-md-1"></div>
                    <div class="col-md-10">
                        <div class="mb-2 d-flex justify-content-between">
                            <TableTopMenu
                            :itemsPerPage="itemsPerPage"
                            :searchQuery="searchQuery"
                            @update-search="searchQuery = $event"
                            @update-items="itemsPerPage = $event"
                            />
                        </div>
                        <table class="table tight-table">
                            <thead class="thead-dark">
                                <tr>
                                    <th style="width: 15%;">Time</th>
                                    <th style="width: 65%;">Products</th>
                                    <th class="text-center" style="width: 20%;">Total Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="sale in paginatedData" :key="sale.id">
                                    <td>{{ formatTime(sale.date) }}</td>
                                    <td>
                                        <div v-for="item in sale.saleItems" :key="item.id" class="product-item">
                                            <span class="fw-bold">{{ item.product.product_name }}</span> - 
                                            <span>Qty: {{ item.quantity }}</span> × 
                                            <span>₱{{ item.unit_price }}</span> = 
                                            <span class="text-success">₱{{ (item.quantity * item.unit_price).toFixed(2) }}</span>
                                        </div>
                                    </td>
                                    <td class="text-center fw-bold">₱{{ sale.total.toFixed(2) }}</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <!-- pagination part -->
                        <Pagination
                            :currentPage="currentPage"
                            :itemsPerPage="itemsPerPage"
                            :numberOfEntries="filteredSales?.length || 0"
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
</template>

<script>
import { ref, provide, onBeforeMount, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Loading from '@/components/Loading.vue'
import AccountTop from '@/components/Accounts/AccountTop.vue'
import Pagination from '@/components/Table/Pagination.vue'
import TableTopMenu from '@/components/Table/TableTopMenu.vue'
import getSales from '@/composables/sales/getSales'
import store from '@/store'

export default {
    name: "ListSaleItemsWeb",
    components: {
        Loading,
        AccountTop,
        Pagination,
        TableTopMenu
    },
    setup() {
        const router = useRouter()
        const route = useRoute()
        const loading = ref(false)
        const salesData = ref([])
        const currentDate = ref('')
        const searchQuery = ref('')
        const currentPage = ref(1)
        const itemsPerPage = ref(10)
        const currentCategory = ref('')
        const currentPaymentMode = ref('')

        const userToken = localStorage.getItem('token')

        if (!userToken) {
            router.push('/login')
        }

        provide('store', store)

        onBeforeMount(async() => {
            if (!store.state.isUserLoggedIn) {
                router.push('/login')
            }

            loading.value = true
            // Get query parameters for date filtering
            const startDate = route.query?.startDate || null
            const endDate = route.query?.endDate || null
            currentCategory.value = route.query?.category || ''
            currentPaymentMode.value = route.query?.paymentMode?.toString() || ''
            
            // Set current date for display
            if (startDate && endDate) {
                const startLabel = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                const endLabel = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                currentDate.value = `${startLabel} - ${endLabel}`
            } else if (startDate) {
                const date = new Date(startDate)
                currentDate.value = date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                })
            } else {
                currentDate.value = new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                })
            }
            
            // Get all sales with sale items included, filtered by date range
            const { response, error } = await getSales(userToken, null, true, startDate, endDate, currentPaymentMode.value || null)
            if (error.value === null) {
                salesData.value = response.value
            }
            loading.value = false
        })

        const formatDate = (dateString) => {
            const date = new Date(dateString)
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }

        const formatTime = (dateString) => {
            const date = new Date(dateString)
            return date.toLocaleTimeString('en-US', { 
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })
        }

        // Reset to first page when itemsPerPage changes
        watch(itemsPerPage, () => {
            currentPage.value = 1
        })

        // Search Implementation
        const filteredSales = computed(() => {
            if (!salesData.value) return []

            const categoryRaw = route.query?.category
            const paymentFilter = (route.query?.paymentMode || '').toString().toLowerCase()
            let data = salesData.value
            if (paymentFilter) {
                data = data.filter((sale) => (sale.payment_mode || '').toLowerCase() === paymentFilter)
            }
            if (categoryRaw) {
                const cat = decodeURIComponent(categoryRaw.toString()).toLowerCase()
                data = salesData.value
                    .map((sale) => {
                        const items = (sale.saleItems || []).filter((item) => {
                            const catField = (item.product?.category || item.product?.product_name || '').toLowerCase()
                            return catField.includes(cat)
                        })
                        if (!items.length) return null
                        const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
                        return { ...sale, saleItems: items, total }
                    })
                    .filter(Boolean)
            }

            if (!searchQuery.value) return data

            const query = searchQuery.value.toLowerCase()
            return data.filter(sale => {
                if (sale.id.toString().includes(query)) return true
                
                const hasMatchingProduct = sale.saleItems?.some(item => 
                    (item.product?.product_name || '').toLowerCase().includes(query)
                )
                if (hasMatchingProduct) return true
                
                if (sale.total?.toString().includes(query)) return true
                
                return false
            })
        })

        const paginatedData = computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage.value
            const end = start + itemsPerPage.value

            return filteredSales.value?.slice(start, end) || []
        })

        const totalPages = computed(() => {
            return Math.ceil((filteredSales.value?.length || 0) / itemsPerPage.value)
        })

        console.log("SalesData: ", salesData.value);
        return {
            router,
            loading,
            salesData,
            formatDate,
            formatTime,
            currentDate,
            route,
            searchQuery,
            currentPage,
            itemsPerPage,
            filteredSales,
            paginatedData,
            totalPages,
            currentCategory,
            currentPaymentMode
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
    padding: 0.3rem 0.5rem;
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

.product-item {
    padding: 4px 0;
    border-bottom: 1px solid #f0f0f0;
    font-size: 13px;
}

.product-item:last-child {
    border-bottom: none;
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
}

.serv {
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
</style>
