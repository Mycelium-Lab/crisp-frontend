<template>
    <div class="wrapper">
        <div class="modal">
            <div class="modal-header">
                <span class="modal-title">
                    Swap {{manual_input}} 
                    <template v-if="!$store.state.account">
                        (please, connect wallet)
                    </template>
                    <template v-if="tokenAmntLoading">
                        (loading your 
                        <template v-if="manual_input === 'in'">
                            return,
                        </template>
                        <template v-else>
                            expense,
                        </template>please wait)
                    </template>
                    <template v-if="loaded === false && $store.state.account">
                        (please wait, we are loading your tokens)
                    </template>
                </span>
                <div>
                    <!-- ... -->
                </div>
            </div>
            <div class="modal-body">
                <button @click="swapPositions()" class="swap-tokens"></button> <!--position: absolute-->
                <div class="token-wrapper">
                    <!-- v-if="$store.state.tokenBalances[0]" -->
                    <select :disabled="loaded === false" v-model="token_in" @change="findPool()" class="token-select"> <!--position: absolute-->
                        <option v-for="(token, index) in tokens" :key="index" :value="token" class="select-option">{{token.symbol}}</option>
                    </select>
                    <div class="token-input" v-if="manual_input === 'out' && tokenAmntLoading === true">
                        loading . . .
                    </div>
                    <input v-else type="text" @change="getReturn()" @keypress="isNumber" placeholder="0" v-model.lazy="token_in_amnt" class="token-input"/>
                </div>
                <span class="token-balance" v-if="token_in_balance">{{token_in_balance.symbol}} balance: {{token_in_balance.amount}}</span>
                <div class="token-wrapper">
                    <!-- v-if="$store.state.tokenBalances[0]" -->
                    <select :disabled="loaded === false" v-model="token_out" @change="findPool()" class="token-select"> <!--position: absolute-->
                        <option v-for="(token, index) in tokens" :key="index" :value="token" class="select-option">{{token.symbol}}</option>
                    </select>
                    <div class="token-input" v-if="manual_input === 'in' && tokenAmntLoading === true">
                        loading . . .
                    </div>
                    <input v-else type="text" @keypress="isNumber" @change="getExpense()" placeholder="0" v-model.lazy="token_out_amnt" class="token-input"/>
                </div>
                <span class="token-balance" v-if="token_out_balance">{{token_out_balance.symbol}} balance: {{token_out_balance.amount}}</span>
            </div>
            <div v-if="swapError" class="swap-error">
                {{ swapError }}
            </div>
            <div class="modal-footer">
                <img v-if="txPending" class="loader-icon" src="../assets/icons/loader.gif">
                <template v-else>
                    <button @click="confirmSwap()" v-if="$store.state.account" class="footer-btn">Confirm</button>
                    <button @click="signIn()" v-else class="footer-btn" :class="{footerbtnactive: this.footerBtnActive}">Connect wallet</button>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'

// import { CONTRACT_ID } from '../constants/index.js'
import { CONTRACT_ID } from '@/constants'
import store from '../store'
import { isNumber, toFixed } from '../utils/number'
import { getStorageItem, setStorageItem } from '../utils/localStorage'
import { DEFAULT_SWAP_PAIR, SWAP_TOKENS, NOT_ENOUGH_LIQUIDITY_ERROR } from '../constants/index'
export default {
    name: 'SwapView',
    store,
    data () {
        return {
            token_in: null,
            token_out: null,
            token_in_amnt: null,
            token_out_amnt: null,

            tokenAmntLoading: false,
            manual_input: null,
            pool_id: -1,
            tokens: [],

            txPending: false,
            token_in_balance: null,
            token_out_balance: null,
            // animation for footerBtn
            footerBtnActive: false,
            swapError: ''
        }
    },
    async created () {
        await this.initTokens()
    },
    computed: {
        loaded: function () {
            if (this.$store.state.loaded.balances && this.$store.state.loaded.positions && this.$store.state.loaded.pools && this.$store.state.loaded.tokens) {
                return true
            } else {
                return false
            }
        }
    },
    watch: {
        '$store.state.tokenBalances': function () {
            this.findPool()
        }
    },
    methods: {
        isNumber,
        swapPositions: async function () {
            const tin = this.token_out
            const tout = this.token_in
            const inbalance = this.token_out_balance
            const outbalance = this.token_in_balance
            this.token_in = tin
            this.token_out = tout
            this.token_in_balance = inbalance
            this.token_out_balance = outbalance
            
            if (this.manual_input === 'in' && this.token_in_amnt) {
                this.getReturn()
            } else if (this.manual_input === 'out' && this.token_out_amnt) {
                this.getExpense()
            }
        },
        findPool: async function () {
            setStorageItem('swap_pair', {
                token_in: this.token_in,
                token_out: this.token_out
            })
            if (this.token_in && this.token_out) {
                const res = this.$store.state.pools.findIndex(
                    item => item.token0 === this.token_in.token && item.token1 === this.token_out.token
                )
                if (res === -1) {
                    const res2 = this.$store.state.pools.findIndex(
                        item => item.token1 === this.token_in.token && item.token0 === this.token_out.token
                    )
                    this.pool_id = res2
                } else {
                    this.pool_id = res
                }
                console.log(this.pool_id)
            }
            if (this.token_in) {
                console.log(this.token_in)
                console.log(this.$store.state.tokenBalances)
                const balanceObj = this.$store.state.tokenBalances.find(item => item.token === this.token_in.token)
                if (balanceObj) {
                    this.token_in_balance = {
                        symbol: balanceObj.symbol,
                        amount: balanceObj.amount
                    }
                } else {
                    this.token_in_balance = {
                        symbol: 'Token',
                        amount: '0'
                    }
                }
            }
            if (this.token_out) {
                const balanceObj = this.$store.state.tokenBalances.find(item => item.token === this.token_out.token)
                if (balanceObj) {
                    this.token_out_balance = {
                        symbol: balanceObj.symbol,
                        amount: balanceObj.amount
                    }
                } else {
                    this.token_out_balance = {
                        symbol: 'Token',
                        amount: '0'
                    }
                }
            }
            if (this.manual_input === 'in' && this.token_in_amnt !== null) {
                this.getReturn()
            }
            if (this.manual_input === 'out' && this.token_out_amnt !== null) {
                this.getExpense()
            }
        },
        getReturn: async function () {
            this.tokenAmntLoading = true
            this.txPending = true
            this.manual_input = 'in'
            this.swapError = ''
            console.log('getReturn()')
            // let decimals
            if (this.$store.state.crispContract && this.pool_id !== -1) {
                try {
                    let tokenObj
                    if (this.$store.state.tokens[this.token_in.token]) {
                        tokenObj = this.$store.state.tokens[this.token_in.token]
                    }
                    await this.$store.state.walletConnection.account().viewFunction(
                        {
                            contractId: CONTRACT_ID,
                            methodName: 'get_return',
                            args: {
                                pool_id: this.pool_id,
                                token_in: this.token_in.token,
                                amount_in: ((Number(this.token_in_amnt) * Math.pow(10, tokenObj.decimals)).toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 }))
                            }
                        }
                    ).then((res) => {
                        console.log(res)
                        let tokenOutObj
                        if (this.$store.state.tokens[this.token_out.token]) {
                            tokenOutObj = this.$store.state.tokens[this.token_out.token]
                        }
                        this.token_out_amnt = toFixed((res / Math.pow(10, tokenOutObj.decimals)))
                        this.tokenAmntLoading = false
                        this.txPending = false
                    })
                } catch (error) {
                    if(error.message.toLowerCase().includes(NOT_ENOUGH_LIQUIDITY_ERROR)) {
                        this.swapError = NOT_ENOUGH_LIQUIDITY_ERROR
                    } else {
                        this.$store.commit('pushNotification', {
                            title: 'Error',
                            type: 'error',
                            text: error
                        })
                    }
                    console.log(error)
                    this.token_in_amnt = null
                    this.token_out_amnt = null
                    this.tokenAmntLoading = false
                    this.txPending = false
                }
                        
                // })
            } else {
                this.flashConnectBtn()
                this.tokenAmntLoading = false
                this.txPending = false
            }
        },
        getExpense: async function () {
            this.tokenAmntLoading = true
            this.txPending = true
            this.manual_input = 'out'
            this.swapError = ''
            console.log('getExpense()')
            // let decimals
            if (this.$store.state.crispContract && this.pool_id !== -1) {
                try {
                    let tokenObj
                    if (this.$store.state.tokens[this.token_out.token]) {
                        tokenObj = this.$store.state.tokens[this.token_out.token]
                    }
                    await this.$store.state.walletConnection.account().viewFunction(
                        {
                            contractId: CONTRACT_ID,
                            methodName: 'get_expense',
                            args: {
                                pool_id: this.pool_id,
                                token_out: this.token_out.token,
                                amount_out: ((this.token_out_amnt * Math.pow(10, tokenObj.decimals)).toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 }))
                            }
                        }
                    ).then((res) => {
                        console.log(res)
                        let tokenInObj
                        if (this.$store.state.tokens[this.token_in.token]) {
                            tokenInObj = this.$store.state.tokens[this.token_in.token]
                        }
                        this.token_in_amnt = toFixed(res / Math.pow(10, tokenInObj.decimals))
                        this.tokenAmntLoading = false
                        this.txPending = false
                    })
                } catch (error) {
                    if(error.message.toLowerCase().includes(NOT_ENOUGH_LIQUIDITY_ERROR)) {
                        this.swapError = NOT_ENOUGH_LIQUIDITY_ERROR
                    } else {
                        this.$store.commit('pushNotification', {
                            title: 'Error',
                            type: 'error',
                            text: error
                        })
                    }
                    this.token_in_amnt = null
                    this.token_out_amnt = null
                    this.tokenAmntLoading = false
                    this.txPending = false
                }
            } else {
                this.flashConnectBtn()
                this.tokenAmntLoading = false
                this.txPending = false
            }
        },  
        initTokens: async function () {
            this.tokens = SWAP_TOKENS
            const storageSwapPair = getStorageItem('swap_pair')
            this.token_in = storageSwapPair?.token_in || DEFAULT_SWAP_PAIR.token_in
            this.token_out = storageSwapPair?.token_out || DEFAULT_SWAP_PAIR.token_out
            this.findPool()
        },
        signIn: async function () {
            await this.$store.dispatch('signIn', store.state)
        },
        flashConnectBtn: async function () {
            this.footerBtnActive = true
            setTimeout(() => {
                this.footerBtnActive = false
            }, 1000)
        },
        confirmSwap: async function () {
            const contract = this.$store.state.crispContract

            if (contract) {
                this.txPending = true
                if (this.manual_input === 'in') {
                    // swap_in
                    try {
                        let tokenObj
                        if (this.$store.state.tokens[this.token_in.token]) {
                            tokenObj = this.$store.state.tokens[this.token_in.token]
                        }
                        await contract.swap_in(
                            {
                                pool_id: this.pool_id,
                                token_in: this.token_in.token,
                                amount_in: ((Number(this.token_in_amnt) * Math.pow(10, tokenObj.decimals)).toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 })),
                                token_out: this.token_out.token
                            }
                        ).then((response) => {
                            console.log(response)
                            this.$store.commit('pushNotification', {
                                title: 'Success',
                                type: 'success',
                                // text: response
                                text: 'Swap is successful'
                            })
                            this.txPending = false
                            this.$store.dispatch('reload', store.state)
                        })
                    } catch (error) {
                        console.log(error)
                        this.$store.commit('pushNotification', {
                            title: 'Error',
                            type: 'error',
                            text: error
                        })
                        this.txPending = false
                    }
                } else if (this.manual_input === 'out') {
                    // swap_out
                    try {
                        let tokenObj
                        if (this.$store.state.tokens[this.token_out.token]) {
                            tokenObj = this.$store.state.tokens[this.token_out.token]
                        }
                        await contract.swap_out(
                            {
                                pool_id: this.pool_id,
                                token_in: this.token_in.token,
                                amount_out: ((this.token_out_amnt * Math.pow(10, tokenObj.decimals)).toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 })),
                                token_out: this.token_out.token
                            }
                        ).then((response) => {
                            console.log(response)
                            this.$store.commit('pushNotification', {
                                title: 'Success',
                                type: 'success',
                                // text: response
                                text: 'Swap is successful'
                            })
                            this.txPending = false
                            this.$store.dispatch('reload', store.state)
                        })
                    } catch (error) {
                        console.log(error)
                        this.$store.commit('pushNotification', {
                            title: 'Error',
                            type: 'error',
                            text: error
                        })
                        this.txPending = false
                    }
                }
                
            }
            
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

.token-balance {
    padding: 8px;
    padding-left: 0;
}
.swap-error{
    font-size: $lesserTextSize;
    color: #C46060;
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

.modal-footer {
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-top: 12px;
}

.footer-btn {
    border: 1px solid transparent;
    width: 100%;
    padding: 8px;
    border: 1px solid $buttonBgColor; 
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

.footerbtnactive {
    animation: flash 1s linear;
}

@keyframes flash {
    0% {
        background-color: $buttonAltBgColor;
        color: $buttonBgColor;
    }
    25% {
        background-color: $buttonBgColor;
        color: $buttonAltBgColor;
    }
    50% {
        background-color: $buttonAltBgColor;
        color: $buttonBgColor;
    }
    75% {
        background-color: $buttonBgColor;
        color: $buttonAltBgColor;
    }
    100% {
        background-color: $buttonAltBgColor;
        color: $buttonBgColor;
    }
}
</style>