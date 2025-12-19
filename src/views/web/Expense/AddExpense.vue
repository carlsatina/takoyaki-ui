<template>
    <form @submit.prevent="saveExpense">
    <div class="card border-0 home-container">
        <!-- New UI starts here -->
        <div class="card-body home-inner">

            <div class="row">
                <div class="col-md-1"></div>
                <div class="col-md-10  d-flex flex-row justify-content-between align-items-center">
                    <div class="d-flex flex-row justify-content-start align-items-center">
                        <mdicon name="arrow-left" @click="router.go(-1)" size="30"/>
                        <span class="ms-3 fw-bold">Expense</span>
                    </div>
                </div>
                <div class="col-md-1"></div>
            </div>
            <hr>

            <div class="row mt-4">
                <div class="col-md-1"></div>
                <div class="col-md-10 d-flex flex-column justify-content-start">
                    <span style="font-size: 12px; text-align: left;">Purchase Date (mm-dd-yyyy)</span>
                    <flat-pickr
                        
                        :model-value="expenseInfo.expense_date"
                        :config="config"
                        @update:model-value="val => expenseInfo.expense_date = val"
                        class="form-control"
                        placeholder="Select date"
                        name="purchase-date"></flat-pickr>
                    
                </div>
                <div class="col-md-1"></div>
            </div>
            <div class="row mt-4">
                <div class="col-md-1"></div>
                <div class="col-md-10 d-flex flex-column justify-content-start">
                    <span style="font-size: 12px; text-align: left;">Description</span>
                    <input type="text" class="service-form form-control lh-1"
                        placeholder=""
                        v-model="expenseInfo.description"
                        ref="descInput"
                        required/>
                </div>
                <div class="col-md-1"></div>
            </div>
            <!-- <div class="row mt-3">
                <div class="col-md-2"></div>
                <div class="col-md-8 d-flex flex-column justify-content-start">
                    <span style="font-size: 12px; text-align: left;">Upload Image</span>
                    <input type="text" class="service-form form-control lh-1" placeholder="" required/>
                </div>
                <div class="col-md-2"></div>
            </div> -->
            <div class="row mt-3">
                <div class="col-md-1"></div>
                <div class="col-md-10 d-flex flex-column justify-content-start">
                    <span style="font-size: 12px; text-align: left;">Cost</span>
                    <input type="number" class="service-form form-control lh-1" placeholder="" v-model="expenseInfo.cost" required/>
                </div>
                <div class="col-md-1"></div>
            </div>
            <div class="row mt-4 mb-4">
                <div class="col-md-1"></div>
                <div class="col-md-10 d-flex flex-row justify-content-center">
                    <button type="submit" 
                    class="shadow-sm w-100"
                    :class="isEdit ? 'btn btn-warning' : 'btn btn-success'"
                    >
                        {{isEdit ? 'Edit' : 'Save' }}
                    </button>
                </div>
                <div class="col-md-1"></div>
            </div>
            <hr>
            <div class="row mt-4">
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
                    <table class="table table-striped">
                        <thead class=thead-dark>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th class="text-center">Cost</th>
                                <th class="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody >
                            <tr v-for="item in paginatedData" :key="item.id">

                                <td>{{formatDate(item.expense_date)}}</td>
                                <td>{{item.description}}</td>
                                <td class="text-center">{{item.cost}}</td>
                                <td class="text-center text-danger" @click="gotoEdit(item.id)"><mdicon name="text-box-edit-outline" size="25" ></mdicon></td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <!-- pagination part -->
                    <Pagination
                        :currentPage="currentPage"
                        :itemsPerPage="itemsPerPage"
                        :numberOfEntries="filteredExpense?.length || 0"
                        :totalPages="totalPages"
                        @update-page="currentPage = $event"
                    />
                </div>
                <div class="col-md-1"></div>
            </div>
        </div>
        <!-- New UI ends here -->

    </div>
    </form>
    <!-- Loading Modal -->
    <Loading v-if="loading"/>
</template>

<script>
import { ref, provide, onBeforeMount, watch, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import Loading from '@/components/Loading.vue'
import getProfile from '@/composables/getProfile'
import addExpense from '@/composables/expense/addExpense'
import getAllExpense from '@/composables/expense/getAllExpense'
import getExpenseById from '@/composables/expense/getExpenseById'
import editExpense from '@/composables/expense/editExpense'
import store from '@/store'
import Pagination from '@/components/Table/Pagination.vue'
import TableTopMenu from '@/components/Table/TableTopMenu.vue'
import FlatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';

export default {
    name: "AddExpenseWeb",
    components: {
        Modal,
        Loading,
        Pagination,
        TableTopMenu,
        FlatPickr
    },
    setup() {
        const modalActive = ref(false)
        const router = useRouter()
        const loading = ref(false)
        const user = ref(null)
        const isEdit = ref(false)
        const expenseInfo = ref({
            id: 0,
            expense_date: new Date(),
            description: '',
            cost: 0
        })
        const listExpense = ref([])

        const userToken = localStorage.getItem('token')
        const toggleModal = () => {
            modalActive.value = !modalActive
        }
        const searchQuery = ref('')
        const currentPage = ref(1)
        const itemsPerPage = ref(10)
        const descInput = ref(null)

        provide('store', store)

        onMounted(() => {
            descInput?.value.focus()
        })
        onBeforeMount(async() => {
            loading.value = true

            const resp = await getAllExpense(userToken)
            if (resp.error.value === null) {
                listExpense.value = resp.response.value
            }
            loading.value = false
        })

        const saveExpense = async() => {
            if (isEdit.value) {
                loading.value = true;
                const {response, error} = await editExpense(expenseInfo.value, userToken)
                loading.value = false
                if (error.value === null) {
                    router.go(0)
                }
            } else {
                loading.value = true;
                const {response, error} = await addExpense(expenseInfo.value, userToken)
                loading.value = false
                if (error.value === null) {
                    router.go(0)
                }
            }
        }
        
        const config = ref({
            altInput: true,
            altFormat: "m-d-Y",
            dateFormat: "m-d-Y",
        });

        
        // Reset to first page when itemsPerPage changes
        watch(itemsPerPage, () => {
            currentPage.value = 1
        })
        const paginatedData = computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage.value
            const end = start + itemsPerPage.value

            return filteredExpense.value?.slice(start, end) || []
        })

        const totalPages = computed(() => {
            return Math.ceil((listExpense.value?.length || 0) / itemsPerPage.value)
        })
        
        // Search Implementation
        const filteredExpense = computed(() => {
            
            if (!listExpense.value) return []
            if (!searchQuery.value) return listExpense.value

            const query = searchQuery.value.toLowerCase();
            return listExpense.value.filter(expense =>
                (expense.description || '').toLowerCase().includes(query)
            );
        })

        const gotoEdit = (id) => {
            getExpenseById(id, userToken)
            .then((expense) => {
                console.log("expense: ", expense.response.value.id)
                if (expense.error.value === null) {
                    expenseInfo.value.id = expense.response.value.id
                    expenseInfo.value.expense_date = expense.response.value.expense_date
                    expenseInfo.value.description = expense.response.value.description
                    expenseInfo.value.cost = expense.response.value.cost
                }
                isEdit.value = true
            })
        }

        const formatDate = (date) => {

            // return new Date(date).toISOString().split('T')[0]
            const d = new Date(date)
            const result = String(d.getMonth()+1).padStart(2, '0')  + "-" + String(d.getDate()).padStart(2, '0') + "-" + d.getFullYear()
            return result
        }

        return {
            router,
            toggleModal,
            modalActive,
            loading,
            expenseInfo,
            saveExpense,
            listExpense,
            itemsPerPage,
            currentPage,
            totalPages,
            searchQuery,
            filteredExpense,
            paginatedData,
            gotoEdit,
            isEdit,
            config,
            formatDate,
            descInput
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