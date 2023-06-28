import { defineStore } from "pinia";

export const useWebGLStore = defineStore("webglStore", () => {
  const isInitialized = ref(false);

  return {
    isInitialized,
  };
});
