<template>
    <AccountTop />
    <div class="card border-0">
        <div class="card-body">
            <div class="row" v-if="!store.state.isUserLoggedIn" @click="router.push('/login')"> <AccountMenu menu="Sign in" iconName="login"/> </div>
    
            <!-- <div class="row mt-3">
                <div class="col-md-12 fw-bold fs-5">
                    <span>General</span>
                </div>
            </div>
            <div class="row"><AccountMenu menu="My interest" iconName="medal-outline"/></div> -->
    
            <div v-if="store.state.isUserLoggedIn">
                <div class="row mt-3">
                    <div class="col-md-12 fw-bold fs-5">
                        <span>Administrator</span>
                    </div>
                </div>
                <div v-if="store.state.isUserAdmin">
                    <div class="row ripple" @click="gotoAddSupplier"><AccountMenu menu="Add Supplier" iconName="face-agent"/></div>
                    <div class="row ripple" @click="gotoAddPurchase"><AccountMenu menu="Add Purchase Order" iconName="button-pointer"/></div>
                    <div class="row ripple" @click="gotoAddProducts"><AccountMenu menu="Add Products" iconName="feather"/></div>
                    <div class="row ripple" @click="gotoAddIngredient"><AccountMenu menu="Add Ingredient" iconName="food-outline"/></div>
                    <div class="row ripple" @click="gotoAddPackaging"><AccountMenu menu="Add Packaging" iconName="package-variant"/></div>
                    <div class="row ripple" @click="gotoAddRecipe"><AccountMenu menu="Add Recipe" iconName="bowl-mix-outline"/></div>
                    <div class="row ripple" @click="gotoAddExpense"><AccountMenu menu="Add Expense" iconName="bowl-mix-outline"/></div>
                </div>
            </div>
    
            <div v-if="store.state.isUserLoggedIn">
                <div class="row mt-3">
                    <div class="col-md-12 fw-bold fs-5">
                        <span>Settings</span>
                    </div>
                </div>
                <div class="row ripple" @click="gotoListAccount" v-if="store.state.isUserAdmin"><AccountMenu menu="List Accounts" iconName="account-cog-outline"/></div>
                <div class="row ripple" @click="gotoAccountDetails"><AccountMenu menu="Account" iconName="account-cog-outline"/></div>
                <div class="row ripple" v-if="store.state.isUserAdmin" @click="gotoSalesGoals"><AccountMenu menu="Sales Goals" iconName="target-account"/></div>
            </div>
    
    
            <!-- <div class="row mt-3">
                <div class="col-md-12 fw-bold fs-5">
                    <span>Resources</span>
                </div>
            </div>
            <div class="row"><AccountMenu menu="Become a service dealer" iconName="archive-star-outline"/></div>
            <div class="row"><AccountMenu menu="Support" iconName="lifebuoy"/></div>
            <div class="row"><AccountMenu menu="Privacy Policy" iconName="lock-outline"/></div> -->

        </div>
    
    </div>
    </template>
    
    <script>
    import { provide } from 'vue'
    import { useRouter } from 'vue-router'
    import store from '@/store'
    import AccountTop from '@/components/Accounts/AccountTop.vue'
    import AccountMenu from '@/components/Accounts/AccountMenu.vue'
    
    export default {
        name: "AccountWeb",
        components: {
            AccountTop,
            AccountMenu
        },
        setup () {
            const router = useRouter()
            provide('store', store)
    
            const gotoAddSupplier = () => {
                setTimeout(() => {
                    router.push('/addSupplier')
                }, 400)
            }
            const gotoAddPurchase = () => {
                setTimeout(() => {
                    router.push('/addPurchase')
                }, 400)
            }
            const gotoAddPackaging = () => {
                setTimeout(() => {
                    router.push('/addPackaging')
                }, 400)
            }
            const gotoAddIngredient = () => {
                setTimeout(() => {
                    router.push('/addIngredient')
                }, 400)
            }
            const gotoAddProducts = () => {
                setTimeout(() => {
                    router.push('/addProduct')
                }, 400)
            }
            const gotoAddRecipe = () => {
                setTimeout(() => {
                    router.push('/addRecipe')
                }, 400)
            }
            const gotoAccountDetails = () => {
                setTimeout(() => {
                    router.push('/accountDetails')
                }, 400)
            }
            const gotoAddExpense = () => {
                setTimeout(() => {
                    router.push('/addExpense')
                }, 400)
            }
            const logout = async () => {
                store.methods.logoutUser()
                FB.logout(function(reponse) {
                    console.log("FB Logout")
                })
                // googleLogout()
                // const device = await Device.getInfo()
                // if (device.platform === 'android') {
                //     GoogleAuth.signOut()
                // }
                router.push('/')
            }

            const gotoListAccount = () => {
                
                setTimeout(() => {
                    router.push('/listAccounts')
                }, 400)
            }

            const gotoSalesGoals = () => {
                setTimeout(() => {
                    router.push('/settings/sales-goals')
                }, 400)
            }

            return {
                store,
                router,
                gotoAddProducts,
                logout,
                gotoAddIngredient,
                gotoAddPackaging,
                gotoAddRecipe,
                gotoAccountDetails,
                gotoAddPurchase,
                gotoAddSupplier,
                gotoAddExpense,
                gotoListAccount,
                gotoSalesGoals
                
            }
        }
    }
    </script>
    
    <style scoped>
    .profile {
        display: grid;
        grid-template-columns: 30% 70%;
        justify-content: space-between;
    }
    </style>
