<template>
    <form @submit.prevent="saveSupplier">
    <div class="card border-0 home-container">
        <!-- New UI starts here -->
        <div class="card-body home-inner">

            <div class="row">
                <div class="col-md-1"></div>
                <div class="col-md-10  d-flex flex-row justify-content-between align-items-center">
                    <div class="d-flex flex-row justify-content-start align-items-center">
                        <mdicon name="arrow-left" @click="router.go(-1)" size="30"/>
                        <span class="ms-3 fw-bold">Suppliers</span>
                    </div>
                </div>
                <div class="col-md-1"></div>
            </div>
            <hr>
            <div class="row mt-4">
                <div class="col-md-1"></div>
                <div class="col-md-10 d-flex flex-column justify-content-start">
                    <span style="font-size: 12px; text-align: left;">Supplier Name</span>
                    <input type="text" class="service-form form-control lh-1"
                        placeholder=""
                        v-model="supplierInfo.name"
                        ref="nameInput"
                        required/>
                </div>
                <div class="col-md-1"></div>
            </div>
            <div class="row mt-3">
                <div class="col-md-1"></div>
                <div class="col-md-10 d-flex flex-column justify-content-start">
                    <span style="font-size: 12px; text-align: left;">Contact Number</span>
                    <input type="tel" class="service-form form-control lh-1" placeholder="" v-model="supplierInfo.contact_no" @input="formattedContactNum(supplierInfo.contact_no)" maxlength="13" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}|[0-9]{4}-[0-9]{3}-[0-9]{4}" required/>
                </div>
                <div class="col-md-1"></div>
            </div>
            <div class="row mt-3">
                <div class="col-md-1"></div>
                <div class="col-md-10 d-flex flex-column justify-content-start">
                    <span style="font-size: 12px; text-align: left;">Address</span>
                    <input type="text" class="service-form form-control lh-1" placeholder="" v-model="supplierInfo.address" required/>
                </div>
                <div class="col-md-1"></div>
            </div>

            <!-- // Save button here -->
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
                    <table class="table table-striped tight-table">
                        <thead class=thead-dark>
                            <tr>
                                <th>Name</th>
                                <th>Contact#</th>
                                <th>Address</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody >
                            <tr v-for="item in paginatedData" :key="item.id">

                                <td>{{item.name}}</td>
                                <td>{{item.contact_info}}</td>
                                <td>{{item.address}}</td>
                                <td class="text-center text-danger" @click="gotoEdit(item.id)"><mdicon name="text-box-edit-outline" size="25" ></mdicon></td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <!-- pagination part -->
                    <Pagination
                        :currentPage="currentPage"
                        :itemsPerPage="itemsPerPage"
                        :numberOfEntries="filteredSupplier?.length || 0"
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
import { useRouter, useRoute } from 'vue-router'
import Modal from '@/components/Modal.vue'
import Loading from '@/components/Loading.vue'
import getProfile from '@/composables/getProfile'
import addSupplier from '@/composables/supplier/addSupplier'
import getAllSupplier from '@/composables/supplier/getAllSupplier'
import getSupplierById from '@/composables/supplier/getSupplierById'
import editSupplier from '@/composables/supplier/editSupplier'
import store from '@/store'
import Pagination from '@/components/Table/Pagination.vue'
import TableTopMenu from '@/components/Table/TableTopMenu.vue'
import { objectEntries } from '@vueuse/core'

export default {
    name: "AddPurchaseMobile",
    components: {
        Modal,
        Loading,
        Pagination,
        TableTopMenu
    },
    setup() {
        const modalActive = ref(false)
        const router = useRouter()
        const route = useRoute()
        const loading = ref(false)
        const user = ref(null)
        const isEdit = ref(false)
        const supplierInfo = ref({
            id: 0,
            name: '',
            contact_no: '',
            address: '',
        })
        const listSupplier = ref()

        const userToken = localStorage.getItem('token')
        const toggleModal = () => {
            modalActive.value = !modalActive
        }
        const searchQuery = ref('')
        const currentPage = ref(1)
        const itemsPerPage = ref(10)
        const nameInput = ref(null)

        // Required for the table functionality
        provide('store', store)

        onMounted(() => {
            nameInput?.value.focus()
        })
        onBeforeMount(async() => {
            loading.value = true
            const resp = await getAllSupplier(userToken)

            if (resp.error.value === null) {
                listSupplier.value = resp.response.value
            }
            loading.value = false
        })

        const saveSupplier = async() => {
            if (isEdit.value) {
                loading.value = true;
                const {response, error} = await editSupplier(supplierInfo.value, userToken)
                loading.value = false
                if (error.value === null) {
                    router.go(0)
                }
            } else {
                loading.value = true;
                const {response, error} = await addSupplier(supplierInfo.value, userToken)
                loading.value = false
                if (error.value === null) {
                    router.go(0)
                }
            }
        }

        const formattedContactNum = (num) => {
            // Automatically add - after 4th and 8th character.
            if (num.length === 4 || num.length === 8) {
                supplierInfo.value.contact_no += '-'
            }
        }

        // Reset to first page when itemsPerPage changes
        watch(itemsPerPage, () => {
            currentPage.value = 1
        })
        const paginatedData = computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage.value
            const end = start + itemsPerPage.value

            return filteredSupplier.value?.slice(start, end) || []
        })

        const totalPages = computed(() => {
            return Math.ceil((listSupplier.value?.length || 0) / itemsPerPage.value)
        })
        
        // Search Implementation
        const filteredSupplier = computed(() => {
            
            if (!listSupplier.value) return []
            if (!searchQuery.value) return listSupplier.value

            const query = searchQuery.value.toLowerCase();
            return listSupplier.value.filter(supplier =>
                (supplier.name || '').toLowerCase().includes(query) ||
                (supplier.contact_info || '').toLowerCase().includes(query) ||
                (supplier.address || '').toLowerCase().includes(query)
            );
        })

        const gotoEdit = (id) => {
            getSupplierById(id, userToken)
            .then((supplier) => {
                if (supplier.error.value === null) {
                    supplierInfo.value.id = supplier.response.value.id
                    supplierInfo.value.name = supplier.response.value.name
                    supplierInfo.value.contact_no = supplier.response.value.contact_info
                    supplierInfo.value.address = supplier.response.value.address
                }
                isEdit.value = true
            })
        }
        return {
            router,
            toggleModal,
            modalActive,
            loading,
            user,
            supplierInfo,
            saveSupplier,
            listSupplier,
            formattedContactNum,
            filteredSupplier,
            totalPages,
            itemsPerPage,
            currentPage,
            searchQuery,
            paginatedData,
            gotoEdit,
            isEdit,
            nameInput
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