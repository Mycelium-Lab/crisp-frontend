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
                        <div class="input-wrapper">
                            <span class="input-title">Pool id</span>
                            <select v-model="poolId" id="poolId" class="modal-body_row-input">
                                <option v-for="(pool, index) in $store.state.pools" :key="index">
                                    {{index}}
                                </option>
                            </select>
                        </div>
                        <div v-if="poolId" class="input-wrapper">
                            <span class="input-title">{{$store.state.pools[poolId].token0}} liquidity</span>
                            <input v-model="t0_liq" id="t0_liq" class="modal-body_row-input"/>
                        </div>
                    </div>
                    <div class="modal-body_row">
                        <div class="input-wrapper">
                            <span class="input-title">Lower bound price</span>
                            <input v-model="lowerPrice" id="lowerPrice" class="modal-body_row-input"/>
                        </div>
                        <div class="input-wrapper">
                            <span class="input-title">Upper bound price</span>
                            <input v-model="upperPrice" id="upperPrice" class="modal-body_row-input"/>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="confirmNewPositionModal()" class="confirm-btn">Confirm</button>
                </div>
            </div>
        </div>
        <div v-if="noLogin">
            Please, connect your wallet
        </div>
        <template v-else-if="!loading">
            <div class="heading">
                <span class="title">Pools</span><!--<button @click="openNewPoolModal()" class="new-pool-btn">+ New pool</button>-->
            </div>

            <template v-if="$store.state.pools">
                <div v-if="$store.state.pools[0]" class="list-header">
                    <span class="list-header_unit">
                        #
                    </span>
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
                        <span class="list-pool_unit">
                            {{index}}
                        </span>
                        <span v-if="$store.state.tokens" class="list-pool_unit">
                            <img class="icon" :src="$store.state.tokens[pool.token0].icon"/>
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
                            {{pool.liquidity}}
                        </span>
                        <span class="list-pool_unit">
                            {{pool.protocol_fee/100}}%
                        </span>
                        <span class="list-pool_unit">
                            {{pool.rewards/100}}%
                        </span>
                        <span class="list-pool_unit">
                            {{pool.sqrt_price * pool.sqrt_price}}
                        </span>
                    </div>
                </div>
            </template>
            
            <template v-if="$store.state.positions">
                <div class="heading">
                    <span class="title">Positions</span><button @click="openNewPositionModal()" class="new-position-btn">+ New position</button>
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
                    <!--<span class="pos-list-header_unit">
                        Status
                    </span>-->
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
                            {{(pos.sqrt_lower_bound_price * pos.sqrt_lower_bound_price).toFixed(6)}}
                        </span>
                        <span class="pos-list-pool_unit">
                            {{(pos.sqrt_upper_bound_price * pos.sqrt_upper_bound_price).toFixed(6)}}
                        </span>
                        <span class="pos-list-pool_unit">
                            {{(pos.token0_real_liquidity).toFixed(6)}}
                        </span>
                        <span class="pos-list-pool_unit">
                            {{(pos.token1_real_liquidity).toFixed(6)}}
                        </span>
                        <!--<span v-if="pos.ownerId === $store.state.account.accountId" class="pos-list-pool_unit close-pos">
                            <button v-if="pos.isActive === true" @click="closePosition(pos)" class="close-btn">
                                X
                            </button>
                            <template v-else>
                                Closed
                            </template>
                        </span>
                        <span v-else class="pos-list-pool_unit">
                            <template v-if="pos.isActive === true">
                                Active
                            </template>
                            <template v-else>
                                Closed
                            </template>
                        </span>-->
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
            lowerPrice: null,      // e.g. 90
            upperPrice: null,      // e.g. 110
            t0_balance: null,
            t1_balance: null,

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
        }
    },
    watch: {
        poolId: function () {
            console.log(this.t0_balance)
            console.log(this.t1_balance)
        }
    },
    methods: {
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
        confirmNewPositionModal: async function () {
            const contract = this.$store.state.crispContract

            if (contract) {
                await contract.open_position(
                    {
                        pool_id: Number(this.poolId),
                        token0_liquidity: Number(this.t0_liq),
                        lower_bound_price: Number(this.lowerPrice),
                        upper_bound_price: Number(this.upperPrice)
                    }
                ).then((response) => {
                    console.log(response)
                })
            }
        },
        closePosition: async function (pos) {
            const contract = this.$store.state.crispContract

            if (contract) {
                await contract.close_position(
                    {
                        pool_id: Number(pos.poolId),
                        id: Number(pos.id)
                    }
                ).then((response) => {
                    console.log(response)
                })
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

.pos-list-header_unit:nth-child(3), .pos-list-pool_unit:nth-child(3), .pos-list-header_unit:nth-child(4), .pos-list-pool_unit:nth-child(4) {
    width: 13%;
}

.row {
    display: flex;
    flex-direction: row;
    align-items: center;
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
}

.close-btn:hover {
    background-color: $buttonTextColor;
    color: $buttonBgColor;
    transition: 0.3s;
    border: 1px solid $buttonBgColor;
}
</style>