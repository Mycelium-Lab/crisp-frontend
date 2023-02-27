<template>
    <div class="wrapper">
        <template v-if="$store.state.account">
            <div class="heading">
                <span class="title">Signed in as {{$store.state.account.accountId}}</span>
            </div>
            <div class="methods-table">
                <div class="method">
                    <div @click="create_reserve()" class="method-title">
                        Create_reserve
                    </div>
                    <div class="method-variable">
                        <input class="inputbox" type="text" v-model="reserve_token">
                        <span class="var-title">reserve_token e.g. "usdn.testnet"</span>
                    </div>
                </div>
                <div class="method">
                    <div @click="create_deposit()" class="method-title">
                        Create_deposit
                    </div>
                    <div class="method-variable">
                        <input class="inputbox" type="text" v-model="create_deposit_asset">
                        <span class="var-title">asset e.g. "usdn.testnet"</span>
                    </div>
                    <div class="method-variable">
                        <input class="inputbox" type="text" v-model="create_deposit_amount">
                        <span class="var-title">amount e.g. 100000</span>
                    </div>
                </div>
                <div class="method">
                    <div @click="close_deposit()" class="method-title">
                        Close_deposit
                    </div>
                    <div class="method-variable">
                        <input class="inputbox" type="text" v-model="close_deposit_deposit_id">
                        <span class="var-title">deposit_id e.g. "0"</span>
                    </div>
                </div>
                <div class="method">
                    <div @click="refresh_deposits_growth()" class="method-title">
                        Refresh_deposits_growth
                    </div>
                </div>
                <div class="method">
                    <div @click="take_deposit_growth()" class="method-title">
                        Take_deposit_growth
                    </div>
                    <div class="method-variable">
                        <input class="inputbox" type="text" v-model="take_growth_deposit_id">
                        <span class="var-title">deposit_id e.g. "0"</span>
                    </div>
                    <div class="method-variable">
                        <input class="inputbox" type="text" v-model="take_growth_amount">
                        <span class="var-title">amount e.g. 100</span>
                    </div>
                </div>
                <div class="method">
                    <div @click="get_account_deposits()" class="method-title">
                        Get_account_deposits
                    </div>
                    <div class="method-variable">
                        <span class="var-title">account_id - {{ this.$store.state.account.accountId }}</span>
                    </div>
                </div>
                <div class="method">
                    <div @click="supply_collateral_and_borrow_simple()" class="method-title">
                        Supply_collateral_and_borrow_simple
                    </div>
                    <div class="method-variable">
                        <input class="inputbox" type="text" v-model="supply_simple_pool_id">
                        <span class="var-title">pool_id e.g. 0</span>
                    </div>
                    <div class="method-variable">
                        <input class="inputbox" type="text" v-model="supply_simple_pos_id">
                        <span class="var-title">position_id e.g. 0</span>
                    </div>
                </div>
                <div class="method">
                    <div @click="supply_collateral_and_borrow_leveraged()" class="method-title">
                        Supply_collateral_and_borrow_leveraged
                    </div>
                    <div class="method-variable">
                        <input class="inputbox" type="text" v-model="supply_leveraged_pool_id">
                        <span class="var-title">pool_id e.g. 0</span>
                    </div>
                    <div class="method-variable">
                        <input class="inputbox" type="text" v-model="supply_leveraged_pos_id">
                        <span class="var-title">position_id e.g. 0</span>
                    </div>
                    <div class="method-variable">
                        <input class="inputbox" type="text" v-model="supply_leveraged_leverage">
                        <span class="var-title">leverage e.g. 2</span>
                    </div>
                </div>
                <div class="method">
                    <div @click="return_collateral_and_repay()" class="method-title">
                        Return_collateral_and_repay
                    </div>
                    <div class="method-variable">
                        <input class="inputbox" type="text" v-model="return_collateral_borrow_id">
                        <span class="var-title">borrow_id e.g. 0</span>
                    </div>
                </div>
                <div class="method">
                    <div @click="get_liquidation_list()" class="method-title">
                        Get_liquidation_list
                    </div>
                </div>
                <div class="method">
                    <div @click="get_borrow_health_factor()" class="method-title">
                        Get_borrow_health_factor
                    </div>
                    <div class="method-variable">
                        <input class="inputbox" type="text" v-model="get_borrow_health_borrow_id">
                        <span class="var-title">borrow_id e.g. 0</span>
                    </div>
                </div>
                <div class="method">
                    <div @click="liquidate()" class="method-title">
                        Liquidate
                    </div>
                    <div class="method-variable">
                        <input class="inputbox" type="text" v-model="liquidate_borrow_id">
                        <span class="var-title">borrow_id e.g. 0</span>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
// import { CONTRACT_ID } from '../constants/index.js'
// import { toFixed } from '../utils/number'
import { addDecimals } from '@/utils/format'
import store from '../store'
// import * as nearAPI from "near-api-js"

export default {
    name: 'LendingView',
    store,
    data () {
        return {
            addDecimals: addDecimals,
            /**
             * create_reserve()
             */
            reserve_token: '',

            /**
             * create_deposit()
             */
            create_deposit_asset: '',
            create_deposit_amount: '',

            /**
             * close_deposit()
             */
            close_deposit_deposit_id: '',

            /**
             * refresh_deposits_growth()
             */

            /**
             * take_deposit_growth()
             */
            take_growth_deposit_id: '',
            take_growth_amount: '',

            /**
             * get_account_deposits()
             */

            /**
             * supply_collateral_and_borrow_simple()
             */
            supply_simple_pool_id: '',
            supply_simple_pos_id: '',

            /**
             * supply_collateral_and_borrow_leveraged()
             */
            supply_leveraged_pool_id: '',
            supply_leveraged_pos_id: '',
            supply_leveraged_leverage: '',

            /**
             * return_collateral_and_repay()
             */
            return_collateral_borrow_id: '',
            
            /**
             * get_liquidation_list()
             */

            /**
             * get_borrow_health_factor()
             */
            get_borrow_health_borrow_id: '',
            
            /**
             * liquidate
             */
            liquidate_borrow_id: ''
        }
    },
    methods: {
        create_reserve: async function () {
            const contract = this.$store.state.crispContract

            if (contract) {
                try {
                    await contract.create_reserve(
                        { 
                            reserve_token: this.reserve_token
                        }
                    ).then(data => {
                        console.log(data)
                        this.$store.commit('pushNotification', {
                            title: 'Success',
                            type: 'success',
                            // text: response
                            text: 'Create_reserve() is successful'
                        })
                        this.$store.dispatch('reload', store.state)
                    })
                }
                catch (err) {
                    console.log(err)
                    this.$store.commit('pushNotification', {
                        title: 'Error',
                        type: 'error',
                        text: err
                    })
                }
            }
        },
        create_deposit: async function () {
            const contract = this.$store.state.crispContract

            if (contract) {
                try {
                    let tokenObj
                    if (this.$store.state.tokens[this.create_deposit_asset]) {
                        tokenObj = this.$store.state.tokens[this.create_deposit_asset]
                    }

                    const amount = addDecimals(this.create_deposit_amount, tokenObj)

                    await contract.create_deposit(
                        { 
                            asset: this.create_deposit_asset,
                            amount: amount
                        }
                    ).then(data => {
                        console.log(data)
                        this.$store.commit('pushNotification', {
                            title: 'Success',
                            type: 'success',
                            // text: response
                            text: 'Create_deposit() is successful'
                        })
                        this.$store.dispatch('reload', store.state)
                    })
                }
                catch (err) {
                    console.log(err)
                    this.$store.commit('pushNotification', {
                        title: 'Error',
                        type: 'error',
                        text: err
                    })
                }
            }
        },
        close_deposit: async function () {
            const contract = this.$store.state.crispContract

            if (contract) {
                try {
                    await contract.close_deposit(
                        { 
                            deposit_id: Number(this.close_deposit_deposit_id)
                        }
                    ).then(data => {
                        console.log(data)
                        this.$store.commit('pushNotification', {
                            title: 'Success',
                            type: 'success',
                            // text: response
                            text: 'Close_deposit() is successful'
                        })
                        this.$store.dispatch('reload', store.state)
                    })
                }
                catch (err) {
                    console.log(err)
                    this.$store.commit('pushNotification', {
                        title: 'Error',
                        type: 'error',
                        text: err
                    })
                }
            }
        },
        refresh_deposits_growth: async function () {
            const contract = this.$store.state.crispContract

            if (contract) {
                try {
                    await contract.refresh_deposits_growth().then(data => {
                        console.log(data)
                        this.$store.commit('pushNotification', {
                            title: 'Success',
                            type: 'success',
                            // text: response
                            text: 'Refresh_deposits_growth() is successful'
                        })
                        this.$store.dispatch('reload', store.state)
                    })
                }
                catch (err) {
                    console.log(err)
                    this.$store.commit('pushNotification', {
                        title: 'Error',
                        type: 'error',
                        text: err
                    })
                }
            }
        },
        take_deposit_growth: async function () {
            const contract = this.$store.state.crispContract

            if (contract) {
                try {
                    await contract.take_deposit_growth(
                        { 
                            deposit_id: Number(this.take_growth_deposit_id),
                            amount: this.take_growth_amount
                        }
                    ).then(data => {
                        console.log(data)
                        this.$store.commit('pushNotification', {
                            title: 'Success',
                            type: 'success',
                            // text: response
                            text: 'Take_deposit_growth() is successful'
                        })
                        this.$store.dispatch('reload', store.state)
                    })
                }
                catch (err) {
                    console.log(err)
                    this.$store.commit('pushNotification', {
                        title: 'Error',
                        type: 'error',
                        text: err
                    })
                }
            }
        },
        get_account_deposits: async function () {
            const contract = this.$store.state.crispContract

            if (contract) {
                try {
                    await contract.get_account_deposits(
                        { 
                            account_id: this.$store.state.account.accountId
                        }
                    ).then(data => {
                        console.log(data)
                        this.$store.commit('pushNotification', {
                            title: 'Success',
                            type: 'success',
                            // text: response
                            text: 'Get_account_deposits() is successful'
                        })
                        this.$store.dispatch('reload', store.state)
                    })
                }
                catch (err) {
                    console.log(err)
                    this.$store.commit('pushNotification', {
                        title: 'Error',
                        type: 'error',
                        text: err
                    })
                }
            }
        },
        supply_collateral_and_borrow_simple: async function () {
            const contract = this.$store.state.crispContract

            if (contract) {
                try {
                    await contract.supply_collateral_and_borrow_simple(
                        { 
                            pool_id: Number(this.supply_simple_pool_id),
                            position_id: Number(this.supply_simple_pos_id)
                        }
                    ).then(data => {
                        console.log(data)
                        this.$store.commit('pushNotification', {
                            title: 'Success',
                            type: 'success',
                            // text: response
                            text: 'Supply_collateral_and_borrow_simple() is successful'
                        })
                        this.$store.dispatch('reload', store.state)
                    })
                }
                catch (err) {
                    console.log(err)
                    this.$store.commit('pushNotification', {
                        title: 'Error',
                        type: 'error',
                        text: err
                    })
                }
            }
        },
        supply_collateral_and_borrow_leveraged: async function () {
            const contract = this.$store.state.crispContract

            if (contract) {
                try {
                    await contract.supply_collateral_and_borrow_leveraged(
                        { 
                            pool_id: Number(this.supply_leveraged_pool_id),
                            position_id: Number(this.supply_leveraged_pos_id),
                            leverage: Number(this.supply_leveraged_leverage)
                        }
                    ).then(data => {
                        console.log(data)
                        this.$store.commit('pushNotification', {
                            title: 'Success',
                            type: 'success',
                            // text: response
                            text: 'Supply_collateral_and_borrow_leveraged() is successful'
                        })
                        this.$store.dispatch('reload', store.state)
                    })
                }
                catch (err) {
                    console.log(err)
                    this.$store.commit('pushNotification', {
                        title: 'Error',
                        type: 'error',
                        text: err
                    })
                }
            }
        },
        return_collateral_and_repay: async function () {
            const contract = this.$store.state.crispContract

            if (contract) {
                try {
                    await contract.return_collateral_and_repay(
                        { 
                            borrow_id: Number(this.return_collateral_borrow_id)
                        }
                    ).then(data => {
                        console.log(data)
                        this.$store.commit('pushNotification', {
                            title: 'Success',
                            type: 'success',
                            // text: response
                            text: 'Return_collateral_and_repay() is successful'
                        })
                        this.$store.dispatch('reload', store.state)
                    })
                }
                catch (err) {
                    console.log(err)
                    this.$store.commit('pushNotification', {
                        title: 'Error',
                        type: 'error',
                        text: err
                    })
                }
            }
        },
        get_liquidation_list: async function () {
            const contract = this.$store.state.crispContract

            if (contract) {
                try {
                    await contract.get_liquidation_list().then(data => {
                        console.log(data)
                        this.$store.commit('pushNotification', {
                            title: 'Success',
                            type: 'success',
                            // text: response
                            text: 'Get_liquidation_list() is successful'
                        })
                        this.$store.dispatch('reload', store.state)
                    })
                }
                catch (err) {
                    console.log(err)
                    this.$store.commit('pushNotification', {
                        title: 'Error',
                        type: 'error',
                        text: err
                    })
                }
            }
        },
        get_borrow_health_factor: async function () {
            const contract = this.$store.state.crispContract

            if (contract) {
                try {
                    await contract.get_borrow_health_factor(
                        {
                            borrow_id: Number(this.get_borrow_health_borrow_id)
                        }
                    ).then(data => {
                        console.log(data)
                        this.$store.commit('pushNotification', {
                            title: 'Success',
                            type: 'success',
                            // text: response
                            text: 'Get_borrow_health_factor() is successful'
                        })
                        this.$store.dispatch('reload', store.state)
                    })
                }
                catch (err) {
                    console.log(err)
                    this.$store.commit('pushNotification', {
                        title: 'Error',
                        type: 'error',
                        text: err
                    })
                }
            }
        },
        liquidate: async function () {
            const contract = this.$store.state.crispContract

            if (contract) {
                try {
                    await contract.liquidate(
                        {
                            borrow_id: Number(this.liquidate_borrow_id)
                        }
                    ).then(data => {
                        console.log(data)
                        this.$store.commit('pushNotification', {
                            title: 'Success',
                            type: 'success',
                            // text: response
                            text: 'Liquidate() is successful'
                        })
                        this.$store.dispatch('reload', store.state)
                    })
                }
                catch (err) {
                    console.log(err)
                    this.$store.commit('pushNotification', {
                        title: 'Error',
                        type: 'error',
                        text: err
                    })
                }
            }
        }
    }
}
</script>

<style lang="scss">
@import "~@/assets/scss/main.scss";

.heading {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    font-size: $textSize;
}

.inputbox {
    width: 260px;
    margin-right: 4px;
}

.method {
    border: 1px solid black;
    margin-bottom: 12px;
    padding: 4px;
}

.method-title {
    cursor: pointer;
}
</style>