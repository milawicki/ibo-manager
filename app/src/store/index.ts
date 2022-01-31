import Vue from 'vue'
import Vuex from 'vuex'
import { BottlesStore } from './bottles'
import { UserStore } from './user'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    UserStore,
    BottlesStore
  }
})
