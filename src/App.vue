<template>
  <div class="notifications-wrapper">
    <div class="notification-list">
      <div v-for="notification in $store.state.notifications" :key="notification.id" class="notification-box">
        <div class="notification">
          <div class="notification-header">
            <span :class="['notification-title', notification.type]">
              {{notification.title}}
            </span>
            <button @click="removeNotif(notification.id)" class="notification-close">
              
            </button>
          </div>
          <span :class="['notification-text', notification.type]">
            {{notification.text}}
          </span>
          <div :class="['loader', notification.type]"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="socials-wrapper">
    <a href='https://t.me/crisp_exchange' target="_blank" class="social-button">
      
    </a>
  </div>
  <div @click.self="toggleSidenav()" class="sidenav-mobile-wrapper" v-bind:class="{sidenavActive: sidenavActive}">
    <div class="sidenav-mobile">
      <router-link class="sidenav-link" to="/swap">Swap</router-link>
      <router-link class="sidenav-link" to="/pools">Manage liquidity</router-link>
      <router-link class="sidenav-link" to="/lending">Earn</router-link>
      <router-link class="sidenav-link" to="/deposit">Balance</router-link>
    </div>
  </div>
  <header>
    <div class="header-nav">
        <router-link class="header-link" to="/swap"><img class="logo" src="../src/assets/crisp-logo.png"><span class="desktop-link">Swap</span></router-link>
        <router-link class="header-link desktop-link" to="/pools">Manage Liquidity</router-link>
        <router-link class="header-link desktop-link" to="/lending">Earn</router-link>
        <!--<router-link class="header-link" to="/swap">Swap</router-link>-->
      <a class="header-link desktop-link" href="https://near-faucet.io/" target="_blank" style="color: #f5bf52 !important; text-decoration: underline;">Get test tokens</a>
    </div>
    <div class="header-nav">
      <router-link v-if="$store.state.account" class="header-link desktop-link" to="/deposit">Balance</router-link>
      <!--<button v-if="$store.state.account" @click="signOut()" class="header-link">Sign out</button>-->
      <button v-if="$store.state.account" @click="signOut()" class="header-link account"><span>{{ $store.state.account.accountId }}</span><img class="logout-gfx" src="./assets/icons/logout.svg"/></button>
      <button v-else @click="signIn()" class="header-link connect">Connect wallet</button>
    </div>
    <div class="burger-wrapper">
      <button @click="toggleSidenav()" class="burger-button"></button>
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
      closed: false,
      sidenavActive: false
    }
  },
  async created () {
    this.load()
  },
  methods: {
    load: async function () {
      await this.$store.dispatch('fetchCrispContract', store.state)
      .then(
        (async () => {
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
          if (this.$store.state.pools[0]) {
            console.log('fetching deposits and borrows')
            await this.$store.dispatch('fetchDeposits', store.state)
            await this.$store.dispatch('fetchBorrows', store.state)  
          }
          // await this.$store.dispatch('fetchDeposits', store.state)
          // await this.$store.dispatch('fetchBorrows', store.state)
        })
      )
    },
    signIn: async function () {
      await this.$store.dispatch('signIn', store.state)
    },
    signOut: async function () {
      await this.$store.dispatch('signOut', store.state)
    },
    removeNotif: async function(id) {
      await this.$store.commit('removeNotification', id)
    },
    toggleSidenav () {
      console.log('click')
      this.sidenavActive = !this.sidenavActive
    }
  }
}
</script>

<style lang="scss">
@import "~@/assets/scss/main.scss";
@import "@near-wallet-selector/modal-ui-js/styles.css";

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
  background: linear-gradient(356.97deg, #F5BF52 -20.04%, rgba(245, 191, 82, 0.53125) 42.31%, rgba(245, 191, 82, 0) 112.97%);
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

.socials-wrapper {
  width: 100vw;
  height: 100vh;
  position: fixed;
  pointer-events: none;
}

.social-button {
  position: absolute;
  bottom: 36px;
  right: 36px;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: $buttonBgColor;
  background-image: url('assets/icons/telegram.svg');
  background-position: left 12px bottom 12px;
  background-size: 42px;
  background-repeat: no-repeat;
  pointer-events: all;
  cursor: pointer;
  opacity: 0.85;
}

.social-button:hover {
  opacity: 1;
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
  @extend %default-block;
  opacity: 1;
  padding: 32px 40px;
  position: absolute;
  width: ($interfaceBlocksWidth/2)-36px;
  animation: shiftIn 0.6s linear;
  height: 169px;
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
  padding-bottom: 24px;
}

.notification-title {
  font-size: 20px;
}

.notification-text {
  font-size: 18px;
  color: #fff;
}

.notification-close {
  width: $textSize;
  height: $textSize;
  background-color: transparent;
  border: 0;
  background-image: url('./assets/icons/x.svg');
  background-repeat: no-repeat;
  background-size: cover;
  opacity: 0.8;
  transition: 0.3s;
  cursor: pointer;
}

.notification-close:hover {
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
  padding-top: 12px;
}

.header-nav:nth-child(2) {
  justify-content: flex-end;
}

.header-link {
  padding: 12px;
  padding-top: 0;
  font-size: $mediumTextSize;
  text-decoration: none;
  color: $textColor !important;
  font-weight: 500;
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
  margin-left: 20px;
  margin-right: 32px;
  width: 72px;
  height: 72px;
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

.burger-wrapper {
  display: none;
}

@keyframes draw-loader {
      0% {
        width: 0;
      }
      95% {
        width: 83%;
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
}
.loader{
  position: absolute;
  bottom: 40px;
  left: 40px;
  height: 10px;
  border-radius: 10px;
  animation: draw-loader 5s ease-in-out;
}

.loader {
  background: #000;
}

.notification-title.success {
  color: #008653;
}
.notification-title.error {
  color:#A90203;
}

.header-link.connect {
  background-color: $blockBgColor;
  padding: 11px 25px;
  border-radius: 20px;
  height: auto;
}

.account {
  background: #FDDEA0;
  border: 0.5px solid #000000;
  border-radius: 20px;
  padding: 9px 16px;
  margin-bottom: 12px;
  height: 40px;
  box-sizing: border-box;
  color: #000 !important;
}

.account:hover {
  color: #000 !important;
  background: #f3c76f;
}

.logout-gfx {
  margin-left: 6px;
}

.header-link.connect:hover {
  background-color: $buttonSecondaryColor;
  color: $blockBgColor !important;
}

.sidenav-mobile-wrapper {
  width: 100vw;
  height: 100vh;
  position: fixed;
  display: none;
}

@media screen and (max-width: 1050px) {
  .sidenavActive {
    display: flex;
  }

  .sidenav-mobile {
    display: none;
  }

  .sidenavActive .sidenav-mobile {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    width: 192px;
    height: 108px;
    background-color: #f5bf52;
    border: 0;
    border-radius: $borderRadius;
    padding: 12px 24px;
    margin-top: 32px;
    pointer-events: all;
    margin-left: 16px;
    box-sizing: border-box;
    box-shadow: 4px 4px 5px 0px rgba(0,0,0,0.45);
  }

  .sidenav-link {
    font-size: 16px;
    text-decoration: none;
    color: #0e111a !important;
    font-weight: 500;
    border: 0;
    cursor: pointer;
  }

  .desktop-link {
    display: none;
  }

  #app {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  header {
    padding-top: 44px;
    width: 340px;
  }

  .header-link {
    margin-right: 0;
    padding-left: 0;
  }

  .connect {
    background: #F5BF52;
    font-size: 14px;
    margin-right: 32px;
    padding: 8px 20px !important;
    height: 40px;
  }

  .account {
    margin-right: 16px;
    font-size: 16px;
    padding-left: 12px;
  }

  .logout-gfx {
    width: 16px;
    height: 16px;
  }

  .logo {
    margin: 0;
  }

  .burger-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding-top: 0;
  }

  .burger-button {
    width: 24px;
    height: 24px;
    background-color: transparent;
    border: 0;
    cursor: pointer;
    background-image: url('./assets/icons/burger.svg');
    background-repeat: no-repeat;
    background-position: 100% 100%;
  }

  .socials-wrapper {
    display: none;
  }
}
</style>
