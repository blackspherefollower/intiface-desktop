<template>
  <v-container>
    <template v-slot:header>
      <div>Device Simulator</div>
    </template>
    <v-flex shrink>
      <v-btn outline class="my-3" @click="AddDevice()">Add device</v-btn>
      <v-btn outline class="my-3" @click="RemoveDevice()">Remove device</v-btn>
    </v-flex>
    <SimulatorVisual v-for="item in controls"
                     :key="item.type+item.index"
                     :type="item.type"
                     :index="item.index"
                     :value="item.value"
                     :clockwise="item.clockwise"
    />
  </v-container>
</template>

<script lang="ts" src="./SimulatorPanel.ts">
</script>
