<template>
    <form @submit.prevent="saveProduct">
    <div class="card border-0 home-container" @scroll="onScroll">
        <!-- New UI starts here -->
        <div class="card-body home-inner">

            <div class="row">
                <div class="col-md-1"></div>
                <div class="col-md-10  d-flex flex-row justify-content-between align-items-center">
                    <div class="d-flex flex-row justify-content-start align-items-center">
                        <mdicon name="arrow-left" @click="router.go(-1)" size="30"/>
                        <span class="ms-3 fw-bold">Products</span>
                    </div>
                </div>
                <div class="col-md-1"></div>
            </div>
            <hr>
            <div class="row mt-4">
                <div class="col-md-1"></div>
                <div class="col-md-10 d-flex flex-column justify-content-start">
                    <span style="font-size: 12px; text-align: left;">Product Name</span>
                    <!-- <input type="text" class="service-form form-control lh-1" placeholder="" v-model="productInfo.product_name" required/> -->
                    <select class="form-select" aria-label="Default select example" v-model="productInfo.recipe_id" @change="setProductName">
                        <option :value="ing.id" v-for="ing in listRecipes">{{ ing.name }}</option>
                    </select>
                </div>
                <div class="col-md-1"></div>
            </div>
            <div class="row mt-3">
                <div class="col-md-1"></div>
                <div class="col-md-10 d-flex flex-column justify-content-start">
                    <span style="font-size: 12px; text-align: left;">Category</span>
                    <div class="input-group mt-1" >
                        <select class="form-select form-select service-form" v-model="productInfo.category">
                            <option value="Select" selected>Select Sub Category</option>
                            <option value="Buko">Buko</option>
                            <option value="Takoyaki">Takoyaki</option>
                        </select>
                    </div>
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
                    <span style="font-size: 12px; text-align: left;">Selling price</span>
                    <input type="text" class="service-form form-control lh-1" placeholder="" v-model="productInfo.sell_price"/>
                </div>
                <div class="col-md-1"></div>
            </div>
            <div class="row mt-3">
                <div class="col-md-1"></div>
                <div class="col-md-10 d-flex flex-column justify-content-start">
                    <span style="font-size: 12px; text-align: left;">Cost</span>
                    <input type="text" class="service-form form-control lh-1" placeholder="" v-model="productInfo.cost"/>
                </div>
                <div class="col-md-1"></div>
            </div>

            <!-- // Box (Dine in & Takeout) Checkbox -->
            <div class="row mt-3">
                <div class="col-md-1"></div>
                <div class="col-md-10 d-flex flex-column justify-content-start">
                    <h6>Packaging</h6>
                    <div class="bottle-container">
                        <div class="form-check" v-for="item in boxPackage" :key="item.id">
                            <input class="form-check-input" type="checkbox" :value="item.id" :id="item.name" v-model="productPackaging">
                            <label class="form-check-label" :for="item.name">
                                {{item.name}}
                            </label>
                        </div>
                        <div></div>
                    </div>
                </div>
                <div class="col-md-1"></div>
            </div>

            <!-- // bottle Checkbox -->
            <div class="row mt-1">
                <div class="col-md-1"></div>
                <div class="col-md-10 d-flex flex-column justify-content-start">
                    <div class="bottle-container">
                        <div class="form-check" v-for="item in bottle" :key="item.id">
                            <input class="form-check-input" type="checkbox" :value="item.id" :id="item.name" v-model="productPackaging">
                            <label class="form-check-label" :for="item.name">
                                {{ item.name }}
                            </label>
                        </div>
                    </div>
                </div>
                <div class="col-md-1"></div>
            </div>

            <!-- // CUPS Checkbox -->
            <div class="row mt-1">
                <div class="col-md-1"></div>
                <div class="col-md-10 d-flex flex-column justify-content-start">
                    <div class="bottle-container">
                        <div class="form-check" v-for="item in cups" :key="item.id">
                            <input class="form-check-input" type="checkbox" :value="item.id" :id="item.name" v-model="productPackaging">
                            <label class="form-check-label" :for="item.name">
                                {{item.name}}
                            </label>
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
        </div>
        <!-- New UI ends here -->

    </div>
    </form>
    <!-- Loading Modal -->
    <Loading v-if="loading"/>
</template>

<script>
import { ref, provide, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import Loading from '@/components/Loading.vue'
import getProfile from '@/composables/getProfile'
import addProduct from '@/composables/products/addProduct'
import getAllRecipe from '@/composables/recipe/getAllRecipe'
import getAllPackaging from '@/composables/packaging/getAllPackaging'
import store from '@/store'

export default {
    name: "AddProductWeb",
    components: {
        Modal,
        Loading,
    },
    setup() {
        const services = ref(null)
        const modalActive = ref(false)
        const serviceDetails = ref(null)
        const filteredData = ref({})
        const router = useRouter()
        const viewResults = ref(false)
        const loading = ref(false)
        const user = ref(null)
        const isEdit = ref(false)
        const productInfo = ref({
            product_name: '',
            short_description: '',
            sell_price: 0,
            cost: 0,
            category: '',
            recipe_id: 0
        })

        const userToken = localStorage.getItem('token')
        const toggleModal = () => {
            modalActive.value = !modalActive
            serviceDetails.value = null
        }
        const listRecipes = ref()
        const listPackaging = ref()
        const boxPackage = ref()
        const bottle = ref()
        const cups = ref()
        const productPackaging = ref([])

        provide('store', store)

        onBeforeMount(async() => {
            loading.value = true
            const { response, error } = await getProfile(userToken)
            if (error.value === null) {
                user.value = response.value.userInfo
            }

            const recipes = await getAllRecipe(userToken)
            if (recipes.error.value === null) {
                listRecipes.value = recipes.response.value
            }

            const packaging = await getAllPackaging(userToken)
            if (packaging.error.value === null) {
                listPackaging.value = packaging.response.value

                boxPackage.value = listPackaging.value.filter(item => item.name.toLowerCase().includes('box'))
                bottle.value = listPackaging.value.filter(item => item.name.toLowerCase().includes('bottle'))
                cups.value = listPackaging.value.filter(item => item.name.toLowerCase().includes('cups'))
            }

            loading.value = false
        })

        const onScroll = ({target: {scrollTop, clientHeight, scrollHeight}}) => {
            if (scrollTop > 60) {
                store.methods.setSearchIcon(true)
            } else {
                store.methods.setSearchIcon(false)
            }
        }

        const saveProduct = async() => {
            if (isEdit.value) {
                console.log("Editing product");
            } else {
                loading.value = true;
                const {response, error} = await addProduct(productInfo.value, productPackaging.value, userToken)
                loading.value = false
                if (error.value === null) {
                    router.go(0)
                }
            }
        }

        const setProductName = () => {
            const recipe = listRecipes.value.find(item => item.id == productInfo.value.recipe_id)
            productInfo.value.product_name = recipe.name
        }
        return {
            router,
            services,
            toggleModal,
            modalActive,
            serviceDetails,
            filteredData,
            viewResults,
            loading,
            onScroll,
            user,
            productInfo,
            saveProduct,
            listRecipes,
            setProductName,
            boxPackage,
            bottle,
            cups,
            productPackaging
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

.box-container {
    display: grid;
    grid-template-columns: 50% 50%;
    justify-content:start;
}
.bottle-container {
    display: grid;
    grid-template-columns: 33% 33% 33%;
    justify-content:start;
}
</style>