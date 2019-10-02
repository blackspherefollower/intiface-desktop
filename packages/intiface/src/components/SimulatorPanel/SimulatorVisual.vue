<template>
    <v-card flat color="transparent">
        <v-subheader>{{this.type}} - {{this.index}}</v-subheader>

        <v-card-text class="pt-0">
            <v-slider readonly value=sliderValue :min="minValue" max="100" :value="sliderValue"/>
        </v-card-text>
    </v-card>
</template>

<script lang="ts" src="./SimulatorVisual.ts">
</script>
