<template>
  <div class="mobile-nav shadow" v-if="store.state.isUserLoggedIn">
    <div class="bloc-icon w-100" v-if="store.state.isUserAdmin">
      <router-link to="/admin"  class="icon w-100 p-3 text-center"
      :class="route.name === 'salesByItem' ? 'router-link-active':''"
        >
        <mdicon name="home-outline" size="30"/><br>
        <span>Dashboard</span>
      </router-link>
    </div>
    <div class="bloc-icon w-100" v-if="!store.state.isUserAdmin">
      <router-link to="/sales"  class="icon w-100 p-3 text-center">
        <mdicon name="cash" size="30"/><br>
        <span>Sales</span>
      </router-link>
    </div>

    <div class="bloc-icon w-100" v-if="store.state.isUserAdmin">
      <router-link to="/listInventory" class="icon w-100 p-3 text-center">
        <mdicon name="playlist-check" size="30" /><br>
        <span>Inventory</span>
      </router-link>
    </div>

    <div class="bloc-icon w-100">
      <router-link to="/dailySales" class="icon w-100 p-3 text-center">
        <mdicon name="calendar-range" size="30" /><br>
        <span>Daily Sales</span>
      </router-link>
    </div>

    <div class="bloc-icon w-100">
      <router-link to="/account" class="icon w-100 p-3 text-center" 
        :class="route.name === 'addSupplier' || 
        route.name === 'addProduct'  ||
        route.name === 'addPurchase' ||
        route.name === 'addIngredient' ||
        route.name === 'addPackaging' ||
        route.name === 'addRecipe' ? 'router-link-active':''"
        >
        <mdicon name="account-settings" size="30" /><br>
        <span>Settings</span>
      </router-link>
    </div>
    
  </div>
</template>

<script>
import { ref, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import store from '@/store'

export default {
  name: 'BottomNav',
  setup() {
    provide('store', store)
    const route = useRoute()

    return {
        store,
        route
    }
  }
}
</script>

<style scoped>
.mobile-nav {
  background: transparent;
  position: fixed;
  bottom: 0;
  height: 65px;
  width: 100%;
  display: flex;
  justify-content: space-around;
}

.bloc-icon {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: black;
  font-size: 12px;
}

a.router-link-active {
  border-top: 2px;
  color: #F39C12;
  border-top-style: solid;
  width: 100%;
}

/* @media screen and (min-width: 600px) {
  .mobile-nav {
    display: none;
  }
} */

.icon{
  color: black;
  text-decoration: none;
}
</style>
