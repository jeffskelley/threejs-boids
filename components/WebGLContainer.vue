<script setup>
const { $webglManager } = useNuxtApp();
const root = ref(null);

onMounted(() => {
  $webglManager.init(root.value);
});
</script>

<template>
  <div ref="root" class="webgl-container"></div>
</template>

<style lang="scss">
.webgl-container {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #000;
}
</style>
