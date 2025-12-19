import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '@/views/LandingPage/Home.vue'

import store from '@/store'

// Connection
import NoConnection from '@/views/NoConnection.vue'

// Auth 
import Login from '@/views/LandingPage/Login.vue'
import Register from '@/views/LandingPage/Register.vue'

// Accounts
import Account from '@/views/LandingPage/Account.vue'
import AccountDetails from '@/views/LandingPage/AccountDetails.vue'
import Guest from '@/views/LandingPage/Guest.vue'
import ListAccounts from '@/views/LandingPage/ListAccounts.vue'

// Sales
import Sales from '@/views/LandingPage/Sales.vue'
import SalesByItem from '@/views/LandingPage/SalesByItem.vue'
import ListSaleItems from '@/views/LandingPage/ListSaleItems.vue'
import DailySales from '@/views/LandingPage/DailySales.vue'
import SalesSettings from '@/views/web/Settings/SalesSettings.vue'

// Product
import AddProduct from '@/views/LandingPage/AddProduct.vue'
import ListProduct from '@/views/LandingPage/ListProduct.vue'

// Ingredient & Recipe
import AddRecipe from '@/views/LandingPage/AddRecipe.vue'
import AddIngredient from '@/views/web/Ingredients/AddIngredient.vue'

// Packaging
import AddPackaging from '@/views/web/Packaging/AddPackaging.vue'

// Purchase
import AddPurchase from '@/views/LandingPage/AddPurchase.vue'

// Supplier
import AddSupplier from '@/views/LandingPage/AddSupplier.vue'

// Inventory
import ListInventory from '@/views/LandingPage/ListInventory.vue'

// Expense
import AddExpense from '@/views/LandingPage/AddExpense.vue'


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: Sales
  },
  {
    path: '/no-connection',
    name: 'noConnection',
    component: NoConnection
  },
  {
    path: '/admin',
    name: 'admin',
    component: Home
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  },

  // Account
  {
    path: '/account',
    name: 'account',
    component: Account
  },

  {
    path: '/accountDetails',
    name: 'accountDetails',
    component: AccountDetails
  },
  {
    path: '/guest',
    name: 'guest',
    component: Guest
  },
  {
    path: '/listAccounts',
    name: 'listAccounts',
    component: ListAccounts
  },


  // Product
  {
    path: '/addProduct',
    name: 'addProduct',
    component: AddProduct
  },
  {
    path: '/listProduct',
    name: 'listProduct',
    component: ListProduct
  },

  // Sales
  {
    path: '/sales',
    name: 'sales',
    component: Sales
  },
  {
    path: '/salesByItem',
    name: 'salesByItem',
    component: SalesByItem
  },
  {
    path: '/dailySales',
    name: 'dailySales',
    component: DailySales
  },
  {
    path: '/settings/sales-goals',
    name: 'salesGoals',
    component: SalesSettings
  },

  // Ingredient & Recipe
  {
    path: '/addIngredient',
    name: 'addIngredient',
    component: AddIngredient
  },
  {
    path: '/addRecipe',
    name: 'addRecipe',
    component: AddRecipe
  },

  // Packaing
  {
    path: '/addPackaging',
    name: 'addPackaging',
    component: AddPackaging
  },
  
  // Purchse
  // Packaing
  {
    path: '/addPurchase',
    name: 'addPurchase',
    component: AddPurchase
  },

  // Supplier
  {
    path: '/addSupplier',
    name: 'addSupplier',
    component: AddSupplier
  },

  // Inventory
  {
    path: '/listInventory',
    name: 'listInventory',
    component: ListInventory
  },

  // Expense
  {
    path: '/addExpense',
    name: 'addExpense',
    component: AddExpense
  },

  // Sale Items
  {
    path: '/listSaleItems',
    name: 'listSaleItems',
    component: ListSaleItems
  },

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Helper function to check actual internet connectivity
const checkInternetConnection = async (): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    
    await fetch('https://www.google.com/favicon.ico', {
      mode: 'no-cors',
      cache: 'no-cache',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    return true
  } catch (error) {
    return false
  }
}

router.beforeEach(async (to: any, from: any, next: any) => {
  const isLoggedIn = store.state.isUserLoggedIn

  // Check internet connection before navigating (except to no-connection page itself)
  // Use actual network request instead of navigator.onLine for mobile compatibility
  if (to.path !== '/no-connection' && to.path !== '/login' && to.path !== '/register') {
    const isConnected = await checkInternetConnection()
    if (!isConnected) {
      next('/no-connection')
      return
    }
  }

  // If trying to access no-connection page but online, redirect to home
  if (to.path === '/no-connection') {
    const isConnected = await checkInternetConnection()
    if (isConnected) {
      const userRole = localStorage.getItem('role')
      if (userRole === 'admin') {
        next('/admin')
      } else {
        next('/')
      }
      return
    }
  }

  if (to.meta.requiresAuth && !store.state.isUserLoggedIn) {
    next('/login')
  } else if (to.meta.requiresAuth && !store.state.isUserAdmin && store.state.isUserLoggedIn) {
    next('/')
  } else if (to.meta.requiresAuth && store.state.isUserAdmin && store.state.isUserLoggedIn) {
    next('/admin')
  } else {
    next()
  }
})

export default router
