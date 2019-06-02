<template>
  <v-container>
    <v-btn
    @click="ToggleProxy()">
      {{ !IsRunning ? "Start" : "Stop" }} Proxy
    </v-btn>
  </v-container>
</template>

<script lang="ts" src="./ProxyPanel.ts">
</script>
