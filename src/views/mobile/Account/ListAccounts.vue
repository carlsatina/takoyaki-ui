<template>
    <div class="card border-0 home-container">
        <!-- New UI starts here -->
        <div class="card-body home-inner">

            <div class="card-title">
                <h4 class="text-center fw-bold">Accounts Lists</h4>
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
                                    <th style="width: 20%;">Full name</th>
                                    <th class="text-center">email</th>
                                    <th class="text-center">Role</th>
                                </tr>
                            </thead>
                            <tbody >
                                <tr v-for="item in paginatedData" :key="item.id">

                                    <td>{{item.full_name}}</td>
                                    <td class="text-center">{{item.email}}</td>
                                    <td class="text-center">

                                        <select class="form-select form-select service-form" 
                                            v-model="item.role"
                                            @change="updateUserRole(item.role, item.id)"
                                        >
                                            <option value="Select" selected>Select Role</option>
                                            <option value="Guest">Guest</option>
                                            <option value="Staff">Staff</option>
                                        </select>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <!-- pagination part -->
                        <Pagination
                            :currentPage="currentPage"
                            :itemsPerPage="itemsPerPage"
                            :numberOfEntries="filteredAccounts?.length || 0"
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

    <!-- <div v-else>
        loading...
    </div> -->
</template>

<script>
import { ref, provide, onBeforeMount, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import Loading from '@/components/Loading.vue'
import getAllAccounts from '@/composables/auth/getAllAccounts'
import editAccount from '@/composables/auth/editUser'
import store from '@/store'
import Pagination from '@/components/Table/Pagination.vue'
import TableTopMenu from '@/components/Table/TableTopMenu.vue'

export default {
    name: "ListInventoryMobile",
    components: {
        Loading,
        Pagination,
        TableTopMenu
    },
    setup() {
        const router = useRouter()
        const loading = ref(false)
        const user = ref(null)
        const listAccounts = ref();

        const userToken = localStorage.getItem('token')
        const searchQuery = ref('')
        const currentPage = ref(1)
        const itemsPerPage = ref(10)
        const userInfo = ref({
            id: 0,
            role: ''
        })

        if (!userToken) {
            router.push('/login')
        }

        provide('store', store)

        onBeforeMount(async() => {
            if (!store.state.isUserLoggedIn) {
                router.push('/login')
            }

            loading.value = true
            const { response, error } = await getAllAccounts(userToken)
            if (error.value === null) {
                listAccounts.value = response.value.userInfo
            }
            loading.value = false
        })

        // Reset to first page when itemsPerPage changes
        watch(itemsPerPage, () => {
            currentPage.value = 1
        })
        const paginatedData = computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage.value
            const end = start + itemsPerPage.value

            return filteredAccounts.value?.slice(start, end) || []
        })

        const totalPages = computed(() => {
            return Math.ceil((listAccounts.value?.length || 0) / itemsPerPage.value)
        })
        
        const filteredAccounts = computed(() => {
            
            if (!listAccounts.value) return []
            if (!searchQuery.value) return listAccounts.value

            const query = searchQuery.value.toLowerCase();
            return listAccounts.value.filter(inventory =>
                (inventory.name || '').toLowerCase().includes(query)
            );
        })

        const updateUserRole = async(role, id) => {
            userInfo.value.id = id
            userInfo.value.role = role
            // Call Edit user
            const {response, error} = await editAccount(userInfo.value, userToken)
            if (error.value === null) {
                alert(response.value.message)
                if (response.value.userInfo.role === 'Guest') {
                    store.methods.setUserGuest(true)
                } else {
                    store.methods.setUserStaff(true)
                }
            }
        }
        return {
            router,
            loading,
            user,
            listAccounts,
            itemsPerPage,
            currentPage,
            totalPages,
            searchQuery,
            paginatedData,
            filteredAccounts,
            updateUserRole,
            userInfo
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
</style>