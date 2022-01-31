<template>
  <v-card>
    <v-card-title class="d-flex flex-row justify-space-between">
      <div>
          {{ bottle.name }}
          <small class="text-caption">{{ bottle.symbol.toUpperCase() }}</small>
        </div>
        <div>
          <small class="text-caption">bottles</small>
          ({{bottle.totalSupply}}/{{ bottle.bottles }})

          <template v-if="isOwner">
            <v-btn icon x-small color="blue" title="edit" @click="$emit('edit', bottle)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>

            <v-btn icon x-small color="green" title="withdraw funds" @click="$emit('withdraw', bottle)">
              <v-icon>mdi-ethereum</v-icon>
            </v-btn>
          </template>
        </div>
    </v-card-title>

    <v-card-subtitle class="d-flex flex-row justify-space-between">
      <span>{{ bottle.producer }}</span>

      <v-btn x-small plain text :href="bottle.url" target="_new">
        read more 
        <v-icon small class="pl-1">mdi-open-in-new</v-icon>
      </v-btn>
    </v-card-subtitle>

    <v-card-text>
      {{ bottle.desc }}
    </v-card-text>

    <v-card-actions class="mx-6 flex-row justify-space-between">
      <div>
        <p>Shop Price: {{ bottle.shopPrice | toEth }} ETH</p>
        <p>
          IBO Price: {{ bottle.price | toEth }} ETH 
          <span class="green--text text--darken-3">({{ discountValue }}% off)</span>
        </p>
      </div>
      <div class="d-flex align-center text-right">
        <v-text-field type="number" v-model="qua" min="1" :max="bottlesLeft" suffix="x" class="text-right mr-2" />
        <v-btn :disabled="buyingDisabled" @click="buy" color="green darken-1 white--text">buy</v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from "vue-property-decorator";
  import { Bottle, BuyBottles } from "@/interfaces";
  import { toEth } from '@/helpers/number';

  @Component({ filters: { toEth } })
  export default class SingleBottle extends Vue {
    @Prop({ required: true }) readonly bottle!: Bottle;
    @Prop({ default: false }) readonly isOwner!: boolean;
    @Prop({ default: false }) readonly canBuy!: boolean;

    qua: number = 1;

    get discountValue(): number {
      return +((this.bottle.price - this.bottle.shopPrice) / this.bottle.shopPrice * 100 * -1).toFixed(2);
    }

    get buyingDisabled(): boolean {
      return this.bottle.totalSupply === this.bottle.bottles || !this.canBuy;
    }

    get bottlesLeft(): number {
      return this.bottle.bottles - this.bottle.totalSupply;
    }

    buy(): void {
      if (isNaN(this.qua) || this.qua < 1 || this.qua > this.bottlesLeft ) {
        return;
      }

      const order: BuyBottles = {
        bottle: this.bottle,
        qua: this.qua
      };

      this.$emit('buy', order);
    }
  }
</script>
