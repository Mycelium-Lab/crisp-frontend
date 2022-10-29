<template>
  <div class="select">
    <div class="select-value">
      {{selectedPage}}
    </div>
    <select v-model="selectedPage" class="selector">
      <option value="routes">get_routes()</option>
      <option value="tokens">get_balance_all_tokens()</option>
    </select>
  </div>
  <div v-if="selectedPage === 'routes'" class="messages-wrapper">
    <div class="message" v-for="message in messages" :key="message.id">
      ID: {{message.id}}
      {{message.tokens[0]}}: {{message.liquidity[0]}}
      /
      {{message.tokens[1]}}: {{message.liquidity[1]}}
    </div>
  </div>
  <div v-if="selectedPage === 'tokens'" class="balances-wrapper">
    <div v-if="balances" class="balance">
      {{balances}}
    </div>
    <div v-else-if="loading" class="balance balance-loading">
      <span>Loading</span>
      <img class="balance-loader" src="../assets/icons/loader.png">
    </div>
    <div v-else class="balance">
      You have no balances!
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'
import * as nearAPI from "near-api-js"
import { CONTRACT_ID, METHOD_NAMES } from '../constants/index.js'
import { CONFIG } from '../utils/index.js'

export default {
  name: 'HomeView',
  data () {
    return {
      loading: false,

      messages: '',
      balances: '',
      selectedPage: 'routes'
    }
  },
  async created () {
    const { connect, WalletConnection, Contract } = nearAPI
    this.loading = true
    let nearConnection
    let walletConnection
    let account

    console.log(CONFIG.keyStore)

    // connect to NEAR
    nearConnection = await connect(CONFIG);

    // create wallet connection
    walletConnection = await new WalletConnection(nearConnection, 'my-app');

    if (walletConnection.isSignedIn()) {
      account = await nearConnection.account(walletConnection.getAccountId())

      const contract = await new Contract(
        account,
        "dev-1665751360038-15697305691965",
        {
          viewMethods: ['get_pools'],
          changeMethods: ['get_balance_all_tokens']
        }
      )

      const response = await contract.get_pools()
      console.log(response)
      this.messages = response

      await contract.get_balance_all_tokens(
        { account: walletConnection.getAccountId() }
      )
        .then(messages => {
          console.log(messages)
          this.balances = messages
        })
    } else {
      walletConnection.requestSignIn({
        contractId: CONTRACT_ID,
        methodNames: METHOD_NAMES
      });
    }
    this.loading = false
  },
  components: {
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