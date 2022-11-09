import { createStore } from 'vuex'
import * as nearAPI from "near-api-js"
import { CONTRACT_ID, METHOD_NAMES } from '../constants/index.js'
import { CONFIG } from '../utils/index.js'

export default createStore({
  state: {
    nearConnection: null,
    walletConnection: null,
    crispContract: null,
    account: null,
    tokenBalances: []
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

      console.log(state.walletConnection.isSignedIn())
      if (state.walletConnection.isSignedIn()) {
        state.account = await state.nearConnection.account(state.walletConnection.getAccountId())
  
        state.crispContract = await new Contract(
          state.account,
          CONTRACT_ID,
          {
            viewMethods: ['get_pools', 'get_balance'],
            changeMethods: ['open_position', 'get_balance_all_tokens', 'storage_deposit', 'ft_transfer_call']
          }
        )
      } else {
        state.walletConnection.requestSignIn({
          contractId: CONTRACT_ID,
          methodNames: METHOD_NAMES
        });
      }
    },
    async fetchBalances ({state}) {
      if (state.crispContract && state.walletConnection.isSignedIn()) {
        console.log('fetching balances for account ' + state.walletConnection.getAccountId())
        await state.crispContract.get_balance_all_tokens(
          { account: state.walletConnection.getAccountId() }
        )
        .then((resolve) => {
          console.log(resolve)
          state.tokenBalances = resolve
        })
      }
    }
  },
  modules: {
  }
})
