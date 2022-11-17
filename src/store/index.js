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
    positions: null,
    tokens: null,
    notifications: [],
    loaded: {
      balances: false,
      pools: false,
      positions: false,
      tokens: false
    }
  },
  getters: {
  },
  mutations: {
    async pushNotification(state, notification) {
      let newId = 0
      if (state.notifications[0]) {
        for (let i = 0; i < state.notifications.length; i++) {
          if (state.notifications[i].id >= newId) {
            newId = state.notifications[i].id + 1
          }
        }
      }
      state.notifications.push({
        id: newId,      // int
        // txid: notification.txid,
        title: notification.title,
        type: notification.type,  // success/error
        text: notification.text   // caption
      })
    },
    removeNotification(state, id) {
      state.notifications = state.notifications.filter(x => x.id !== id)
    },
    emitLoading(state, parameter) {
      if (parameter === 'positions') { state.loaded.positions = true }
      if (parameter === 'tokens') { state.loaded.tokens = true }
    }
  },
  actions: {
    async reload ({state, commit, dispatch}) {
      state.tokenBalances = []
      state.tokens = null
      state.pools = []
      state.positions = null
      await dispatch('fetchCrispContract', state)
      await dispatch('fetchPools', state)
      await dispatch('fetchBalances', state)
      if (state.pools[0]) {
        await dispatch('processTokenMetadata', state)
      } else {
        await commit('emitLoading', 'tokens')
      }
      if (state.pools[0]) {
        await dispatch('processPositions', state)
      } else {
        await commit('emitLoading', 'positions')
      }
    },
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
      // const contract = state.crispContract
      // if (contract) {
      //     const response = await contract.get_pools()
      //     console.log(response)
      //     state.pools = response
      //     state.loaded.pools = true
      // }
      await state.walletConnection.account().viewFunction(
        {
          contractId: CONTRACT_ID,
          methodName: 'get_pools',
          args: {
          },
        }
      ).then((res) => {
        state.pools = res
        state.loaded.pools = true
      })
    },
    async processTokenMetadata({state}) {
      const tokens = []
      for (let i = 0; i < state.pools.length; i++) {
        const pool = state.pools[i]
        if (tokens.findIndex((unit) => {
          unit.token === pool.token0
        }) === -1) {
          tokens.push({
            token: pool.token0,
          })
        }
        if (tokens.findIndex((unit) => {
          unit.token === pool.token1
        }) === -1) {
          tokens.push({
            token: pool.token1,
          })
        }
      }

      const tokensWithMetadata = []

      for (let i = 0; i < tokens.length; i++) {
        await state.walletConnection.account().viewFunction(
          {
            contractId: tokens[i].token,
            methodName: 'ft_metadata',
            args: {
            }
          }
        ).then((res) => {
          tokensWithMetadata[tokens[i].token] = {
            token: tokens[i].token,
            icon: res.icon,
            symbol: res.symbol,
            decimals: res.decimals,
            name: res.name
          }
        })
      }
      console.log(tokensWithMetadata)
      state.tokens = tokensWithMetadata
      state.loaded.tokens = true
    },
    async processPositions({state}) {
      state.positions = []
      for (let i = 0; i < state.pools.length; i++) {
        const pool = state.pools[i]
        console.log(pool)
        for (let p = 0; p < pool.positions.length; p++) {
          const position = pool.positions[p]
          let token0obj, token1obj
          if (state.tokens[pool.token0]) {
            token0obj = state.tokens[pool.token0]
          }
          if (state.tokens[pool.token1]) {
            token1obj = state.tokens[pool.token1]
          }
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
            token0_real_liquidity: position.token0_real_liquidity / Math.pow(10, token0obj.decimals),
            token1_real_liquidity: position.token1_real_liquidity / Math.pow(10, token1obj.decimals)
          })
        }
      }
      state.loaded.positions = true
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
                // amount: formatedArr[i+1],
                amount: formatedArr[i+1] / Math.pow(10, res.decimals),
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
          state.loaded.balances = true
        })
      }
      state.tokensBeingLoaded = false
    }
  },
  modules: {
  }
})
