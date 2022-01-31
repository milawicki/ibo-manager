<template>
  <v-card class="mx-auto my-4" max-width="400">
    <v-list-item two-line>
      <v-list-item-content>
        <v-list-item-title class="text-h5 d-flex justify-space-between">
          Your {{ symbol }} balance

          <v-btn v-if="isWithdrawable" icon small color="primary" title="witdraw your bottles"
            @click="$emit('withdraw', { token: symbol, balance: value })">
            <v-icon>mdi-bottle-wine</v-icon>
          </v-btn>
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-card-text class="text-h2 text-right">
      <template v-if="hasDecimals">
        {{ value.toFixed(2) }} {{ symbol }}
        <p class="text-caption">{{ value }} {{ symbol }}</p>
      </template>
      <template v-else>
        {{ value }} {{ symbol }}
      </template>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from "vue-property-decorator";

  @Component
  export default class Balance extends Vue {
    @Prop({ required: true }) readonly value!: number;
    @Prop({ required: true }) readonly symbol!: string;
    @Prop({ default: true }) readonly hasDecimals!: boolean;
    @Prop({ default: false }) readonly isWithdrawable!: boolean;
  }
</script>
