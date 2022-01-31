import { ActionContext, Module } from 'vuex';
import { BottlesService, BottlesServiceEvents, ManagerService } from '@/services';
import { Address, Approval, Bottle, BuyBottles, Transaction, TokenBalance, Withdraw, Ibo, BottleEditableDetails } from '@/interfaces';
import { UpdateBottlePayload } from './interfaces';

const ITEMS_PER_PAGE = 10;

interface State {
  bottles: Bottle[];
  userBalances: TokenBalance[];
  showWithdrawBottleDetails: boolean;
  bottlesQua: number;
}

function subscribeForTransferEvents(context: ActionContext<State, null>, bottlesService: BottlesService, symbol: string): void {
  bottlesService.subscribeForEvent(BottlesServiceEvents.Transfer, async({ returnValues }: { returnValues: Transaction }) => {
    returnValues = {
      ...returnValues,
      value: +returnValues.value,
      symbol
    };

    if (returnValues.from === '0x0000000000000000000000000000000000000000') {
      context.dispatch('updateBottleData', returnValues)
      context.dispatch('UserStore/getCurrentUserBalance', null, { root: true });
    } else {
      const userAddress = context.rootGetters['UserStore/currentUser'];
      const qua = returnValues.value;

      const tokensToAdd = returnValues.from === userAddress
        ? qua * -1
        : returnValues.to === userAddress
          ? qua
          : 0;

      context.dispatch('updateUserBalance', { symbol, value: tokensToAdd });
    }
  });
}

function subscribeForAproval(context: ActionContext<State, null>, bottlesService: BottlesService, symbol: string): void {
  bottlesService.subscribeForEvent(BottlesServiceEvents.Approval, ({ returnValues }: { returnValues: Approval }) => {
    const currentUser = context.rootGetters['UserStore/currentUser'];
    if (currentUser === returnValues.owner) {
      context.commit('setShowWithdrawBottleDetails', true);
    }
  });
}

function subscribeForWithdraw(context: ActionContext<State, null>, bottlesService: BottlesService, symbol: string): void {
  bottlesService.subscribeForEvent(BottlesServiceEvents.Withdraw, ({ returnValues }: { returnValues: Withdraw }) => {
    const currentUser = context.rootGetters['UserStore/currentUser'];
    if (currentUser === returnValues.to) {
      context.dispatch('UserStore/getCurrentUserBalance', null, { root: true });
    }
  });
}

export const BottlesStore: Module<State, null> = {
  namespaced: true,

  state: {
    bottles: [],
    userBalances: [],
    showWithdrawBottleDetails: false,
    bottlesQua: 0,
  },

  getters: {
    bottles: (state: State) => state.bottles,
    userBalances: (state: State) => state.userBalances,
    showWithdrawBottleDetails: (state: State) => state.showWithdrawBottleDetails,
    pages: (state: State) => Math.ceil(state.bottlesQua / ITEMS_PER_PAGE)
  },

  mutations: {
    setUserBalance(state: State, tokenBalance: TokenBalance): void {
      const userBalances = [...state.userBalances];
      const userBalanceNdx = userBalances.findIndex(balance => balance.token === tokenBalance.token);

      if (userBalanceNdx !== -1) {
        userBalances[userBalanceNdx] = tokenBalance;
      } else {
        userBalances.push(tokenBalance);
      }

      state.userBalances = userBalances;
    },

    setShowWithdrawBottleDetails(state: State, value: boolean): void {
      state.showWithdrawBottleDetails = value;
    },

    setBottlesQua(state: State, bottlesQua: number): void {
      state.bottlesQua = bottlesQua;
    },

    addBottle(state: State, bottle: Bottle): void {
      const bottles = [
        ...state.bottles,
        bottle
      ];

      state.bottles = bottles;
    },

    updateBottle(state: State, bottle: Bottle): void {
      const bottles = [...state.bottles];
      const bottlesNdx = bottles.findIndex(_bottle => _bottle.symbol === bottle.symbol);

      if (bottlesNdx !== -1) {
        bottles[bottlesNdx] = bottle;
      } else {
        bottles.push(bottle);
      }

      state.bottles = bottles;
    },

    clearBottlesAndBalances(state: State) {
      state.bottles = [];
      state.userBalances = [];
    }
  },

  actions: {
    async init(context: ActionContext<State, null>): Promise<void> {
      const bottlesQua = await ManagerService.getNumberOfIbos();

      if (bottlesQua) {
        context.commit('setBottlesQua', bottlesQua);
        await context.dispatch('getBottlesDetails', 0);
      }
    },

    async getBottlesDetails(context: ActionContext<State, null>, page: number): Promise<void> {
      const offset = page * ITEMS_PER_PAGE;
      const limit = ITEMS_PER_PAGE;

      const list = await ManagerService.getIbos(offset, limit);
      context.commit('clearBottlesAndBalances');

      for (const bottle of list) {
        context.dispatch('getBottleDetails', bottle);
      }
    },

    async getBottleDetails(context: ActionContext<State, null>, bottle: Ibo): Promise<void> {
      const bs = new BottlesService(bottle.addr);
      const details = await bs.getDetails();

      if (!details) {
        return;
      }

      subscribeForTransferEvents(context, bs, details.symbol);
      subscribeForAproval(context, bs, details.symbol);
      subscribeForWithdraw(context, bs, details.symbol);

      context.commit('addBottle', {
        ...details,
        address: bottle.addr
      });
    },

    async getUserBalances(context: ActionContext<State, null>, userAddress: Address): Promise<void> {
      context.getters.bottles.forEach(async(bottle: Bottle) => {
        const balance = await (new BottlesService(bottle.address!)).getUserBalance(userAddress);
        balance && context.commit('setUserBalance', balance);
      });
    },

    buyToken(context: ActionContext<State, null>, order: BuyBottles): void {
      (new BottlesService(order.bottle.address!)).buyToken(order.qua);
    },

    updateBottle(context: ActionContext<State, null>, { newBottle, bottle }: UpdateBottlePayload): void {
      (new BottlesService(bottle.address!)).updateBottleData(newBottle, bottle);
    },

    withdrawBottle(context: ActionContext<State, null>, data: TokenBalance): void {
      const bottle: Bottle = context.getters.bottles.find((bottle: Bottle) => bottle.symbol === data.token);
      bottle && (new BottlesService(bottle.address!)).startWithdrawingProcess(bottle.owner, data);
    },

    withdraw(context: ActionContext<State, null>, bottle: Bottle): void {
      (new BottlesService(bottle.address!)).withdraw();
    },

    updateBottleData(context: ActionContext<State, null>, transaction: Transaction): void {
      const userBalance: TokenBalance = context.getters.userBalances.find((balance: TokenBalance) => balance.token === transaction.symbol) || 
        { token: transaction.symbol, balance: 0 };

      userBalance.balance += transaction.value;
      context.commit('setUserBalance', userBalance);

      const bottle = context.getters.bottles.find((bottle: Bottle) => bottle.symbol === transaction.symbol)
      bottle && context.commit('updateBottle', { ...bottle, totalSupply: +bottle.totalSupply + transaction.value })
    },

    updateUserBalance(context: ActionContext<State, null>, { symbol, value: tokensToAdd }: { symbol: string, value: number }): void {
      const userBalance: TokenBalance = context.getters.userBalances.find((balance: TokenBalance) => balance.token === symbol);
      if (!userBalance) {
        return;
      }

      userBalance.balance += tokensToAdd;
      context.commit('setUserBalance', userBalance);
    },

    createBottle(context: ActionContext<State, null>, bottle: BottleEditableDetails): void {
      const callback = ({ returnValues }: { returnValues: Ibo }) => {
        context.dispatch('getBottleDetails', returnValues);
      };

      ManagerService.createBottle(bottle, callback);
    },
  }
}
