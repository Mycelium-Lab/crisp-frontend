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
                                <option v-for="(pool, index) in pools" :key="index">
                                    {{index}}
                                </option>
                            </select>
                        </div>
                        <div v-if="poolId" class="input-wrapper">
                            <span class="input-title">{{pools[poolId].token0}} liquidity</span>
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
        <template v-if="!loading">
            <div class="heading">
                <span class="title">Pools</span><!--<button @click="openNewPoolModal()" class="new-pool-btn">+ New pool</button>-->
            </div>
            <div class="list-header">
                <span class="list-header_unit">
                    #
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
                    Sqrt price
                </span>
            </div>
            <div class="list">
                <div class="pool" v-for="(pool, index) in pools" :key="index">
                    <span class="list-pool_unit">
                        {{index}}
                    </span>
                    <span class="list-pool_unit">
                        {{pool.token0}}<br>
                        {{pool.token1}}
                    </span>
                    <span class="list-pool_unit">
                        {{pool.liquidity}}
                    </span>
                    <span class="list-pool_unit">
                        {{pool.protocol_fee}}
                    </span>
                    <span class="list-pool_unit">
                        {{pool.rewards}}
                    </span>
                    <span class="list-pool_unit">
                        {{pool.sqrt_price * pool.sqrt_price}}
                    </span>
                </div>
            </div>
            <!-- list of pools goes here -->
            <div class="heading">
                <span class="title">Positions</span><button @click="openNewPositionModal()" class="new-position-btn">+ New position</button>
            </div>
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
            pools: []
        }
    },
    async created () {
        this.loading = true

        const contract = this.$store.state.crispContract
        if (contract) {
            const response = await contract.get_pools()
            console.log(response)
            this.pools = response
        } else {
            // ..
        }
        this.loading = false
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
                        pool_id: parseInt(this.poolId),
                        token0_liquidity: parseInt(this.t0_liq),
                        lower_bound_price: parseInt(this.lowerPrice),
                        upper_bound_price: parseInt(this.upperPrice)
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
    padding: 16px;
    box-sizing: border-box;
}

.pool {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
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
</style>