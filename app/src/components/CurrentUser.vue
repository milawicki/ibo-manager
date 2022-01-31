<template>
  <div class="flex text-right">
    <template v-if="user">
      {{ user }}
      <avatar :address="user" />
    </template>
    <v-chip @click="$emit('walletConnected')" v-else color="red" class="white--text">connect wallet to chat</v-chip>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from "vue-property-decorator";
  import { Address } from "@/interfaces";
  import Avatar from "@/components/Avatar.vue";

  @Component({ components: { Avatar } })
  export default class CurrentUser extends Vue {
    @Prop() readonly user!: Address;
  }
</script>
