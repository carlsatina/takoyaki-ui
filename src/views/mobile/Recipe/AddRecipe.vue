<template>
    <form @submit.prevent="saveRecipe">
    <div class="card border-0 home-container">
        <!-- New UI starts here -->
        <div class="card-body home-inner">

            <div class="row">
                <div class="col-md-1"></div>
                <div class="col-md-10  d-flex flex-row justify-content-between align-items-center">
                    <div class="d-flex flex-row justify-content-start align-items-center">
                        <mdicon name="arrow-left" @click="router.go(-1)" size="30"/>
                        <span class="ms-3 fw-bold">Recipes</span>
                    </div>
                </div>
                <div class="col-md-1"></div>
            </div>
            <hr>
            <div class="row mt-4">
                <div class="col-md-1"></div>
                <div class="col-md-10 d-flex flex-column justify-content-start">
                    <span style="font-size: 12px; text-align: left;">Recipe Name</span>
                    <input type="text" class="service-form form-control lh-1"
                        placeholder=""
                        v-model="recipeInfo.name"
                        ref="nameInput"
                        required/>
                </div>
                <div class="col-md-1"></div>
            </div>
            <div class="row mt-3">
                <div class="col-md-1"></div>
                <div class="col-md-10 d-flex flex-column justify-content-start">
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <span style="font-size: 12px; text-align: left;">Ingredients</span>
                        <span style="font-size: 12px; text-align: center; flex: 1;">Quantity Per Order</span>
                    </div>
                    <div class="d-flex flex-row justify-content-start" v-for="(item, index) in ingredientsUsed">
                        <div class="input-group mt-1 ms-1">
                            <select class="form-select" aria-label="Default select example" v-model="item.id">
                                <option :value="ing.id" v-for="ing in listIngredients">{{ ing.name }}</option>
                            </select>
                            <input
                                type="number"
                                class="form-control"
                                :placeholder="quantityPlaceholder(item.id)"
                                v-model="item.quantity"
                                step=".001"
                                required
                            />
                            <button class="btn btn-danger btn-sm" type="button" @click="removeIngredient(index)">
                                <mdicon name="minus" size="15"/>
                            </button>
                            <button class="btn btn-secondary btn-sm" type="button" @click="addIngredientRow">
                                <mdicon name="plus" size="15"/>
                            </button>
                        </div>
                    </div>

                </div>
                <div class="col-md-1"></div>
            </div>
            <div class="row mt-4 mb-4">
                <div class="col-md-1"></div>
                <div class="col-md-10 d-flex flex-row justify-content-center">
                    <button type="submit" class="btn btn-secondary shadow-sm w-100">Save</button>
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
                    <table class="table tight-table">
                        <thead>
                        <tr>
                            <th>Recipe Name</th>
                            <th>Ingredients per Order</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(recipe, index) in paginatedData" :key="index">
                            <td>{{ recipe.name }}</td>
                            <td>
                            <ul>
                                <li v-for="(item, idx) in recipe.recipe_items" :key="idx">
                                {{ item.ingredient.name }} - {{ item.quantity }} {{ item.ingredient.unit }}
                                </li>
                            </ul>
                            </td>
                            <td><a href='#' disabled style='text-decoration:none;'>Edit</a></td>
                        </tr>
                        </tbody>
                    </table>

                    <!-- pagination part -->
                    <Pagination
                        :currentPage="currentPage"
                        :itemsPerPage="itemsPerPage"
                        :numberOfEntries="filteredRecipe?.length || 0"
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
import { ref, provide, onBeforeMount,computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import Loading from '@/components/Loading.vue'
import getProfile from '@/composables/getProfile'
import addRecipe from '@/composables/recipe/addRecipe'
import getAllRecipe from '@/composables/recipe/getAllRecipe'
import getAllIngredient from '@/composables/ingredients/getAllIngredient'
import store from '@/store'
import Pagination from '@/components/Table/Pagination.vue'
import TableTopMenu from '@/components/Table/TableTopMenu.vue'

export default {
    name: "AddRecipeWeb",
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
        const recipeInfo = ref({
            name: ''
        })

        const ingredientsUsed = ref([{
            id: 1,
            quantity: null
        }])
        const listRecipe = ref()
        const listIngredients = ref()

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
            nameInput?.value.focus()
        })
        onBeforeMount(async() => {
            loading.value = true
            const { response, error } = await getProfile(userToken)
            loading.value = false
            if (error.value === null) {
                user.value = response.value.userInfo
            }

            const ingredients = await getAllIngredient(userToken)

            if (ingredients.error.value === null) {
                listIngredients.value = ingredients.response.value
            }

            const recipes = await getAllRecipe(userToken)
            if (recipes.error.value === null) {
                listRecipe.value = recipes.response.value
            }
        })

        const saveRecipe = async() => {
            if (isEdit.value) {
                console.log("Editing product");
            } else {
                loading.value = true;

                console.log("Ingredients: ", ingredientsUsed.value)
                console.log("Recipe: ", recipeInfo.value)
                const {response, error} = await addRecipe(recipeInfo.value, ingredientsUsed.value, userToken)
                loading.value = false
                if (error.value === null) {
                    router.go(0)
                }
            }
        }

        // Add/remove Ingredients row will populate the ingredients field when pressing + / - button.
        const addIngredientRow = () => {
            ingredientsUsed.value.push({id: 0, quantity: 0})
        }
        const removeIngredient = (index) => {
            if (ingredientsUsed.value.length > 1) {
                ingredientsUsed.value.splice(index, 1)
            }
        }
        // Reset to first page when itemsPerPage changes
        watch(itemsPerPage, () => {
            currentPage.value = 1
        })
        const paginatedData = computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage.value
            const end = start + itemsPerPage.value

            return filteredRecipe.value?.slice(start, end) || []
        })

        const totalPages = computed(() => {
            return Math.ceil((listRecipe.value?.length || 0) / itemsPerPage.value)
        })
        
        // Search Implementation
        const filteredRecipe = computed(() => {
            if (!listRecipe.value) return []
            if (!searchQuery.value) return listRecipe.value

            const keyword = searchQuery.value.toLowerCase()

            return listRecipe.value.filter(recipe => {
                const recipeName = recipe.name?.toLowerCase() || ''
                const ingredients = recipe.recipe_items?.map(
                    item => item.ingredient?.name?.toLowerCase()
                ).join(' ') || ''

                return recipeName.includes(keyword) || ingredients.includes(keyword)
            })
        })

        const quantityPlaceholder = (id) => {
            const ing = (listIngredients.value || []).find((i) => i.id === id)
            const unit = ing?.unit || ''
            return unit ? `Quantity per order (${unit})` : 'Quantity per order'
        }

        return {
            router,
            toggleModal,
            modalActive,
            loading,
            user,
            recipeInfo,
            saveRecipe,
            listRecipe,
            listIngredients,
            ingredientsUsed,
            addIngredientRow,
            removeIngredient,
            paginatedData,
            currentPage,
            itemsPerPage,
            totalPages,
            filteredRecipe,
            searchQuery,
            nameInput,
            quantityPlaceholder
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
