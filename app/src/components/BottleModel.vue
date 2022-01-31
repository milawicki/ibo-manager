<template>
  <v-dialog value="true" max-width="600" @click:outside="$emit('close')">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ isEditMode ? 'Edit' : 'Add' }} Bottle</span>
      </v-card-title>
      <v-card-text>
        <v-form v-model="isValid">
          <v-row>
            <v-col cols="12">
              <v-text-field :disabled="isEditMode" label="Name" v-model.trim="newBottle.name" :rules="[required]"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field :disabled="isEditMode" label="Symbol" v-model.trim="newBottle.symbol" :rules="[required]"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field :disabled="isEditMode" type="number" label="Bottles" v-model.trim="newBottle.bottles" :rules="[required, isPositive, isInt]"></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-text-field required label="Description" v-model.trim="newBottle.desc" :rules="[required]"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field label="Producer" v-model.trim="newBottle.producer"  :rules="[required]"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field label="Url to additional info" v-model.trim="newBottle.url" :rules="[required]"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field type="number" label="Offer price" suffix="ETH" v-model.trim="newBottle.price" :rules="[required, isPositive]"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field type="number" label="Shop price" suffix="ETH" v-model.trim="newBottle.shopPrice" :rules="[required, isPositive, isBiggerThanPrice]"></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="$emit('close')">
          Cancel
        </v-btn>
        <v-btn color="blue darken-1" text :disabled="!isValid" @click="save">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from "vue-property-decorator";
  import { Bottle, BottleEditableDetails } from "@/interfaces";
  import { fromEth, toEth } from "@/helpers/number";

  @Component
  export default class BottleModel extends Vue {
    @Prop({ default: () => ({}) }) readonly bottle!: Bottle;

    newBottle: BottleEditableDetails = {
      ...this.bottle,
      price: this.bottle?.price && +toEth(this.bottle.price.toString()),
      shopPrice: this.bottle?.shopPrice && +toEth(this.bottle.shopPrice.toString())
    }

    isValid: boolean = true;

    get isEditMode(): boolean {
      return Boolean(this.bottle?.symbol);
    }

    save (): void {
      if (!this.isValid) {
        return;
      }

      this.$emit('submit', {
        ...this.newBottle,
        price: +fromEth(this.newBottle.price.toString()),
        shopPrice: +fromEth(this.newBottle.shopPrice.toString())
      },
      this.bottle);
    }

    required(value: string | number): boolean {
      return Boolean(value);
    }

    isInt(value: string | number): boolean {
      return Math.round(+value) === +value;
    }

    isPositive(value: string | number): boolean {
      return +value > 0;
    }

    isBiggerThanPrice(value: string | number): boolean {
      return +value > this.newBottle.price;
    }
  }
</script>
