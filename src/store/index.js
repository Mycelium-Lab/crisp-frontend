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
    tokenBalances: [],
    tokensBeingLoaded: false,
    pools: [],
    positions: []
  },
  getters: {
  },
  mutations: {
  },
  actions: {
    async signIn ({state}) {
      await state.walletConnection.requestSignIn({
        contractId: CONTRACT_ID,
        methodNames: METHOD_NAMES
      }).then(() => {
        // ..
      })
    },
    async signOut ({state}) {
      state.walletConnection.signOut()
      location.reload()
    },
    async fetchPools({state}) {
      const contract = state.crispContract
      if (contract) {
          const response = await contract.get_pools()
          console.log(response)
          state.pools = response
      }
    },
    async processPositions({state}) {
      state.positions = []
      for (let i = 0; i < state.pools.length; i++) {
        const pool = state.pools[i]
        console.log(pool)
        for (let p = 0; p < pool.positions.length; p++) {
          const position = pool.positions[p]
          state.positions.push({
            id: position.id,
            poolId: i,
            isActive: position.is_active,
            ownerId: position.owner_id,
            sqrt_lower_bound_price: position.sqrt_lower_bound_price,
            sqrt_upper_bound_price: position.sqrt_upper_bound_price,
            tick_lower_bound_price: position.tick_lower_bound_price,
            tick_upper_bound_price: position.tick_upper_bound_price,
            token0: pool.token0,
            token1: pool.token1,
            token0_real_liquidity: position.token0_real_liquidity,
            token1_real_liquidity: position.token1_real_liquidity
          })
        }
      }
    },
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
            changeMethods: ['open_position', 'close_position', 'swap_in', 'swap_out', 'get_balance_all_tokens', 'storage_deposit', 'ft_transfer_call', 'withdraw', 'get_return', 'get_expense']
          }
        )
      } else {
        // console.log('smths wrong')
      }
    },
    async fetchBalances ({state}) {
      state.tokensBeingLoaded = true
      if (state.crispContract && state.walletConnection.isSignedIn()) {
        console.log('fetching balances for account ' + state.walletConnection.getAccountId())
        await state.crispContract.get_balance_all_tokens(
          { account_id: state.walletConnection.getAccountId() }
        )
        .then(async (resolve) => {
          console.log(resolve)
          // We have a string instead of array of objects. So, first we split it by using : and , symbols as separators
          const arr = resolve.split(/[:,,]/)
          const formatedArr = []
          const balanceObjects = []
          // Resulting array units might still have empty spaces in them, so we remove those spaces
          arr.forEach((unit) => {
            const newUnit = unit.replace(/ /g, '')
            if (newUnit) formatedArr.push(newUnit)
          })
          // At this point we have an array which looks like
          // [token, amount, token, amount]
          // We call ft_metadata() function for each odd (1st, 3rd, 5th ..) array index
          for (let i = 0; i < formatedArr.length; i++) {
            await state.walletConnection.account().viewFunction({
              contractId: formatedArr[i],
              methodName: 'ft_metadata',
              args: {
                account_id: state.account.accountId
              },
            },
            state.account.accountId
            ).then((res) => {
              balanceObjects.push({
                token: formatedArr[i],
                amount: formatedArr[i+1],
                icon: res.icon,
                symbol: res.symbol,
                decimals: res.decimals,
                name: res.name
              })
            })
            // 2nd increment is placed inside the cycle body so this only affects odd array indexes
            i++
          }
          console.log(balanceObjects)
          state.tokenBalances = balanceObjects
        })
      }
      state.tokensBeingLoaded = false
    }
  },
  modules: {
  }
})
