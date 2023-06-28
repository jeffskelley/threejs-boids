<script setup>
import { useWebGLStore } from "~/store/webgl";

const { $webglManager } = useNuxtApp();

const webglStore = useWebGLStore();
watchEffect(async () => {
  if (webglStore.isInitialized) {
    await $webglManager.loadScene("home");
    $webglManager.activateScene("home");
  }
});
</script>

<template>
  <div class="app">
    <WebGLContainer />
  </div>
</template>

<style lang="scss"></style>
