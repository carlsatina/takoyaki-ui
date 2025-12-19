<template>
  <teleport to="body">
    <div v-if="visible" class="modal-overlay" @click="handleClose">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title">
            Cash Denominations<span v-if="staffLabel"> ({{ staffLabel }})</span>
          </h5>
          <button type="button" class="btn-close" @click="handleClose"></button>
        </div>
        <div class="modal-body">
          <div v-if="readOnly" class="mb-2">
            <div class="d-flex justify-content-between align-items-center">
              <div class="text-muted small">COH Total</div>
              <div class="fw-bold">{{ formatDisplay(savedCoh) }}</div>
            </div>
            <small v-if="!hasBreakdown" class="text-muted d-block mt-1">No denomination breakdown recorded for this staff entry.</small>
            <hr class="my-2" />
          </div>
          <div class="row g-2">
            <div class="col-4">
              <label class="form-label small mb-1">500</label>
              <input
                type="number"
                min="0"
                step="1"
                class="form-control form-control-sm"
                :value="displayDraft.bill_500"
                :disabled="readOnly"
                @input="updateField('bill_500', $event.target.value)"
              />
            </div>
            <div class="col-4">
              <label class="form-label small mb-1">200</label>
              <input
                type="number"
                min="0"
                step="1"
                class="form-control form-control-sm"
                :value="displayDraft.bill_200"
                :disabled="readOnly"
                @input="updateField('bill_200', $event.target.value)"
              />
            </div>
            <div class="col-4">
              <label class="form-label small mb-1">100</label>
              <input
                type="number"
                min="0"
                step="1"
                class="form-control form-control-sm"
                :value="displayDraft.bill_100"
                :disabled="readOnly"
                @input="updateField('bill_100', $event.target.value)"
              />
            </div>
            <div class="col-4">
              <label class="form-label small mb-1">50</label>
              <input
                type="number"
                min="0"
                step="1"
                class="form-control form-control-sm"
                :value="displayDraft.bill_50"
                :disabled="readOnly"
                @input="updateField('bill_50', $event.target.value)"
              />
            </div>
            <div class="col-4">
              <label class="form-label small mb-1">20</label>
              <input
                type="number"
                min="0"
                step="1"
                class="form-control form-control-sm"
                :value="displayDraft.bill_20"
                :disabled="readOnly"
                @input="updateField('bill_20', $event.target.value)"
              />
            </div>
            <div class="col-4">
              <label class="form-label small mb-1">Coins (₱)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                class="form-control form-control-sm"
                :value="displayDraft.coins"
                :disabled="readOnly"
                @input="updateField('coins', $event.target.value)"
              />
            </div>
          </div>
          <div class="d-flex justify-content-between align-items-center mt-3">
            <div class="text-muted small">{{ readOnly ? 'Denomination Total' : 'Computed COH' }}</div>
            <div class="fw-bold">{{ formatDisplay(denomTotal) }}</div>
          </div>
          <small v-if="!readOnly" class="text-muted d-block mt-2">
            When any denomination is entered, COH is auto-calculated and the COH input is locked.
          </small>
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
import { getDenomBreakdown, normalizeDenominations } from '@/utils/cashDenominations'

export default {
  name: 'CashDenominationModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    staffLabel: {
      type: String,
      default: ''
    },
    modelValue: {
      type: Object,
      default: () => ({})
    },
    savedCoh: {
      type: Number,
      default: 0
    },
    formatNumber: {
      type: Function,
      default: null
    }
  },
  emits: ['close', 'apply', 'clear', 'update:modelValue'],
  setup(props, { emit }) {
    const displayDraft = computed(() => normalizeDenominations(props.modelValue))
    const breakdown = computed(() => getDenomBreakdown(props.modelValue))
    const denomTotal = computed(() => breakdown.value.total)
    const hasBreakdown = computed(() => breakdown.value.hasBreakdown)

    const formatDisplay = (val) => {
      const num = Number(val) || 0
      if (typeof props.formatNumber === 'function') {
        return props.formatNumber(num)
      }
      return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    }

    const updateField = (field, rawValue) => {
      const next = {
        ...props.modelValue,
        [field]: rawValue
      }
      emit('update:modelValue', normalizeDenominations(next))
    }

    const handleClose = () => emit('close')
    const emitApply = () => emit('apply')
    const emitClear = () => emit('clear')

    return {
      displayDraft,
      denomTotal,
      hasBreakdown,
      formatDisplay,
      updateField,
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
  max-width: 540px;
  width: 100%;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
}

.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.btn-close {
  border: none;
  background: transparent;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.modal-body {
  padding: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #e9ecef;
}
</style>
