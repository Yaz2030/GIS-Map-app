<template>
  <div class="toast-container" aria-live="polite">
    <TransitionGroup name="toast-pop">
      <div v-for="toast in toastState.items" :key="toast.id" class="toast" :class="toast.type">
        <AppIcon :name="toast.type === 'error' ? 'alert-circle' : 'check-circle'" :size="16" />
        <span>{{ toast.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script>
import AppIcon from "./AppIcon.vue";
import { toastState } from "../store/toast";

export default {
  name: "ToastContainer",

  components: { AppIcon },

  data() {
    return { toastState };
  },
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  /* يبدأ دائمًا أسفل الهيدر كاملًا بدل التراكب معه، ويتبع تلقائيًا أي تغيير
     مستقبلي بـ --header-height (مثلاً بين الموبايل والديسكتوب) دون الحاجة
     لتكرار القيمة هنا */
  top: calc(var(--header-height) + 16px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 5000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 220px;
  background: var(--bg-surface);
  color: var(--text-primary);
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-panel);
  border-inline-start: 4px solid var(--accent-primary);
  font-size: 13.5px;
}

.toast.success {
  border-inline-start-color: var(--color-success);
}

.toast.error {
  border-inline-start-color: var(--color-danger);
}

.toast-pop-enter-active,
.toast-pop-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-pop-enter-from,
.toast-pop-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
