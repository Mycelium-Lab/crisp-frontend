<template>
  <div>
    
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'

import { CONTRACT_ID } from '../constants/index.js'
import store from '../store'

export default {
  name: 'HomeView',
  store,
  data () {
    return {
      loading: false,
      messages: '',
      selectedPage: 'routes'
    }
  },
  async created () {
    this.loading = true
    const contract = this.$store.state.crispContract

    console.log(contract)
    if (contract) {
      const response = await contract.get_pools()
      console.log(response)
      this.messages = response
    }
    this.loading = false
  },
  components: {
  },
  methods: {
    deposit: async function () {
      // const { DEFAULT_FUNCTION_CALL_GAS } = nearAPI
      // const contract = this.$store.state.crispContract
      // const acc = this.$store.state.walletConnection.getAccountId()
      // console.log(acc)

      // await contract.get_balance(
      //   {
      //     account_id: acc,
      //     token: 'near-ft.testnet'
      //   }
      // ).then((res) => {
      //   console.log(res)
      // })

      await this.$store.state.walletConnection.account().functionCall({
        contractId: 'usn-ft.testnet',
        methodName: 'ft_transfer_call',
        args: {
          receiver_id: CONTRACT_ID,
          amount: '1000000000000',
          msg: ''
        },
        gas: 1,
        // gas: DEFAULT_FUNCTION_CALL_GAS,
        attachedDeposit: utils.format.parseNearAmount("0.000000000000000000000001")
      }).then((res) => {
        console.log(res)
      })
    }
  }
}
</script>

<style lang="scss">
@import "~@/assets/scss/main.scss";

.selector {
  width: 100%;
  appearance: none;
  background-color: transparent;
  border: none;
  padding: 0 1em 0 0;
  margin: 0;
  font-family: inherit;
  font-size: 0;
  cursor: inherit;
  line-height: inherit;
  margin-bottom: 24px;
  outline: none;
  height: 48px;
  box-sizing: border-box;
  color: transparent;
}

.selector::-ms-expand {
  display: none;
}

.select {
  width: $interfaceBlocksWidth;
  border-radius: $borderRadius;
  background-color: $selectorDefaultColor;
  color: $textColor;
  text-transform: uppercase;
  
  padding: 0.25em 0em;
  font-size: 1.25rem;
  cursor: pointer;
  margin-bottom: 24px;
  height: 48px;
  box-sizing: border-box;
  position: relative;
}

.select::before {
  content: "";
  position: absolute;
  right: 8px;
  top: 16px;
  display: block;
  width: 16px;
  height: 16px;
  background-color: var(--select-arrow);
  clip-path: polygon(100% 0%, 0 0%, 50% 100%);
}

.select-value {
  position: absolute;
  left: 16px;
  top: 12px;
  pointer-events: none;
}

select option {
  width: 100px;
  height: 100px;
  font-size: 20px;
  color: black;
}

.balances-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.balance-loading {
  background: -webkit-linear-gradient(#BFB5BB, #FFF2FA);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.balance-loader {
  margin-top: 24px;
  animation: spin 2s infinite reverse;
}

@keyframes spin {
  0% {
    transform: rotate(0deg)
  }
  100% {
    transform: rotate(360deg)
  }
}
</style>