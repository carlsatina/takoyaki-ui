<template>
    <form @submit.prevent="savePackaging">
    <div class="card border-0 home-container">
        <!-- New UI starts here -->
        <div class="card-body home-inner">

            <div class="row">
                <div class="col-md-1"></div>
                <div class="col-md-10  d-flex flex-row justify-content-between align-items-center">
                    <div class="d-flex flex-row justify-content-start align-items-center">
                        <mdicon name="arrow-left" @click="router.go(-1)" size="30"/>
                        <span class="ms-3 fw-bold">Packaging</span>
                    </div>
                </div>
                <div class="col-md-1"></div>
            </div>
            <hr>
            <div class="row mt-4">
                <div class="col-md-1"></div>
                <div class="col-md-10 d-flex flex-column justify-content-start">
                    <span style="font-size: 12px; text-align: left;">Packaging Name</span>
                    <input type="text" class="service-form form-control lh-1"
                        placeholder=""
                        v-model="packagingInfo.name"
                        ref="nameInput"
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
                    <span style="font-size: 12px; text-align: left;">Quantity per Product</span>
                    <input type="number" class="service-form form-control lh-1" placeholder="" v-model="packagingInfo.quantity" required/>
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
                                <th>Name</th>
                                <th class="text-center">Quantity per product</th>
                                <th class="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody >
                            <tr v-for="item in paginatedData" :key="item.id">

                                <td>{{item.name}}</td>
                                <td class="text-center">{{item.quantity}}</td>
                                <td class="text-center text-danger" @click="gotoEdit(item.id)"><mdicon name="text-box-edit-outline" size="25" ></mdicon></td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <!-- pagination part -->
                    <Pagination
                        :currentPage="currentPage"
                        :itemsPerPage="itemsPerPage"
                        :numberOfEntries="filteredPackaging?.length || 0"
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
import addPackaging from '@/composables/packaging/addPackaging'
import getAllPackaging from '@/composables/packaging/getAllPackaging'
import getPackagingById from '@/composables/packaging/getPackagingById'
import editPackaging from '@/composables/packaging/editPackaging'
import store from '@/store'
import Pagination from '@/components/Table/Pagination.vue'
import TableTopMenu from '@/components/Table/TableTopMenu.vue'
export default {
    name: "AddPackagingWeb",
    components: {
        Modal,
        Loading,
        Pagination,
        TableTopMenu
    },
    setup() {
        const modalActive = ref(false)
        const router = useRouter()
        const loading = ref(false)
        const user = ref(null)
        const isEdit = ref(false)
        const packagingInfo = ref({
            id: 0,
            name: '',
            quantity: 0
        })
        const listPackaging = ref([])

        const userToken = localStorage.getItem('token')
        const toggleModal = () => {
            modalActive.value = !modalActive
        }
        const searchQuery = ref('')
        const currentPage = ref(1)
        const itemsPerPage = ref(10)
        const nameInput = ref(null)

        provide('store', store)

        onMounted(() => {
            nameInput.value?.focus()
        })
        onBeforeMount(async() => {
            loading.value = true
            const { response, error } = await getProfile(userToken)
            loading.value = false
            if (error.value === null) {
                user.value = response.value.userInfo
            }

            const resp = await getAllPackaging(userToken)

            if (resp.error.value === null) {
                listPackaging.value = resp.response.value
            }
        })

        const savePackaging = async() => {
            if (isEdit.value) {
                loading.value = true;
                const {response, error} = await editPackaging(packagingInfo.value, userToken)
                loading.value = false
                if (error.value === null) {
                    router.go(0)
                }
            } else {
                loading.value = true;
                const {response, error} = await addPackaging(packagingInfo.value, userToken)
                loading.value = false
                if (error.value === null) {
                    router.go(0)
                }
            }
        }
        
        // Reset to first page when itemsPerPage changes
        watch(itemsPerPage, () => {
            currentPage.value = 1
        })
        const paginatedData = computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage.value
            const end = start + itemsPerPage.value

            return filteredPackaging.value?.slice(start, end) || []
        })

        const totalPages = computed(() => {
            return Math.ceil((listPackaging.value?.length || 0) / itemsPerPage.value)
        })
        
        // Search Implementation
        const filteredPackaging = computed(() => {
            
            if (!listPackaging.value) return []
            if (!searchQuery.value) return listPackaging.value

            const query = searchQuery.value.toLowerCase();
            return listPackaging.value.filter(packaging =>
                (packaging.name || '').toLowerCase().includes(query)
            );
        })

        const gotoEdit = (id) => {
            getPackagingById(id, userToken)
            .then((packaging) => {
                if (packaging.error.value === null) {
                    packagingInfo.value.id = packaging.response.value.id
                    packagingInfo.value.name = packaging.response.value.name
                    packagingInfo.value.quantity = packaging.response.value.quantity
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
            packagingInfo,
            savePackaging,
            listPackaging,
            itemsPerPage,
            currentPage,
            totalPages,
            searchQuery,
            filteredPackaging,
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