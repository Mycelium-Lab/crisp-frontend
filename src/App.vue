<template>
  <header>
    <div class="header-nav">
      <router-link class="header-link" to="/"><img class="logo" src="../src/assets/near-protocol-near-logo.svg">Home</router-link>
      <router-link class="header-link" to="/pools">Manage Liquidity</router-link>
    </div>
    <div class="header-nav">
      <router-link class="header-link" to="/deposit">Deposit / Withdraw</router-link>
      <button @click="signOut()" class="header-link">Sign out</button>
    </div>
  </header>
  <div class="page">
    <router-view/>
  </div>
</template>

<script>
window.Buffer = window.Buffer || require("buffer").Buffer;
import store from './store'

export default {
  name: 'App',
  store,
  data () {
    return {
    }
  },
  async created () {
    await this.$store.dispatch('fetchCrispContract', store.state)
    await this.$store.dispatch('fetchBalances', store.state)
  },
  methods: {
    signOut: function () {
      this.$store.state.walletConnection.signOut()
      location.reload()
    }
  }
}
</script>

<style lang="scss">
@import "~@/assets/scss/main.scss";

* {
  padding: 0; margin: 0;
  font-family: 'Montserrat', sans-serif;
}

:root {
  --select-border: #777;
  --select-focus: blue;
  --select-arrow: var(--select-border);
}

#app {
  min-height: 100vh;
  min-width: 100vw;
  background: linear-gradient($gradientPrimary, $gradientSecondary)
}

header {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.header-nav {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.header-nav:nth-child(2) {
  justify-content: flex-end;
}

.header-link {
  padding: 12px;
  font-size: $textSize;
  text-decoration: none;
  color: $textColor !important;
  height: 48px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-right: 24px;
  background: none;
  border: 0;
  cursor: pointer;
}

.header-link:hover {
  transition: 0.3s;
  color: $textHoverColor !important;
}

.logo {
  margin-left: 12px;
  margin-right: 32px;
  width: 48px;
  height: 48px;
}

.page {
  padding-top: 128px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.messages-wrapper, .balances-wrapper {
  margin: auto;
  padding: 24px;
  margin-bottom: 16px;
  box-sizing: border-box;
  
  border: $border;
  border-radius: $borderRadius;
  width: $interfaceBlocksWidth;
  min-height: $defaultCardHeight;
  color: $textColor;
  font-size: $textSize;
  background-color: $cardBgColor;
}

.message, .balance {
  min-height: 24px;
  opacity: 0.8;
  text-transform: uppercase;
}

.message:hover {
  opacity: 1;
  cursor: pointer;
}
</style>
