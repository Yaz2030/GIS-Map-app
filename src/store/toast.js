import { reactive } from "vue";

let nextId = 1;

export const toastState = reactive({
  items: [],
});

export function pushToast(message, type = "success", duration = 3200) {
  const id = nextId++;
  toastState.items.push({ id, message, type });
  setTimeout(() => removeToast(id), duration);
  return id;
}

export function removeToast(id) {
  const index = toastState.items.findIndex((item) => item.id === id);
  if (index !== -1) toastState.items.splice(index, 1);
}
