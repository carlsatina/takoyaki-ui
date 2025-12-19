<template>
  <div class="page">
    <div class="page-header">
      <div class="d-flex align-items-center gap-2">
        <mdicon name="calendar-range" size="28" />
        <div>
          <h5 class="mb-0">Daily Sales</h5>
          <small class="text-muted">touch-friendly</small>
        </div>
      </div>
      <button
        v-if="!isStaffOnly"
        class="btn btn-primary"
        @click="startAddRow"
        :disabled="addingRow"
      >
        Add Entry
      </button>
    </div>

    <div class="filter-card shadow-sm">
      <div class="date-nav">
        <button class="nav-btn" @click="shiftDate(-1)">
          <mdicon name="chevron-left" size="20" />
        </button>
        <div class="date-display clickable" @click="showDateModal = true">
          <mdicon name="calendar-month" size="18" class="text-primary" />
          <span class="date-text">{{ baseDateInput }}</span>
        </div>
        <button class="nav-btn" @click="shiftDate(1)">
          <mdicon name="chevron-right" size="20" />
        </button>
      </div>
    </div>

    <div v-if="addingRow" class="form-card shadow-sm">
      <div class="form-header entry-header">
        <div class="d-flex align-items-center gap-2">
          <span class="entry-plus">+</span>
          <strong class="entry-title">New Daily Entry</strong>
        </div>
        <button class="btn btn-link entry-cancel" @click="cancelRow" :disabled="saving">Cancel</button>
      </div>
      <div class="row g-2">
        <div class="col-6">
          <label class="form-label small">Date</label>
          <input type="date" class="form-control form-control-sm" v-model="newRow.record_date" :disabled="isStaffOnly" />
        </div>
        <div class="col-6">
          <label class="form-label small">Expense</label>
          <input type="number" class="form-control form-control-sm" v-model.number="newRow.expense" />
        </div>
        <div class="col-6" v-if="!isStaffOnly">
          <label class="form-label small">Senior Discount</label>
          <input type="number" class="form-control form-control-sm" v-model.number="newRow.senior_discount" disabled />
        </div>
        <div class="col-6" v-if="!isStaffOnly">
          <label class="form-label small">Actual COH</label>
          <input type="number" class="form-control form-control-sm" v-model.number="newRow.actual_cash_on_hand" />
        </div>
      </div>
      <div class="staff-inputs">
        <div class="staff-input" v-for="idx in 2" :key="'new-'+idx">
          <div class="d-flex justify-content-between align-items-center">
            <div class="fw-semibold">{{ staffLabels[idx-1] }}</div>
          </div>
          <div class="row g-2">
            <div class="col-6">
              <label class="form-label small mb-1">Cash on Hand</label>
              <div class="input-group input-group-sm">
                <input
                  type="number"
                  class="form-control"
                  v-model.number="newRowStaff(idx-1).cash_on_hand"
                  @input="updateNewRowTotals"
                  :disabled="isDenomBreakdownActive(newRowStaff(idx-1))"
                />
                <button
                  class="btn"
                  type="button"
                  :class="isDenomBreakdownActive(newRowStaff(idx-1)) ? 'btn-outline-success' : 'btn-outline-secondary'"
                  title="Enter cash denominations"
                  @click="openDenomModal('new', idx-1)"
                >Denoms</button>
              </div>
            </div>
            <div class="col-6">
              <label class="form-label small mb-1">GCash</label>
              <input type="number" class="form-control form-control-sm" v-model.number="newRowStaff(idx-1).gcash" @input="updateNewRowTotals" />
            </div>
          </div>
        </div>
      </div>
      <div class="readouts">
        <div>
          <span class="label">Total GCash</span>
          <span class="value">{{ formatNumber(totalGcash(newRow)) }}</span>
        </div>
        <div>
          <span class="label">Total COH</span>
          <span class="value">{{ formatNumber(totalCoh(newRow)) }}</span>
        </div>
        <div>
          <span class="label">Sales Needed</span>
          <span class="value text-primary">{{ formatNumber(calcSalesNeeded(newRow)) }}</span>
        </div>
      </div>
      <div class="d-flex justify-content-end gap-2 mt-2">
        <button class="btn btn-outline-secondary btn-sm" @click="cancelRow" :disabled="saving">Discard</button>
        <button class="btn btn-success btn-sm" @click="saveRow" :disabled="saving">Save Entry</button>
      </div>
    </div>

    <div v-if="loading" class="text-center text-muted py-4">Loading daily sales…</div>
    <div v-else>
      <div v-if="showEmptyState" class="empty-state">
        <mdicon name="clipboard-text" size="36" class="text-muted" />
        <p class="text-muted mb-0">No daily sales entries yet.</p>
      </div>

      <div v-for="entry in paginatedSales" :key="entry.id" class="entry-wrapper">
        <div v-if="editingId === entry.id && editingEntry" class="form-card shadow-sm">
          <div class="form-header">
            <div class="d-flex align-items-center gap-2">
              <mdicon name="pencil" size="20" />
              <strong>Edit {{ formatDate(editingEntry.record_date) }}</strong>
            </div>
            <button class="btn btn-link text-secondary p-0" @click="cancelEdit" :disabled="saving">Cancel</button>
          </div>
          <div class="row g-2">
            <div class="col-6">
              <label class="form-label small">Date</label>
              <input type="date" class="form-control form-control-sm" v-model="editingEntry.record_date" :disabled="isStaffOnly" />
            </div>
            <div class="col-6">
              <label class="form-label small">Expense</label>
              <input type="number" class="form-control form-control-sm" v-model.number="editingEntry.expense" />
            </div>
            <div class="col-6" v-if="!isStaffOnly">
              <label class="form-label small">Senior Discount</label>
              <input type="number" class="form-control form-control-sm" v-model.number="editingEntry.senior_discount" disabled />
            </div>
            <div class="col-6" v-if="!isStaffOnly">
              <label class="form-label small">Actual COH</label>
              <input type="number" class="form-control form-control-sm" v-model.number="editingEntry.actual_cash_on_hand" />
            </div>
          </div>
          <div class="staff-inputs">
            <div class="staff-input" v-for="idx in 2" :key="'edit-'+idx">
              <div class="d-flex justify-content-between align-items-center">
                <div class="fw-semibold">{{ staffLabels[idx-1] }}</div>
              </div>
              <div class="row g-2">
                <div class="col-6">
                  <label class="form-label small mb-1">Cash on Hand</label>
                  <div class="input-group input-group-sm">
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="editingStaff(idx-1).cash_on_hand"
                      @input="updateEditTotals"
                      :disabled="isDenomBreakdownActive(editingStaff(idx-1))"
                    />
                    <button
                      class="btn"
                      type="button"
                      :class="isDenomBreakdownActive(editingStaff(idx-1)) ? 'btn-outline-success' : 'btn-outline-secondary'"
                      title="Enter cash denominations"
                      @click="openDenomModal('edit', idx-1)"
                    >Denoms</button>
                  </div>
                </div>
                <div class="col-6">
                  <label class="form-label small mb-1">GCash</label>
                  <input type="number" class="form-control form-control-sm" v-model.number="editingStaff(idx-1).gcash" @input="updateEditTotals" />
                </div>
              </div>
            </div>
          </div>
          <div class="readouts">
            <div>
              <span class="label">Total GCash</span>
              <span class="value">{{ formatNumber(totalGcash(editingEntry)) }}</span>
            </div>
            <div>
              <span class="label">Total COH</span>
              <span class="value">{{ formatNumber(totalCoh(editingEntry)) }}</span>
            </div>
            <div>
              <span class="label">Sales Needed</span>
              <span class="value text-primary">{{ formatNumber(calcSalesNeeded(editingEntry)) }}</span>
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-2">
            <button class="btn btn-outline-secondary btn-sm" @click="cancelEdit" :disabled="saving">Discard</button>
            <button class="btn btn-success btn-sm" @click="saveEdit" :disabled="saving">Save Changes</button>
          </div>
        </div>

        <div v-else class="entry-card shadow-sm">
          <div class="entry-head">
            <div>
              <div class="fw-bold">{{ formatDate(entry.record_date) }}</div>
              <small class="text-muted">{{ formatDay(entry.record_date) }}</small>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span v-if="!isStaffOnly" class="pill pill-soft">
                Need: {{ formatNumber(calcSalesNeeded(entry)) }}
              </span>
              <div class="btn-group btn-group-sm">
                <button
                  class="btn btn-outline-primary"
                  :disabled="isEditDisabled(entry)"
                  @click="startEdit(entry)"
                >
                  Edit
                </button>
                <button
                  v-if="!isStaffOnly"
                  class="btn btn-outline-danger"
                  @click="confirmDelete(entry)"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div class="metric-grid">
            <div class="metric">
              <div class="label">Expense</div>
              <div class="value">{{ formatNumber(entry.expense) }}</div>
            </div>
            <div class="metric" v-if="!isStaffOnly">
              <div class="label">Senior</div>
              <div class="value">{{ formatNumber(entry.senior_discount) }}</div>
            </div>
            <div class="metric">
              <div class="label">GCash</div>
              <div class="value">{{ formatNumber(totalGcash(entry)) }}</div>
            </div>
            <div class="metric">
              <div class="label">COH</div>
              <div class="value">{{ formatNumber(totalCoh(entry)) }}</div>
            </div>
            <div class="metric" v-if="!isStaffOnly">
              <div class="label">Total Sales</div>
              <div class="value fw-semibold text-primary">{{ formatNumber(calcTotalSales(entry)) }}</div>
            </div>
            <div class="metric" v-if="!isStaffOnly">
              <div class="label">POS COH</div>
              <div class="value">{{ formatNumber(entry.pos_cash_on_hand) }}</div>
            </div>
            <div class="metric" v-if="!isStaffOnly">
              <div class="label">Actual COH</div>
              <div class="value">{{ formatNumber(entry.actual_cash_on_hand) }}</div>
            </div>
            <div class="metric" v-if="!isStaffOnly">
              <div class="label">Kulang</div>
              <div class="value">{{ formatNumber(entry.total_cash_on_hand - entry.actual_cash_on_hand) }}</div>
            </div>
            <div class="metric" v-if="!isStaffOnly">
              <div class="label">Short</div>
              <div class="value">{{ formatNumber(entry.total_sales - entry.pos_cash_on_hand) }}</div>
            </div>
          </div>

          <div class="staff-pills">
            <div class="staff-pill" v-for="idx in 2" :key="'staff-'+entry.id+'-'+idx">
              <div class="d-flex justify-content-between align-items-center">
                <div class="fw-semibold">{{ staffLabels[idx-1] }}</div>
                <small class="text-muted">{{ formatDay(entry.record_date) }}</small>
              </div>
              <div class="d-flex justify-content-between">
                <div class="mini-metric">
                  <div class="label">COH</div>
                  <div class="value">
                    <button
                      v-if="!isStaffOnly"
                      type="button"
                      class="coh-clickable"
                      @click="openViewDenomModal(entry, idx-1)"
                    >{{ formatNumber(staffField(entry, idx-1, 'cash_on_hand')) }}</button>
                    <span v-else>{{ formatNumber(staffField(entry, idx-1, 'cash_on_hand')) }}</span>
                  </div>
                </div>
                <div class="mini-metric">
                  <div class="label">GCash</div>
                  <div class="value">{{ formatNumber(staffField(entry, idx-1, 'gcash')) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1" class="pagination-controls">
        <button class="btn btn-outline-secondary btn-sm" :disabled="currentPage === 1" @click="prevPage">Prev</button>
        <span class="text-muted">Page {{ currentPage }} / {{ totalPages }}</span>
        <button class="btn btn-outline-secondary btn-sm" :disabled="currentPage === totalPages" @click="nextPage">Next</button>
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

    <div v-if="showDateModal" class="modal-overlay" @click="showDateModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title">Select Date Range</h5>
          <button type="button" class="btn-close" @click="showDateModal = false"></button>
        </div>
        <div class="modal-body">
          <div class="date-option-buttons">
            <button
              class="btn btn-outline-primary w-100 mb-2"
              :class="{ 'active': viewMode === 'daily' }"
              @click="viewMode = 'daily'; showDateModal = false; currentPage = 1"
            >
              <mdicon name="calendar-today" size="20" class="me-2"/>
              Daily
            </button>
            <button
              class="btn btn-outline-primary w-100 mb-2"
              :class="{ 'active': viewMode === 'weekly' }"
              @click="viewMode = 'weekly'; showDateModal = false; currentPage = 1"
            >
              <mdicon name="calendar-week" size="20" class="me-2"/>
              Weekly
            </button>
            <button
              class="btn btn-outline-primary w-100 mb-2"
              :class="{ 'active': viewMode === 'monthly' }"
              @click="viewMode = 'monthly'; showDateModal = false; currentPage = 1"
            >
              <mdicon name="calendar-month" size="20" class="me-2"/>
              Monthly
            </button>
            <button
              class="btn btn-outline-secondary w-100"
              :class="{ 'active': viewMode === 'all' }"
              @click="viewMode = 'all'; showDateModal = false; currentPage = 1"
            >
              <mdicon name="calendar" size="20" class="me-2"/>
              All
            </button>
          </div>
          <div class="mt-3">
            <label class="form-label small">Reference Date</label>
            <input type="date" class="form-control" v-model="baseDateInput" />
          </div>
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
  name: 'DailySalesMobile',
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
    const viewMode = ref('daily')
    const baseDate = ref(new Date())
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

    const todayString = () => {
      const d = new Date()
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }

    const newRow = ref({
      record_date: todayString(),
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
        baseDate.value = val ? new Date(`${val}T00:00:00`) : new Date()
      }
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
        record_date: todayString(),
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
      const d = new Date(val)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
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

    const showDateModal = ref(false)

    const totalPages = computed(() => {
      const total = Math.ceil(filteredSales.value.length / itemsPerPage.value) || 1
      return Math.max(total, 1)
    })

    const showEmptyState = computed(() => !loading.value && filteredSales.value.length === 0 && !addingRow.value)

    const paginatedSales = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredSales.value.slice(start, end)
    })

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

    const shiftDate = (days) => {
      const next = new Date(baseDate.value)
      next.setDate(next.getDate() + days)
      baseDate.value = next
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

    const prevPage = () => {
      currentPage.value = Math.max(1, currentPage.value - 1)
    }

    const nextPage = () => {
      currentPage.value = Math.min(totalPages.value, currentPage.value + 1)
    }

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

    if (!userToken) {
        router.push('/login')
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

    watch([filteredSales, itemsPerPage], () => {
      currentPage.value = 1
    })

    watch(totalPages, (val) => {
      if (currentPage.value > val) {
        currentPage.value = val
      }
    })

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
      viewMode,
      baseDateInput,
      itemsPerPage,
      currentPage,
      filteredSales,
      paginatedSales,
      totalPages,
      prevPage,
      nextPage,
      shiftDate,
      showEmptyState,
      showDateModal,
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

.filter-card,
.form-card,
.entry-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.date-nav {
  display: grid;
  grid-template-columns: 60px 1fr 60px;
  align-items: center;
  gap: 10px;
}

.nav-btn {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.nav-btn:active {
  transform: translateY(1px);
}

.date-display {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #f9fafb, #f1f5f9);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
  transition: box-shadow 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
}

.date-input {
  border: none;
  outline: none;
  width: 100%;
  font-weight: 700;
  color: #0f172a;
  font-size: 15px;
  background: transparent;
}

.date-text {
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.2px;
}

.date-display:focus-within {
  border-color: #2563eb;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.2);
  transform: translateY(-1px);
}

.date-input::-webkit-calendar-picker-indicator {
  filter: invert(20%) sepia(60%) saturate(250%) hue-rotate(190deg);
  cursor: pointer;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.staff-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
  margin-top: 8px;
}

.staff-input {
  border: 1px dashed #d9e2ec;
  border-radius: 10px;
  padding: 10px;
  background: #f9fafb;
}

.readouts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.readouts .label {
  font-size: 12px;
  color: #6b7280;
  margin-right: 6px;
}

.readouts .value {
  font-weight: 600;
}

.entry-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.pill {
  background: #f3f4f6;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
}

.pill-soft {
  background: #eef2ff;
  color: #4338ca;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 10px;
  margin-bottom: 10px;
}

.metric .label,
.mini-metric .label {
  font-size: 12px;
  color: #6b7280;
}

.metric .value,
.mini-metric .value {
  font-weight: 600;
}

.staff-pills {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.staff-pill {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px;
}

.mini-metric .value {
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  border: 1px dashed #d1d5db;
  border-radius: 12px;
  background: #fff;
}

.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
  margin-bottom: 24px;
}

.clickable {
  cursor: pointer;
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

.entry-header {
  padding: 4px 2px;
}

.entry-plus {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.entry-title {
  color: #1f2937;
}

.entry-cancel {
  color: #6b7280;
  text-decoration: underline;
  font-weight: 500;
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
