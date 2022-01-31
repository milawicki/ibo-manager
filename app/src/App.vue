<template>
  <v-app>
     <v-app-bar app flat color="white">
       <v-app-bar-title>IBO - Initial Bottle Offering</v-app-bar-title>
       <current-user :user="currentUser" @walletConnected="onWalletConnected" />
    </v-app-bar>

    <v-main>
      <v-container class="py-8 px-6">
        <v-row>
          <v-col cols="6">
            <h1>What is IBO?</h1>
            <p>IBO (Initial Bottle Offering) is a way for alcohol producers to tokenize thier production. You as a producer can create token that'll represent bottles you'll provide in the future. Customers can buy tokends with discount and exchange them to real bottles when they'll be ready.</p>
            <p><small>ps. this app is not production ready</small></p>

            <h2 class="mt-7 my-4 d-flex justify-space-between">
              Current offers
              <v-btn v-if="!!currentUser" icon small color="primary" title="add IBO"
                @click="showBottleModal = true">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </h2>

            <single-bottle v-for="bottle in bottles" :key="bottle.symbol" class="mb-5"
              :bottle="bottle" :isOwner="isOwner(bottle)" :canBuy="!!currentUser"
              @buy="onBuy" @edit="onBottleEdit" @withdraw="onWithdraw" />

            <v-pagination v-model="currentPage" :length="pages" @input="changePage" />

          </v-col>
          <v-col cols="6">
            <balance :value="currentUserBalance" symbol="ETH" />

            <template v-for="userBalance in userBalances">
              <balance v-if="userBalance.balance" :key="userBalance.token" 
                :value="userBalance.balance" :symbol="userBalance.token" :hasDecimals="false"
                :isWithdrawable="true" @withdraw="onBottleWithdraw" />
            </template>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <no-wallet v-if="!isWalletDetected" />

    <bottle-model v-if="showBottleModal"
      :bottle="bottleToEdit" 
      @close="closeBottleModal"
      @submit="onBottleSubmit" />

    <withrawd-details v-if="showWithdrawBottleDetails" @close="closeWithrawdDetails" :address="currentUser" />
  </v-app>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import Web3 from 'web3';
  import { Address, Bottle, BuyBottles, TokenBalance } from '@/interfaces';
  import CurrentUser from '@/components/CurrentUser.vue';
  import NoWallet from '@/components/NoWallet.vue';
  import Balance from '@/components/Balance.vue';
  import SingleBottle from '@/components/SingleBottle.vue';
  import BottleModel from '@/components/BottleModel.vue';
  import WithrawdDetails from '@/components/WithdrawDetails.vue';

  @Component({ components: { CurrentUser, Balance, BottleModel, NoWallet, SingleBottle, WithrawdDetails } })
  export default class App extends Vue {
    bottleToEdit: Bottle | null = null;
    showBottleModal: boolean = false;
    currentPage = 1;

    async mounted(): Promise<void> {      
      await this.$store.dispatch('BottlesStore/init');
      this.loadData();

      Web3.givenProvider.on('accountsChanged', () => {
        this.loadData();
      });
    }

    get currentUser(): Address | null {
      return this.$store.getters['UserStore/currentUser'];
    }

    get currentUserBalance(): Address | null {
      return this.$store.getters['UserStore/currentUserBalance'];
    }

    get isWalletDetected(): boolean {
      return !!Web3.givenProvider;
    }

    get bottles(): Bottle[] {
      return this.$store.getters['BottlesStore/bottles'];
    }

    get userBalances(): TokenBalance[] {
      return this.$store.getters['BottlesStore/userBalances'];
    }

    get showWithdrawBottleDetails(): Bottle | null {
      return this.$store.getters['BottlesStore/showWithdrawBottleDetails'];
    }

    get pages(): number {
      return this.$store.getters['BottlesStore/pages'] || 0;
    }

    async loadData(): Promise<void> {
      await this.$store.dispatch('UserStore/getCurrentUser');
      if (this.currentUser) {
        this.$store.dispatch('BottlesStore/getUserBalances', this.currentUser);
      }
    }

    onWalletConnected(): void {
      this.$store.dispatch('UserStore/connect');
    }

    onBuy(order: BuyBottles): void {
      this.$store.dispatch('BottlesStore/buyToken', order);
    }

    isOwner(bottle: Bottle): boolean {
      return bottle.owner === this.currentUser;
    }

    onBottleEdit(bottle: Bottle): void {
      this.bottleToEdit = bottle;
      this.showBottleModal = true;
    }

    closeBottleModal() {
      this.bottleToEdit = null;
      this.showBottleModal = false;
    }

    onBottleSubmit(newBottle: Bottle, bottle: Bottle): void {
      bottle
        ? this.$store.dispatch('BottlesStore/updateBottle', { newBottle, bottle })
        : this.$store.dispatch('BottlesStore/createBottle', newBottle);

      this.closeBottleModal();
    }

    onBottleWithdraw(data: TokenBalance): void {
      this.$store.dispatch('BottlesStore/withdrawBottle', data);
    }

    closeWithrawdDetails(): void {
      this.$store.commit('BottlesStore/setShowWithdrawBottleDetails', false);
    }

    onWithdraw(bottle: Bottle): void {
      this.$store.dispatch('BottlesStore/withdraw', bottle);
    }

    changePage(page: number): void {
      this.$store.dispatch('BottlesStore/getBottlesDetails', page -1);

      if (this.currentUser) {
        this.$store.dispatch('BottlesStore/getUserBalances', this.currentUser);
      }
    }
  }
</script>
