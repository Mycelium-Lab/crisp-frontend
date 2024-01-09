import { createStore } from 'vuex'
import * as nearAPI from "near-api-js"
import { CONTRACT_ID, METHOD_NAMES, SWAP_TOKENS } from '../constants/index.js'
import { CONFIG } from '../utils/index.js'
import router from '../router'

import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui-js";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupNearMobileWallet } from "@near-wallet-selector/near-mobile-wallet"; 
import { toFixed } from '@/utils/number.js'
import { removeDecimals } from '@/utils/format.js'

export default createStore({
  state: {
    selector: null,
    modal: null,
    nearConnection: null,
    walletConnection: null,
    crispContract: null,
    account: null,

    accountId: null,
    
    tokenBalances: [],
    tokensBeingLoaded: false,
    pools: [],
    positions: null,
    borrows: null,
    userPositions: null,
    userDeposits: null,
    // userDepositsByToken: null,
    tokens: null,
    notifications: [],
    tokenForDeposit: null,

    loaded: {
      balances: false,
      pools: false,
      positions: false,
      tokens: false,
      deposits: false
    }
  },
  getters: {
    tokenForDeposit: (s) => s.tokenForDeposit
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
      setTimeout(() => {
        this.commit('removeNotification', newId)
      },5000)
    },
    removeNotification(state, id) {
      state.notifications = state.notifications.filter(x => x.id !== id)
    },
    emitLoading(state, parameter) {
      if (parameter === 'positions') { state.loaded.positions = true }
      if (parameter === 'tokens') { state.loaded.tokens = true }
    },
    setDepositToken(state, tokenForDeposit) {
      state.tokenForDeposit = tokenForDeposit
    }
  },
  actions: {
    depositToken({ commit }, token) {
      commit('setDepositToken', token)
      router.push("/deposit")
    },
    async reload ({state, commit, dispatch}) {
      state.loaded = {
        balances: false,
        pools: false,
        positions: false,
        tokens: false,
        deposits: false
      }
      state.tokenBalances = []
      state.tokens = null
      state.pools = []
      state.borrows = null
      state.positions = null
      state.userPositions = null
      state.userDeposits = null
      // state.userDepositsByToken = null
      await dispatch('fetchCrispContract', state)
      await dispatch('fetchPools', state)
      await dispatch('fetchBalances', state)
      if (state.pools[0]) {
        await dispatch('processTokenMetadata', state)
      } else {
        commit('emitLoading', 'tokens')
      }
      if (state.pools[0]) {
        await dispatch('processPositions', state)
      } else {
        commit('emitLoading', 'positions')
      }
      await dispatch('fetchDeposits', state)
      await dispatch('fetchBorrows', state)
    },
    async signIn ({state}) {
      state.modal.show();
    },
    async signOut ({state}) {
      const wallet = await state.selector.wallet();
      await wallet.signOut();
      state.walletConnection.signOut();
      location.reload();
    },
    async fetchPools({state}) {
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
          if (tokens[i].token !== 'wrap.testnet') {
            tokensWithMetadata[tokens[i].token] = {
              token: tokens[i].token,
              icon: res.icon,
              symbol: res.symbol,
              decimals: res.decimals,
              name: res.name
            }
          } else {
            tokensWithMetadata[tokens[i].token] = {
              token: tokens[i].token,
              icon: "data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='12' r='11' fill='%23FAFAFA' stroke='%23D5D4D8' stroke-width='2'%3E%3C/circle%3E%3Cpath d='M15.6317 6.60497L13.1233 10.3034C13.0876 10.3567 13.0725 10.421 13.0808 10.4845C13.0892 10.5479 13.1204 10.6063 13.1686 10.6487C13.2169 10.691 13.279 10.7146 13.3435 10.7151C13.4079 10.7155 13.4703 10.6928 13.5192 10.651L15.9883 8.52414C16.0028 8.51128 16.0207 8.50289 16.0399 8.49998C16.0591 8.49707 16.0788 8.49977 16.0964 8.50776C16.1141 8.51574 16.129 8.52867 16.1394 8.54495C16.1498 8.56123 16.1553 8.58017 16.155 8.59945V15.2582C16.155 15.2786 16.1487 15.2985 16.1369 15.3152C16.1251 15.3319 16.1084 15.3446 16.0891 15.3515C16.0698 15.3585 16.0489 15.3594 16.029 15.3541C16.0092 15.3488 15.9915 15.3376 15.9783 15.3219L8.515 6.44938C8.39495 6.3086 8.24548 6.19548 8.07696 6.11788C7.90844 6.04027 7.72492 6.00005 7.53917 6H7.27833C6.9393 6 6.61415 6.13375 6.37442 6.37183C6.13468 6.60991 6 6.93282 6 7.26952V16.6477C6 16.9844 6.13468 17.3073 6.37442 17.5454C6.61415 17.7835 6.9393 17.9172 7.27833 17.9172C7.49693 17.9173 7.71189 17.8617 7.90271 17.7558C8.09353 17.6499 8.25384 17.4972 8.36833 17.3123L10.8767 13.6138C10.9124 13.5605 10.9275 13.4962 10.9192 13.4328C10.9108 13.3693 10.8796 13.311 10.8314 13.2686C10.7831 13.2262 10.721 13.2026 10.6566 13.2022C10.5921 13.2017 10.5297 13.2245 10.4808 13.2662L8.01167 15.3931C7.9972 15.406 7.97927 15.4144 7.96008 15.4173C7.94088 15.4202 7.92125 15.4175 7.90358 15.4095C7.8859 15.4015 7.87095 15.3886 7.86055 15.3723C7.85015 15.356 7.84475 15.3371 7.845 15.3178V8.65738C7.84501 8.63699 7.85133 8.61711 7.86311 8.60041C7.8749 8.58372 7.89157 8.57103 7.91086 8.56407C7.93016 8.55711 7.95114 8.55622 7.97096 8.56151C7.99078 8.5668 8.00849 8.57803 8.02167 8.59366L15.4842 17.4679C15.6042 17.6086 15.7537 17.7218 15.9222 17.7994C16.0907 17.877 16.2742 17.9172 16.46 17.9172H16.7208C16.8888 17.9174 17.0551 17.8846 17.2103 17.8208C17.3655 17.7571 17.5065 17.6636 17.6253 17.5457C17.7441 17.4278 17.8383 17.2878 17.9026 17.1337C17.9669 16.9797 18 16.8145 18 16.6477V7.26952C18 6.93282 17.8653 6.60991 17.6256 6.37183C17.3859 6.13375 17.0607 6 16.7217 6C16.5031 5.99994 16.2881 6.05552 16.0973 6.16143C15.9065 6.26733 15.7462 6.42004 15.6317 6.60497Z' fill='%23D5D4D8'%3E%3C/path%3E%3C/svg%3E",
              symbol: res.symbol,
              decimals: res.decimals,
              name: res.name
            }
          }
        })
      }
      console.log(tokensWithMetadata)
      state.tokens = tokensWithMetadata
      state.loaded.tokens = true
    },
    async processPositions({state}) {
      state.positions = []
      state.userPositions = []
      for (let i = 0; i < state.pools.length; i++) {
        const pool = state.pools[i]
        console.log(pool)
        const newPositions = []
        for (let [key, value] of Object.entries(pool.positions)) {
          value = {
            ...value,
            id: Number(key)
          }
          newPositions.push(value)
        }
        for (let p = 0; p < newPositions.length; p++) {
          // const position = pool.positions[p]
          const position = newPositions[p]
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
            lower_bound_price_decimals: position.sqrt_lower_bound_price * position.sqrt_lower_bound_price * Math.pow(10, token0obj.decimals - token1obj.decimals),
            upper_bound_price_decimals: position.sqrt_upper_bound_price * position.sqrt_upper_bound_price * Math.pow(10, token0obj.decimals - token1obj.decimals),
            tick_lower_bound_price: position.tick_lower_bound_price,
            tick_upper_bound_price: position.tick_upper_bound_price,
            fees0: position.fees_earned_token0 / Math.pow(10, token0obj.decimals),
            fees1: position.fees_earned_token1 / Math.pow(10, token1obj.decimals),
            token0: pool.token0,
            token1: pool.token1,
            token0_real_liquidity: position.token0_locked / Math.pow(10, token0obj.decimals),
            token1_real_liquidity: position.token1_locked / Math.pow(10, token1obj.decimals),
            totalLiquidity: position.liquidity
          })
          if (state.account && position.owner_id === state.account.accountId) {
            state.userPositions.push({
              id: position.id,
              poolId: i,
              isActive: position.is_active,
              ownerId: position.owner_id,
              sqrt_lower_bound_price: position.sqrt_lower_bound_price,
              sqrt_upper_bound_price: position.sqrt_upper_bound_price,
              lower_bound_price_decimals: position.sqrt_lower_bound_price * position.sqrt_lower_bound_price * Math.pow(10, token0obj.decimals - token1obj.decimals),
              upper_bound_price_decimals: position.sqrt_upper_bound_price * position.sqrt_upper_bound_price * Math.pow(10, token0obj.decimals - token1obj.decimals),
              tick_lower_bound_price: position.tick_lower_bound_price,
              tick_upper_bound_price: position.tick_upper_bound_price,
              fees0: position.fees_earned_token0 / Math.pow(10, token0obj.decimals),
              fees1: position.fees_earned_token1 / Math.pow(10, token1obj.decimals),
              token0: pool.token0,
              token1: pool.token1,
              token0_real_liquidity: position.token0_locked / Math.pow(10, token0obj.decimals),
              token1_real_liquidity: position.token1_locked / Math.pow(10, token1obj.decimals),
              totalLiquidity: position.liquidity,
              activeTab: 'in'
            })
          }
        }
      }
      console.log(state.userPositions)
      state.loaded.positions = true
    },
    async fetchCrispContract ({state}) {
      console.log("nearAPI: ", nearAPI)
      const { connect, WalletConnection, Contract } = nearAPI
      console.log("Keystore: ", CONFIG.keyStore)

      state.selector = await setupWalletSelector({
        network: "testnet",
        modules: [
          setupMyNearWallet(),
          setupNearMobileWallet(),
          setupMeteorWallet(),
          setupNearWallet(),
          setupHereWallet(),
        ],
      });
      console.log("Selector: ", state.selector)

      state.modal = setupModal(state.selector, {
        contractId: CONTRACT_ID,
        methodNames: METHOD_NAMES
      });
      state.modal.on("onHide", () => {
        location.reload();
      });

      // connect to NEAR
      state.nearConnection = await connect(CONFIG)
      // create wallet connection
      state.walletConnection = await new WalletConnection(state.nearConnection, 'my-app');

      if (state.selector.isSignedIn()) {
        const wallet = await state.selector.wallet()
        const accounts = await wallet.getAccounts()
        const account_id = accounts[0].accountId

        state.account = await state.nearConnection.account(account_id)
        console.log("Account: ", state.account)
        
        state.crispContract = await new Contract(
          state.account,
          CONTRACT_ID,
          {
            viewMethods: ['get_pools', 'get_balance', 'positions_opened', 'get_max_leverage'],
            changeMethods: ['open_position', 'close_position', 'add_liquidity', 'remove_liquidity', 'swap',/*'swap_in', 'swap_out',*/ 'get_balance_all_tokens', 'storage_deposit', 'ft_transfer_call', 'withdraw', 'get_return', 'get_expense', 'create_reserve', 'create_deposit', 'close_deposit', 'refresh_deposits_growth', 'take_deposit_growth', 'get_account_deposits', 'supply_collateral_and_borrow', 'return_collateral_and_repay', 'get_liquidation_list', 'get_borrow_health_factor', 'liquidate', 'get_borrows_by_account', 'get_liquidation_price']
          }
        )
      } else {
        // console.log('smths wrong')
      }
    },

    // step 1. get all balances of tokens with get_balance_all_tokens() method if there is a contract entity existing and user is signed in using wallet selector
    // step 2. cast a string resolve from get_balance_all_tokens() into an array of objects
    // step 3. call ft_metadata() for each ODD (1st, 3rd, 5th) array index, since every EVEN (2nd, 4th, 6th) index is an amount
    // step 4. 
    async fetchBalances ({state, dispatch}) {
      state.tokensBeingLoaded = true
      if (state.crispContract && state.selector.isSignedIn() /*state.walletConnection.isSignedIn()*/) {
        // console.log('fetching balances for account ' + state.walletConnection.getAccountId())
        const account_id = state.account.accountId
        console.log('fetching balances for account ' + account_id)

        try {
          await state.walletConnection.account().viewFunction(
            {
              contractId: CONTRACT_ID,
              methodName: 'get_balance_all_tokens',
              args: { account_id: account_id
              },
            }
          )
          .then(async (resolve) => {
            console.log(resolve)
            const formatedArr = []
            const balanceObjects = []
            if (resolve) {
              // We have a string instead of array of objects. So, first we split it by using : and , symbols as separators
              const arr = resolve.split(/[:,,]/)
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
                    account_id: account_id
                  },
                },
                account_id
                ).then((res) => {
                  if (formatedArr[i] !== 'wrap.testnet') {
                    balanceObjects.push({
                      token: formatedArr[i],
                      amount: removeDecimals(formatedArr[i+1], res),
                      icon: res.icon,
                      symbol: res.symbol,
                      decimals: res.decimals,
                      name: res.name
                    })
                  } else {
                    balanceObjects.push({
                      token: formatedArr[i],
                      amount: removeDecimals(formatedArr[i+1], res),
                      icon: "data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='12' r='11' fill='%23FAFAFA' stroke='%23D5D4D8' stroke-width='2'%3E%3C/circle%3E%3Cpath d='M15.6317 6.60497L13.1233 10.3034C13.0876 10.3567 13.0725 10.421 13.0808 10.4845C13.0892 10.5479 13.1204 10.6063 13.1686 10.6487C13.2169 10.691 13.279 10.7146 13.3435 10.7151C13.4079 10.7155 13.4703 10.6928 13.5192 10.651L15.9883 8.52414C16.0028 8.51128 16.0207 8.50289 16.0399 8.49998C16.0591 8.49707 16.0788 8.49977 16.0964 8.50776C16.1141 8.51574 16.129 8.52867 16.1394 8.54495C16.1498 8.56123 16.1553 8.58017 16.155 8.59945V15.2582C16.155 15.2786 16.1487 15.2985 16.1369 15.3152C16.1251 15.3319 16.1084 15.3446 16.0891 15.3515C16.0698 15.3585 16.0489 15.3594 16.029 15.3541C16.0092 15.3488 15.9915 15.3376 15.9783 15.3219L8.515 6.44938C8.39495 6.3086 8.24548 6.19548 8.07696 6.11788C7.90844 6.04027 7.72492 6.00005 7.53917 6H7.27833C6.9393 6 6.61415 6.13375 6.37442 6.37183C6.13468 6.60991 6 6.93282 6 7.26952V16.6477C6 16.9844 6.13468 17.3073 6.37442 17.5454C6.61415 17.7835 6.9393 17.9172 7.27833 17.9172C7.49693 17.9173 7.71189 17.8617 7.90271 17.7558C8.09353 17.6499 8.25384 17.4972 8.36833 17.3123L10.8767 13.6138C10.9124 13.5605 10.9275 13.4962 10.9192 13.4328C10.9108 13.3693 10.8796 13.311 10.8314 13.2686C10.7831 13.2262 10.721 13.2026 10.6566 13.2022C10.5921 13.2017 10.5297 13.2245 10.4808 13.2662L8.01167 15.3931C7.9972 15.406 7.97927 15.4144 7.96008 15.4173C7.94088 15.4202 7.92125 15.4175 7.90358 15.4095C7.8859 15.4015 7.87095 15.3886 7.86055 15.3723C7.85015 15.356 7.84475 15.3371 7.845 15.3178V8.65738C7.84501 8.63699 7.85133 8.61711 7.86311 8.60041C7.8749 8.58372 7.89157 8.57103 7.91086 8.56407C7.93016 8.55711 7.95114 8.55622 7.97096 8.56151C7.99078 8.5668 8.00849 8.57803 8.02167 8.59366L15.4842 17.4679C15.6042 17.6086 15.7537 17.7218 15.9222 17.7994C16.0907 17.877 16.2742 17.9172 16.46 17.9172H16.7208C16.8888 17.9174 17.0551 17.8846 17.2103 17.8208C17.3655 17.7571 17.5065 17.6636 17.6253 17.5457C17.7441 17.4278 17.8383 17.2878 17.9026 17.1337C17.9669 16.9797 18 16.8145 18 16.6477V7.26952C18 6.93282 17.8653 6.60991 17.6256 6.37183C17.3859 6.13375 17.0607 6 16.7217 6C16.5031 5.99994 16.2881 6.05552 16.0973 6.16143C15.9065 6.26733 15.7462 6.42004 15.6317 6.60497Z' fill='%23D5D4D8'%3E%3C/path%3E%3C/svg%3E",
                      symbol: res.symbol,
                      decimals: res.decimals,
                      name: res.name
                    })
                  }
                })
                // 2nd increment is placed inside the cycle body so this only affects odd array indexes
                i++
              }
            }
            console.log(balanceObjects)
            // if (!balanceObjects[0]) {
            for (let i = 0; i < SWAP_TOKENS.length; i++) {
              const existingBalanceOfThisToken = balanceObjects.find((item) => item.token === SWAP_TOKENS[i].token)
              if (!existingBalanceOfThisToken) {
                balanceObjects.push(SWAP_TOKENS[i])
              }
            }
            console.log(balanceObjects)
            for (let i = 0; i < balanceObjects.length; i++) {
              if (('amount' in balanceObjects[i]) === false) {
                await state.walletConnection.account().viewFunction(
                  {
                    contractId: balanceObjects[i].token,
                    methodName: 'ft_metadata',
                    args: {
                      account_id: account_id
                    },
                  },
                account_id
                ).then((res) => {
                  console.log(res)
                  balanceObjects[i].amount = 0
                  balanceObjects[i].decimals = res.decimals
                  balanceObjects[i].name = res.name
                  if (balanceObjects[i] !== 'wrap.testnet') {
                    balanceObjects[i].icon = res.icon
                  } else if (balanceObjects[i] == 'usdt.fakes.testnet') {
                    balanceObjects[i].icon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Ccircle cx='16' cy='16' r='16' fill='%2326A17B'/%3E%3Cpath fill='%23FFF' d='M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117'/%3E%3C/g%3E%3C/svg%3E"
                  } else {
                    balanceObjects[i].icon = "data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='12' r='11' fill='%23FAFAFA' stroke='%23D5D4D8' stroke-width='2'%3E%3C/circle%3E%3Cpath d='M15.6317 6.60497L13.1233 10.3034C13.0876 10.3567 13.0725 10.421 13.0808 10.4845C13.0892 10.5479 13.1204 10.6063 13.1686 10.6487C13.2169 10.691 13.279 10.7146 13.3435 10.7151C13.4079 10.7155 13.4703 10.6928 13.5192 10.651L15.9883 8.52414C16.0028 8.51128 16.0207 8.50289 16.0399 8.49998C16.0591 8.49707 16.0788 8.49977 16.0964 8.50776C16.1141 8.51574 16.129 8.52867 16.1394 8.54495C16.1498 8.56123 16.1553 8.58017 16.155 8.59945V15.2582C16.155 15.2786 16.1487 15.2985 16.1369 15.3152C16.1251 15.3319 16.1084 15.3446 16.0891 15.3515C16.0698 15.3585 16.0489 15.3594 16.029 15.3541C16.0092 15.3488 15.9915 15.3376 15.9783 15.3219L8.515 6.44938C8.39495 6.3086 8.24548 6.19548 8.07696 6.11788C7.90844 6.04027 7.72492 6.00005 7.53917 6H7.27833C6.9393 6 6.61415 6.13375 6.37442 6.37183C6.13468 6.60991 6 6.93282 6 7.26952V16.6477C6 16.9844 6.13468 17.3073 6.37442 17.5454C6.61415 17.7835 6.9393 17.9172 7.27833 17.9172C7.49693 17.9173 7.71189 17.8617 7.90271 17.7558C8.09353 17.6499 8.25384 17.4972 8.36833 17.3123L10.8767 13.6138C10.9124 13.5605 10.9275 13.4962 10.9192 13.4328C10.9108 13.3693 10.8796 13.311 10.8314 13.2686C10.7831 13.2262 10.721 13.2026 10.6566 13.2022C10.5921 13.2017 10.5297 13.2245 10.4808 13.2662L8.01167 15.3931C7.9972 15.406 7.97927 15.4144 7.96008 15.4173C7.94088 15.4202 7.92125 15.4175 7.90358 15.4095C7.8859 15.4015 7.87095 15.3886 7.86055 15.3723C7.85015 15.356 7.84475 15.3371 7.845 15.3178V8.65738C7.84501 8.63699 7.85133 8.61711 7.86311 8.60041C7.8749 8.58372 7.89157 8.57103 7.91086 8.56407C7.93016 8.55711 7.95114 8.55622 7.97096 8.56151C7.99078 8.5668 8.00849 8.57803 8.02167 8.59366L15.4842 17.4679C15.6042 17.6086 15.7537 17.7218 15.9222 17.7994C16.0907 17.877 16.2742 17.9172 16.46 17.9172H16.7208C16.8888 17.9174 17.0551 17.8846 17.2103 17.8208C17.3655 17.7571 17.5065 17.6636 17.6253 17.5457C17.7441 17.4278 17.8383 17.2878 17.9026 17.1337C17.9669 16.9797 18 16.8145 18 16.6477V7.26952C18 6.93282 17.8653 6.60991 17.6256 6.37183C17.3859 6.13375 17.0607 6 16.7217 6C16.5031 5.99994 16.2881 6.05552 16.0973 6.16143C15.9065 6.26733 15.7462 6.42004 15.6317 6.60497Z' fill='%23D5D4D8'%3E%3C/path%3E%3C/svg%3E"
                  }
                })
              }
            }
            // }
            for (let i = 0; i < balanceObjects.length; i++) {
              try {
                await state.walletConnection.account().viewFunction(
                  {
                      contractId: balanceObjects[i].token,
                      methodName: 'ft_balance_of',
                      args: {
                          account_id: state.account.accountId
                      }
                  }
                ).then((res) => {
                  balanceObjects[i].nearBalance = res / Math.pow(10, balanceObjects[i].decimals)
                })
              } catch (e) {
                console.log(e)
                await dispatch('signOut', state)
              }
            }
            console.log(balanceObjects)
            state.tokenBalances = balanceObjects
            state.loaded.balances = true
          })
        } catch (error) {
          console.log(error)
          console.log(dispatch)
          await dispatch('signOut', state)
        }
      }
      state.tokensBeingLoaded = false
    },
    async fetchDeposits ({state}) {
      if (state.crispContract && state.selector.isSignedIn()) {
        try {
          await state.walletConnection.account().viewFunction(
            {
              contractId: CONTRACT_ID,
              methodName: 'get_account_deposits',
              args: {
                account_id: state.account.accountId
              },
            }
          ).then((res) => {
            console.log(res)
            const depositsArray = Object.entries(res)
            const userDeposits = []
            for (let i = 0; i < depositsArray.length; i++) {
              console.log(depositsArray[i])
              // console.log(toFixed(depositsArray[i][1].amount))
              const asset = depositsArray[i][1].asset
              const amount = toFixed(depositsArray[i][1].amount)
              const apr = depositsArray[i][1].apr
              const id = depositsArray[i][0]
          
              userDeposits.push({
                asset: asset,
                amount: amount,
                apr: apr,
                id: id
              })
            }
            console.log(userDeposits)
            state.userDeposits = userDeposits
          })
        } catch (e) {
          console.log(e)
        }
        state.loaded.deposits = true
      }
    },
    async fetchBorrows ({state}) {
      if (state.crispContract && state.selector.isSignedIn()) {
        await state.walletConnection.account().viewFunction(
          {
            contractId: CONTRACT_ID,
            methodName: 'get_borrows_by_account',
            args: {
              account_id: state.account.accountId
            },
          }
        ).then((res) => { 
          if (res && res[0]) {
            console.log(res)
            console.log(state.userPositions)
            for (let i = 0; i < res.length; i++) {
              const borrow = res[i]
              const pos = state.userPositions.find((element) => Number(element.id) === Number(borrow.position_id) && Number(element.poolId) == Number(borrow.pool_id))
              if (pos) {
                if (state.tokens[borrow.asset0]) {
                  const tokenObj = state.tokens[borrow.asset0]
                  const tokenObj2 = state.tokens[borrow.asset1]

                  pos.leverageAsset = tokenObj
                  pos.leverageAsset2 = tokenObj2
                  pos.isBorrowed = true
                  pos.borrowed0 = borrow.borrowed0 / Math.pow(10, tokenObj.decimals)
                  pos.borrowed1 = borrow.borrowed1 / Math.pow(10, tokenObj2.decimals)
                  // pos.collateral = borrow.collateral / Math.pow(10, tokenObj.decimals)
                  pos.leverage = borrow.leverage
                  pos.borrowId = borrow.id

                  console.log(borrow)

                  // pos.liquidation_price = borrow.liquidation_price * Math.pow(10, tokenObj2.decimals - tokenObj.decimals) * pos.leverage
                  pos.liquidation_price0 = borrow.liquidation_price[0] * Math.pow(10, tokenObj.decimals - tokenObj2.decimals)
                  pos.liquidation_price1 = borrow.liquidation_price[1] * Math.pow(10, tokenObj.decimals - tokenObj2.decimals)

                  pos.apr = borrow.apr
                }
              }
            }
          }
        })
      }
    }
  },
  modules: {
  }
})
