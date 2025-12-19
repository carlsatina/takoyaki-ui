<template>
    <div class="dashboard-container">
        <!-- Page Header -->
        <div class="page-header">
            <button class="back-btn" @click="router.go(-1)">
                <mdicon name="arrow-left" size="24"/>
            </button>
            <h4 class="page-title">Sales by Items</h4>
        </div>

        <!-- Date Navigation -->
        <div class="date-nav-container">
            <button class="nav-btn" @click="prevPeriod">
                <mdicon name="chevron-left" size="20"/>
            </button>
            
            <div class="date-display shadow-sm" @click="showDateModal = true">
                <mdicon name="calendar" size="18" class="me-1"/>
                {{ formattedRange }}
            </div>
            
            <button class="nav-btn" @click="nextPeriod">
                <mdicon name="chevron-right" size="20"/>
            </button>
        </div>

        <!-- Top Selling Item Highlight -->
        <div class="top-selling-highlight mt-3" v-if="topSellingItem">
            <div class="trophy-badge">
                <mdicon name="trophy" size="24"/>
            </div>
            <div class="top-item-content">
                <div class="top-item-label">🏆 Best Seller</div>
                <div class="top-item-name">{{ topSellingItem.productName }}</div>
                <div class="top-item-stats">
                    <span class="stat-badge">{{ topSellingItem.totalQuantity }} sold</span>
                    <span class="stat-badge">₱{{ topSellingItem.totalRevenue?.toLocaleString() }}</span>
                </div>
            </div>
        </div>

        <!-- Items List -->
        <div class="sales-section shadow-sm mt-3" v-if="salesReport && salesReport.products.length > 0">
            <div class="section-header">
                <h6 class="section-title">
                    <mdicon name="chart-bar" size="20" class="me-2"/>
                    All Items ({{ salesReport.products.length }})
                </h6>
                <div class="total-revenue">
                    Total: ₱{{ salesReport.products.reduce((sum, item) => sum + (item.price * item.totalSold), 0).toLocaleString() }}
                </div>
            </div>
            <div class="sales-list">
                <div class="sales-item" v-for="item in salesReport.products" :key="item.productId">
                    <div class="item-rank">#{{ salesReport.products.indexOf(item) + 1 }}</div>
                    <div class="item-image">
                        <img :src="item.category === 'Takoyaki' ? takoyakiImg : bukoImg" alt="">
                    </div>
                    <div class="item-details">
                        <div class="item-name">{{ item.name }}</div>
                        <div class="item-category">{{ item.category }}</div>
                        <div class="item-meta">
                            <span class="price">₱{{ item.price }}</span>
                            <span class="separator">•</span>
                            <span class="quantity">{{ item.totalSold }} sold</span>
                            <span v-if="item.category === 'Takoyaki'" class="pieces">({{ item.totalSold * 4 }} pcs)</span>
                        </div>
                    </div>
                    <div class="item-revenue">
                        <div class="revenue-amount">₱{{ (item.price * item.totalSold).toLocaleString() }}</div>
                        <div class="revenue-label">Revenue</div>
                    </div>
                </div>
            </div>
        </div>

        <br>
        <br>
        <br>
        <div class="mt-3" v-if="salesReport && salesReport.products.length <= 0">
            <div class="d-flex flex-column justify-content-center align-items-center">
            <img src="@/assets/no-data.png" width="80" />
            <br>
            <span class="text-muted">No Sales Data</span>
            </div>
        </div>
        <!-- Loading Modal -->
        <Loading v-if="loading"/>

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
                        <button 
                            class="btn btn-outline-primary w-100 mb-3" 
                            :class="{ 'active': viewMode === 'custom' }"
                            @click="viewMode = 'custom'">
                            <mdicon name="calendar-range" size="20" class="me-2"/>
                            Custom Range
                        </button>
                    </div>

                    <!-- Custom Date Range Inputs -->
                    <div v-if="viewMode === 'custom'" class="custom-date-inputs">
                        <div class="mb-3">
                            <label class="form-label">Start Date</label>
                            <input 
                                type="date" 
                                class="form-control" 
                                v-model="customStartDate"
                                :max="customEndDate || today"
                            />
                        </div>
                        <div class="mb-3">
                            <label class="form-label">End Date</label>
                            <input 
                                type="date" 
                                class="form-control" 
                                v-model="customEndDate"
                                :min="customStartDate"
                                :max="today"
                            />
                        </div>
                        <button 
                            class="btn btn-primary w-100" 
                            @click="applyCustomRange"
                            :disabled="!customStartDate || !customEndDate">
                            Apply Custom Range
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script>
import { ref, computed, onBeforeMount, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import Loading from '@/components/Loading.vue'
import getSalesReport from '@/composables/reports/getSalesReport'
import getTopSellingItemByDateRange from '@/composables/reports/getTopSellingItemByDateRange'
import store from '@/store'
import takoyakiImg from '@/assets/takoyaki-circle.png'
import bukoImg from '@/assets/Buko.png'

export default {
    name: "SalesByItemMobile",
    components: {
        Loading
    },
    setup() {
        
        const router = useRouter()
        const currentDate = ref(new Date())
        const viewMode = ref('daily')
        const salesReport = ref(null)
        const loading = ref(false)
        const userToken = localStorage.getItem('token')
        const showDateModal = ref(false)
        const customStartDate = ref('')
        const customEndDate = ref('')
        const today = ref(new Date().toISOString().split('T')[0])
        const startDate = ref()
        const endDate = ref()
        const topSellingItem = ref(null)
        
        const stats = ref({
            "Buko": 0,
            "Takoyaki": 0
        })


        onBeforeMount(async() => {

            if (!store.state.isUserLoggedIn) {
                router.push('/login')
            }

            loading.value = true
            // const st = new Date(currentDate.value)
            // st.setDate(st.getDate() - 1)

            // const { response, error } = await getSalesReport(st, st, userToken)
            // if (error.value === null) {
            //     salesReport.value = response.value
            // }
            loading.value = false
        })

        watchEffect(async() => {
            const d = new Date(currentDate.value)
            if (viewMode.value === 'daily') {
                Object.keys(stats.value).forEach(key => {
                    stats.value[key] = 0;
                });
                const target = d.toISOString().split('T')[0]
                const { response, error } = await getSalesReport(target, target, userToken)
                if (error.value === null) {
                    // Sort products by totalSold (highest to lowest)
                    salesReport.value = {
                        ...response.value,
                        products: response.value.products.sort((a, b) => b.totalSold - a.totalSold)
                    }
                }
            }

            let start, end

            if (viewMode.value === 'weekly') {
                start = new Date(d)
                start.setDate(d.getDate() - d.getDay()) // Sunday
                end = new Date(start)
                end.setDate(start.getDate() + 6)

                const { response, error } = await getSalesReport(start, end, userToken)
                if (error.value === null) {
                    // Sort products by totalSold (highest to lowest)
                    salesReport.value = {
                        ...response.value,
                        products: response.value.products.sort((a, b) => b.totalSold - a.totalSold)
                    }
                }

            }

            if (viewMode.value === 'monthly') {
                start = new Date(d.getFullYear(), d.getMonth(), 1)
                end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
                
                const { response, error } = await getSalesReport(start, end, userToken)
                if (error.value === null) {
                    // Sort products by totalSold (highest to lowest)
                    salesReport.value = {
                        ...response.value,
                        products: response.value.products.sort((a, b) => b.totalSold - a.totalSold)
                    }
                }

            }

        })

        const formatDate = (date) => {
            return date.toISOString().split('T')[0]
        }
        
        const prevPeriod = () => {
            const d = new Date(currentDate.value)
            if (viewMode.value === 'daily') d.setDate(d.getDate() - 1)
            if (viewMode.value === 'weekly') d.setDate(d.getDate() - 7)
            if (viewMode.value === 'monthly') d.setMonth(d.getMonth() - 1)
            currentDate.value = new Date(d)
        }
        
        const nextPeriod = () => {
            const d = new Date(currentDate.value)
            if (viewMode.value === 'daily') d.setDate(d.getDate() + 1)
            if (viewMode.value === 'weekly') d.setDate(d.getDate() + 7)
            if (viewMode.value === 'monthly') d.setMonth(d.getMonth() + 1)
            currentDate.value = new Date(d)
        }
        
        const formattedRange = computed(() => {
            const d = new Date(currentDate.value)

            if (viewMode.value === 'daily') {
                const f = formatDate(d)
                return f
            }

            if (viewMode.value === 'weekly') {
                const start = new Date(d)
                const end = new Date(d)
                start.setDate(d.getDate() - d.getDay()) // Sunday
                end.setDate(start.getDate() + 6) // Saturday
                return `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`
            }

            if (viewMode.value === 'monthly') {
                return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
            }

            if (viewMode.value === 'custom') {
                if (startDate.value && endDate.value) {
                    const start = new Date(startDate.value)
                    const end = new Date(endDate.value)
                    return `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`
                }
                return 'Select Custom Range'
            }
        })

        const selectViewMode = (mode) => {
            viewMode.value = mode
            showDateModal.value = false
        }

        const selectToday = () => {
            currentDate.value = new Date()
            viewMode.value = 'daily'
            showDateModal.value = false
        }

        const applyCustomRange = () => {
            if (customStartDate.value && customEndDate.value) {
                startDate.value = new Date(customStartDate.value)
                endDate.value = new Date(customEndDate.value)
                showDateModal.value = false
            }
        }

        // Fetch top selling item whenever date range changes
        watchEffect(async() => {
            const d = new Date(currentDate.value)
            let start, end

            if (viewMode.value === 'daily') {
                start = end = d.toISOString().split('T')[0]
            } else if (viewMode.value === 'weekly') {
                const startWeek = new Date(d)
                startWeek.setDate(d.getDate() - d.getDay())
                const endWeek = new Date(startWeek)
                endWeek.setDate(startWeek.getDate() + 6)
                start = startWeek.toISOString().split('T')[0]
                end = endWeek.toISOString().split('T')[0]
            } else if (viewMode.value === 'monthly') {
                const startMonth = new Date(d.getFullYear(), d.getMonth(), 1)
                const endMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0)
                start = startMonth.toISOString().split('T')[0]
                end = endMonth.toISOString().split('T')[0]
            } else if (viewMode.value === 'custom' && startDate.value && endDate.value) {
                start = startDate.value.toISOString().split('T')[0]
                end = endDate.value.toISOString().split('T')[0]
            }

            if (start && end) {
                const topSelling = await getTopSellingItemByDateRange(start, end, userToken)
                if (topSelling.error.value === null) {
                    topSellingItem.value = topSelling.response.value.topSellingItem
                }
            }
        })
        

        return {
            formattedRange,
            nextPeriod,
            prevPeriod,
            viewMode,
            loading,
            salesReport,
            router,
            showDateModal,
            customStartDate,
            customEndDate,
            today,
            selectViewMode,
            selectToday,
            applyCustomRange,
            topSellingItem,
            takoyakiImg,
            bukoImg
        }
    }
}
</script>
  
<style scoped>

.dashboard-container {
    padding: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* Page Header */
.page-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
}

.back-btn {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.back-btn:hover {
    background: #f5f5f5;
    border-color: #007bff;
}

.page-title {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #333;
}

/* Date Navigation */
.date-nav-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
}

.nav-btn {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.nav-btn:hover {
    background: #e9ecef;
    border-color: #007bff;
}

.date-display {
    background-color: white;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 6px 16px;
    min-width: 200px;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    height: 38px;
}

.date-display:hover {
    background-color: #f8f9fa;
    border-color: #adb5bd;
}

/* Sales Section */
.sales-section {
    background: white;
    border-radius: 12px;
    overflow: hidden;
}

.section-header {
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    background: linear-gradient(to bottom, #fafafa, #ffffff);
}

.section-title {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
    display: flex;
    align-items: center;
}

.total-revenue {
    font-size: 18px;
    font-weight: 700;
    color: #28a745;
}

/* Sales Items List */
.sales-list {
    padding: 8px 0;
}

.sales-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 1px solid #f5f5f5;
}

.sales-item:last-child {
    border-bottom: none;
}

.sales-item:hover {
    background-color: #f8f9fa;
}

.item-rank {
    font-size: 14px;
    font-weight: 700;
    color: #999;
    min-width: 30px;
    margin-right: 8px;
}

.item-image {
    flex-shrink: 0;
    width: 50px;
    height: 50px;
    margin-right: 12px;
}

.item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-details {
    flex: 1;
    min-width: 0;
}

.item-name {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 3px;
}

.item-category {
    font-size: 11px;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
}

.item-meta {
    font-size: 12px;
    color: #666;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
}

.item-meta .price {
    font-weight: 600;
    color: #28a745;
    font-size: 13px;
}

.item-meta .separator {
    color: #ddd;
}

.item-meta .quantity {
    color: #666;
    font-weight: 500;
}

.item-meta .pieces {
    color: #999;
    font-size: 11px;
}

.item-revenue {
    text-align: right;
    flex-shrink: 0;
    margin-left: 12px;
}

.revenue-amount {
    font-size: 15px;
    font-weight: 700;
    color: #007bff;
    margin-bottom: 2px;
}

.revenue-label {
    font-size: 10px;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
    padding: 1rem;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    margin: 0;
    font-size: 18px;
    font-weight: bold;
}

.btn-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-close:hover {
    opacity: 0.7;
}

.btn-close::before {
    content: "×";
}

.modal-body {
    padding: 1.5rem;
}

.date-option-buttons .btn.active {
    background-color: #0d6efd;
    color: white;
    border-color: #0d6efd;
}

.custom-date-inputs {
    border-top: 1px solid #e0e0e0;
    padding-top: 1rem;
    margin-top: 0.5rem;
}

.form-label {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 0.5rem;
}

/* Top Selling Item Highlight */
.top-selling-highlight {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    position: relative;
    overflow: hidden;
}

.top-selling-highlight::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
}

.trophy-badge {
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFD700;
    flex-shrink: 0;
    z-index: 1;
}

.top-item-content {
    flex: 1;
    z-index: 1;
}

.top-item-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
}

.top-item-name {
    font-size: 16px;
    font-weight: 700;
    color: white;
    margin-bottom: 8px;
}

.top-item-stats {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.stat-badge {
    background: rgba(255, 255, 255, 0.25);
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    color: white;
    backdrop-filter: blur(10px);
}

</style>
