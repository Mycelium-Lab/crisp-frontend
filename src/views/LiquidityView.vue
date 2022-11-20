<template>
    <div class="wrapper">
        <div v-if="modalActive" class="modal-wrapper">
            <div v-if="newPoolModalActive" class="modal">
                <div class="modal-header">
                    <div></div>
                    <span class="modal-title">Create new pool</span>
                    <img @click="closeNewPoolModal()" class="x-icon" src="../assets/icons/x.svg"/>
                </div>
                <div class="modal-body">
                    <div class="modal-body_row">
                        <div class="input-wrapper">
                            <span class="input-title">First token</span>
                            <input v-model="token0" id="token0" class="modal-body_row-input"/>
                        </div>
                        <div class="input-wrapper">
                            <span class="input-title">Second token</span>
                            <input v-model="token1" id="token1" class="modal-body_row-input"/>
                        </div>
                    </div>
                    <div class="modal-body_row">
                        <div class="input-wrapper">
                            <span class="input-title">Initial price</span>
                            <input v-model="price" id="initialPrice" class="modal-body_row-input"/>
                        </div>
                        <div class="input-wrapper">
                            <span class="input-title">Protocol fee</span>
                            <input v-model="protocol_fee" id="protocolFee" class="modal-body_row-input"/>
                        </div>
                        <div class="input-wrapper">
                            <span class="input-title">Rewards</span>
                            <input v-model="rewards" id="rewards" class="modal-body_row-input"/>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="confirmNewPoolModal()" class="confirm-btn">Confirm</button>
                </div>
            </div>
            <div v-if="newPositionModalActive" class="modal">
                <div class="modal-header">
                    <div></div>
                    <span class="modal-title">Create new position</span>
                    <img @click="closeNewPositionModal()" class="x-icon" src="../assets/icons/x.svg"/>
                </div>
                <div class="modal-body">
                    <div class="modal-body_row">
                        <template v-if="tokensLoaded">
                            <div class="input-wrapper">
                                <span class="input-title">Pool</span>
                                <select @change="calculateInit()" v-model.lazy="poolId" id="poolId" class="modal-body_row-input">
                                    <option v-for="(pool, index) in $store.state.pools" :key="index" :value="index">
                                        {{$store.state.tokens[pool.token0].symbol}}
                                        -
                                        {{$store.state.tokens[pool.token1].symbol}}
                                    </option>
                                </select>
                            </div>
                            <div class="input-wrapper">
                                <span v-if="poolId !== null && tokensLoaded" class="input-title"><img class="small-icon" :src="$store.state.tokens[$store.state.pools[poolId].token0].icon"/><span>{{$store.state.tokens[$store.state.pools[poolId].token0].symbol}} liquidity</span></span>
                                <span v-else class="input-title">Token 0 liquidity</span>
                                <input type="text" v-model.lazy="t0_liq" @keypress="isNumber" @change="calculateDefault()" id="t0_liq" class="modal-body_row-input" :disabled="upperSmallerThanCurrent"/>
                                <span v-if="t0_balance">{{$store.state.tokens[$store.state.pools[poolId].token0].symbol}} balance: {{t0_balance.toFixed(4)}}</span>
                            </div>
                            <div class="input-wrapper">
                                <span v-if="poolId !== null && tokensLoaded" class="input-title"><img class="small-icon" :src="$store.state.tokens[$store.state.pools[poolId].token1].icon"/><span>{{$store.state.tokens[$store.state.pools[poolId].token1].symbol}} liquidity</span></span>
                                <span v-else class="input-title">Token 1 liquidity</span>
                                <input type="text" v-model.lazy="t1_liq" @keypress="isNumber" @change="calculateAlternative()" id="t1_liq" class="modal-body_row-input" :disabled="lowerGreaterThanCurrent" />
                                <span v-if="t1_balance">{{$store.state.tokens[$store.state.pools[poolId].token1].symbol}} balance: {{t1_balance.toFixed(4)}}</span>
                            </div>
                        </template>
                        <span v-else>Please wait while we load pools. . .</span>
                    </div>
                    <div class="modal-body_row">
                        <div class="input-wrapper">
                            <span class="input-title">Lower bound price</span>
                            <input v-model="lowerPrice" @change="calculateLower()" id="lowerPrice" class="modal-body_row-input"/>
                        </div>
                        <div class="input-wrapper">
                            <span class="input-title">Upper bound price</span>
                            <input v-model="upperPrice" @change="calculateUpper()" id="upperPrice" class="modal-body_row-input"/>
                        </div>
                        <div class="input-wrapper">
                            <span class="input-title">Current price</span>
                            <span id="currentPrice" class="modal-body_row-input">{{currentPrice}}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <img v-if="txPending" class="loader-icon" src="../assets/icons/loader.gif">
                    <button v-else @click="confirmNewPositionModal()" class="confirm-btn">Confirm</button>
                </div>
            </div>
        </div>
        <!--<div v-if="noLogin">
            Please, connect your wallet
        </div>-->
        <template v-if="!loading">
            <template v-if="$store.state.userPositions">
                <div class="heading">
                    <span class="title">Your positions</span><button @click="openNewPositionModal()" class="new-position-btn">+ New position</button>
                </div>
                <div v-if="$store.state.userPositions[0]" class="list-header">
                    <span class="pos-list-header_unit" style="width: 7%">
                        # Pool
                    </span>
                    <span class="pos-list-header_unit" style="width: 7%">
                        # Pos
                    </span>
                    <span class="pos-list-header_unit" style="width: 14%">
                        Pool tokens
                    </span>
                    <span class="pos-list-header_unit">
                        Current pool price
                    </span>
                    <span class="pos-list-header_unit">
                        L. bound price
                    </span>
                    <span class="pos-list-header_unit">
                        U. bound price
                    </span>
                    <span class="pos-list-header_unit">
                        T0 Real Liquidity
                    </span>
                    <span class="pos-list-header_unit">
                        T1 Real Liquidity
                    </span>
                    <span class="pos-list-header_unit close-header-unit">
                        Close
                    </span>
                </div>
                <div v-if="$store.state.userPositions[0]" class="list">
                    <div class="pool" v-for="pos in $store.state.userPositions" :key="pos.id">
                        <span class="pos-list-pool_unit" style="width: 7%">
                            {{pos.poolId}}
                        </span>
                        <span class="pos-list-pool_unit" style="width: 7%">
                            {{pos.id}}
                        </span>
                        <span v-if="$store.state.tokens" class="pos-list-pool_unit row" style="width: 14%">
                            <img class="icon" :src="$store.state.tokens[pos.token0].icon">
                            <img class="icon" :src="$store.state.tokens[pos.token1].icon">
                            <div>
                                {{$store.state.tokens[pos.token0].symbol}}<br>
                                {{$store.state.tokens[pos.token1].symbol}}
                            </div>
                        </span>
                        <span v-else class="pos-list-pool_unit row">
                            {{pos.token0}}<br>
                            {{pos.token1}}
                        </span>
                        <span class="pos-list-pool_unit">
                            {{($store.state.pools[pos.poolId].sqrt_price * $store.state.pools[pos.poolId].sqrt_price * Math.pow(10, $store.state.tokens[pos.token0].decimals - $store.state.tokens[pos.token1].decimals)).toFixed(2)}}
                        </span>
                        <span class="pos-list-pool_unit">
                            {{(pos.lower_bound_price_decimals).toFixed(2)}}
                        </span>
                        <span class="pos-list-pool_unit">
                            {{(pos.upper_bound_price_decimals).toFixed(2)}}
                        </span>
                        <span class="pos-list-pool_unit">
                            {{(pos.token0_real_liquidity).toFixed(6)}}
                        </span>
                        <span class="pos-list-pool_unit">
                            {{(pos.token1_real_liquidity).toFixed(6)}}
                        </span>
                        <span class="pos-list-pool_unit close-pos">
                            <img v-if="txPending" class="loader-icon-small" src="../assets/icons/loader.gif">
                            <button v-else @click="closePosition(pos)" class="close-btn">
                                X
                            </button>
                        </span>
                    </div>
                </div>
            </template>

            <div v-if="$store.state.pools && $store.state.tokens" class="heading">
                <span class="title">Pools</span><!--<button @click="openNewPoolModal()" class="new-pool-btn">+ New pool</button>-->
            </div>

            <template v-if="$store.state.pools && $store.state.tokens">
                <div v-if="$store.state.pools[0]" class="list-header">
                        <!--<span class="list-header_unit">
                            #
                        </span>-->
                        <span class="list-header_unit">
                            Icon
                        </span>
                        <span class="list-header_unit">
                            Token pair
                        </span>
                        <span class="list-header_unit">
                            Liquidity
                        </span>
                        <span class="list-header_unit">
                            Protocol fee
                        </span>
                        <span class="list-header_unit">
                            Rewards
                        </span>
                        <span class="list-header_unit">
                            Price
                        </span>
                </div>
                <div v-if="$store.state.pools[0]" class="list">
                        <div class="pool" v-for="(pool, index) in $store.state.pools" :key="index">
                            <!--<span class="list-pool_unit">
                                {{index}}
                            </span>-->
                            <span v-if="$store.state.tokens" class="list-pool_unit">
                                <img class="icon" :src="$store.state.tokens[pool.token0].icon"/>
                                <img class="icon" :src="$store.state.tokens[pool.token1].icon"/>
                            </span>
                            <span v-if="$store.state.tokens" class="list-pool_unit">
                                {{$store.state.tokens[pool.token0].symbol}}<br>
                                {{$store.state.tokens[pool.token1].symbol}}
                            </span>
                            <span v-else>
                                {{pool.token0}}<br>
                                {{pool.token1}}
                            </span>
                            <span class="list-pool_unit">
                                {{pool.liquidity }}
                            </span>
                            <span class="list-pool_unit">
                                {{pool.protocol_fee/100}}%
                            </span>
                            <span class="list-pool_unit">
                                {{pool.rewards/100}}%
                            </span>
                            <span class="list-pool_unit">
                                {{(pool.sqrt_price * pool.sqrt_price * Math.pow(10, $store.state.tokens[pool.token0].decimals - $store.state.tokens[pool.token1].decimals)).toFixed(2)}}
                            </span>
                        </div>
                </div>
            </template>
            <template v-else-if="$store.state.pools">
                Loading necessary metadata of tokens. . .
            </template>
            <template v-else>
                Loading pools. . .
            </template>
            
            <template v-if="$store.state.positions">
                <div class="heading">
                    <span class="title">All Positions</span>
                </div>
                <div v-if="$store.state.positions[0]" class="list-header">
                    <span class="pos-list-header_unit">
                        # Pool
                    </span>
                    <span class="pos-list-header_unit">
                        # Pos
                    </span>
                    <span class="pos-list-header_unit">
                        Pool tokens
                    </span>
                    <!--<span class="pos-list-header_unit">
                        Owner
                    </span>-->
                    <span class="pos-list-header_unit">
                        L. bound price
                    </span>
                    <span class="pos-list-header_unit">
                        U. bound price
                    </span>
                    <span class="pos-list-header_unit">
                        T0 Real Liquidity
                    </span>
                    <span class="pos-list-header_unit">
                        T1 Real Liquidity
                    </span>
                </div>
                <div v-if="$store.state.positions[0]" class="list">
                    <div class="pool" v-for="pos in $store.state.positions" :key="pos.id">
                        <span class="pos-list-pool_unit">
                            {{pos.poolId}}
                        </span>
                        <span class="pos-list-pool_unit">
                            {{pos.id}}
                        </span>
                        <span v-if="$store.state.tokens" class="pos-list-pool_unit row">
                            <img class="icon" :src="$store.state.tokens[pos.token0].icon">
                            <img class="icon" :src="$store.state.tokens[pos.token1].icon">
                            <div>
                                {{$store.state.tokens[pos.token0].symbol}}<br>
                                {{$store.state.tokens[pos.token1].symbol}}
                            </div>
                        </span>
                        <span v-else>
                            {{pos.token0}}<br>
                            {{pos.token1}}
                        </span>
                        <!--<span class="pos-list-pool_unit">
                            <template v-if="pos.ownerId === $store.state.account.accountId">
                                <span class="bold">{{pos.ownerId}}<br>(You)</span>
                            </template>
                            <template v-else>
                                {{pos.ownerId}}
                            </template>
                        </span>-->
                        <span class="pos-list-pool_unit">
                            {{(pos.lower_bound_price_decimals).toFixed(2)}}
                        </span>
                        <span class="pos-list-pool_unit">
                            {{(pos.upper_bound_price_decimals).toFixed(2)}}
                        </span>
                        <span class="pos-list-pool_unit">
                            {{(pos.token0_real_liquidity).toFixed(6)}}
                        </span>
                        <span class="pos-list-pool_unit">
                            {{(pos.token1_real_liquidity).toFixed(6)}}
                        </span>
                    </div>
                </div>
            </template>

            
            <!-- list of positions goes here -->
        </template>
        <div class="loading" v-else>
            Loading . . .
        </div>
    </div>
</template>

<script>
import { isNumber, toFixed } from '../utils/number'
import store from '../store'

export default {
    name: 'LiquidityView',
    store,
    data () {
        return {
            /**
             * modal state handling
             */
            modalActive: false,
            newPoolModalActive: false,
            newPositionModalActive: false,

            /**
             * create_pool()
             */
            // token0: null,       // e.g. near-ft.testnet
            // token1: null,       // e.g. usn-ft.testnet
            // price: null,        // e.g. 100
            // protocol_fee: null, // e.g. 10
            // rewards: null,      // e.g. 20

            /**
             * open_position()
             */
            poolId: null,          // e.g. 0
            t0_liq: null,          // e.g. 100000
            t1_liq: null,
            lowerPrice: null,      // e.g. 90
            upperPrice: null,      // e.g. 110
            t0_balance: null,
            t1_balance: null,
            // total: null,
            txPending: false,
            currentPrice: null,
            upperSmallerThanCurrent: false,
            lowerGreaterThanCurrent: false,
            disabled: {
                t0: false,
                t1: false
            },
            loading: false,
        }
    },
    async created () {
        this.loading = true
        // .. 
        this.loading = false
    },
    computed: {
        noLogin() {
            return this.$store.state.account === null ? true : false
        },
        tokensLoaded() {
            return this.$store.state.tokens === null ? false : true
        }
    },
    watch: {
        poolId: function () {
            // console.log(this.t0_balance)
            // console.log(this.t1_balance)
        }
    },
    methods: {
        isNumber,
        openNewPoolModal: function () {
            this.modalActive = true
            this.newPoolModalActive = true
        },
        closeNewPoolModal: function () {
            this.modalActive = false
            this.newPoolModalActive = false
        },
        confirmNewPoolModal: async function () {
            const contract = this.$store.state.crispContract

            if (contract) {
                await contract.create_pool(
                    { 
                        token1: this.token0,
                        token2: this.token1,
                        initial_price: this.price,
                        protocol_fee: this.protocol_fee,
                        rewards: this.rewards
                    }
                ).then(data => {
                    console.log(data)
                })
            }

            // await contract.get_balance_all_tokens(
            //     { account: walletConnection.getAccountId() }
            // )
            //     .then(messages => {
            //     console.log(messages)
            //     this.balances = messages
            //     })
            // }
        },
        openNewPositionModal: function () {
            this.modalActive = true
            this.newPositionModalActive = true
        },
        closeNewPositionModal: function () {
            this.modalActive = false
            this.newPositionModalActive = false
        },
        calculateInit: function () {
            const tokenObj = this.$store.state.tokens[this.$store.state.pools[this.poolId].token0]
            const tokenObj2 = this.$store.state.tokens[this.$store.state.pools[this.poolId].token1]

            const sp = this.$store.state.pools[this.poolId].sqrt_price * this.$store.state.pools[this.poolId].sqrt_price * Math.pow(10, tokenObj.decimals - tokenObj2.decimals)
            console.log(this.$store.state.pools[this.poolId].sqrt_price)
            console.log(sp)

            const lp = sp * 0.9
            const up = sp * 1.1

            this.lowerPrice = lp
            this.upperPrice = up
            this.currentPrice = this.$store.state.pools[this.poolId].sqrt_price * this.$store.state.pools[this.poolId].sqrt_price * Math.pow(10, tokenObj.decimals - tokenObj2.decimals)
            const balance0 = this.$store.state.tokenBalances.find(item => item.token === this.$store.state.pools[this.poolId].token0)
            const balance1 = this.$store.state.tokenBalances.find(item => item.token === this.$store.state.pools[this.poolId].token1)
            this.t0_balance = balance0?.amount || null
            this.t1_balance = balance1?.amount || null
        },
        calculatePricesRatio: function () {
            if(Number(this.upperPrice) < Number(this.currentPrice)) {
                this.upperSmallerThanCurrent = true
                this.t0_liq = 0
                this.disabled.t0 = true
            } else {
                this.upperSmallerThanCurrent = false
                this.t0_liq = null
                this.disabled.t0 = false
            }
            
            if (Number(this.lowerPrice) > Number(this.currentPrice)) {
                this.lowerGreaterThanCurrent = true
                this.t1_liq = 0
                this.disabled.t1 = true
            } else {
                this.lowerGreaterThanCurrent = false
                this.t1_liq = null
                this.disabled.t1 = false
            }
        },
        calculateDefault: function () {
            this.manual_input = 'first'
            if (this.$store.state.pools[0] && Number(this.t0_liq) && this.lowerPrice && this.upperPrice && this.lowerPrice < this.upperPrice && this.upperPrice >= 0 && this.lowerPrice >= 0) {
                const poolId = this.poolId

                const tokenObj = this.$store.state.tokens[this.$store.state.pools[this.poolId].token0]
                const x = Number(this.t0_liq) * Math.pow(10, tokenObj.decimals)
                
                const tokenObj2 = this.$store.state.tokens[this.$store.state.pools[this.poolId].token1]
                const sa = Math.sqrt(this.lowerPrice / Math.pow(10, tokenObj.decimals - tokenObj2.decimals))
                const sb = Math.sqrt(this.upperPrice / Math.pow(10, tokenObj.decimals - tokenObj2.decimals))
                let sp = this.$store.state.pools[poolId].sqrt_price

                const liquidity = (x * sp * sb) / (sb - sp)//  // amount of 2nd token
                sp = Math.max(Math.min(sp, sb), sa) // ?
                const res = liquidity * (sp - sa) / Math.pow(10, tokenObj2.decimals)// //  // ?
                console.log(liquidity + '* (' + sp + ' - ' + sa + ') / ' + Math.pow(10, tokenObj2.decimals) )
                console.log(x, sp, sb, sa)
                console.log(liquidity, res)

                this.t1_liq = toFixed(res)
                // this.total = res
            }
        },
        calculateAlternative: function () {
            this.manual_input = 'second'
            if (this.$store.state.pools[0] && Number(this.t1_liq) && this.lowerPrice && this.upperPrice && this.lowerPrice < this.upperPrice && this.upperPrice >= 0 && this.lowerPrice >= 0) {
                const poolId = this.poolId

                const tokenObj = this.$store.state.tokens[this.$store.state.pools[this.poolId].token0]
                const tokenObj2 = this.$store.state.tokens[this.$store.state.pools[this.poolId].token1]
                const x = Number(this.t1_liq) * Math.pow(10, tokenObj2.decimals)
                
                const sa = Math.sqrt(this.lowerPrice / Math.pow(10, tokenObj.decimals - tokenObj2.decimals))
                const sb = Math.sqrt(this.upperPrice / Math.pow(10, tokenObj.decimals - tokenObj2.decimals))
                let sp = this.$store.state.pools[poolId].sqrt_price

                const liquidity = x / (sp - sa)// amount of 1st token
                sp = Math.max(Math.min(sp, sb), sa) // ?
                const res = liquidity * (sb - sp) / (sp * sb) / Math.pow(10, tokenObj.decimals)//  // ?

                this.t0_liq = toFixed(res)
                // this.total = res
            }
        },
        calculateLower: async function () {
            this.lowerPrice = Number(this.lowerPrice)
            this.upperPrice = Number(this.upperPrice)
            let i_lower = Math.log(this.lowerPrice) / Math.log(1.0001)
            const i_upper = Math.log(this.upperPrice) / Math.log(1.0001)
            if (i_upper - i_lower < 1) {
                i_lower = i_upper - 1
            }
            const new_lower_price = Math.pow(1.0001, i_lower)
            this.lowerPrice = new_lower_price

            if (this.lowerPrice > this.currentPrice || this.upperPrice < this.currentPrice) {
                this.calculateInit()
            }
            // if (this.lowerPrice > this.upperPrice - 1) {
            //     this.lowerPrice = this.upperPrice - 1
            // }
            if (this.$store.state.pools[0] && this.lowerPrice < this.upperPrice) {
                if (this.manual_input === 'first') {
                    this.calculateDefault()
                } else if (this.manual_input === 'second') {
                    this.calculateAlternative()
                }
            }
        },
        calculateUpper: async function () {
            this.lowerPrice = Number(this.lowerPrice)
            this.upperPrice = Number(this.upperPrice)
            const i_lower = Math.log(this.lowerPrice) / Math.log(1.0001)
            let i_upper = Math.log(this.upperPrice) / Math.log(1.0001)
            if (i_upper - i_lower < 1) {
                i_upper = i_lower + 1
            }
            const new_upper_price = Math.pow(1.0001, i_upper)
            this.upperPrice = new_upper_price

            if (this.lowerPrice > this.currentPrice || this.upperPrice < this.currentPrice) {
                this.calculateInit()
            }
            if (this.$store.state.pools[0] && this.lowerPrice < this.upperPrice) {
                if (this.manual_input === 'first') {
                    this.calculateDefault()
                } else if (this.manual_input === 'second') {
                    this.calculateAlternative()
                }
            }
        },
        confirmNewPositionModal: async function () {
            this.lowerPrice = Number(this.lowerPrice)
            this.upperPrice = Number(this.upperPrice)
            const contract = this.$store.state.crispContract

            if (contract && this.lowerPrice < this.upperPrice && this.upperPrice >= 0 && this.lowerPrice >= 0) {
                this.txPending = true
                try {
                    let tokenObj = this.$store.state.tokens[this.$store.state.pools[this.poolId].token0]
                        console.log(this.$store.state.tokens[this.$store.state.pools[this.poolId].token0])
                        const tokenObj2 = this.$store.state.tokens[this.$store.state.pools[this.poolId].token1]

                    console.log(Number(this.poolId))
                    console.log(Number(this.t0_liq).toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 }))
                    console.log(Number(this.t0_liq * Math.pow(10, tokenObj.decimals)).toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 }))
                    console.log(Number(this.lowerPrice))
                    console.log(Number(this.upperPrice))
                    console.log(tokenObj)
                    await contract.open_position(
                        {
                            pool_id: Number(this.poolId),
                            token0_liquidity: Number(this.t0_liq * Math.pow(10, tokenObj.decimals)).toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 }),
                            lower_bound_price: Number(this.lowerPrice / Math.pow(10, tokenObj.decimals - tokenObj2.decimals)),
                            upper_bound_price: Number(this.upperPrice / Math.pow(10, tokenObj.decimals - tokenObj2.decimals))
                        }
                    ).then((response) => {
                        console.log(response)
                        this.$store.commit('pushNotification', {
                            title: 'Success',
                            type: 'success',
                            // text: response
                            text: 'Position successfully opened'
                        })
                        this.txPending = false
                        this.closeNewPositionModal()
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
        },
        closePosition: async function (pos) {
            const contract = this.$store.state.crispContract

            if (contract) {
                this.txPending = true
                try {
                    await contract.close_position(
                        {
                            pool_id: Number(pos.poolId),
                            id: Number(pos.id)
                        }
                    ).then((response) => {
                        console.log(response)
                        this.$store.commit('pushNotification', {
                            title: 'Success',
                            type: 'success',
                            // text: response
                            text: 'Position successfully closed'
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
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/main.scss";

.wrapper {
    width: $interfaceBlocksWidth;
}

.heading, .list {
    width: 100%;
}

.heading {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
}

.list {
    margin-bottom: 64px;
    display: flex;
    flex-direction: column;
    background-color: $cardBgColor;
    border: $border;
    border-radius: $borderRadius;
    box-sizing: border-box;
}

.pool {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-radius: $borderRadius;
}

.pool:hover {
    background-color: $cardHoverBgColor;
    border-radius: $borderRadius;
}

.title {
    color: $textColor;
    font-size: $greaterTextSize;
}

.new-pool-btn, .new-position-btn {
    border: 1px solid transparent;
    width: 200px;
    padding: 8px;
    border-radius: $borderRadius;
    background-color: $buttonBgColor;
    color: $buttonTextColor;
    font-size: $lesserTextSize;
    cursor: pointer;
    transition: 0.3s;
}

.new-pool-btn:hover, .new-position-btn:hover {
    background-color: $buttonTextColor;
    color: $buttonBgColor;
    transition: 0.3s;
    border: 1px solid $buttonBgColor;
}

.list-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 16px;
    box-sizing: border-box;
}

.list-header_unit, .list-pool_unit {
    width: 19%;
    font-size: $tinyTextSize;
}

.list-header_unit:first-child, .list-pool_unit:first-child {
    width: 5%;
}
.list-header_unit:nth-child(2), .list-pool_unit:nth-child(2) {
    width: 6%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}

.pos-list-header_unit, .pos-list-pool_unit {
    width: 14%;
    font-size: $tinyTextSize;
}

.pos-list-header_unit:first-child, .pos-list-pool_unit:first-child, .pos-list-header_unit:nth-child(2), .pos-list-pool_unit:nth-child(2) {
    width: 5%;
}

.pos-list-header_unit:first-child, .pos-list-pool_unit:first-child, .pos-list-header_unit:nth-child(2), .pos-list-pool_unit:nth-child(2) {
    width: 7%;
}

.pos-list-header_unit:nth-child(3), .pos-list-pool_unit:nth-child(3), .pos-list-header_unit:nth-child(4), .pos-list-pool_unit:nth-child(4) {
    width: 13%;
}

.pos-list-header_unit:nth-child(7), .pos-list-pool_unit:nth-child(7), .pos-list-header_unit:nth-child(8), .pos-list-pool_unit:nth-child(8) {
    width: 16%;
}

.row {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.small-icon {
    width: $lesserTextSize;
    height: $lesserTextSize;
    margin-right: 4px;
}

.icon {
    margin: 6px;
    margin-left: 0;
    width: $lesserTextSize;
    height: $lesserTextSize;
}

.bold {
    font-weight: 500;
    color: $textHoverColor;
}
.modal-wrapper {
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

@keyframes appear {
    0% {
        background-color: rgb(59, 60, 63, 0);
    }
    100% {
        background-color: rgb(59, 60, 63, 0.8);
    }
}

.modal {
    width: $interfaceBlocksWidth;
    background-color: $cardBgColor;
    min-height: $defaultCardHeight;
    border: $brightBorder;
    border-radius: $borderRadius;
    padding: 26px;
}

.modal-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-bottom: $brightBorder;
    padding-bottom: 26px;
}

.modal-title {
    font-size: $textSize;
}

.x-icon {
    width: $textSize;
    height: $textSize;
    cursor: pointer;
    opacity: 0.9;
    transition: 0.2s;
}

.x-icon:hover {
    opacity: 1;
    transition: 0.2s;
}

.modal-body {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.modal-body_row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-top: 48px;
    width: 60%;
    padding-bottom: 48px;
}

.modal-body_row:first-child {
    border-bottom: $brightBorder;
}

.modal-body_row-input {
    border: $border;
    background: none;
    font-size: $lesserTextSize;
    border-radius: $borderRadius;
    padding: 4px;
    margin-left: 8px;
    margin-right: 8px;
    transition: 0.3s;
    min-width: 238px;
    min-height: 29px;
    box-sizing: border-box;
}

.modal-body_row-input:focus {
    border: 1px solid $buttonBgColor;
    outline: none;
    transition: 0.3s;
}

.input-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.input-title {
    font-size: $tinyTextSize;
    margin-bottom: 8px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.modal-footer {
    border-top: $brightBorder;
    padding-top: 26px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
}

.confirm-btn {
    border: 1px solid transparent;
    width: 200px;
    padding: 8px;
    border-radius: $borderRadius;
    background-color: $buttonBgColor;
    color: $buttonTextColor;
    font-size: $lesserTextSize;
    cursor: pointer;
    transition: 0.3s;
}

.confirm-btn:hover {
    background-color: $buttonTextColor;
    color: $buttonBgColor;
    transition: 0.3s;
    border: 1px solid $buttonBgColor;
}

.close-pos {
    font-weight: 500;
    color: $textHoverColor;
    text-align: center;
}

.close-header-unit {
    text-align: center;
    padding-right: 32px;
    box-sizing: border-box;
}

.close-btn {
    border: 1px solid transparent;
    width: $textSize;
    height: $textSize;
    padding: 2px;
    border-radius: ($borderRadius/2);
    background-color: $buttonBgColor;
    color: $buttonTextColor;
    font-size: $lesserTextSize;
    cursor: pointer;
    transition: 0.3s;
    margin-right: 32px;
}

.close-btn:hover {
    background-color: $buttonTextColor;
    color: $buttonBgColor;
    transition: 0.3s;
    border: 1px solid $buttonBgColor;
}

.loader-icon-small {
    width: $textSize;
    height: $textSize;
    margin-right: 32px;
}
</style>