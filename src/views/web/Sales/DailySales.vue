<template>
  <div class="page">
    <div class="page-header">
      <div class="d-flex align-items-center gap-2">
        <mdicon name="calendar-range" size="28" />
        <div>
          <h5 class="mb-0">Daily Sales</h5>
          <small class="text-muted">Review per-day totals and staff cash entries</small>
        </div>
      </div>
      <button class="btn btn-primary" @click="startAddRow" :disabled="addingRow">
        Add Entry
      </button>
    </div>

    <div class="table-card shadow-sm">
      <div class="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <label class="form-label mb-0 small text-muted">View</label>
          <select class="form-select form-select-sm" style="width: 120px" v-model="viewMode">
            <option value="all">All</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <label class="form-label mb-0 small text-muted">Show</label>
          <select class="form-select form-select-sm" style="width: 80px" v-model.number="itemsPerPage">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
        </div>

          <div class="d-flex align-items-center gap-1">
            <button class="btn btn-outline-secondary btn-sm" @click="shiftMonth(-1)">◀</button>
            <div class="fw-semibold small">{{ monthLabel }}</div>
            <button class="btn btn-outline-secondary btn-sm" @click="shiftMonth(1)">▶</button>
          </div>
      </div>
      <div class="table-responsive">
        <table class="table table-sm align-middle daily-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>COH ({{ staffLabels[1] }})</th>
              <th>COH ({{ staffLabels[0] }})</th>
              <th>GCash ({{ staffLabels[1] }})</th>
              <th>GCash ({{ staffLabels[0] }})</th>
              <th v-if="!isStaffOnly">Senior</th>
              <th>Expense</th>
              <th v-if="!isStaffOnly">Total GCash</th>
              <th v-if="!isStaffOnly">Total COH</th>
              <th v-if="!isStaffOnly" class="highlight">Total Sales</th>
              <th v-if="!isStaffOnly" class="highlight">POS</th>
              <th v-if="!isStaffOnly">Actual COH</th>
              <th v-if="!isStaffOnly">Kulang Remit</th>
              <th v-if="!isStaffOnly">Short if (-)</th>
              <th v-if="!isStaffOnly"class="text-center">Sales Needed</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="addingRow" class="table-warning">
              <td><input type="date" class="form-control form-control-sm" v-model="newRow.record_date" :disabled="isStaffOnly" /></td>
              <td>
                <div class="input-group input-group-sm">
                  <input
                    type="number"
                    class="form-control"
                    v-model.number="newRowStaff(1).cash_on_hand"
                    @input="updateNewRowTotals"
                    :disabled="isDenomBreakdownActive(newRowStaff(1))"
                  />
                  <button
                    class="btn"
                    type="button"
                    :class="isDenomBreakdownActive(newRowStaff(1)) ? 'btn-outline-success' : 'btn-outline-secondary'"
                    title="Enter cash denominations"
                    @click="openDenomModal('new', 1)"
                  >Denoms</button>
                </div>
              </td>
              <td>
                <div class="input-group input-group-sm">
                  <input
                    type="number"
                    class="form-control"
                    v-model.number="newRowStaff(0).cash_on_hand"
                    @input="updateNewRowTotals"
                    :disabled="isDenomBreakdownActive(newRowStaff(0))"
                  />
                  <button
                    class="btn"
                    type="button"
                    :class="isDenomBreakdownActive(newRowStaff(0)) ? 'btn-outline-success' : 'btn-outline-secondary'"
                    title="Enter cash denominations"
                    @click="openDenomModal('new', 0)"
                  >Denoms</button>
                </div>
              </td>
              <td><input type="number" class="form-control form-control-sm" v-model.number="newRowStaff(1).gcash" @input="updateNewRowTotals" /></td>
              <td><input type="number" class="form-control form-control-sm" v-model.number="newRowStaff(0).gcash" @input="updateNewRowTotals" /></td>
              <td v-if="!isStaffOnly"><input type="number" class="form-control form-control-sm" v-model.number="newRow.senior_discount" disabled/></td>
              <td><input type="number" class="form-control form-control-sm" v-model.number="newRow.expense" /></td>
              <td v-if="!isStaffOnly"><input type="number" class="form-control form-control-sm" :value="totalGcash(newRow)" disabled /></td>
              <td v-if="!isStaffOnly"><input type="number" class="form-control form-control-sm" :value="totalCoh(newRow)" disabled /></td>
              <td v-if="!isStaffOnly" class="highlight"><input type="number" class="form-control form-control-sm" :value="calcTotalSales(newRow)" disabled /></td>
              <td v-if="!isStaffOnly" class="highlight"><input type="number" class="form-control form-control-sm" v-model.number="newRow.pos_cash_on_hand" disabled/></td>
              <td v-if="!isStaffOnly"><input type="number" class="form-control form-control-sm" v-model.number="newRow.actual_cash_on_hand" /></td>
              <td v-if="!isStaffOnly">-</td>
              <td v-if="!isStaffOnly">-</td>
              <td v-if="!isStaffOnly" class="text-center">
                <span class="sales-needed-value">{{ formatNumber(calcSalesNeeded(newRow)) }}</span>
              </td>
              <td class="text-center">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-success" @click="saveRow" :disabled="saving">Save</button>
                  <button class="btn btn-outline-secondary" @click="cancelRow" :disabled="saving">Cancel</button>
                </div>
              </td>
            </tr>
            <tr v-for="entry in paginatedSales" :key="entry.id">
              <template v-if="editingId === entry.id && editingEntry">
                <td><input type="date" class="form-control form-control-sm" v-model="editingEntry.record_date" :disabled="isStaffOnly" /></td>
                <td>
                  <div class="input-group input-group-sm">
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="editingStaff(1).cash_on_hand"
                      @input="updateEditTotals"
                      :disabled="isDenomBreakdownActive(editingStaff(1))"
                    />
                    <button
                      class="btn"
                      type="button"
                      :class="isDenomBreakdownActive(editingStaff(1)) ? 'btn-outline-success' : 'btn-outline-secondary'"
                      title="Enter cash denominations"
                      @click="openDenomModal('edit', 1)"
                    >Denoms</button>
                  </div>
                </td>
                <td>
                  <div class="input-group input-group-sm">
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="editingStaff(0).cash_on_hand"
                      @input="updateEditTotals"
                      :disabled="isDenomBreakdownActive(editingStaff(0))"
                    />
                    <button
                      class="btn"
                      type="button"
                      :class="isDenomBreakdownActive(editingStaff(0)) ? 'btn-outline-success' : 'btn-outline-secondary'"
                      title="Enter cash denominations"
                      @click="openDenomModal('edit', 0)"
                    >Denoms</button>
                  </div>
                </td>
                <td><input type="number" class="form-control form-control-sm" v-model.number="editingStaff(1).gcash" @input="updateEditTotals" /></td>
                <td><input type="number" class="form-control form-control-sm" v-model.number="editingStaff(0).gcash" @input="updateEditTotals" /></td>
                <td v-if="!isStaffOnly"><input type="number" class="form-control form-control-sm" v-model.number="editingEntry.senior_discount" disabled/></td>
                <td><input type="number" class="form-control form-control-sm" v-model.number="editingEntry.expense" /></td>
                <td v-if="!isStaffOnly"><input type="number" class="form-control form-control-sm" :value="totalGcash(editingEntry)" disabled /></td>
                <td v-if="!isStaffOnly"><input type="number" class="form-control form-control-sm" :value="totalCoh(editingEntry)" disabled /></td>
                <td v-if="!isStaffOnly" class="highlight"><input type="number" class="form-control form-control-sm" :value="calcTotalSales(editingEntry)" disabled /></td>
                <td v-if="!isStaffOnly" class="highlight"><input type="number" class="form-control form-control-sm" v-model.number="editingEntry.pos_cash_on_hand" disabled/></td>
                <td v-if="!isStaffOnly"><input type="number" class="form-control form-control-sm" v-model.number="editingEntry.actual_cash_on_hand" /></td>
                <td v-if="!isStaffOnly">{{ formatNumber(editingEntry.total_cash_on_hand - editingEntry.actual_cash_on_hand) }}</td>
                <td v-if="!isStaffOnly">{{ formatNumber(editingEntry.total_sales - editingEntry.pos_cash_on_hand) }}</td>
                <td v-if="!isStaffOnly" class="text-center">
                  <span class="sales-needed-value">{{ formatNumber(calcSalesNeeded(editingEntry)) }}</span>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-success" @click="saveEdit" :disabled="saving">Save</button>
                    <button class="btn btn-outline-secondary" @click="cancelEdit" :disabled="saving">Cancel</button>
                  </div>
                </td>
              </template>
              <template v-else>
                <td>{{ formatDate(entry.record_date) }} ({{ formatDay(entry.record_date) }})</td>
                <td>
                  <button
                    v-if="!isStaffOnly"
                    type="button"
                    class="coh-clickable"
                    @click="openViewDenomModal(entry, 1)"
                  >{{ formatNumber(staffField(entry, 1, 'cash_on_hand')) }}</button>
                  <span v-else>{{ formatNumber(staffField(entry, 1, 'cash_on_hand')) }}</span>
                </td>
                <td>
                  <button
                    v-if="!isStaffOnly"
                    type="button"
                    class="coh-clickable"
                    @click="openViewDenomModal(entry, 0)"
                  >{{ formatNumber(staffField(entry, 0, 'cash_on_hand')) }}</button>
                  <span v-else>{{ formatNumber(staffField(entry, 0, 'cash_on_hand')) }}</span>
                </td>
                <td>{{ formatNumber(staffField(entry, 1, 'gcash')) }}</td>
                <td>{{ formatNumber(staffField(entry, 0, 'gcash')) }}</td>
                <td v-if="!isStaffOnly">{{ formatNumber(entry.senior_discount) }}</td>
                <td>{{ formatNumber(entry.expense) }}</td>
                <td v-if="!isStaffOnly">{{ formatNumber(totalGcash(entry)) }}</td>
                <td v-if="!isStaffOnly">{{ formatNumber(totalCoh(entry)) }}</td>
                <td v-if="!isStaffOnly" class="highlight">{{ formatNumber(calcTotalSales(entry)) }}</td>
                <td v-if="!isStaffOnly" class="highlight">{{ formatNumber(entry.pos_cash_on_hand) }}</td>
                <td v-if="!isStaffOnly">{{ formatNumber(entry.actual_cash_on_hand) }}</td>
                <td v-if="!isStaffOnly">{{ entry.total_cash_on_hand - entry.actual_cash_on_hand }}</td> <!-- kulang remit -->
                <td v-if="!isStaffOnly">{{ entry.total_sales - entry.pos_cash_on_hand }}</td> <!-- Short if (-) -->
                <td v-if="!isStaffOnly" class="text-center">
                  <span class="sales-needed-value">{{ formatNumber(calcSalesNeeded(entry)) }}</span>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                  <button
                    class="btn btn-outline-primary"
                    :disabled="isEditDisabled(entry)"
                    @click="startEdit(entry)"
                  >✏️</button>
                  <button
                    v-if="!isStaffOnly"
                    class="btn btn-outline-danger"
                    @click="confirmDelete(entry)"
                  >✖️</button>
                </div>
              </td>
            </template>
            </tr>
            <tr v-if="filteredSales.length === 0">
              <td colspan="18" class="text-center text-muted py-4">No daily sales entries yet.</td>
            </tr>
            <tr v-else class="table-secondary fw-bold" v-if="!isStaffOnly">
              <td>Total</td>
              <td>{{ formatNumber(totalColumn('staff_coh_1')) }}</td>
              <td>{{ formatNumber(totalColumn('staff_coh_0')) }}</td>
              <td>{{ formatNumber(totalColumn('staff_gcash_1')) }}</td>
              <td>{{ formatNumber(totalColumn('staff_gcash_0')) }}</td>
              <td v-if="!isStaffOnly">{{ formatNumber(totalColumn('senior_discount')) }}</td>
              <td>{{ formatNumber(totalColumn('expense')) }}</td>
              <td v-if="!isStaffOnly">{{ formatNumber(totalColumn('total_gcash')) }}</td>
              <td v-if="!isStaffOnly">{{ formatNumber(totalColumn('total_coh')) }}</td>
              <td v-if="!isStaffOnly">{{ formatNumber(totalColumn('total_sales')) }}</td>
              <td v-if="!isStaffOnly">{{ formatNumber(totalColumn('pos_cash_on_hand')) }}</td>
              <td v-if="!isStaffOnly">{{ formatNumber(totalColumn('actual_cash_on_hand')) }}</td>
              <td v-if="!isStaffOnly"></td>
              <td v-if="!isStaffOnly"></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <small class="d-flex justify-content-center text-muted">{{ filteredSales.length }} records</small>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title">Delete Entry</h5>
          <button type="button" class="btn-close" @click="closeDeleteModal"></button>
        </div>
        <div class="modal-body">
          <p class="mb-0">Are you sure you want to delete the daily sales entry for <strong>{{ deleteTarget?.record_date ? formatDate(deleteTarget.record_date) : '' }}</strong>?</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeDeleteModal">Cancel</button>&nbsp;&nbsp;
          <button class="btn btn-danger" :disabled="saving" @click="deleteEntry">Delete</button>
        </div>
      </div>
    </div>

    <DuplicateDateModal
      :visible="showDuplicateModal"
      :date-text="formatDate(duplicateDate)"
      @close="closeDuplicateModal"
    />

    <CashDenominationModal
      :visible="showDenomModal"
      :read-only="denomReadOnly"
      :staff-label="denomStaffLabel"
      v-model="denomDraft"
      :saved-coh="denomSavedCoh"
      :format-number="formatNumber"
      @close="closeDenomModal"
      @clear="clearDenomDraft"
      @apply="applyDenomModal"
    />
  </div>
</template>

<script>
import { ref, onBeforeMount, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import CashDenominationModal from '@/components/Sales/CashDenominationModal.vue'
import DuplicateDateModal from '@/components/Sales/DuplicateDateModal.vue'
import addDailySales from '@/composables/dailySales/addDailySales'
import getDailySales from '@/composables/dailySales/getDailySales'
import updateDailySales from '@/composables/dailySales/updateDailySales'
import deleteDailySales from '@/composables/dailySales/deleteDailySales'
import getAllAccounts from '@/composables/auth/getAllAccounts'
import getSalesReport from '@/composables/reports/getSalesReport'
import getSettings from '@/composables/settings/getSettings'
import store from '@/store'
import getProfile from '@/composables/getProfile'
import { getDenomBreakdown } from '@/utils/cashDenominations'

export default {
  name: 'DailySalesWeb',
  components: {
    CashDenominationModal,
    DuplicateDateModal
  },
  setup() {
    const router = useRouter()
    const salesGoal = ref(2000)
    const dailySales = ref([])
    const staffList = ref([])
    const loading = ref(false)
    const saving = ref(false)
    const addingRow = ref(false)
    const dailySalesLoaded = ref(false)
    const viewMode = ref('monthly')
    const baseDate = ref(new Date())
    const searchQuery = ref('')
    const itemsPerPage = ref(10)
    const currentPage = ref(1)
    const editingId = ref(null)
    const editingEntry = ref(null)
    const showDuplicateModal = ref(false)
    const duplicateDate = ref(null)
    const showDenomModal = ref(false)
    const denomContext = ref({ mode: 'new', staffIndex: 0 })
    const denomDraft = ref({
      bill_500: 0,
      bill_200: 0,
      bill_100: 0,
      bill_50: 0,
      bill_20: 0,
      coins: 0
    })
    const denomSavedCoh = ref(0)
    const isStaffOnly = ref(false)
    const userToken = localStorage.getItem('token')

    const newRow = ref({
      record_date: new Date().toISOString().split('T')[0],
      total_sales: 0,
      total_cash_on_hand: 0,
      total_gcash: 0,
      senior_discount: 0,
      expense: 0,
      pos_cash_on_hand: 0,
      actual_cash_on_hand: 0,
      cash_goal: 0,
      cash_needed_for_goal: 0,
      staff_cash_entries: []
    })

    const fetchStaff = async () => {
      const token = localStorage.getItem('token')
      const { response, error } = await getAllAccounts(token)
      if (error.value !== null) return

      const accounts = Array.isArray(response.value?.userInfo)
        ? response.value.userInfo
        : Array.isArray(response.value)
          ? response.value
          : []

      const staff = accounts.filter((u) => u.role === 'Staff')
      staffList.value = staff.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0))
    }

    const fetchDailySales = async () => {
      loading.value = true
      const token = localStorage.getItem('token')
      const { response, error } = await getDailySales(token)
      if (error.value === null && Array.isArray(response.value)) {
        dailySales.value = response.value
      }
      dailySalesLoaded.value = true
      loading.value = false
    }

    const fetchSettings = async () => {
      const token = localStorage.getItem('token')
      const { response, error } = await getSettings(token)
      if (error.value === null && Array.isArray(response.value) && response.value.length > 0) {
        salesGoal.value = response.value[0].daily_sales_goal || 0
      }
    }

    const baseDateInput = computed({
      get: () => dateKey(baseDate.value),
      set: (val) => {
        baseDate.value = val ? new Date(val) : new Date()
      }
    })

    const monthLabel = computed(() => {
      if (!baseDate.value) return ''
      return baseDate.value.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    })

    const fetchSalesMetrics = async (dateStr) => {
      const key = dateKey(dateStr)
      if (!key) return null
      const token = localStorage.getItem('token')
      const { response, error } = await getSalesReport(key, key, token)
      if (error.value !== null || !response.value) return null

      const products = response.value.products || []
      const userSales = response.value.userSales || []

      const totalRevenue = products.reduce((sum, p) => sum + (p.totalRevenue || 0), 0)
      const userSalesSum = userSales.reduce((sum, u) => sum + (u.total_sales || 0), 0)
      const seniorDiscount = Math.max(totalRevenue - userSalesSum, 0)

      const staffEntries = userSales.map((u) => ({
        staff_id: u.user_id,
        cash_on_hand: u.cash_total || 0,
        gcash: u.gcash_total || 0
      }))
      const totalGcashStaff = staffEntries.reduce((sum, s) => sum + (s.gcash || 0), 0)
      const totalCashStaff = staffEntries.reduce((sum, s) => sum + (s.cash_on_hand || 0), 0)

      return {
        total_sales: totalRevenue,
        senior_discount: seniorDiscount,
        pos_cash_on_hand: totalRevenue,
        total_gcash: totalGcashStaff || 0,
        total_cash_on_hand: totalCashStaff || 0,
        staffEntries
      }
    }

    const resolveRole = () => {
      const role = localStorage.getItem('role')
      if (store.state.isUserAdmin) return false
      if (store.state.isUserStaff) return true
      return role === 'Staff'
    }

    const buildStaffDefaults = () => {
      const staff = staffList.value.slice(0, 2)
      if (staff.length === 0) return []
      return staff.map((s) => ({
        staff_id: s.id,
        cash_on_hand: 0,
        gcash: 0,
        bill_500: 0,
        bill_200: 0,
        bill_100: 0,
        bill_50: 0,
        bill_20: 0,
        coins: 0
      }))
    }

    const staffIdOrder = computed(() => {
      const ids = []
      const latestEntry = [...dailySales.value]
        .sort((a, b) => new Date(b.record_date) - new Date(a.record_date))
        .find(
          (e) =>
            (Array.isArray(e.staffCashEntries) && e.staffCashEntries.length) ||
            (Array.isArray(e.staff_cash_entries) && e.staff_cash_entries.length)
        )

      const staffEntries =
        latestEntry?.staffCashEntries || latestEntry?.staff_cash_entries || []

      staffEntries.forEach((entry) => {
        if (entry?.staff_id !== null && entry?.staff_id !== undefined) {
          const staffId = entry.staff_id
          const inStaffList = staffList.value.some((s) => String(s.id) === String(staffId))
          if (inStaffList && !ids.some((id) => String(id) === String(staffId))) {
            ids.push(staffId)
          }
        }
      })

      const sortedStaff = [...staffList.value].sort(
        (a, b) => (Number(a.id) || 0) - (Number(b.id) || 0)
      )
      sortedStaff.forEach((s) => {
        if (!ids.some((id) => String(id) === String(s.id))) {
          ids.push(s.id)
        }
      })

      while (ids.length < 2) {
        ids.push(null)
      }

      return ids.slice(0, 2)
    })

    const staffIdByIndex = (idx) => {
      const id = staffIdOrder.value[idx]
      if (id !== undefined && id !== null) return id
      return staffList.value[idx]?.id ?? null
    }

    const alignEntriesToStaffOrder = (entries = []) => {
      const base = Array.isArray(entries) ? entries : []
      const ordered = staffIdOrder.value
        .map((id, idx) => {
          if (id === null || id === undefined) return null
          const match = base.find((item) => String(item.staff_id) === String(id))
          if (match) return match
          return {
            staff_id: id,
            cash_on_hand: 0,
            gcash: 0,
            bill_500: 0,
            bill_200: 0,
            bill_100: 0,
            bill_50: 0,
            bill_20: 0,
            coins: 0
          }
        })
        .filter(Boolean)

      const remaining = base.filter(
        (item) => !ordered.some((o) => String(o.staff_id) === String(item.staff_id))
      )
      const result = [...ordered, ...remaining]
      while (result.length < 2) {
        result.push({
          staff_id: staffIdByIndex(result.length),
          cash_on_hand: 0,
          gcash: 0,
          bill_500: 0,
          bill_200: 0,
          bill_100: 0,
          bill_50: 0,
          bill_20: 0,
          coins: 0
        })
      }
      return result.slice(0, 2)
    }

    const findStaffEntryByIndex = (entries = [], idx) => {
      const targetId = staffIdByIndex(idx)
      const list = Array.isArray(entries) ? entries : []
      if (targetId !== null && targetId !== undefined) {
        const match = list.find((item) => String(item.staff_id) === String(targetId))
        if (match) return match
      }
      return list[idx]
    }

    const ensureNewRowStaffLength = () => {
      newRow.value.staff_cash_entries = alignEntriesToStaffOrder(newRow.value.staff_cash_entries)
    }

    const newRowStaff = (idx) => newRow.value.staff_cash_entries?.[idx]

    const startAddRow = async () => {
      if (addingRow.value) return
      editingId.value = null
      editingEntry.value = null
      newRow.value = {
        record_date: new Date().toISOString().split('T')[0],
        total_sales: 0,
        total_cash_on_hand: 0,
        total_gcash: 0,
        senior_discount: 0,
        expense: 0,
        pos_cash_on_hand: 0,
        actual_cash_on_hand: 0,
        cash_goal: 0,
        cash_needed_for_goal: 0,
        staff_cash_entries: []
      }
      ensureNewRowStaffLength()
      updateNewRowTotals()
      addingRow.value = true
      await fetchDailySales() // always refresh to use latest records before prefilling
      await prefillRowFromDate(newRow.value.record_date)
      updateNewRowTotals()
    }

    const isDuplicateDate = (dateStr, excludeId = null) => {
      const key = dateKey(dateStr)
      if (!key) return false
      return (dailySales.value || []).some(
        (entry) =>
          dateKey(entry.record_date) === key &&
          (excludeId === null || String(entry.id) !== String(excludeId))
      )
    }

    const openDuplicateModal = (dateStr) => {
      duplicateDate.value = dateStr
      showDuplicateModal.value = true
    }

    const closeDuplicateModal = () => {
      showDuplicateModal.value = false
      duplicateDate.value = null
    }

    const isDenomBreakdownActive = (staffEntry) => getDenomBreakdown(staffEntry).hasBreakdown

    const denomReadOnly = computed(() => denomContext.value?.mode === 'view')

    const isPastDate = (dateStr) => {
      if (!dateStr) return false
      const target = new Date(dateStr)
      const today = new Date()
      target.setHours(0, 0, 0, 0)
      today.setHours(0, 0, 0, 0)
      return target < today
    }

    const isEditDisabled = (entry) => isStaffOnly.value && isPastDate(entry?.record_date)

    const staffEntryFor = (dailySalesEntry, staffIndex) => {
      const list = dailySalesEntry?.staffCashEntries || dailySalesEntry?.staff_cash_entries || []
      return findStaffEntryByIndex(list, staffIndex)
    }

    const hasDenomBreakdown = (dailySalesEntry, staffIndex) =>
      isDenomBreakdownActive(staffEntryFor(dailySalesEntry, staffIndex))

    const openViewDenomModal = (dailySalesEntry, staffIndex) => {
      denomContext.value = { mode: 'view', staffIndex }
      const entry = staffEntryFor(dailySalesEntry, staffIndex)
      denomSavedCoh.value = Number(entry?.cash_on_hand) || 0
      denomDraft.value = {
        bill_500: entry?.bill_500 || 0,
        bill_200: entry?.bill_200 || 0,
        bill_100: entry?.bill_100 || 0,
        bill_50: entry?.bill_50 || 0,
        bill_20: entry?.bill_20 || 0,
        coins: entry?.coins || 0
      }
      showDenomModal.value = true
    }

    const openDenomModal = (mode, staffIndex) => {
      denomContext.value = { mode, staffIndex }
      const entry = mode === 'edit' ? editingStaff(staffIndex) : newRowStaff(staffIndex)
      denomDraft.value = {
        bill_500: entry?.bill_500 || 0,
        bill_200: entry?.bill_200 || 0,
        bill_100: entry?.bill_100 || 0,
        bill_50: entry?.bill_50 || 0,
        bill_20: entry?.bill_20 || 0,
        coins: entry?.coins || 0
      }
      showDenomModal.value = true
    }

    const closeDenomModal = () => {
      showDenomModal.value = false
      denomSavedCoh.value = 0
    }

    const clearDenomDraft = () => {
      denomDraft.value = {
        bill_500: 0,
        bill_200: 0,
        bill_100: 0,
        bill_50: 0,
        bill_20: 0,
        coins: 0
      }
    }

    const applyDenomModal = () => {
      const breakdown = getDenomBreakdown(denomDraft.value)
      const { mode, staffIndex } = denomContext.value || { mode: 'new', staffIndex: 0 }
      const entry = mode === 'edit' ? editingStaff(staffIndex) : newRowStaff(staffIndex)
      if (!entry) {
        closeDenomModal()
        return
      }

      Object.assign(entry, {
        bill_500: breakdown.bill_500,
        bill_200: breakdown.bill_200,
        bill_100: breakdown.bill_100,
        bill_50: breakdown.bill_50,
        bill_20: breakdown.bill_20,
        coins: breakdown.coins
      })

      if (breakdown.hasBreakdown) {
        entry.cash_on_hand = breakdown.total
      }

      closeDenomModal()
      if (mode === 'edit') {
        updateEditTotals()
      } else {
        updateNewRowTotals()
      }
    }

    const saveRow = async () => {
      if (isDuplicateDate(newRow.value.record_date)) {
        openDuplicateModal(newRow.value.record_date)
        return
      }
      saving.value = true
      const token = localStorage.getItem('token')
      const payload = { ...newRow.value }
      updateNewRowTotals()
      payload.cash_needed_for_goal = calcSalesNeeded(newRow.value)
      payload.staff_cash_entries = (payload.staff_cash_entries || []).map((s, idx) => ({
        staff_id: s.staff_id ?? staffIdByIndex(idx) ?? null,
        cash_on_hand: s.cash_on_hand || 0,
        gcash: s.gcash || 0,
        bill_500: s.bill_500 || 0,
        bill_200: s.bill_200 || 0,
        bill_100: s.bill_100 || 0,
        bill_50: s.bill_50 || 0,
        bill_20: s.bill_20 || 0,
        coins: s.coins || 0
      }))
      payload.staff_cash_entries = (payload.staff_cash_entries || []).filter((s) => s.staff_id)
      const { error } = await addDailySales(payload, token)
      saving.value = false
      if (error.value === null) {
        addingRow.value = false
        await fetchDailySales()
      }
    }

    const cancelRow = () => {
      addingRow.value = false
      editingId.value = null
      editingEntry.value = null
    }

    const dateKey = (val) => {
      if (!val) return ''
      return new Date(val).toISOString().split('T')[0]
    }

    const prefillRowFromDate = async (dateStr, targetRow = newRow.value) => {
      const key = dateKey(dateStr)
      if (!key) return

      const match = dailySales.value.find((e) => dateKey(e.record_date) === key)
      const salesMetrics = await fetchSalesMetrics(key)
      if (!match && !salesMetrics) return

      // Only prefill staff cash/gcash from an existing entry; never from metrics
      const shouldPrefillStaffCash = Boolean(match)
      const staffEntriesFromData =
        shouldPrefillStaffCash
          ? (match?.staffCashEntries || match?.staff_cash_entries || [])
              .slice(0, 2)
              .map((entry) => ({
                staff_id: entry.staff_id,
                cash_on_hand: entry.cash_on_hand || 0,
                gcash: entry.gcash || 0,
                bill_500: entry.bill_500 || 0,
                bill_200: entry.bill_200 || 0,
                bill_100: entry.bill_100 || 0,
                bill_50: entry.bill_50 || 0,
                bill_20: entry.bill_20 || 0,
                coins: entry.coins || 0
              }))
          : []

      const alignedEntries = shouldPrefillStaffCash
        ? alignEntriesToStaffOrder(staffEntriesFromData)
        : alignEntriesToStaffOrder(
            targetRow.staff_cash_entries || targetRow.staffCashEntries || []
          )

      Object.assign(targetRow, {
        record_date: key,
        total_sales: salesMetrics?.total_sales ?? match?.total_sales ?? 0,
        total_cash_on_hand: match?.total_cash_on_hand ?? targetRow.total_cash_on_hand ?? 0,
        total_gcash: match?.total_gcash ?? targetRow.total_gcash ?? 0,
        senior_discount: salesMetrics?.senior_discount ?? match?.senior_discount ?? 0,
        expense: match?.expense ?? 0,
        pos_cash_on_hand: salesMetrics?.pos_cash_on_hand ?? match?.pos_cash_on_hand ?? 0,
        actual_cash_on_hand: match?.actual_cash_on_hand ?? 0,
        cash_goal: match?.cash_goal ?? 0,
        cash_needed_for_goal: match?.cash_needed_for_goal ?? 0,
        staff_cash_entries: alignedEntries,
        staffCashEntries: alignedEntries
      })

      if (targetRow === newRow.value) {
        ensureNewRowStaffLength()
        updateNewRowTotals()
      } else if (targetRow === editingEntry.value) {
        updateEditTotals()
      }
    }

    const formatDate = (d) => {
      if (!d) return ''
      return new Date(d).toLocaleDateString()
    }

    const formatNumber = (n) => {
      const num = Number(n) || 0
      return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    }

    const staffField = (entry, idx, key) => {
      const list = entry.staffCashEntries || entry.staff_cash_entries || []
      const item = findStaffEntryByIndex(list, idx)
      if (!item) return 0
      return item[key] || 0
    }

    const totalCoh = (entry) => {
      const list = entry.staffCashEntries || entry.staff_cash_entries || []
      return list.reduce((sum, s) => sum + (Number(s.cash_on_hand) || 0), 0)
    }

    const totalGcash = (entry) => {
      const list = entry.staffCashEntries || entry.staff_cash_entries || []
      return list.reduce((sum, s) => sum + (Number(s.gcash) || 0), 0)
    }

    const calcTotalSales = (entry) => {
      const totalG = totalGcash(entry)
      const totalC = totalCoh(entry)
      const sd = Number(entry.senior_discount) || 0
      const exp = Number(entry.expense) || 0
      return totalG + totalC + sd + exp
    }

    const getPreviousNeed = (dateStr) => {
      const key = dateKey(dateStr)
      if (!key) return 0
      const target = new Date(key)
      if (target.getDate() === 1) return 0
      target.setDate(target.getDate() - 1)
      const prevEntry = dailySales.value
        .filter((e) => {
          const d = new Date(e.record_date)
          return d <= target
        })
        .sort((a, b) => new Date(b.record_date) - new Date(a.record_date))[0]
      return Number(prevEntry?.cash_needed_for_goal) || 0
    }

    const calcSalesNeeded = (entry) => {
      const pos = calcTotalSales(entry) || 0
      const prevNeed = getPreviousNeed(entry.record_date)
      return (salesGoal.value - pos) + prevNeed
    }

    const formatDay = (d) => {
      if (!d) return ''
      return new Date(d).toLocaleDateString(undefined, { weekday: 'short' })
    }

    const cashShort = (entry) => {
      const goal = Number(entry.cash_goal) || 0
      const actual = Number(entry.actual_cash_on_hand) || 0
      return goal - actual
    }

    const isInRange = (entryDate) => {
      if (viewMode.value === 'all') return true
      const d = new Date(entryDate)
      const base = new Date(baseDate.value)
      base.setHours(0, 0, 0, 0)

      if (viewMode.value === 'daily') {
        return dateKey(d) === dateKey(base)
      }
      if (viewMode.value === 'weekly') {
        const start = new Date(base)
        start.setDate(base.getDate() - base.getDay())
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(start.getDate() + 6)
        end.setHours(23, 59, 59, 999)
        return d >= start && d <= end
      }
      if (viewMode.value === 'monthly') {
        const start = new Date(base.getFullYear(), base.getMonth(), 1)
        const end = new Date(base.getFullYear(), base.getMonth() + 1, 0)
        end.setHours(23, 59, 59, 999)
        return d >= start && d <= end
      }
      return true
    }

    const filteredSales = computed(() => {
      let data = dailySales.value || []
      data = data.filter((entry) => isInRange(entry.record_date))
      return data
    })

    const paginatedSales = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredSales.value.slice(start, end)
    })

    const shiftMonth = (delta) => {
      const next = new Date(baseDate.value)
      next.setMonth(next.getMonth() + delta)
      baseDate.value = next
      viewMode.value = 'monthly'
    }

    const totalColumn = (key) => {
      const sum = filteredSales.value.reduce((acc, entry) => {
        switch (key) {
          case 'staff_coh_0':
            return acc + (Number(staffField(entry, 0, 'cash_on_hand')) || 0)
          case 'staff_coh_1':
            return acc + (Number(staffField(entry, 1, 'cash_on_hand')) || 0)
          case 'staff_gcash_0':
            return acc + (Number(staffField(entry, 0, 'gcash')) || 0)
          case 'staff_gcash_1':
            return acc + (Number(staffField(entry, 1, 'gcash')) || 0)
          case 'senior_discount':
            return acc + (Number(entry.senior_discount) || 0)
          case 'expense':
            return acc + (Number(entry.expense) || 0)
          case 'total_gcash':
            return acc + (Number(totalGcash(entry)) || 0)
          case 'total_coh':
            return acc + (Number(totalCoh(entry)) || 0)
          case 'total_sales':
            return acc + (Number(calcTotalSales(entry)) || 0)
          case 'pos_cash_on_hand':
            return acc + (Number(entry.pos_cash_on_hand) || 0)
          case 'actual_cash_on_hand':
            return acc + (Number(entry.actual_cash_on_hand) || 0)
          case 'kulang_remit':
            return acc + (Number(entry.total_cash_on_hand - entry.actual_cash_on_hand) || 0)
          case 'short':
            return acc + (Number(entry.total_sales - entry.pos_cash_on_hand) || 0)
          case 'sales_needed':
            return acc + (Number(calcSalesNeeded(entry)) || 0)
          default:
            return acc
        }
      }, 0)
      return sum
    }

    const shortfallClass = (entry) => {
      const val = cashShort(entry)
      return val > 0 ? 'text-danger fw-bold' : 'text-muted'
    }

    const staffName = (staffId) => {
      if (staffId === null || staffId === undefined) return null
      const staff = staffList.value.find((s) => String(s.id) === String(staffId))
      return staff?.full_name
    }

    const staffLabels = computed(() => {
      const names = staffIdOrder.value.map((id, idx) => staffName(id) || `Staff ${idx + 1}`)
      while (names.length < 2) {
        names.push(`Staff ${names.length + 1}`)
      }
      return names
    })

    const denomStaffLabel = computed(() => {
      const idx = denomContext.value?.staffIndex ?? 0
      return staffLabels.value[idx] || `Staff ${idx + 1}`
    })

    const updateNewRowTotals = () => {
      ensureNewRowStaffLength()
      newRow.value.total_gcash = totalGcash(newRow.value)
      newRow.value.total_cash_on_hand = totalCoh(newRow.value)
      newRow.value.total_sales = calcTotalSales(newRow.value)
      newRow.value.cash_needed_for_goal = calcSalesNeeded(newRow.value)
    }

    const startEdit = async (entry) => {
      if (isEditDisabled(entry)) return
      // Refresh from DB to ensure we edit latest data
      await fetchDailySales()
      const fresh = dailySales.value.find((e) => e.id === entry.id) || entry
      editingId.value = fresh.id
      editingEntry.value = JSON.parse(JSON.stringify(fresh))
      if (!editingEntry.value.staffCashEntries) {
        editingEntry.value.staffCashEntries = editingEntry.value.staff_cash_entries || []
      }
      editingEntry.value.staffCashEntries = alignEntriesToStaffOrder(editingEntry.value.staffCashEntries)
      editingEntry.value.staff_cash_entries = editingEntry.value.staffCashEntries
      editingEntry.value.record_date = dateKey(editingEntry.value.record_date)
      updateEditTotals()
    }

    const editingStaff = (idx) => editingEntry.value?.staffCashEntries?.[idx]

    const updateEditTotals = () => {
      if (!editingEntry.value) return
      const wrap = { staffCashEntries: editingEntry.value.staffCashEntries }
      editingEntry.value.total_gcash = totalGcash(wrap)
      editingEntry.value.total_cash_on_hand = totalCoh(wrap)
      editingEntry.value.total_sales = calcTotalSales(editingEntry.value)
      editingEntry.value.cash_needed_for_goal = calcSalesNeeded(editingEntry.value)
    }

    const saveEdit = async () => {
      if (!editingEntry.value) return
      if (isDuplicateDate(editingEntry.value.record_date, editingId.value)) {
        openDuplicateModal(editingEntry.value.record_date)
        return
      }
      // Recompute derived totals before saving
      updateEditTotals()
      saving.value = true
      const token = localStorage.getItem('token')
      const payload = {
        record_date: editingEntry.value.record_date,
        total_sales: editingEntry.value.total_sales,
        total_cash_on_hand: editingEntry.value.total_cash_on_hand,
        total_gcash: editingEntry.value.total_gcash,
        senior_discount: editingEntry.value.senior_discount,
        expense: editingEntry.value.expense,
        pos_cash_on_hand: editingEntry.value.pos_cash_on_hand,
        actual_cash_on_hand: editingEntry.value.actual_cash_on_hand,
        cash_goal: editingEntry.value.cash_goal,
        cash_needed_for_goal: calcSalesNeeded(editingEntry.value),
        staff_cash_entries: editingEntry.value.staffCashEntries.map((s, idx) => ({
          staff_id: s.staff_id ?? staffIdByIndex(idx),
          cash_on_hand: s.cash_on_hand || 0,
          gcash: s.gcash || 0,
          bill_500: s.bill_500 || 0,
          bill_200: s.bill_200 || 0,
          bill_100: s.bill_100 || 0,
          bill_50: s.bill_50 || 0,
          bill_20: s.bill_20 || 0,
          coins: s.coins || 0
        }))
      }
      const { error } = await updateDailySales(editingId.value, payload, token)
      saving.value = false
      if (error.value === null) {
        editingId.value = null
        editingEntry.value = null
        await fetchDailySales()
      }
    }

    const cancelEdit = () => {
      editingId.value = null
      editingEntry.value = null
    }

    const deleteTarget = ref(null)
    const showDeleteModal = ref(false)

    const confirmDelete = (entry) => {
      deleteTarget.value = entry
      showDeleteModal.value = true
    }

    const closeDeleteModal = () => {
      deleteTarget.value = null
      showDeleteModal.value = false
    }

    const deleteEntry = async () => {
      if (!deleteTarget.value) return
      saving.value = true
      const token = localStorage.getItem('token')
      const { error } = await deleteDailySales(deleteTarget.value.id, token)
      saving.value = false
      if (error.value === null) {
        await fetchDailySales()
      }
      closeDeleteModal()
    }

    onBeforeMount(async () => {
        if (!store.state.isUserLoggedIn) {
            router.push('/login')
        }
        loading.value = true
        isStaffOnly.value = resolveRole()
        if (isStaffOnly.value) {
          viewMode.value = 'daily'
          baseDate.value = new Date()
        }
        await fetchStaff()
        await fetchSettings()
        await fetchDailySales()
        loading.value = false
    })

    watch(
      () => newRow.value.record_date,
      async (val) => {
        if (addingRow.value) {
          if (!dailySalesLoaded.value) {
            await fetchDailySales()
          }
          await prefillRowFromDate(val)
        }
      }
    )

    watch(
      () => editingEntry.value?.record_date,
      async (val) => {
        if (editingId.value && editingEntry.value) {
          if (!dailySalesLoaded.value) {
            await fetchDailySales()
          }
          await prefillRowFromDate(val, editingEntry.value)
        }
      }
    )

    return {
      dailySales,
      staffList,
      loading,
      saving,
      addingRow,
      newRow,
      startAddRow,
      saveRow,
      cancelRow,
      formatDate,
      formatNumber,
      staffField,
      staffName,
      formatDay,
      cashShort,
      shortfallClass,
      staffLabels,
      totalCoh,
      totalGcash,
      updateNewRowTotals,
      isStaffOnly,
      startEdit,
      editingId,
      editingEntry,
      saveEdit,
      cancelEdit,
      newRowStaff,
      editingStaff,
      calcTotalSales,
      salesGoal,
      calcSalesNeeded,
      totalColumn,
      viewMode,
      monthLabel,
      baseDateInput,
      searchQuery,
      itemsPerPage,
      currentPage,
      filteredSales,
      shiftMonth,
      paginatedSales,
      totalColumn,
      showDeleteModal,
      confirmDelete,
      closeDeleteModal,
      deleteEntry,
      deleteTarget,
      isEditDisabled,
      showDuplicateModal,
      duplicateDate,
      closeDuplicateModal,
      showDenomModal,
      denomDraft,
      denomStaffLabel,
      denomReadOnly,
      denomSavedCoh,
      hasDenomBreakdown,
      isDenomBreakdownActive,
      openDenomModal,
      openViewDenomModal,
      closeDenomModal,
      clearDenomDraft,
      applyDenomModal
    }
  }
}
</script>

<style scoped>
.page {
  padding: 24px;
  min-height: 100vh;
  background: #f8fafc;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.form-card,
.table-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.daily-table thead th {
  background: #2f5a4c;
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 1;
}

.daily-table tbody tr:nth-child(odd) {
  background: #f8fbf9;
}

.daily-table tbody tr:nth-child(even) {
  background: #eef5f1;
}

.daily-table td,
.daily-table th {
  vertical-align: middle;
  font-size: 13px;
}

.highlight {
  background: #e0e0e0;
  font-weight: 700;
}

.sales-needed-value {
  background: #eef2f7;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 6px;
}

.sales-needed-icon {
  background: #f5f7fb;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 4px;
  font-size: 13px;
}

.sales-needed-icon.edit {
  color: #0d6efd;
}

.sales-needed-icon.delete {
  color: #dc3545;
}

.coh-clickable {
  background: transparent;
  border: 0;
  padding: 0;
  color: inherit;
  font: inherit;
  cursor: pointer;
  text-decoration: underline dotted;
}

.coh-clickable:hover {
  text-decoration: underline;
}

.staff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}

.staff-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px;
  background: #fdfdfd;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 12px;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.staff-pill {
  background: #f1f5f9;
  border-radius: 6px;
  padding: 6px 8px;
  margin-bottom: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}
.modal-body {
  padding: 16px;
}

.modal-footer {
    padding: 12px;
}
</style>
