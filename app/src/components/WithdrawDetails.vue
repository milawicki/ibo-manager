<template>
  <v-overlay color="blue" :value="true" opacity="0.9">
    <h1>you're almost there!</h1>
    <h2>show below account address to one of our employees to get you bottles</h2>
    <h4 class="text-h4 mt-10">{{ address }}</h4>

    <v-btn elevation="2" fab fixed top right outlined @click="$emit('close')">X</v-btn>
  </v-overlay>
</template>

<script lang="ts">
  import { Address } from "@/interfaces";
  import { Component, Prop, Vue } from "vue-property-decorator";

  @Component
  export default class WitdrawDetails extends Vue {
    @Prop({ required: true }) readonly address!: Address;
  }
</script>
