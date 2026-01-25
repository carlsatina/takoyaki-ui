<template>
  <teleport to="body">
    <div v-if="visible" class="modal-overlay" @click="handleClose">
      <div class="modal-content" :class="{ compact }" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title">Expense Breakdown</h5>
          <button type="button" class="btn-close" @click="handleClose"></button>
        </div>
        <div class="modal-body">
          <div v-if="readOnly" class="mb-2">
            <div class="d-flex justify-content-between align-items-center">
              <div class="text-muted small">Expense Total</div>
              <div class="fw-bold">{{ formatDisplay(totalAmount) }}</div>
            </div>
            <small v-if="!hasBreakdown" class="text-muted d-block mt-1">
              No expense breakdown recorded.
            </small>
            <hr class="my-2" />
          </div>

          <div class="expense-rows">
            <div v-for="(item, idx) in displayRows" :key="`expense-row-${idx}`" class="expense-row">
              <input
                type="text"
                class="form-control form-control-sm"
                :value="item.name"
                :disabled="readOnly"
                placeholder="Name"
                @input="updateField(idx, 'name', $event.target.value)"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                class="form-control form-control-sm amount-input"
                :value="item.amount"
                :disabled="readOnly"
                placeholder="Amount"
                @input="updateField(idx, 'amount', $event.target.value)"
              />
              <button
                v-if="!readOnly"
                class="btn btn-outline-danger btn-sm"
                type="button"
                @click="removeRow(idx)"
              >✖</button>
            </div>
          </div>

          <button
            v-if="!readOnly"
            class="btn btn-outline-secondary btn-sm mt-2"
            type="button"
            @click="addRow"
          >+ Add</button>

          <div class="d-flex justify-content-between align-items-center mt-3">
            <div class="text-muted small">Total</div>
            <div class="fw-bold">{{ formatDisplay(totalAmount) }}</div>
          </div>
        </div>
        <div class="modal-footer">
          <template v-if="readOnly">
            <button class="btn btn-primary" @click="handleClose">Close</button>
          </template>
          <template v-else>
            <button class="btn btn-outline-secondary" @click="emitClear">Clear</button>
            <button class="btn btn-secondary" @click="handleClose">Cancel</button>
            <button class="btn btn-success" @click="emitApply">Apply</button>
          </template>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import { computed } from 'vue'

const normalizeBreakdown = (val) => {
  let raw = val
  if (raw === undefined || raw === null || raw === '') return []
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw)
    } catch (err) {
      return []
    }
  }
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    const name = typeof item?.name === 'string' ? item.name : ''
    const amountRaw = item?.amount ?? item?.value ?? item?.cost
    const amountNum = Number(amountRaw)
    const amount = Number.isFinite(amountNum) ? amountNum : 0
    return { name, amount }
  })
}

export default {
  name: 'ExpenseBreakdownModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Array,
      default: () => []
    },
    compact: {
      type: Boolean,
      default: false
    },
    formatNumber: {
      type: Function,
      default: null
    }
  },
  emits: ['close', 'apply', 'clear', 'update:modelValue'],
  setup(props, { emit }) {
    const normalized = computed(() => normalizeBreakdown(props.modelValue))

    const displayRows = computed(() => {
      if (!props.readOnly && normalized.value.length === 0) {
        return [{ name: '', amount: 0 }]
      }
      return normalized.value
    })

    const totalAmount = computed(() =>
      displayRows.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
    )

    const hasBreakdown = computed(() => normalized.value.length > 0)

    const formatDisplay = (val) => {
      const num = Number(val) || 0
      if (typeof props.formatNumber === 'function') {
        return props.formatNumber(num)
      }
      return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    }

    const updateField = (idx, field, rawValue) => {
      const next = displayRows.value.map((item) => ({ ...item }))
      if (!next[idx]) return
      if (field === 'amount') {
        const amountNum = rawValue === '' ? 0 : Number(rawValue)
        next[idx].amount = Number.isFinite(amountNum) ? amountNum : 0
      } else {
        next[idx].name = rawValue
      }
      emit('update:modelValue', next)
    }

    const addRow = () => {
      const next = displayRows.value.map((item) => ({ ...item }))
      next.push({ name: '', amount: 0 })
      emit('update:modelValue', next)
    }

    const removeRow = (idx) => {
      const next = displayRows.value.map((item) => ({ ...item }))
      next.splice(idx, 1)
      emit('update:modelValue', next)
    }

    const handleClose = () => emit('close')
    const emitApply = () => emit('apply')
    const emitClear = () => emit('clear')

    return {
      displayRows,
      totalAmount,
      hasBreakdown,
      formatDisplay,
      updateField,
      addRow,
      removeRow,
      handleClose,
      emitApply,
      emitClear
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  padding: 12px;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  width: min(520px, 100%);
}

.modal-content.compact {
  width: min(420px, 100%);
}

.modal-content.compact .modal-header,
.modal-content.compact .modal-body,
.modal-content.compact .modal-footer {
  padding: 10px 12px;
}

.modal-content.compact .modal-title {
  font-size: 14px;
}

.modal-content.compact .expense-rows {
  gap: 6px;
}

.modal-content.compact .expense-row {
  grid-template-columns: 1fr 80px auto;
  gap: 6px;
}

.modal-content.compact .form-control-sm,
.modal-content.compact .btn {
  font-size: 12px;
}

.modal-content.compact .form-control-sm {
  padding: 4px 6px;
}

.modal-content.compact .btn {
  padding: 4px 8px;
}

.modal-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-body {
  padding: 16px;
}

.modal-footer {
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.expense-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.expense-row {
  display: grid;
  grid-template-columns: 1fr 120px auto;
  gap: 8px;
  align-items: center;
}

.amount-input {
  text-align: right;
}

@media (max-width: 480px) {
  .expense-row {
    grid-template-columns: 1fr;
  }
}
</style>
