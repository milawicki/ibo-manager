import { ActionContext, Module } from 'vuex';
import { UserService } from '@/services';
import { Address } from '@/interfaces';

interface State {
  address: Address | null;
  currentUserBalance: number;
}

export const UserStore: Module<State, null> = {
  namespaced: true,

  state: {
    address: null,
    currentUserBalance: 0
  },

  getters: {
    currentUser: (state: State) => state.address,
    currentUserBalance: (state: State) => state.currentUserBalance
  },

  mutations: {
    setCurrentUser(state: State, address: Address): void {
      state.address = address;
    },

    setCurrentUserBalance(state: State, balance: number): void {
      state.currentUserBalance = balance;
    }
  },

  actions: {
    async getCurrentUser(context: ActionContext<State, null>): Promise<void> {
      const currentUser = await UserService.getCurrentUser();
      context.commit('setCurrentUser', currentUser);

      context.dispatch('getCurrentUserBalance');
    },

    async getCurrentUserBalance(context: ActionContext<State, null>): Promise<void> {
      const currentUserBalance = await UserService.getCurrentUserBalance();
      context.commit('setCurrentUserBalance', currentUserBalance);
    },

    async connect(context: ActionContext<State, null>): Promise<void> {
      await UserService.connectToWallet();
      context.dispatch('getCurrentUser');
    }
  }
}
