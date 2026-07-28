<template>
  <svg
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="markup"
  ></svg>
</template>

<script>
import { getIconMarkup } from "../utils/iconPaths";

export default {
  name: "AppIcon",

  props: {
    name: {
      type: String,
      required: true,
    },
    size: {
      type: [Number, String],
      default: 20,
    },
  },

  computed: {
    markup() {
      return getIconMarkup(this.name);
    },
  },
};
</script>

<style scoped>
.app-icon {
  display: inline-block;
  flex-shrink: 0;
}
</style>
