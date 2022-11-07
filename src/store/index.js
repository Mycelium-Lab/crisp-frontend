import { createStore } from 'vuex'
import * as nearAPI from "near-api-js"
import { CONTRACT_ID, METHOD_NAMES } from '../constants/index.js'
import { CONFIG } from '../utils/index.js'

export default createStore({
  state: {
    nearConnection: null,
    walletConnection: null,
    crispContract: null,
    account: null
  },
  getters: {
  },
  mutations: {
  },
  actions: {
    async fetchCrispContract ({state}) {
      const { connect, WalletConnection, Contract } = nearAPI
      console.log(CONFIG.keyStore)

      // connect to NEAR
      state.nearConnection = await connect(CONFIG)
      // create wallet connection
      state.walletConnection = await new WalletConnection(state.nearConnection, 'my-app');

      if (state.walletConnection.isSignedIn()) {
        state.account = await state.nearConnection.account(state.walletConnection.getAccountId())
  
        state.crispContract = await new Contract(
          state.account,
          "dev-1665751360038-15697305691965",
          {
            viewMethods: ['get_pools'],
            changeMethods: ['get_balance_all_tokens']
          }
        )
      } else {
        state.walletConnection.requestSignIn({
          contractId: CONTRACT_ID,
          methodNames: METHOD_NAMES
        });
      }
    }
  },
  modules: {
  }
})
