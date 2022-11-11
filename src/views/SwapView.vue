<template>
    <div class="wrapper">
        <div class="modal">
            <div class="modal-header">
                <span class="modal-title">
                    Swap
                </span>
                <div>
                    <!-- ... -->
                </div>
            </div>
            <div class="modal-body">
                <button class="swap-tokens"></button> <!--position: absolute-->
                <div class="token-wrapper">
                    <!-- v-if="$store.state.tokenBalances[0]" -->
                    <select v-model="token_in" class="token-select"> <!--position: absolute-->
                        <option v-for="(token, index) in tokens" :key="index" :value="token.token" class="select-option">{{token.symbol}}</option>
                    </select>
                    <input type="number" placeholder="0" v-model="token_in_amnt" class="token-input"/>
                </div>
                <div class="token-wrapper">
                    <!-- v-if="$store.state.tokenBalances[0]" -->
                    <select v-model="token_out" class="token-select"> <!--position: absolute-->
                        <option v-for="(token, index) in tokens" :key="index" :value="token.token" class="select-option">{{token.symbol}}</option>
                    </select>
                    <input type="number" placeholder="0" v-model="token_out_amnt" class="token-input"/>
                </div>
            </div>
            <div class="modal-footer">
                <button v-if="$store.state.account" class="footer-btn">Confirm</button>
                <button @click="signIn()" v-else class="footer-btn">Connect wallet</button>
            </div>
        </div>
    </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'

// import { CONTRACT_ID } from '../constants/index.js'
import store from '../store'

export default {
    name: 'SwapView',
    store,
    components: {

    },
    data () {
        return {
            token_in: null,
            token_out: null,
            token_in_amnt: null,
            token_out_amnt: null,

            tokens: []
        }
    },
    async created () {
        await this.initTokens()
    },
    methods: {
        initTokens: async function () {
            this.tokens = [
                {
                    symbol: 'EXAMPLE',
                    token: 'usdt-ft.testnet'
                },
                {
                    symbol: 'EXAMPLE',
                    token: 'usn-ft.testnet'
                },
                {
                    symbol: 'EXAMPLE',
                    token: 'near-ft.testnet'
                }
            ]
        },
        signIn: async function () {
            await this.$store.dispatch('signIn', store.state)
        }
    }
}

</script>

<style lang="scss" scoped>
@import "~@/assets/scss/main.scss";

.modal {
    width: ($interfaceBlocksWidth/2);
    background-color: $cardBgColor;
    min-height: $defaultCardHeight;
    border: $brightBorder;
    border-radius: $borderRadius;
    padding: 12px;
    margin-top: 32px;
}

.modal-header {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding-bottom: 12px;
}

.modal-title {
    font-size: $lesserTextSize;
    font-weight: 400;
    padding-left: 8px;
}

.modal-body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
}

.swap-tokens {
    position: absolute;
    width: 32px;
    height: 32px;
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 0;
    text-align: center;
    background-image: url('../assets/icons/swap.png');
    background-size: 100% 100%;
    background-color: #e8ecfb;
    border: 3px solid $cardBgColor;
    border-radius: $borderRadius/2;
    z-index: 100;
    cursor: pointer;
    transition: 0.15s;
}

.swap-tokens:hover {
    background-color: #d9e2ff;
    -webkit-box-shadow: 2px 2px 12px -4px rgba(34, 60, 80, 0.2);
    -moz-box-shadow: 2px 2px 12px -4px rgba(34, 60, 80, 0.2);
    box-shadow: 2px 2px 12px -4px rgba(34, 60, 80, 0.2);
}

.token-wrapper {
    position: relative;
    height: $largeInputSize;
    background-color: $inputBgColor;
    border-radius: $borderRadius;
    margin-bottom: 2px;
    margin-top: 2px;
    padding: 12px;
    padding-top: 16px;
    box-sizing: border-box;
}

.token-input {
    width: 80%;
    background-color: transparent;
    border: 0;
    height: $largeInputSize*0.6;
    font-size: $greaterTextSize;
    outline: none;
}

.token-select {
    position: absolute;
    right: 12px;
    background-color: #e8ecfb;
    font-size: $lesserTextSize;
    font-weight: 600;
    border: 0;
    border-radius: $borderRadius;
    padding: 4px;
    transition: 0.3s;
}

.token-select:hover {
    background-color: #d9e2ff;
    cursor: pointer;
}

.footer-btn {
    border: 1px solid transparent;
    width: 100%;
    padding: 8px;
    margin-top: 12px;
    border: 1px solid transparent; 
    border-radius: $borderRadius;
    background-color: $buttonAltBgColor;
    color: $buttonBgColor;
    font-size: $textSize;
    font-weight: 500;
    cursor: pointer;
    transition: 0.3s;
    box-sizing: border-box;
}

.footer-btn:hover {
    background-color: $buttonBgColor;
    color: $buttonAltBgColor;
}
</style>