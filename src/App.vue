<template>
  <div class="notifications-wrapper">
    <div class="notification-list">
      <div v-for="notification in $store.state.notifications" :key="notification.id" class="notification-box">
        <div class="notification">
          <div class="notification-header">
            <span class="notification-title">
              {{notification.title}}
            </span>
            <button @click="removeNotif(notification.id)" class="notification-close">
              X
            </button>
          </div>
          <span class="notification-text">
            {{notification.text}}
          </span>
        </div>
      </div>
    </div>
  </div>
  <header>
    <div class="header-nav">
      <router-link class="header-link" to="/swap"><img class="logo" src="../src/assets/near-protocol-near-logo.svg">Swap</router-link>
      <router-link class="header-link" to="/pools">Manage Liquidity</router-link>
      <!--<router-link class="header-link" to="/swap">Swap</router-link>-->
    </div>
    <div class="header-nav">
      <router-link v-if="$store.state.account" class="header-link" to="/deposit">Account</router-link>
      <button v-if="$store.state.account" @click="signOut()" class="header-link">Sign out</button>
      <button v-else @click="signIn()" class="header-link">Connect wallet</button>
    </div>
  </header>
  <div class="page">
    <router-view/>
  </div>
  <div class="fatal-error-msg">
    <span class="str">Sorry, this dApp doesn't support mobile displays yet.</span>
    <span class="str">Please consider using a device with at least 1200 pixel display width for your convenience</span>
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
      closed: false
    }
  },
  async created () {
    this.load()
  },
  methods: {
    load: async function () {
      await this.$store.dispatch('fetchCrispContract', store.state)
      await this.$store.dispatch('fetchPools', store.state)
      await this.$store.dispatch('fetchBalances', store.state)
      if (this.$store.state.pools[0]) {
        await this.$store.dispatch('processTokenMetadata', store.state)
      } else {
        await this.$store.commit('emitLoading', 'tokens')
      }
      if (this.$store.state.pools[0]) {
        await this.$store.dispatch('processPositions', store.state)
      } else {
        await this.$store.commit('emitLoading', 'positions')
      }
    },
    signIn: async function () {
      await this.$store.dispatch('signIn', store.state)
    },
    signOut: async function () {
      await this.$store.dispatch('signOut', store.state)
    },
    removeNotif: async function(id) {
      await this.$store.commit('removeNotification', id)
    }
  }
}
</script>

<style lang="scss">
@import "~@/assets/scss/main.scss";

html {
  scroll-behavior: smooth;
}

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
  min-width: 99vw;
  background: linear-gradient($gradientPrimary, $gradientSecondary)
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}

.notifications-wrapper {
  width: 100vw;
  height: 100vh;
  position: fixed;
  pointer-events: none;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  z-index: 700;
}

.notification-list {
  width: $interfaceBlocksWidth/2;
  padding: 16px;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.notification-box {
  width: 100%;
  min-height: 180px;
  max-height: 180px;
  position: relative;
}

.notification {
  background-color: $cardBgColor;
  border: $border;
  border-radius: $borderRadius;
  opacity: 1;
  padding: 16px;
  position: absolute;
  width: ($interfaceBlocksWidth/2)-36px;
  animation: shiftIn 0.6s linear;
  height: 160px;
  box-sizing: border-box;
  pointer-events: all;
  overflow: hidden;
  overflow-y: scroll;
}

.closed {
  animation: shiftOut 0.6s linear;
  right: -600px;
}

@keyframes shiftIn {
  0% {
    right: -($interfaceBlocksWidth/2)-36px;
  }
  100% {
    right: 16px;
  }
}

@keyframes shiftOut {
  0% {
    right: 16px;
  }
  100% {
    right: -($interfaceBlocksWidth/2)-36px;
  }
}

.notification-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 12px;
}

.notification-title {
  font-size: $textSize;
}

.notification-text {
  font-size: $tinyTextSize;
}

.notification-close {
  width: $textSize;
  height: $textSize;
  border: 1px solid $buttonBgColor;
  color: $buttonBgColor;
  background-color: $buttonTextColor;
  opacity: 0.8;
  transition: 0.3s;
  cursor: pointer;
}

.notification-close:hover {
  background-color: $buttonAltBgColor;
  opacity: 1;
  transition: 0.3s;
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

.fatal-error-msg {
  display: none;
}

@media screen and (max-width: 1200px) {
  .fatal-error-msg {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    z-index: 800;
    position: relative;
    background: linear-gradient($gradientPrimary, $gradientSecondary)
  }

  .fatal-error-msg .str {
    font-size: $tinyTextSize;
    text-align: center;
    max-width: 90vw;
  }

  header {
    display: none;
  }

  .page {
    display: none;
  }
}
</style>
