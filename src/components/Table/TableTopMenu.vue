<template>
  <div class="table-top-menu d-flex flex-row align-items-center w-100 gap-2">
    <div class="d-flex flex-row align-items-center">
      <label for="entriesPerPage" class="me-2" style="font-size: 13px;">Show</label>
      <select
        :value="itemsPerPage"
        @change="$emit('update-items', parseInt($event.target.value))"
        id="entriesPerPage"
        class="form-select form-select-sm me-3"
        style="width: auto;"
      >
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="25">25</option>
        <option :value="50">50</option>
      </select>
    </div>
    <input
      :value="searchQuery"
      type="text"
      class="form-control w-25"
      placeholder="Search"
      @input="$emit('update-search', $event.target.value)"
    />
  </div>
</template>

<script>
export default {
  name: "TableTopMenu",
  props: {
    itemsPerPage: {
      type: Number
    },
    searchQuery: {
      type: String,
    }
  },
  emits: ['update-search', 'update-items']
}
</script>

<style></style>
