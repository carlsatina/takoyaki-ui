<template>
    <div class="card border-0 home-container">
        <!-- New UI starts here -->
        <div class="card-body home-inner">

            <form @submit.prevent="savePurchase">
            <div class="row">
                <div class="col-md-1"></div>
                <div class="col-md-10  d-flex flex-row justify-content-between align-items-center">
                    <div class="d-flex flex-row justify-content-start align-items-center">
                        <mdicon name="arrow-left" @click="router.go(-1)" size="30"/>
                        <span class="ms-3 fw-bold">Purchase Order</span>
                    </div>
                </div>
                <div class="col-md-1"></div>
            </div>
            <hr>
            <div class="row mt-4">
                <div class="col-md-1"></div>
                <div class="col-md-10 d-flex flex-column justify-content-start">
                    <span style="font-size: 12px; text-align: left;">Purchase Date</span>
                    <!-- <datepicker
                        :full-month-name="true"
                        :hideInput="false"
                        @input="dateSelected"
                        :value="purchaseInfo.date"
                    /> -->
                    <flat-pickr
                        
                        :model-value="purchaseInfo.date"
                        @update:model-value="val => purchaseInfo.date = val"
                        :config="config"
                        class="form-control"
                        placeholder="Select date"
                        name="purchase-date"></flat-pickr>
                    
                </div>
                <div class="col-md-1"></div>
            </div>
            <div class="row mt-4">
                <div class="col-md-1"></div>
                <div class="col-md-10 d-flex flex-column justify-content-start">
                    <span style="font-size: 12px; text-align: left;">Invoice No.</span>
                    <input type="text" class="service-form form-control lh-1"
                        placeholder="Enter Invoice#"
                        v-model="purchaseInfo.invoice_no"
                        ref="invoiceInput"
                        required/>
                </div>
                <div class="col-md-1"></div>
            </div>
            <div class="row mt-3">
                <div class="col-md-1"></div>
                <div class="col-md-10 d-flex flex-column justify-content-start">
                    <span style="font-size: 12px; text-align: left;">Supplier Name</span>
                    <select class="form-select" aria-label="Default select example" v-model="purchaseInfo.supplier_id">
                        <option value="0" selected>Select Supplier</option>
                        <option :value="supplier.id" v-for="supplier in listSupplier">{{ supplier.name }}</option>
                    </select>
                </div>
                <div class="col-md-1"></div>
            </div>
            <!-- // List of Items to Purchase -->
            <div class="row mt-4 mb-4">
                <div class="col-md-1"></div>
                <div class="col-md-10">
                    <table class="table">
                        <thead class=thead-dark style="font-size: 14px;">
                            <tr>
                                <th>Category</th>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody >
                            <tr v-for="(item, index) in purchaseItems" :key="item.id">
                                <td style="width: 15%;">
                                    <!-- // Category -->
                                    <select class="form-select" aria-label="Default select example" v-model="item.category" @change="populateInventory(index, item.category)">
                                        <option value="Ingredient">Ingredient</option>
                                        <option value="Packaging">Packaging</option>
                                    </select>
                                </td>
                                <td style="width: 25%;">
                                    <!-- // Filtered Inventory -->
                                    <select class="form-select" aria-label="Default select example" v-model="item.ingredient_id" v-if="item.category === 'Ingredient'">
                                        <option :value="inventory.ingredient_id" v-for="inventory in item.item_array">{{ inventory.name }}</option>
                                    </select>
                                    <select class="form-select" aria-label="Default select example" v-model="item.packaging_id" v-else>
                                        <option :value="inventory.packaging_id" v-for="inventory in item.item_array">{{ inventory.name }}</option>
                                    </select>
                                </td>
                                <td style="width: 15%;">
                                    <!-- // Quantity purchased -->
                                    <input type="number" class="form-control" placeholder="Quantity" v-model="item.quantity" step=".001" required />
                                </td>
                                <td style="width: 15%;">
                                    <!-- // Price  -->
                                    <input type="number" class="form-control" placeholder="Price" v-model="item.price" step=".001" required />
                                </td>
                                <td class="align-items-center justify-content-center" style="width: 15%;">
                                    <!-- // Total  -->
                                    <span class="fw-bold">₱{{ item.price * item.quantity }}</span>
                                </td>
                                <td>
                                    <!-- // Actions -->
                                    <div class="d-flex flex-row">
                                        <button class="btn btn-danger btn-sm" type="button" @click="removePurchaseItems(index)">
                                            <mdicon name="minus" size="15"/>
                                        </button>
                                        <button class="btn btn-secondary btn-sm" type="button" @click="addPurchaseItemsRow">
                                            <mdicon name="plus" size="15"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="col-md-1"></div>
            </div>

            <!-- // Save  Button here -->
            <div class="row mt-4 mb-4">
                <div class="col-md-1"></div>
                <div class="col-md-10 d-flex flex-row justify-content-center">
                    <button type="submit" class="btn btn-secondary shadow-sm w-100">Save</button>
                </div>
                <div class="col-md-1"></div>
            </div>
            </form>
            <hr>
            <div class="row mt-4">
                <div class="col-md-1"></div>
                <div class="col-md-10">
                    <div class="mb-2 d-flex justify-content-between">
                        <div class="d-flex flex-row align-items-center">
                        <label for="entriesPerPage" class="me-2" style="font-size: 13px;">Show</label>
                        <select v-model.number="itemsPerPage" id="entriesPerPage" class="form-select form-select-sm me-3" style="width: auto;">
                            <option :value="5">5</option>
                            <option :value="10">10</option>
                            <option :value="25">25</option>
                            <option :value="50">50</option>
                        </select>
                        </div>
                        <input
                            v-model="searchQuery"
                            type="text"
                            class="form-control w-25"
                            placeholder="Search"
                        />
                    </div>
                    <table class="table table-striped tight-table">
                    <thead>
                        <tr>
                        <th>Purchase Date</th>
                        <th>Invoice #</th>
                        <th>Supplier</th>
                        <th>Items  (quantity * price) = total</th>
                        <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(purchase, index) in paginatedData" :key="index">
                        <td>{{ new Date(purchase.purchase_date).toLocaleDateString() }}</td>
                        <td>{{ purchase.invoice_number || 'N/A' }}</td>
                        <td>{{ purchase.supplier?.name || 'N/A' }}</td>
                        <td style="width: 40%;">
                            <ul>
                            <li
                                v-for="(item, idx) in purchase.items"
                                :key="idx"
                            >
                                {{ item.category === 'Ingredient'
                                ? item.ingredient?.name
                                : item.packaging?.name
                                }} - 
                                ({{ item.quantity }} * ₱{{ item.unit_price.toFixed(2) }}) =
                                ₱{{ item.total_price.toFixed(2) }}
                            </li>
                            </ul>
                        </td>
                        <td>
                            <a href='#' disabled style='text-decoration:none;'>Edit</a>
                        </td>
                        </tr>
                    </tbody>
                    </table>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <!-- pagination part -->
                        <div style="font-size: 13px;">
                            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to
                            {{ Math.min(currentPage * itemsPerPage, filteredPurchases?.length || 0) }} of
                            {{ filteredPurchases?.length || 0 }} entries
                        </div>
                        <div class="d-flex align-items-center">
                            <button
                                class="btn btn-sm btn-success me-1"
                                :disabled="currentPage === 1"
                                @click="currentPage--"
                            >
                                Prev
                            </button>
                            <button
                                class="btn btn-sm btn-primary"
                                :disabled="currentPage === totalPages"
                                @click="currentPage++"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-md-1"></div>
            </div>
        </div>
        <!-- New UI ends here -->

    </div>
    <!-- Loading Modal -->
    <Loading v-if="loading"/>
</template>

<script>
import { ref, provide, onBeforeMount, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import Loading from '@/components/Loading.vue'
import getProfile from '@/composables/getProfile'
import addPurchase from '@/composables/purchase/addPurchase'
import store from '@/store'
import getAllSupplier from '@/composables/supplier/getAllSupplier'
import getAllIngredient from '@/composables/ingredients/getAllIngredient'
import getAllPackaging from '@/composables/packaging/getAllPackaging'
import getAllInventory from '@/composables/inventory/getAllInventory'
import getAllPurchase from '@/composables/purchase/getAllPurchase'

import FlatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';


export default {
    name: "AddPurchaseMobile",
    components: {
        Modal,
        Loading,
        FlatPickr
    },
    setup() {
        const modalActive = ref(false)
        const router = useRouter()
        const loading = ref(false)
        const user = ref(null)
        const isEdit = ref(false)
        const purchaseInfo = ref({
            invoice_no: '',
            supplier_id: 0,
            date: new Date()
        })
        const listSupplier = ref()
        const listIngredient = ref()
        const listPackaging = ref()
        const listInventory = ref()
        const listPurchase = ref()

        const purchaseItems = ref([{
            category: "",
            item_array: []
        }])
        const searchQuery = ref('')
        const currentPage = ref(1)
        const itemsPerPage = ref(10)
        const invoiceInput = ref(null)



        const userToken = localStorage.getItem('token')
        const toggleModal = () => {
            modalActive.value = !modalActive
        }

        provide('store', store)

        onMounted(() => {
            invoiceInput?.value.focus()
        })
        onBeforeMount(async() => {
            loading.value = true
            const { response, error } = await getProfile(userToken)
            if (error.value === null) {
                user.value = response.value.userInfo
            }

            const suppliers = await getAllSupplier(userToken)
            if(suppliers.error.value === null) {
                listSupplier.value = suppliers.response.value
            }

            const packagings = await getAllPackaging(userToken)
            if (packagings.error.value === null) {
                listPackaging.value = packagings.response.value
            }

            const ingredients = await getAllIngredient(userToken)
            if (ingredients.error.value === null) {
                listIngredient.value = ingredients.response.value
            }

            const inventories = await getAllInventory(userToken)
            if (inventories.error.value === null) {
                listInventory.value = inventories.response.value
                purchaseItems.value[0].item_array = listInventory.value.filter(item => item.type === "Ingredients")
            }

            const purchases = await getAllPurchase(userToken)
            if (purchases.error.value === null) {
                listPurchase.value = purchases.response.value
            }
            loading.value = false

        })


        const savePurchase = async() => {
            if (isEdit.value) {
                console.log("Editing product");
            } else {
                loading.value = true;
                console.log("purchaseItems: ", purchaseItems.value)
                const {response, error} = await addPurchase(purchaseInfo.value, purchaseItems.value, userToken)
                loading.value = false
                if (error.value === null) {
                    router.go(0)
                }
            }
        }
        
        const populateInventory = (index, type) => {
            purchaseItems.value[index].item_array = listInventory.value.filter(item => item.type === type)
        }
        
        // Add/remove Purchase Items row will populate the Purcahse items field when pressing + / - button.
        const addPurchaseItemsRow = () => {
            purchaseItems.value.push(
                {
                    category: "",
                    item_array: ""
                }
            )
        }
        const removePurchaseItems = (index) => {
            if (purchaseItems.value.length > 1) {
                purchaseItems.value.splice(index, 1)
            }
        }
        
        // Read more at https://flatpickr.js.org/options/
        const config = ref({
            enableTime: true,
            altInput: true,
            altFormat: "m-d-Y",
            dateFormat: "m-d-Y",
        });

        watch(itemsPerPage, () => {
            currentPage.value = 1
        })
        const paginatedData = computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage.value
            const end = start + itemsPerPage.value

            return filteredPurchases.value?.slice(start, end) || []
        })

        const totalPages = computed(() => {
            return Math.ceil((listPurchase.value?.length || 0) / itemsPerPage.value)
        })

        // Search Implementation
        const filteredPurchases = computed(() => {
            if (!listPurchase.value) return []
            if (!searchQuery.value) return listPurchase.value

            const keyword = searchQuery.value.toLowerCase()

            return listPurchase.value.filter(purchase => {
                const supplierName = purchase.supplier?.name?.toLowerCase() || ''
                const invoiceNumber = purchase.invoice_number?.toLowerCase() || ''
                const itemNames = purchase.items?.map(item =>
                    item.category === 'Ingredient'
                        ? item.ingredient?.name?.toLowerCase()
                        : item.packaging?.name?.toLowerCase()
                ).join(' ') || ''
                
                return (
                    supplierName.includes(keyword) ||
                    invoiceNumber.includes(keyword) ||
                    itemNames.includes(keyword)
                )
            })
        })

        return {
            router,
            toggleModal,
            modalActive,
            loading,
            user,
            purchaseInfo,
            savePurchase,
            listSupplier,
            listIngredient,
            listPackaging,
            purchaseItems,
            listInventory,
            listPurchase,
            populateInventory,
            addPurchaseItemsRow,
            removePurchaseItems,
            config,
            paginatedData,
            currentPage,
            itemsPerPage,
            totalPages,
            filteredPurchases,
            searchQuery,
            invoiceInput
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
    height: 80vh;
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
