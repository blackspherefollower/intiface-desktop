<template>
  <v-container>
    <template v-slot:header>
      <div>Device Simulator</div>
    </template>
    <v-flex shrink>
      <v-btn outline class="my-3" @click="AddDevice()">Add a device</v-btn>
    </v-flex>
  </v-container>
</template>

<script lang="ts" src="./SimulatorPanel.ts">
</script>
