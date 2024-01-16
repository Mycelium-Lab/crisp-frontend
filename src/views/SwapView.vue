<template>
    <div class="wrapper">
        <div v-if="tokenPickerActive" class="token-picker-wrapper">
            <div class="token-picker">
                <div class="picker_header">
                    <span class="picker_title">Select a token</span>
                    <img @click="closeTokenPicker()" class="x-icon" src="../assets/icons/x.svg"/>
                </div>
                <div class="picker_body">
                    <div class="picker_search-wrapper">
                        <img class="search-icon" src="../assets/icons/search.svg">
                        <input v-model="searchPrompt" type="text" class="picker_search" placeholder="Search name or paste address">
                    </div>
                    <div class="picker_suggestions">
                        <div @click="selectToken(token)" v-bind:class="{suggestionActive: (token.symbol === token_in.symbol && tokenForSelection === 'in') || (token.symbol === token_out.symbol && tokenForSelection === 'out')}" v-for="token in searchPromptResult" :key="token.symbol" class="picker_suggestion">
                            <img class="suggestion_icon" :src="$store.state.tokens[token.token].icon"/>
                            <span class="suggestion_token">{{token.symbol}}</span>
                        </div>
                    </div>
                    <div class="picker_list">
                        <div @click="selectToken(token)" v-bind:class="{listItemActive: (token.symbol === token_in.symbol && tokenForSelection === 'in') || (token.symbol === token_out.symbol && tokenForSelection === 'out')}" v-for="token in tokens" :key="token.symbol" class="picker_list_item">
                            <div class="list_item_left">
                                <img class="list_item_icon" :src="$store.state.tokens[token.token].icon"/>
                                <span class="list_item_token">{{token.symbol}}</span>
                            </div>
                            <div v-if="depositSource === 'inner' && tokenBalances.find(e => e.token === token.token)" class="list_item_right">
                                <span class="list_item_token">{{tokenBalances.find(e => e.token === token.token).amount}}</span>
                            </div>
                            <div v-else-if="depositSource === 'outer' && tokenBalances.find(e => e.token === token.token)" class="list_item_right">
                                <span class="list_item_token">{{tokenBalances.find(e => e.token === token.token).nearBalance}}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
                <div class="toggler-wrapper">
                    Near
                    <div class="toggler" @click="swapDepositSource()">
                        <div class="toggle" :class="{toggleActive: depositSource === 'inner'}">

                        </div>
                    </div>
                    Crisp
                </div>
            </div>
            <div class="modal-body">
                <button @click="swapPositions()" class="swap-tokens"></button> <!--position: absolute-->
                <div class="token-wrapper token-in">
                    <!-- v-if="$store.state.tokenBalances[0]" -->
                    <div v-if="$store.state.tokens" @click="openTokenPicker('in')" class="token-select">
                        <img v-if="token_in" class="selected-icon" :src="$store.state.tokens[token_in.token].icon"/>
                        <span class="selected-symbol">{{ token_in.symbol }}</span>
                        <img class="selected-expand" src="../assets/icons/arrow-down.svg"/>
                    </div>
                    <!--<select :disabled="loaded === false" v-model="token_in" @change="findPool()" class="token-select">
                        <option v-for="(token, index) in tokens" :key="index" :value="token" class="select-option">{{token.symbol}}</option>
                    </select>-->
                    <div class="token-input" v-if="manual_input === 'out' && tokenAmntLoading === true">
                        loading . . .
                    </div>
                    <input v-else type="text" @change="getReturn()" @keypress="isNumber" placeholder="0" v-model.lazy="token_in_amnt" class="token-input"/>
                </div>
                <span v-if="depositSource === 'inner' && token_in_balance" class="token-balance">
                    <span>
                        {{token_in_balance.symbol}} balance: {{token_in_balance.amount}}
                    </span>
                    <button v-if="token_in_balance.amount === 0" @click="depositToken(token_in)" class="deposit_nav_btn">Deposit {{token_in_balance.symbol}}</button>
                </span>
                <span v-else-if="depositSource === 'outer' && token_in_balance" class="token-balance">
                    <span>
                        {{token_in_balance.symbol}} balance: {{token_in_balance.nearBalance}}
                    </span>
                </span>
                <span v-else class="token-balance">
                    
                </span>
                <div class="token-wrapper token-out">
                    <!-- v-if="$store.state.tokenBalances[0]" -->
                    <div v-if="$store.state.tokens" @click="openTokenPicker('out')" class="token-select">
                        <img v-if="token_out" class="selected-icon" :src="$store.state.tokens[token_out.token].icon"/>
                        <span class="selected-symbol">{{ token_out.symbol }}</span>
                        <img class="selected-expand" src="../assets/icons/arrow-down.svg"/>
                    </div>
                    <!--<select :disabled="loaded === false" v-model="token_out" @change="findPool()" class="token-select">
                        <option v-for="(token, index) in tokens" :key="index" :value="token" class="select-option">{{token.symbol}}</option>
                    </select>-->
                    <div class="token-input" v-if="manual_input === 'in' && tokenAmntLoading === true">
                        loading . . .
                    </div>
                    <input v-else type="text" @keypress="isNumber" @change="getExpense()" placeholder="0" v-model.lazy="token_out_amnt" class="token-input"/>
                </div>
                <span v-if="depositSource === 'inner' && token_out_balance" class="token-balance">
                    <span>
                        {{token_out_balance.symbol}} balance: {{token_out_balance.amount}}
                    </span>
                    <button v-if="token_out_balance.amount === 0" @click="depositToken(token_out)" class="deposit_nav_btn">Deposit {{token_out_balance.symbol}}</button>
                </span>
                <span v-else-if="depositSource === 'outer' && token_out_balance" class="token-balance">
                    <span>
                        {{token_out_balance.symbol}} balance: {{token_out_balance.nearBalance}}
                    </span>
                </span>
                <span v-else class="token-balance">
                    
                </span>
            </div>
            <div v-if="swapError" class="swap-error">
                {{ swapError }}
            </div>
            <div class="modal-footer">
                <span v-if="priceImpact" v-bind:class="{green: priceImpactRange === 'green', yellow: priceImpactRange === 'yellow', red: priceImpactRange === 'red'}" class="price-impact">Price impact: {{priceImpact}}</span>
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
import { addDecimals } from '@/utils/format'
import * as nearAPI from "near-api-js"
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
            swapError: '',
            priceImpact: null,
            priceImpactRange: null,

            tokenPickerActive: false,
            tokenForSelection: null,
            searchPrompt: null,

            depositSource: 'outer'
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
        },
        tokenBalances: function () {
            return this.$store.state.tokenBalances
        },
        searchPromptResult: function () {
            if (this.searchPrompt) {
                let tokens = this.tokens
                let prompt = this.searchPrompt
                
                if (this.tokens.find(item => item.token.toLowerCase() === prompt.toLowerCase())) {
                    return [this.tokens.find(item => item.token.toLowerCase() === prompt.toLowerCase())]
                } else {
                    const filteredTokens = tokens.filter((item) => {
                        if (item.symbol.toLowerCase().indexOf(prompt.toLowerCase()) !== -1) {
                            return item
                        }
                    })
                    return filteredTokens
                }
            } else return this.tokens
        }
    },
    watch: {
        '$store.state.tokenBalances': function () {
            this.findPool()
        },
        '$store.state.tokens': function () {
            this.findPool()
        },
    },
    methods: {
        isNumber,
        depositToken (token) {
            console.log(token)
            this.$store.dispatch('depositToken', token)
        },
        openTokenPicker: function (token) {
            console.log(this.tokens)
            console.log(this.$store.state.tokenBalances)
            console.log(this.searchPromptResult)
            console.log(this.$store.state.tokens)
            console.log(this.$store.state.tokens)
            this.tokenForSelection = token
            this.tokenPickerActive = true
        },
        closeTokenPicker: function () {
            this.tokenForSelection = null
            this.tokenPickerActive = false
        },
        selectToken: function (token) {
            if (this.tokenForSelection === 'in') {
                this.token_in = token
                const balanceObj = this.tokenBalances.find(e => e.token === token.token)
                if (balanceObj)
                    this.token_in_balance = {
                        symbol: balanceObj.symbol,
                        amount: balanceObj.amount,
                        nearBalance: balanceObj.nearBalance
                }
                else {
                    this.token_in_balance = {
                        symbol: token.token,
                        amount: 0,
                        nearBalance: 'Cant get near balance of token'
                    }
                }
            } else {
                this.token_out = token
                const balanceObj = this.tokenBalances.find(e => e.token === token.token)
                if (balanceObj) {
                    this.token_out_balance = {
                        symbol: balanceObj.symbol,
                        amount: balanceObj.amount,
                        nearBalance: balanceObj.nearBalance
                    }
                }
                else {
                    this.token_out_balance = {
                        symbol: token.token,
                        amount: 0,
                        nearBalance: 'Cant get near balance of token'
                    }
                }
            }
            this.closeTokenPicker()
            this.findPool()
        },
        swapPositions: async function () {
            const tin = this.token_out
            const tout = this.token_in
            this.token_in = tin
            this.token_out = tout
            this.findPool()
        },
        swapDepositSource: async function () {
            this.findPool()
            if (this.depositSource === 'outer') {
                // ...

                this.depositSource = 'inner'
            } else {
                // ...

                this.depositSource = 'outer'
            }
        },
        findPool: async function () {
            if (this.token_in && this.token_out && this.$store.state.tokens) {
                console.log(this.token_in)
                console.log(this.token_out)
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
                        console.log('1')
                        this.token_in_balance = {
                            symbol: balanceObj.symbol,
                            amount: balanceObj.amount,
                            nearBalance: balanceObj.nearBalance
                        }
                    } else {
                        console.log('h')
                        this.token_in_balance = {
                            symbol: this.tokens.find((t) => t.token === this.token_in.token)?.symbol || 'Token',
                            amount: 0,
                            nearBalance: 0
                        }
                    }
                    console.log(this.token_in_balance)
                }
                if (this.token_out) {
                    const balanceObj = this.$store.state.tokenBalances.find(item => item.token === this.token_out.token)
                    if (balanceObj) {
                        this.token_out_balance = {
                            symbol: balanceObj.symbol,
                            amount: balanceObj.amount,
                            nearBalance: balanceObj.nearBalance
                        }
                    } else {
                        this.token_out_balance = {
                            symbol: this.tokens.find((t) => t.token === this.token_out.token)?.symbol || 'Token',
                            amount: 0,
                            nearBalance: 0
                        }
                    }
                }
                if (this.manual_input === 'in' && this.token_in_amnt !== null) {
                    this.getReturn()
                }
                if (this.manual_input === 'out' && this.token_out_amnt !== null) {
                    this.getExpense()
                }
            }
        },
        calculatePriceImpact: async function (pool, t0, t1, t0_liquidity, t1_liquidity) {
            let priceImpact
            let actualPriceImpact
            if (pool.token0 === t0.token) {
                console.log('1')
                // const t0_init = pool.token0_locked / Math.pow(10, t0.decimals)
                // const t1_init = pool.token1_locked / Math.pow(10, t1.decimals)
                // const constantProduct = t0_init * t1_init
                const price = 1 / (pool.sqrt_price * pool.sqrt_price * Math.pow(10, t0.decimals - t1.decimals))
                console.log(price)

                const t0_liq_decimals = t0_liquidity

                // const t0_new = Number(t0_init) + Number(t0_liq_decimals)
                // const t1_new = constantProduct / t0_new

                const received = t1_liquidity// t1_init - t1_new
                console.log(t0_liq_decimals, received)
                const pricePaid = t0_liq_decimals / received
                console.log(pricePaid, price)

                actualPriceImpact = pricePaid / price * 100
                priceImpact = (100 - actualPriceImpact).toFixed(2) + ' % '
                // actualPriceImpact = priceImpact
            } else {
                // const t1_init = pool.token0_locked / Math.pow(10, t1.decimals)
                // const t0_init = pool.token1_locked / Math.pow(10, t0.decimals)
                // const constantProduct = t0_init * t1_init
                const price = pool.sqrt_price * pool.sqrt_price * Math.pow(10, t1.decimals - t0.decimals)
                console.log(price)

                const t0_liq_decimals = t0_liquidity

                // const t0_new = Number(t0_init) + Number(t0_liq_decimals)
                // const t1_new = constantProduct / t0_new

                const received = t1_liquidity
                const pricePaid = t0_liq_decimals / received
                console.log(pricePaid, price)

                actualPriceImpact = pricePaid / price * 100
                priceImpact = (100 - actualPriceImpact).toFixed(2) + ' % '
                // actualPriceImpact = priceImpact
            }

            this.priceImpact = priceImpact

            if (actualPriceImpact) {
                actualPriceImpact = -(100 - actualPriceImpact)
            }
            if (actualPriceImpact < 1) {
                this.priceImpactRange = 'green'
            } else if (actualPriceImpact >= 1 && actualPriceImpact <= 5) {
                this.priceImpactRange = 'yellow'
            } else if (actualPriceImpact > 5) {
                this.priceImpactRange = 'red'
            }

            
        },
        getReturn: async function () {
            this.tokenAmntLoading = true
            this.txPending = true
            this.manual_input = 'in'
            this.swapError = ''
            console.log('getReturn()')
            // let decimals
            if (this.$store.state.crispContract && this.pool_id !== -1 && this.$store.state.tokens !== null && Number(this.token_in_amnt)) {
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
                                amount_in: addDecimals(this.token_in_amnt, tokenObj)
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

                        this.calculatePriceImpact(this.$store.state.pools[this.pool_id], tokenObj, tokenOutObj, this.token_in_amnt, this.token_out_amnt)
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
                    // this.token_in_amnt = null
                    // this.token_out_amnt = null
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
            if (this.$store.state.crispContract && this.pool_id !== -1 && this.$store.state.tokens !== null && Number(this.token_out_amnt)) {
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
                                amount_out: addDecimals(this.token_out_amnt, tokenObj)
                            }
                        }
                    ).then((res) => {
                        console.log(res)
                        let tokenInObj
                        if (this.$store.state.tokens[this.token_in.token]) {
                            tokenInObj = this.$store.state.tokens[this.token_in.token]
                        }
                        this.token_in_amnt = toFixed((res / Math.pow(10, tokenInObj.decimals)))
                        this.tokenAmntLoading = false
                        this.txPending = false

                        this.calculatePriceImpact(this.$store.state.pools[this.pool_id], tokenInObj, tokenObj, this.token_in_amnt, this.token_out_amnt)
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
                    // this.token_in_amnt = null
                    // this.token_out_amnt = null
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
            console.log("initTokens: ", this.tokens)
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
            const wallet = await this.$store.state.selector.wallet()

            if (contract && this.token_in.token && this.token_out.token && this.token_in.token !== this.token_out.token && Number(this.token_in_amnt)) {
                const { utils } = nearAPI
                this.txPending = true
                // if (this.manual_input === 'in') {
                //     // swap_in
                    try {
                        let tokenObj
                        if (this.$store.state.tokens[this.token_in.token]) {
                            tokenObj = this.$store.state.tokens[this.token_in.token]
                        }
                        if (this.depositSource === 'outer' && tokenObj) {
                            // Get return, so we know how much we will need to withdraw
                            await this.$store.state.walletConnection.account().viewFunction(
                                {
                                    contractId: CONTRACT_ID,
                                    methodName: 'get_return',
                                    args: {
                                        pool_id: this.pool_id,
                                        token_in: this.token_in.token,
                                        amount_in: addDecimals(this.token_in_amnt, tokenObj)
                                    }
                                }
                            ).then(async (res) => {
                                const withdrawAmount = res
                                const depositAmount = addDecimals(this.token_in_amnt, tokenObj)

                                const argsDeposit = { registration_only: true, account_id: CONTRACT_ID }
                                const argsTransfer = { 
                                    receiver_id: CONTRACT_ID, 
                                    amount: depositAmount, 
                                    msg: `{"actions":[{"Swap":{"amount_in":"${depositAmount}","pool_id":${this.pool_id},"token_in":"${this.token_in.token}","token_out":"${this.token_out.token}"}},{"Withdraw":{"amount":"${withdrawAmount}","token":"${this.token_out.token}"}}]}`
                                }

                                await wallet.signAndSendTransactions({
                                    transactions: [
                                        {
                                            receiverId: this.token_in.token,
                                            actions: [
                                                {
                                                    type: "FunctionCall",
                                                    params: {
                                                        methodName: "storage_deposit",
                                                        args: Buffer.from(JSON.stringify(argsDeposit)),
                                                        gas: 150000000000000,
                                                        deposit: utils.format.parseNearAmount("0.01")
                                                    }
                                                },
                                                {
                                                    type: "FunctionCall",
                                                    params: {
                                                        methodName: "ft_transfer_call",
                                                        args: Buffer.from(JSON.stringify(argsTransfer)),
                                                        gas: 150000000000000,
                                                        deposit: utils.format.parseNearAmount("0.000000000000000000000001")
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }).then((response) => {
                                    console.log(response)
                                    this.$store.commit('pushNotification', {
                                        title: 'Success',
                                        type: 'success',
                                        text: 'Swap is successful'
                                    })
                                    this.txPending = false
                                    this.$store.dispatch('reload', store.state)
                                })
                            })
                        } else if (tokenObj) {
                            await wallet.signAndSendTransactions({
                                transactions: [
                                    {
                                        receiverId: CONTRACT_ID,
                                        actions: [
                                            {
                                                type: "FunctionCall",
                                                params: {
                                                    methodName: "swap",
                                                    args: Buffer.from(JSON.stringify({
                                                        pool_id: this.pool_id,
                                                        token_in: this.token_in.token,
                                                        amount_in: ((Number(this.token_in_amnt) * Math.pow(10, tokenObj.decimals)).toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 })),
                                                        token_out: this.token_out.token
                                                    })),
                                                    gas: 150000000000000,
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }).then((response) => {
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
                        }
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

</script>

<style lang="scss" scoped>
@import "~@/assets/scss/main.scss";

.token-picker-wrapper {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    animation: appear 0.3s linear;
    background-color: rgb(59, 60, 63, 0.8);
    z-index: 600;
}

.token-picker {
    @extend %default-block;
    width: 430px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px;
}

.toggler-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-weight: 500;
}

.toggler {
    @extend %toggler;
    margin-left: 6px;
    margin-right: 6px;
}

.picker_header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 32px;
}

.picker_title {
    font-size: $textSize;
    font-weight: 500;
}

.x-icon {
    width: $textSize;
    height: $textSize;
    cursor: pointer;
}

.picker_body {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

.picker_search-wrapper {
    width: 100%;
    position: relative;
    background: #FDEFD4;
    border-radius: 15px;
    padding: 16px 20px;
    box-sizing: border-box;
}

.search-icon {
    position: absolute;
    left: 12px;
    width: 24px;
    height: 24px;
}

.picker_search {
    width: 100%;
    height: 100%;
    padding-left: 24px;
    box-sizing: border-box;
    background: none;
    border: none;
    font-size: $lesserTextSize;
    font-weight: 500;
    padding-top: 3px;
    outline: none;
    color: rgba(33, 33, 33, 0.78);
}

.picker_suggestions {
    margin-top: 20px;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(4, fit-content(100px));
    grid-column-gap: 10px;
    grid-row-gap: 10px; 
    margin-bottom: 20px;
    box-sizing: border-box;
}

.picker_suggestion {
    background: #FDDEA0;
    height: 30px;
    border-radius: 10px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 5px;
    box-sizing: border-box;
    cursor: pointer;
    border: 1px solid transparent;
    max-width: 103px;
}

.picker_suggestion:hover, .suggestionActive {
    transition: 0.3s;
    border: 1px solid #000;
}

.suggestion_icon {
    width: $textSize;
    height: $textSize;
    margin-right: 5px;
}

.suggestion_token {
    font-size: 16px;
    font-weight: 500;
    color: #212121;
}

.picker_list {
    display: flex;
    flex-direction: column;
    width: 100%;
    background: #FDEFD4;
    border-radius: 15px;
    padding-top: 15px;
    padding-bottom: 15px;
    box-sizing: border-box;
}

.picker_list_item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    margin-top: 4px;
    margin-bottom: 4px;
    padding-left: 15px;
    padding-right: 15px;
    box-sizing: border-box;
    cursor: pointer;
}

.list_item_left {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}

.list_item_right {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
}

.picker_list_item:hover, .listItemActive {
    background: rgba(253, 222, 160, 0.6);
}

.list_item_icon {
    width: 30px;
    height: 30px;
    margin-right: 5px;
}

.list_item_token {
    font-size: 18px;
    font-weight: 500;
    color: #212121;
}

.modal {
    @extend %default-block;
    width: ($interfaceBlocksWidth/2);
    // background-color: $cardBgColor;
    min-height: $defaultCardHeight;
    border: 0;
    // border-radius: $borderRadius;
    padding: 30px 40px;
    margin-top: 32px;
}

.modal-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    padding-left: 8px;
    padding-right: 8px;
}

.modal-title {
    font-size: $mediumTextSize;
    font-weight: 600;
    max-width: 400px;
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
    background-image: url('../assets/icons/arrow-twin.svg');
    background-size: 100% 100%;
    transform: rotateZ(90deg);
    background-color: #FDE4A0;
    border: 3px solid #FDE4A0;
    border-radius: $borderRadius/2;
    z-index: 100;
    cursor: pointer;
    transition: 0.15s;
}

.swap-tokens:hover {
    background-color: $buttonPrimaryColor;
    border: 3px solid $buttonPrimaryColor;
}

.token-wrapper {
    @extend %default-element;
    position: relative;
    height: 60px;
    margin-bottom: 2px;
    margin-top: 20px;
    padding: 12px;
    padding-top: 16px;
    border-radius: 15px;
    box-sizing: border-box;
}

.token-balance {
    margin-bottom: 24px;
}

.token-out {
    margin-top: 44px !important;
}

.token-input {
    width: 80%;
    background-color: transparent;
    border: 0;
    height: 30px;
    font-size: $greaterTextSize;
    outline: none;
}

.token-balance {
    padding: 8px;
    padding-left: 0;
    font-weight: 500;
}
.swap-error{
    font-size: $lesserTextSize;
    color: #C46060;
}
.token-select {
    position: absolute;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    right: 12px;
    font-size: $lesserTextSize;
    font-weight: 600;
    border: 0;
    background: #FDDEA0;
    border-radius: 10px;
    padding: 4px;
    transition: 0.3s;
}

.token-select:hover {
    background: #ffce6c;
    cursor: pointer;
}

.selected-icon {
    width: 20px;
    height: 20px;
    margin-right: 5px;
}

.selected-symbol {
    font-size: 18px;
    font-weight: 500;
}

.selected-expand {
    width: 14px;
    height: 14px;
    margin-left: 5px;
}

.modal-footer {
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-top: 12px;
}

.footer-btn {
    @extend %dark-btn;
    border: 1px solid transparent;
    width: 100%;
    padding: 8px;
    border: 1px solid $buttonBgColor; 
    border-radius: $borderRadius;
    font-size: $textSize;
    font-weight: 500;
    cursor: pointer;
    transition: 0.3s;
    box-sizing: border-box;
}

.deposit_nav_btn{
    @extend %light-btn;
    border: 1px solid transparent;
    box-sizing: border-box;
    transition: 0.3s;
    border-radius: 8px;
    padding: 4px 8px;
    margin-left: 8px;
    font-weight: 500;
}
.deposit_nav_btn:hover {
    @extend %dark-btn;
    cursor: pointer;
}

.footer-btn:hover {
    @extend %light-btn;
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

.green {
    text-shadow: 0px 0px 2px $green;
}

.yellow {
    text-shadow: 0px 0px 2px $yellow;
}

.red {
    text-shadow: 0px 0px 2px $red;
}

@media screen and (max-width: 1050px) {
    .modal {
        width: auto;
        min-width: 330px;
        max-width: 341px;
        box-sizing: border-box;
        padding: 18px;
    }

    .modal-title {
        font-size: 18px;
        padding-left: 0;
    }

    .token-wrapper {
        height: 40px;
        padding: 10px;
    }
    
    .token-input {
        height: 20px;
        font-size: 16px;
    }

    .token-select {
        box-sizing: border-box;
        top: 5px;
        right: 5px;
    }

    .selected-symbol {
        font-size: 14px;
    }

    .selected-expand {
        width: 12px;
        height: 12px;
    }

    .token-balance {
        margin-bottom: 12px;
    }

    .token-balance span {
        font-size: 14px;
    }

    .deposit_nav_btn {
        font-size: 12px;
    }

    .footer-btn {
        background: #212121;
        border-radius: 20px;
        font-size: 18px;
    }

    .price-impact {
        font-size: 12px;
    }
}
</style>