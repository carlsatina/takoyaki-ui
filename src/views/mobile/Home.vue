<template>
  <pull-to 
    :top-load-method="refresh"
    :top-config="{
        pullText: 'Pull down to refresh',
        triggerText: 'Release to update',
        loadingText: 'Loading...',
        doneText: 'Done',
        failText: 'Failed to refresh',
    }"
  >
    <AccountTop />
    <div class="dashboard-container">
        <div class="report-view shadow">
            <!-- Date Range Button -->
            <div class="date-nav">
                <button type="submit" class="btn shadow-sm" @click="prevPeriod"><mdicon name="chevron-left"></mdicon></button>
                
                <div class="date-display shadow-sm" @click="showDateModal = true">
                    <mdicon name="calendar" size="18" class="me-1"/>
                    {{ formattedRange }}
                </div>
                
                <button type="submit" class="btn shadow-sm" @click="nextPeriod"><mdicon name="chevron-right"></mdicon></button>
            </div>

            <!-- Stats Cards -->
            <div class="stats-grid mt-3">
                <div class="stat-card sales-card" @click="navigateToSaleItems">
                    <div class="stat-icon">
                        <mdicon name="cash-multiple" size="20"/>
                    </div>
                    <div class="stat-content">
                        <div class="stat-label">Sales</div>
                        <div class="stat-value">₱{{netSales.toLocaleString()}}</div>
                    </div>
                </div>

                <div class="stat-card senior-card">
                    <div class="stat-icon">
                        <mdicon name="account-heart" size="20"/>
                    </div>
                    <div class="stat-content">
                        <div class="stat-label">Senior</div>
                        <div class="stat-value">₱{{seniorDiscount.toLocaleString()}}</div>
                    </div>
                </div>

                <div class="stat-card profit-card">
                    <div class="stat-icon">
                        <mdicon name="trending-up" size="20"/>
                    </div>
                    <div class="stat-content">
                        <div class="stat-label">Profit</div>
                        <div class="stat-value">₱{{profit.toLocaleString()}}</div>
                    </div>
                </div>
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

            <!-- -- Revenue Chart -- -->
            <RevenueChart :salesData="chartSalesData" v-if="chartSalesData != null && salesReport && salesReport.length > 0"/>
        </div>

        <!-- Items sold  -->
        <div class="sales-section shadow" v-if="salesReport && salesReport.length > 0">
            <div class="section-header">
                <h6 class="section-title">Top Selling Items</h6>
            </div>
            <div class="sales-list">
                <div class="sales-item" v-for="item in salesReport" :key="item.product_id" @click="router.push('/salesByItem')">
                    <div class="item-image">
                        <img :src="item.category === 'Takoyaki' ? takoyakiImg : bukoImg" alt="">
                    </div>
                    <div class="item-details">
                        <div class="item-name">{{item.name}}</div>
                        <div class="item-meta">
                            <span class="price">₱{{item.price}}</span>
                            <span class="separator">•</span>
                            <span class="quantity">{{item.totalSold}} sold</span>
                            <span v-if="item.category === 'Takoyaki'" class="pieces">({{item.totalSold * 4}} pcs)</span>
                        </div>
                    </div>
                    <div class="item-revenue">
                        <div class="revenue-amount">₱{{(item.price * item.totalSold).toLocaleString()}}</div>
                        <div class="revenue-label">Revenue</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sold by Category -->
        <div class="sales-section shadow" v-if="salesReport && salesReport.length > 0">
            <div class="section-header">
                <h6 class="section-title">Sales by Category</h6>
            </div>
            <div class="category-grid">
                <div class="category-card" @click="navigateToCategory('Takoyaki')">
                    <div class="category-icon">
                        <img src="@/assets/takoyaki-circle.png" alt="Takoyaki">
                    </div>
                    <div class="category-info">
                        <div class="category-name">Takoyaki</div>
                        <div class="category-stats">
                            <span class="stat-value">{{stats.Takoyaki?.totalSold || 0}}</span>
                            <span class="stat-label">orders</span>
                            <span class="pieces-info">({{(stats.Takoyaki?.totalSold || 0) * 4}} pcs)</span>
                        </div>
                        <div class="category-revenue">₱{{(stats.Takoyaki?.totalRevenue || 0).toLocaleString()}}</div>
                    </div>
                </div>
                <div class="category-card" @click="navigateToCategory('Buko')">
                    <div class="category-icon">
                        <img src="@/assets/Buko.png" alt="Buko">
                    </div>
                    <div class="category-info">
                        <div class="category-name">Buko</div>
                        <div class="category-stats">
                            <span class="stat-value">{{stats.Buko?.totalSold || 0}}</span>
                            <span class="stat-label">orders</span>
                        </div>
                        <div class="category-revenue">₱{{(stats.Buko?.totalRevenue || 0).toLocaleString()}}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sold by Payment Mode -->
        <div class="sales-section shadow" v-if="salesReport && salesReport.length > 0">
            <div class="section-header">
                <h6 class="section-title">Payment Methods</h6>
            </div>
            <div class="payment-list">
                <div
                    class="payment-item"
                    v-for="item in paymentMode"
                    :key="item.paymentMode"
                    @click="navigateToPaymentMode(item.paymentMode)"
                    style="cursor: pointer;"
                >
                    <div class="payment-icon">
                        <img v-if="item.paymentMode === 'Cash'" src="@/assets/cash-peso.png" alt="Cash">
                        <img v-else-if="item.paymentMode === 'GCash'" src="@/assets/g-cash.png" alt="GCash">
                        <img v-else src="@/assets/foodpanda.png" alt="FoodPanda">
                    </div>
                    <div class="payment-details">
                        <div class="payment-name">{{ item.paymentMode }}</div>
                        <div class="payment-count">{{ item.transactionCount }} transactions</div>
                    </div>
                    <div class="payment-revenue">
                        <div class="revenue-amount">₱{{ item.totalRevenue.toLocaleString() }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sold by User -->
        <div class="sales-section shadow" v-if="salesReport && salesReport.length > 0">
            <div class="section-header">
                <h6 class="section-title">Employee Sales</h6>
            </div>
            <div class="employee-list">
                <div class="employee-item" v-for="item in userSales" :key="item.full_name">
                    <div class="employee-avatar">
                        <img src="@/assets/avatar-takoyaki.png" alt="Avatar">
                    </div>
                    <div class="employee-details">
                        <div class="employee-name">{{ item.full_name }}</div>
                        <div class="employee-label">Sales Representative</div>
                    </div>
                    <div class="employee-revenue">
                        <div class="revenue-amount">₱{{ (item.total_sales || 0).toLocaleString() }}</div>
                        <div class="revenue-split" v-if="item.cash_total != null || item.gcash_total != null">
                            <span class="badge bg-light text-dark me-1">Cash: ₱{{ (item.cash_total || 0).toLocaleString() }}</span>
                            <span class="badge bg-primary">GCash: ₱{{ (item.gcash_total || 0).toLocaleString() }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <br>
        <br>
        <br>
        <div class="mt-3" v-if="salesReport && salesReport.length <= 0">
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
    </pull-to>
</template>
  
<script>
import { ref, computed, onBeforeMount, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import Loading from '@/components/Loading.vue'
import getSalesReport from '@/composables/reports/getSalesReport'
import getNumberOfReceipts from '@/composables/reports/getNumberOfReceipts'
import getSalesByPaymentMode from '@/composables/reports/getSalesByPaymentMode'
import getSalesByHour from '@/composables/reports/getSalesByhour'
import getTopSellingItemByDateRange from '@/composables/reports/getTopSellingItemByDateRange'
import store from '@/store'
import RevenueChart from '@/components/Chart/RevenueChart.vue'
import getProfile from '@/composables/getProfile'
import {format} from 'date-fns'
import AccountTop from '@/components/Accounts/AccountTop.vue'

import PullTo from 'vue3-pull-to'
import takoyakiImg from '@/assets/takoyaki-circle.png'
import bukoImg from '@/assets/Buko.png'

export default {
    name: "HomeMobile",
    components: {
        Loading,
        AccountTop,
        RevenueChart,
        PullTo
    },
    setup() {
        
        const viewOptions = [
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
        ]
        
        const router = useRouter()
        const currentDate = ref(new Date())
        const viewMode = ref('daily')
        const salesReport = ref(null)
        const loading = ref(false)
        const userToken = localStorage.getItem('token')
        const receipts = ref(0)
        const netSales = ref(0)
        const paymentMode = ref()
        const profit = ref(0)
        const chartSalesData = ref(null)
        const startDate = ref()
        const endDate = ref()
        const userSales = ref()
        const seniorDiscount = ref(0)
        const showDateModal = ref(false)
        const customStartDate = ref('')
        const customEndDate = ref('')
        const today = ref(new Date().toISOString().split('T')[0])
        const topSellingItem = ref(null)
        
        const stats = ref({
            "Buko": 0,
            "Takoyaki": 0
        })

        onBeforeMount(async() => {

            loading.value = true
            const userToken = localStorage.getItem('token')
            if (userToken) {
                store.methods.loginUser(userToken)
                getProfile(userToken)
                .then((data) => {
                    if (data.error.value === null) {
                        store.methods.setUserAdmin(data.response.value.userInfo.is_admin)

                        if (data.response.value.userInfo.is_admin) {
                            router.push('/admin')
                        } else if (data.response.value.userInfo.role === "Guest"){
                            store.methods.setUserGuest(true)
                            router.push('/guest')
                        } else {
                            store.methods.setUserStaff(true)
                            router.push('/')
                        }
                    }
                })
            } else {
                router.push('/login')
            }

            loading.value = false
        })

        const refreshAllData = async () => {
            loading.value = true

            const { response, error } = await getSalesReport(startDate.value, endDate.value, userToken)
            if (error.value === null) {
                netSales.value = response.value.products.reduce((sum, item) => sum + item.totalRevenue, 0)
                profit.value = response.value.products.reduce((sum, item) => sum + item.totalProfit, 0)
                salesReport.value = response.value.products
                userSales.value = response.value.userSales
                seniorDiscount.value = netSales.value - (userSales.value.reduce((sum, item) => sum + item.total_sales, 0))

                if (salesReport.value.length > 0) {
                    updateSales()
                }

                // Sort by totalSold (highest to lowest) and take top 3
                salesReport.value = response.value.products
                    .sort((a, b) => b.totalSold - a.totalSold)
                    .slice(0, 3)
                receipts.value = response.value.totalReceipts
            }

            // Hourly Sales
            const hourly = await getSalesByHour(startDate.value, endDate.value, userToken)
            if (hourly.error.value === null) {
                chartSalesData.value = hourly.response.value
            }

            const payment = await getSalesByPaymentMode(startDate.value, endDate.value, userToken)
            if (payment.error.value === null) {
                paymentMode.value = payment.response.value
            }

            // Fetch top selling item
            if (startDate.value && endDate.value) {
                const start = startDate.value instanceof Date 
                    ? startDate.value.toISOString().split('T')[0]
                    : startDate.value
                const end = endDate.value instanceof Date
                    ? endDate.value.toISOString().split('T')[0]
                    : endDate.value
                    
                const topSelling = await getTopSellingItemByDateRange(start, end, userToken)
                if (topSelling.error.value === null) {
                    topSellingItem.value = topSelling.response.value.topSellingItem
                }
            }

            loading.value = false
        }

        const updateSales = () => {
            // Reset stats before recalculating
            Object.keys(stats.value).forEach(key => {
                stats.value[key] = {
                    totalSold: 0,
                    totalRevenue: 0
                };
            });

            salesReport.value.forEach(product => {
                if (!stats.value[product.category]) {
                    stats.value[product.category] = {
                        totalSold: 0,
                        totalRevenue: 0
                    };
                }
                
                stats.value[product.category].totalSold += product.totalSold;
                stats.value[product.category].totalRevenue += product.totalRevenue;
            });
        }

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
        
        watchEffect(async() => {
            startDate.value= currentDate.value
            if (viewMode.value === 'daily') {
                Object.keys(stats.value).forEach(key => {
                    stats.value[key] = 0;
                });
                if (startDate.value) {
                    startDate.value = startDate.value.toISOString().split('T')[0]
                    endDate.value = startDate.value
                }
                
                refreshAllData()
            }

            let start, end

            if (viewMode.value === 'weekly') {
                startDate.value = currentDate.value
                startDate.value.setDate(currentDate.value.getDate() - currentDate.value.getDay()) // Sunday
                endDate.value = new Date(startDate.value)
                endDate.value.setDate(startDate.value.getDate() + 6)

                refreshAllData()
            }

            if (viewMode.value === 'monthly') {
                startDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
                endDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)
                
                refreshAllData()

            }

        })

        const refresh = (loaded) => {
            // Check internet connection
            if (!navigator.onLine) {
                router.push('/no-connection')
                loaded('done')
                return
            }

            setTimeout(() => {
                refreshAllData()
                loaded('done')
            }, 500)
        }

        const navigateToSaleItems = () => {
            // Format dates to ISO string format (YYYY-MM-DD)
            let start = startDate.value
            let end = endDate.value
            
            // Convert Date objects to string format if needed
            if (start instanceof Date) {
                start = start.toISOString().split('T')[0]
            }
            if (end instanceof Date) {
                end = end.toISOString().split('T')[0]
            }
            
            router.push({ 
                path: '/listSaleItems', 
                query: { 
                    startDate: start, 
                    endDate: end 
                } 
            })
        }

        const navigateToCategory = (category) => {
            let start = startDate.value
            let end = endDate.value
            if (start instanceof Date) start = start.toISOString().split('T')[0]
            if (end instanceof Date) end = end.toISOString().split('T')[0]
            router.push({
                path: '/listSaleItems',
                query: {
                    startDate: start,
                    endDate: end,
                    category
                }
            })
        }

        const selectViewMode = (mode) => {
            viewMode.value = mode
            showDateModal.value = false
            refreshAllData()
        }

        const selectToday = () => {
            currentDate.value = new Date()
            viewMode.value = 'daily'
            showDateModal.value = false
            refreshAllData()
        }

        const applyCustomRange = () => {
            if (customStartDate.value && customEndDate.value) {
                startDate.value = new Date(customStartDate.value)
                endDate.value = new Date(customEndDate.value)
                showDateModal.value = false
                refreshAllData()
            }
        }

        const navigateToPaymentMode = (mode) => {
            let start = startDate.value
            let end = endDate.value
            if (start instanceof Date) start = start.toISOString().split('T')[0]
            if (end instanceof Date) end = end.toISOString().split('T')[0]
            router.push({
                path: '/listSaleItems',
                query: {
                    startDate: start,
                    endDate: end,
                    paymentMode: mode
                }
            })
        }

        return {
            formattedRange,
            nextPeriod,
            prevPeriod,
            viewOptions,
            viewMode,
            loading,
            salesReport,
            receipts,
            netSales,
            stats,
            paymentMode,
            profit,
            router,
            chartSalesData,
            refreshAllData,
            userSales,
            refresh,
            navigateToSaleItems,
            navigateToCategory,
            navigateToPaymentMode,
            seniorDiscount,
            showDateModal,
            customStartDate,
            customEndDate,
            today,
            selectViewMode,
            selectToday,
            applyCustomRange,
            topSellingItem
            ,
            takoyakiImg,
            bukoImg
        }
    }
}
</script>
  
<style scoped>
@media (max-width: 768px) {
  .dashboard-container {
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
.sales-container {
    display: grid;
    grid-template-columns: 33% 33% 33%;
}
.items-container {
    display: grid;
    grid-template-columns: 20% 60% 20%;
    justify-content:start;
}

.dashboard-container {
    padding: 20px 16px;
    height: 80vh;
    font-family: Arial, sans-serif;
}

/* Stats Cards Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 16px;
    padding: 0 16px;
}

.stat-card {
    background: white;
    border-radius: 8px;
    padding: 10px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 6px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
}

.stat-card::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
}

.stat-card:active {
    transform: scale(0.96);
}

.sales-card {
    cursor: pointer;
}

.sales-card::before {
    background: linear-gradient(90deg, #28a745, #20c997);
}

.sales-card .stat-icon {
    background: linear-gradient(135deg, #28a745, #20c997);
}

.senior-card::before {
    background: linear-gradient(90deg, #6D2E0C, #8B4513);
}

.senior-card .stat-icon {
    background: linear-gradient(135deg, #6D2E0C, #8B4513);
}

.profit-card::before {
    background: linear-gradient(90deg, #007bff, #0056b3);
}

.profit-card .stat-icon {
    background: linear-gradient(135deg, #007bff, #0056b3);
}

.stat-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
}

.stat-content {
    width: 100%;
}

.stat-label {
    font-size: 10px;
    color: #6c757d;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-bottom: 4px;
}

.stat-value {
    font-size: 15px;
    font-weight: 700;
    color: #212529;
    line-height: 1;
    word-break: break-all;
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

.view-selector {
    display: flex;
    gap: 25px;
    margin-bottom: 6px;
    justify-content: center;
}

.view-selector label {
    font-size: 12px;
    cursor: pointer;
}

.date-nav {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 30px;
    margin-bottom: 10px;
}

.date-nav button {
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
}

.date-label {
    font-weight: bold;
    font-size: 16px;
}

.dashboard {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    justify-content: center;
}

.card {
    display: flex;
    align-items: center;
    background: #fff;
    padding: 5px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    flex: 1;
}

.solid-line {
  border-top: 1px solid #e0e0e0; /* Adjust color as needed */
  margin: 2px 0; /* Adjust spacing as needed */
  width: 100%;
}

.date-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px;
}

.date-nav .btn {
  padding: 6px 12px;
  font-size: 14px;
  line-height: 1.5;
  min-width: auto;
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

/* Sales Section Styles */
.sales-section {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 16px;
}

.sales-section:first-of-type {
  margin-top: 0;
}

.section-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(to bottom, #fafafa, #ffffff);
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

/* Sales Items List */
.sales-list {
  padding: 8px 0;
}

.sales-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
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

.item-image {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  margin-right: 16px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.item-meta {
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.item-meta .price {
  font-weight: 500;
  color: #28a745;
}

.item-meta .separator {
  color: #ccc;
}

.item-meta .quantity {
  color: #666;
}

.item-meta .pieces {
  color: #999;
  font-size: 12px;
}

.item-revenue {
  text-align: right;
  flex-shrink: 0;
  margin-left: 12px;
}

.revenue-amount {
  font-size: 16px;
  font-weight: 700;
  color: #007bff;
  margin-bottom: 2px;
}

.revenue-label {
  font-size: 11px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Category Grid */
.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
}

.category-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  border-color: #007bff;
}

.category-icon {
  width: 45px;
  height: 45px;
  flex-shrink: 0;
}

.category-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.category-info {
  flex: 1;
  text-align: left;
}

.category-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.category-stats {
  font-size: 11px;
  color: #666;
  margin-bottom: 6px;
}

.category-stats .stat-value {
  font-weight: 700;
  color: #007bff;
  font-size: 14px;
}

.category-stats .stat-label {
  color: #999;
  margin-left: 2px;
}

.category-stats .pieces-info {
  display: inline;
  font-size: 10px;
  color: #999;
  margin-left: 4px;
}

.category-revenue {
  font-size: 16px;
  font-weight: 700;
  color: #28a745;
  margin-top: 2px;
}

/* Payment Methods List */
.payment-list {
  padding: 8px 0;
}

.payment-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  transition: background-color 0.2s;
}

.payment-item:last-child {
  border-bottom: none;
}

.payment-item:hover {
  background-color: #f8f9fa;
}

.payment-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.payment-icon img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.payment-details {
  flex: 1;
  min-width: 0;
}

.payment-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 3px;
}

.payment-count {
  font-size: 12px;
  color: #999;
}

.payment-revenue {
  text-align: right;
  flex-shrink: 0;
  margin-left: 12px;
}

.payment-revenue .revenue-amount {
  font-size: 15px;
  font-weight: 700;
  color: #007bff;
}

/* Employee List */
.employee-list {
  padding: 8px 0;
}

.employee-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  transition: background-color 0.2s;
}

.employee-item:last-child {
  border-bottom: none;
}

.employee-item:hover {
  background-color: #f8f9fa;
}

.employee-avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  margin-right: 12px;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.employee-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.employee-details {
  flex: 1;
  min-width: 0;
}

.employee-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 3px;
}

.employee-label {
  font-size: 11px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.employee-revenue {
  text-align: right;
  flex-shrink: 0;
  margin-left: 12px;
}

.employee-revenue .revenue-amount {
  font-size: 15px;
  font-weight: 700;
  color: #28a745;
}

</style>
