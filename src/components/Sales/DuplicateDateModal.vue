<template>
  <teleport to="body">
    <div v-if="visible" class="modal-overlay" @click="handleClose">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="btn-close" @click="handleClose"></button>
        </div>
        <div class="modal-body">
          <p class="mb-0">{{ bodyText }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="handleClose">{{ ctaText }}</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'DuplicateDateModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    dateText: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: 'Duplicate Date'
    },
    message: {
      type: String,
      default: ''
    },
    ctaText: {
      type: String,
      default: 'OK'
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const bodyText = computed(() => {
      if (props.message) return props.message
      if (props.dateText) {
        return `An entry already exists for ${props.dateText}. Please choose another date.`
      }
      return 'An entry already exists for this date. Please choose another date.'
    })

    const handleClose = () => emit('close')

    return {
      bodyText,
      handleClose
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
  max-width: 420px;
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
