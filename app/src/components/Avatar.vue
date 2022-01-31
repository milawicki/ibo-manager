<template>
  <v-avatar size="32">
    <img :src="`https://i.pravatar.cc/32?u=${ address }`" :alt="address" />
  </v-avatar>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from "vue-property-decorator";
  import { Address } from "@/interfaces";

  @Component
  export default class Avatar extends Vue {
    @Prop({ required: true }) readonly address!: Address
  }
</script>
