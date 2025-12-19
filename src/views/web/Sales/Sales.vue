<template>
    <AccountTop />
    <div class="card border-0 view-container">
        <!-- New UI starts here -->
        <div>
            <div class="container">
                <div class="row p-3" v-if="productLists != null" style="gap: 3px;">
                    <div class="col-sm-2 card ripple p-2 ms-2 mt-2" @click="handleClick(item)" v-for="item in productLists" :key="item.product_id" :class="item.category==='Buko' ? 'bg-light' : 'bg-danger text-light'">
                        <span class="card-title fw-bold" style="font-size: 14px;">{{item.product_name}}</span>
                            <!-- <p class="text-muted">₱{{item.sell_price}}</p> -->
                    </div>
                </div>
            </div>
        </div>
        <div>
            <div class="container">
                <div class="row p-2">
                    <div class="col-sm-11 bg-light m-3 border rounded shadow">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <h6 class="card-title mb-0">Items</h6>
                                <div class="d-flex align-items-center gap-2">
                                    <h6 class="mb-0">{{currentDate}}</h6>
                                    <button class="btn btn-sm btn-outline-primary" @click="openModal" style="font-size: 11px; padding: 2px 8px;">
                                        <mdicon name="history" size="16"/>
                                    </button>
                                </div>
                                <input id="startDate" type="date" hidden/>
                            </div>
                            <div class="row" v-for="item in cartItems" :key="item.product_id" style="font-size: 13px;">
                                <div class="col-sm-10">{{item.product_name}} &ensp; x{{item.quantity}} &ensp; ₱({{ item.quantity * item.price }})</div>
                                <div class="col-sm-2 text-danger" @click="deleteItem(item)"><mdicon name="trash-can-outline" size="20"/></div>
                            </div>
                            <div class="solid-line"></div>
                            <div class="fw-bold text-success mt-1">
                                <h3>Total: ₱{{total - seniorDiscountAmount}}</h3>
                            </div>
                            <div class="solid-line"></div>
                            <div class="row">
                                <div class="col-sm-12 d-flex flex-column justify-content-start mt-2 mb-2">
                                    <div class="form-check" for="discount">
                                        <input class="form-check-input" type="checkbox" id="discount" v-model="hasDiscount" @change="handleDiscount">
                                        <label class="form-check-label" for="discount">
                                            Senior Discount
                                        </label>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <span style="font-size: 12px; text-align: left;">Payment Mode</span>
                                    <div class="input-group mt-1" >
                                        <select class="form-select form-select service-form" v-model="payment_mode">
                                            <option value="Cash" selected>Cash</option>
                                            <option value="GCash">G-Cash</option>
                                            <option value="FoodPanda">Food Panda</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <span style="font-size: 12px; text-align: left;">Dine Mode</span>
                                    <div class="input-group mt-1" >
                                        <select class="form-select form-select service-form" v-model="dine_mode">
                                            <option value="Dine-in" selected>Dine-in</option>
                                            <option value="Takeout">Takeout</option>
                                        </select>
                                    </div>
                                </div>
                                <!-- <div class="col-sm-6">
                                    <span style="font-size: 12px; text-align: left;">Cash Paid</span>
                                    <input type="number" class="form-control" placeholder="" v-model="cashPaid" @input="calculateChange"/>
                                </div>
                                <p></p>
                                <div class="col-sm-6 text-dark">
                                    <h3>Change: ₱{{change}}</h3>
                                </div> -->
                            </div>
                            <div class="row mt-2">
                                <button type="submit" class="btn btn-primary shadow-sm w-100" @click="handleSubmit">Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- New UI ends here -->

        <!-- Loading Modal -->
        <Loading v-if="loading"/>

        <!-- Last Sales Modal -->
        <div v-if="showLastSalesModal" class="modal-overlay" @click="showLastSalesModal = false">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h5 class="modal-title">Last 2 Sales</h5>
                    <button type="button" class="btn-close" @click="showLastSalesModal = false"></button>
                </div>
                <div class="modal-body">
                    <div v-if="lastSales.length === 0" class="text-center text-muted">
                        No recent sales found
                    </div>
                    <div v-else>
                        <div v-for="(sale, index) in lastSales" :key="sale.id" class="sale-item mb-3">
                            <div class="sale-header">
                                <strong>Sale #{{ sale.id }}</strong>
                                <span class="text-muted ms-2" style="font-size: 12px;">{{ formatDate(sale.date) }}</span>
                            </div>
                            <div class="sale-products mt-2">
                                <div v-for="item in sale.saleItems" :key="item.id" class="product-row">
                                    <span class="product-name">{{ item.product.product_name }}</span>
                                    <span class="product-qty">x{{ item.quantity }}</span>
                                    <span class="product-price">₱{{ item.unit_price }}</span>
                                    <span class="product-total">₱{{ (item.quantity * item.unit_price).toFixed(2) }}</span>
                                </div>
                            </div>
                            <div class="sale-total mt-2">
                                <strong>Total: ₱{{ sale.total.toFixed(2) }}</strong>
                            </div>
                            <hr v-if="index < lastSales.length - 1">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Loading from '@/components/Loading.vue'
import getProfile from '@/composables/getProfile'
import getAllProduct from '@/composables/products/getAllProduct'
import addSales from '@/composables/sales/addSales'
import getSales from '@/composables/sales/getSales'
import store from '@/store'
import AccountTop from '@/components/Accounts/AccountTop.vue'

export default {
    name: "SalesWeb",
    components: {
        Loading,
        AccountTop
    },
    setup() {
        const router = useRouter()
        const loading = ref(false)
        const productLists = ref(null);
        const cartItems = ref([])
        const total = ref(0)
        const currentDate = ref(new Date().toLocaleDateString());
        const payment_mode = ref('Cash')
        const dine_mode = ref('Dine-in')
        const hasDiscount = ref(false)
        const seniorDiscountAmount = ref(0);
        const showLastSalesModal = ref(false)
        const lastSales = ref([])

        const loadProfileAndRoute = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }
            store.methods.loginUser(token)
            const { response, error } = await getProfile(token)
            if (error.value !== null || !response.value?.userInfo) return

            const userInfo = response.value.userInfo
            store.methods.setUserAdmin(userInfo.is_admin)
            if (userInfo.is_admin) {
                router.push('/admin')
            } else if (userInfo.role === 'Guest') {
                store.methods.setUserGuest(true)
                router.push('/guest')
            } else {
                store.methods.setUserStaff(true)
            }
        }

        const loadProducts = async () => {
            const token = localStorage.getItem('token')
            if (!token) return
            const { response, error } = await getAllProduct(token)
            if (error.value === null) {
                productLists.value = response.value
            }
        }

        onMounted(async () => {
            loading.value = true
            await Promise.allSettled([loadProfileAndRoute(), loadProducts()])
            loading.value = false
        })

        const deleteItem = (param) => {
            let id = param.product_id

            const product = productLists.value.find(item => item.product_id === id)

            const index = cartItems.value.findIndex(item => item.product_id === id)
            if (index !== -1) {
                total.value -= product.price
                cartItems.value[index].quantity--

                if (cartItems.value[index].quantity === 0) {
                    cartItems.value.splice(index, 1)
                }
            }

        }

        const handleClick = (param) => {
            let id = param.product_id

            const index = cartItems.value.findIndex(item => item.product_id === id)

            if (index !== -1) {
                cartItems.value[index].quantity++
                total.value += param.price
            } else {
                cartItems.value.push({
                    product_id: id,
                    product_name: param.product_name,
                    quantity: 1,
                    price: param.price
                })
                total.value += param.price
            }
        }

        // const calculateChange = (event) => {
        //     let value = parseFloat(event.target.value)

        //     change.value = value - total.value
        // }

        const handleSubmit = async () => {
            loading.value = true
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                loading.value = false
                return
            }
            const { response, error } = await addSales(cartItems.value, (total.value - seniorDiscountAmount.value), payment_mode.value, dine_mode.value, token)
            if (error.value === null) {
                router.go(0)
            }
            loading.value = false
        }

        const handleDiscount = () => {
            if (hasDiscount.value === true) {
                // calculate 20% discount for senior citizen
                seniorDiscountAmount.value = total.value * 0.2
            } else {
                seniorDiscountAmount.value = 0
            }
        }

        const fetchLastSales = async () => {
            loading.value = true
            const token = localStorage.getItem('token')
            if (!token) {
                loading.value = false
                return
            }
            const { response, error } = await getSales(token, 2, true)
            if (error.value === null) {
                lastSales.value = response.value
            }
            loading.value = false
        }

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

        // Watch for modal opening to fetch data
        const openModal = async () => {
            showLastSalesModal.value = true
            await fetchLastSales()
        }

        return {
            router,
            loading,
            handleClick,
            productLists,
            cartItems,
            total,
            deleteItem,
            currentDate,
            handleSubmit,
            payment_mode,
            dine_mode,
            handleDiscount,
            hasDiscount,
            seniorDiscountAmount,
            showLastSalesModal,
            lastSales,
            formatDate,
            openModal
        }
    }
}
</script>

<style scoped>

@media (max-width: 768px) {
  .view-container {
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

.view-container {
    display: grid;
    grid-template-columns: 65% 35%;
    justify-content:start;
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

.solid-line {
  border-top: 1px solid #e0e0e0; /* Adjust color as needed */
  margin: 2px 0; /* Adjust spacing as needed */
  width: 100%;
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
  max-width: 500px;
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
  padding: 1rem;
  font-size: 13px;
}

.sale-item {
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 5px;
}

.sale-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.sale-products {
  margin-left: 10px;
}

.product-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 8px;
  padding: 4px 0;
  font-size: 12px;
}

.product-name {
  font-weight: 500;
}

.product-qty {
  text-align: center;
}

.product-price {
  text-align: right;
}

.product-total {
  text-align: right;
  font-weight: 600;
  color: #28a745;
}

.sale-total {
  text-align: right;
  padding-top: 8px;
  border-top: 1px solid #dee2e6;
  color: #28a745;
}
</style>
