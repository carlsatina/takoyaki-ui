<template>
    
    <div class="d-flex justify-content-between align-items-center mt-3">
        <div style="font-size: 13px;">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to
            {{ Math.min(currentPage * itemsPerPage, numberOfEntries || 0) }} of
            {{ numberOfEntries || 0 }} entries
        </div>
        <div class="d-flex align-items-center">


            <button
                class="btn btn-sm btn-success me-1"
                :disabled="currentPage === 1"
                @click="$emit('update-page', currentPage - 1)"
            >
                Prev
            </button>
            <button
                class="btn btn-sm btn-primary"
                :disabled="currentPage === totalPages"
                @click="$emit('update-page', currentPage + 1)"
            >
                Next
            </button>
        </div>
    </div>
</template>


<script>

export default {
    name: "Pagination",
    props: {
        currentPage: {
            type: Number
        },
        itemsPerPage: {
            type: Number,
        },
        numberOfEntries: {
            type: Number
        },
        totalPages: {
            type: Number
        }
    },
    emits: ['update-page']

}
</script>

<style></style>
