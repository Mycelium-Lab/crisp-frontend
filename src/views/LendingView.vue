<template>
    <div class="wrapper">
        <div v-if="modalActive" class="modal-wrapper">
            <div v-if="depositModalActive" class="modal">
                <div class="modal-header">
                    <div></div>
                    <span class="modal-title">Deposit {{ tokenForDeposit.symbol }}</span>
                    <img @click="closeDepositModal()" class="x-icon" src="../assets/icons/x.svg"/>
                </div>
                <div class="modal-body modal-body-deletepos">
                    <div class="input-wrapper">
                        <span class="input-title">Deposit source</span>
                        <div class="toggler-wrapper">
                            Near
                            <div class="toggler" @click="swapDepositSource()">
                                <div class="toggle" :class="{toggleActive: depositSource === 'inner'}">

                                </div>
                            </div>
                            Crisp
                        </div>
                        <span class="input-title">Amount</span>
                        <input type="text" @keypress="isNumber" placeholder="0" v-model="create_deposit_amount" id="depositAmount" class="input-inputbox"/>
                        <span v-if="this.$store.state.tokenBalances.find(item => item.symbol === tokenForDeposit.symbol) && depositSource === 'inner'" class="input-balance">Available balance on Crisp: {{this.$store.state.tokenBalances.find(item => item.symbol === tokenForDeposit.symbol).amount}}</span>
                        <span v-else-if="tokenForDepositNearBalance && depositSource === 'outer'" class="input-balance">Available balance on Near: {{ tokenForDepositNearBalance }}</span>
                    </div>
                </div>
                <div class="modal-footer">
                    <img v-if="txPending" class="loader-icon" src="../assets/icons/loader.gif">
                    <button v-if="!txPending" @click="create_deposit()" class="confirm-btn confirm-btn-deletepos">Yes</button>
                </div>
            </div>
            <div v-if="withdrawModalActive" class="modal">
                <div class="modal-header">
                    <div></div>
                    <span class="modal-title">Withdraw {{ depositForWithdraw.symbol }}</span>
                    <img @click="closeWithdrawModal()" class="x-icon" src="../assets/icons/x.svg"/>
                </div>
                <div class="modal-body modal-body-deletepos">
                    <div class="input-wrapper">
                        <span class="input-title">Withdraw to</span>
                        <div class="toggler-wrapper">
                            Near
                            <div class="toggler" @click="swapWithdrawTarget()">
                                <div class="toggle" :class="{toggleActive: withdrawTarget === 'inner'}">

                                </div>
                            </div>
                            Crisp
                        </div>
                        <span class="input-title">Amount</span>
                        <input type="text" @keypress="isNumber" placeholder="0" v-model="close_deposit_amount" id="withdrawAmount" class="input-inputbox"/>
                        <span class="input-balance">Total amount deposited: {{ depositForWithdraw.amount / Math.pow(10, $store.state.tokens[depositForWithdraw.asset].decimals) }}</span>
                    </div>
                </div>
                <div class="modal-footer">
                    <img v-if="txPending" class="loader-icon" src="../assets/icons/loader.gif">
                    <button v-if="!txPending" @click="close_deposit_by_token(depositForWithdraw)" class="confirm-btn confirm-btn-deletepos">Yes</button>
                </div>
            </div>
        </div>
        <template v-if="$store.state.account">
            <template v-if="tokensSupportedForDeposit && $store.state.tokens">
                <span class="heading">Deposit Assets</span>
                <div class="table_wrapper">
                    <div class="table">
                        <div @click="openDepositModal(token)" v-for="token in tokensSupportedForDeposit" :key="token.token" class="token">
                            <span class="token-unit">
                                <img class="icon" :src="$store.state.tokens[token.token].icon">
                            </span>
                            <span class="token-unit symbol">
                                {{ $store.state.tokens[token.token].symbol }}
                            </span>
                        </div>
                    </div>
                </div>
            </template>
            <template v-else>
                <span class="heading">Loading your tokens</span>
                <span class="heading">Signed in as {{$store.state.account.accountId}}</span>
            </template>
            <template v-if="$store.state.userDeposits && $store.state.userDeposits[0] && $store.state.tokens">
                <div class="token-table_wrapper">
                    <div class="token-table">
                        <span class="heading">Deposited assets</span>
                        <div class="deposit">
                            <div class="deposit-unit"></div>
                            <div class="deposit-unit" style="margin-left: 6px;">Asset</div>
                            <div class="deposit-unit" style="margin-left: 2px;">Amount</div>
                            <div class="deposit-unit" style="margin-left: 2px;">APR</div>
                            <div class="deposit-unit"></div>
                        </div>
                        <div v-for="deposit in $store.state.userDeposits" :key="deposit.id" class="deposit-token-wrapper">
                            <div class="deposit">
                                <div class="deposit-unit">
                                    <img class="icon" :src="$store.state.tokens[deposit.asset].icon">
                                </div>
                                <div class="deposit-unit">
                                    {{ $store.state.tokens[deposit.asset].symbol }}
                                </div>
                                <div class="deposit-unit">
                                    {{ (deposit.amount / Math.pow(10, $store.state.tokens[deposit.asset].decimals)).toFixed(4) }}
                                </div>
                                <div class="deposit-unit">
                                    10%
                                    <!--{{ token.apr }}-->
                                </div>
                                <div class="deposit-unit">
                                    <img v-if="txPending" class="cell-loader-icon" src="../assets/icons/loader.gif">
                                    <template v-else>
                                        <button @click="openWithdrawModal(deposit)" class="close-pos">
                                            X
                                        </button>
                                        <!--<button v-if="token.deposits.length > 1" @click="token.expanded = true" class="expand-pos">
                                            V
                                        </button>
                                        <button v-else class="expand-pos expand-pos-disabled" disabled>
                                            V
                                        </button>-->
                                    </template>
                                </div>
                            </div>
                        </div>
                        <!--<div v-for="deposit in $store.state.userDeposits" :key="deposit.id" class="deposit">
                            <div class="deposit-unit">
                                <img class="icon" :src="$store.state.tokens[deposit.asset].icon">
                            </div>
                            <div class="deposit-unit">
                                {{ $store.state.tokens[deposit.asset].symbol }}
                            </div>
                            <div class="deposit-unit">
                                {{ deposit.amount / Math.pow(10, $store.state.tokens[deposit.asset].decimals) }}
                            </div>
                            <div class="deposit-unit">
                                <img v-if="txPending" class="cell-loader-icon" src="../assets/icons/loader.gif">
                                <button v-else @click="close_deposit(deposit.id)" class="close-pos">
                                    X
                                </button>
                            </div>
                        </div>-->
                    </div>
                </div>
            </template>
            <!--<div class="methods-table">
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
            </div>-->
        </template>
    </div>
</template>

<script>
import { CONTRACT_ID } from '../constants/index.js'
// import { toFixed } from '../utils/number'
import { SWAP_TOKENS } from '@/constants'
import { isNumber } from '../utils/number'
import { addDecimals } from '@/utils/format'
import store from '../store'
import * as nearAPI from "near-api-js"

export default {
    name: 'LendingView',
    store,
    data () {
        return {
            txPending: false,
            tokensSupportedForDeposit: SWAP_TOKENS,
            addDecimals: addDecimals,
            modalActive: false,
            depositModalActive: false,
            withdrawModalActive: false,

            depositSource: 'outer',
            withdrawTarget: 'outer',
            tokenForDepositNearBalance: null,
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
            // close_deposit_deposit_id: '',

            close_deposit_amount: '',

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
        isNumber,
        openDepositModal: async function (token) {
            const tokenObj = this.$store.state.tokens[token.token]

            this.modalActive = true
            this.depositModalActive = true
            this.tokenForDeposit = token
            this.create_deposit_asset = token.token
            this.create_deposit_amount = 0

            await this.$store.state.walletConnection.account().viewFunction(
                {
                    contractId: tokenObj.token,
                    methodName: 'ft_balance_of',
                    args: {
                        account_id: this.$store.state.account.accountId
                    }
                }
            ).then((res) => {
                console.log(tokenObj)
                console.log(res)
                this.tokenForDepositNearBalance = res / Math.pow(10, Number(tokenObj.decimals))
            })
        },
        openWithdrawModal: async function (deposit) {
            this.depositForWithdraw = deposit
            this.modalActive = true
            this.withdrawModalActive = true
        },
        closeWithdrawModal: async function () {
            this.modalActive = false
            this.withdrawModalActive = false
            this.depositForWithdraw = null
            this.close_deposit_amount = null
        },
        closeDepositModal: async function () {
            this.modalActive = false
            this.depositModalActive = false
            this.tokenForDeposit = null
            this.tokenForDepositNearBalance = null
        },
        swapDepositSource: function() {
            if (this.depositSource === 'outer') {
                // ...
                this.depositSource = 'inner'
            } else {
                // ...
                this.depositSource = 'outer'
            }
        },
        swapWithdrawTarget: function() {
            if (this.withdrawTarget === 'outer') {
                // ...
                this.withdrawTarget = 'inner'
            } else {
                // ...
                this.withdrawTarget = 'outer'
            }
        },
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
            const { utils } = nearAPI
            this.txPending = true
            const contract = this.$store.state.crispContract
            const wallet = await this.$store.state.selector.wallet()

            if (contract) {
                try {
                    let tokenObj
                    if (this.$store.state.tokens[this.create_deposit_asset]) {
                        tokenObj = this.$store.state.tokens[this.create_deposit_asset]
                    }
                    const amount = addDecimals(this.create_deposit_amount, tokenObj)

                    if (this.depositSource === 'inner') {
                        const args = { 
                            asset: this.create_deposit_asset,
                            amount: amount
                        }
                        await wallet.signAndSendTransactions({
                            transactions: [
                                {
                                    receiverId: CONTRACT_ID,
                                    actions: [
                                        {
                                            type: "FunctionCall",
                                            params: {
                                                methodName: "create_deposit",
                                                args: Buffer.from(JSON.stringify(args)),
                                                gas: 150000000000000
                                            }
                                        }
                                    ]
                                }
                            ]
                        }).then(data => {
                            this.txPending = false
                            console.log(data)
                            this.closeDepositModal()
                            this.$store.commit('pushNotification', {
                                title: 'Success',
                                type: 'success',
                                text: 'Create_deposit() is successful'
                            })
                            this.$store.dispatch('reload', store.state)
                        })
                    } else {
                        const wallet = await this.$store.state.selector.wallet()

                        const argsDeposit = { registration_only: true, account_id: CONTRACT_ID }
                        const argsTransfer = {
                            receiver_id: CONTRACT_ID,
                            amount: amount,
                            msg: ``
                        }
                        const argsCreateDeposit = {
                            asset: this.create_deposit_asset,
                            amount: amount
                        }

                        await wallet.signAndSendTransactions({
                            transactions: [
                                {
                                    receiverId: tokenObj.token,
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
                                },
                                {
                                    receiverId: CONTRACT_ID,
                                    actions: [
                                        {
                                            type: "FunctionCall",
                                            params: {
                                                methodName: "create_deposit",
                                                args: Buffer.from(JSON.stringify(argsCreateDeposit)),
                                                gas: 150000000000000
                                            }
                                        }
                                    ]
                                }
                            ]
                        }).then(data => {
                            this.txPending = false
                            console.log(data)
                            this.closeDepositModal()
                            this.$store.commit('pushNotification', {
                                title: 'Success',
                                type: 'success',
                                text: 'Create_deposit() is successful'
                            })
                            this.$store.dispatch('reload', store.state)
                        })
                    }
                }
                catch (err) {
                    this.txPending = false
                    console.log(err)
                    this.$store.commit('pushNotification', {
                        title: 'Error',
                        type: 'error',
                        text: err
                    })
                }
            }
        },
        close_deposit: async function (id) {
            console.log(id)
            this.txPending = true
            const contract = this.$store.state.crispContract
            const wallet = await this.$store.state.selector.wallet()

            if (contract) {
                try {
                    const args = {
                        deposit_id: Number(id)
                    }
                    await wallet.signAndSendTransactions({
                        transactions: [
                            {
                                receiverId: CONTRACT_ID,
                                actions: [
                                    {
                                        type: "FunctionCall",
                                        params: {
                                            methodName: "close_deposit",
                                            args: Buffer.from(JSON.stringify(args)),
                                            gas: 150000000000000
                                        }
                                    }
                                ]
                            }
                        ]
                    }).then(data => {
                        console.log(data)
                        this.$store.commit('pushNotification', {
                            title: 'Success',
                            type: 'success',
                            text: 'Deposit is withdrawn successfully'
                        })
                        this.$store.dispatch('reload', store.state)
                        this.txPending = false
                    })
                } catch (err) {
                    console.log(err)
                    this.$store.commit('pushNotification', {
                        title: 'Error',
                        type: 'error',
                        text: err
                    })
                    this.txPending = false
                }
            }
        },
        close_deposit_by_token: async function (deposit) {
            this.txPending = true
            // const { transactions } = nearAPI

            const tokenObj = this.$store.state.tokens[deposit.asset]

            console.log(deposit)

            const wallet = await this.$store.state.selector.wallet()
            const amount = this.close_deposit_amount * Math.pow(10, tokenObj.decimals)

            if (this.withdrawTarget === 'inner') {
                const args = {
                    asset: deposit.asset,
                    amount: Number(amount).toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 })
                }

                await wallet.signAndSendTransactions({
                    transactions: [
                        {
                            receiverId: CONTRACT_ID,
                            actions: [
                                {
                                    type: "FunctionCall",
                                    params: {
                                        methodName: "close_deposit",
                                        args: Buffer.from(JSON.stringify(args)),
                                        gas: 150000000000000
                                    }
                                }
                            ]
                        }
                    ]
                }).then(data => {
                    console.log(data)
                    this.$store.commit('pushNotification', {
                        title: 'Success',
                        type: 'success',
                        text: 'Deposit is withdrawn successfully'
                    })
                    this.$store.dispatch('reload', store.state)
                });
            } else {
                const argsCloseDeposit = {
                    asset: deposit.asset,
                    amount: Number(amount).toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 })
                }
                const argsWithdraw = {
                    token: deposit.asset,
                    amount: Number(amount).toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 })
                }

                await wallet.signAndSendTransactions({
                    transactions: [
                        {
                            receiverId: CONTRACT_ID,
                            actions: [
                                {
                                    type: "FunctionCall",
                                    params: {
                                        methodName: "close_deposit",
                                        args: Buffer.from(JSON.stringify(argsCloseDeposit)),
                                        gas: 150000000000000
                                    }
                                },
                                {
                                    type: "FunctionCall",
                                    params: {
                                        methodName: "withdraw",
                                        args: Buffer.from(JSON.stringify(argsWithdraw)),
                                        gas: 150000000000000
                                    }
                                }
                            ]
                        }
                    ]
                }).then(data => {
                    console.log(data)
                    this.$store.commit('pushNotification', {
                        title: 'Success',
                        type: 'success',
                        text: 'Deposit is withdrawn successfully'
                    })
                    this.$store.dispatch('reload', store.state)
                    this.txPending = false
                });
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

<style lang="scss" scoped>
@import "~@/assets/scss/main.scss";

.toggler-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    margin-top: 16px;
    margin-bottom: 24px;
}

.toggler {
    @extend %toggler;
    margin-left: 6px;
    margin-right: 6px;
}

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

.wrapper {
    width: ($interfaceBlocksWidth/2);
}

.table_wrapper {
    max-width: $interfaceBlocksWidth;
}

.token-table_wrapper {
    max-width: $interfaceBlocksWidth;
}

.table {
    border-radius: $borderRadius;
    background-color: $blockBgColor;
    padding: 8px 12px;
    margin-bottom: 40px;
}

.token-table {
    border-radius: $borderRadius;
    background-color: $elementBgColor;
    padding: 8px 12px;
    margin-bottom: 40px;
}

.token {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding-top: 4px;
    padding-bottom: 4px;
    background-color: $elementBgColor;
    opacity: 0.9;
    border-radius: 8px;
    margin-bottom: 4px;
    padding-left: 4px;
    cursor: pointer;
}

.token:hover {
    opacity: 1;
}

.token-unit {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.symbol {
    font-size: $textSize;
    margin-left: 8px;
}

.icon {
    width: 24px;
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
    @extend %default-block;
    width: $interfaceBlocksWidth;
    min-height: $defaultCardHeight;
    padding: 26px;
    overflow: auto;
    max-height: 95vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.modal-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    // border-bottom: $brightBorder;
    padding-bottom: 26px;
    padding-left: 18px;
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
    font-weight: 600;
}

.input-balance {
    font-size: $tinyTextSize;
    margin-top: 14px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-weight: 600;
}

.modal-footer {
    // border-top: $brightBorder;
    padding-top: 26px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    padding-left: 18px;
    padding-right: 18px;
}

.confirm-btn {
    border: 1px solid transparent;
    width: 200px;
    padding: 8px;
    border-radius: $borderRadius;
    background-color: #212121;
    color: #F5C352;
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

.input-inputbox {
    width: 80%;
    background-color: $elementBgColor;
    border: 0;
    border-radius: $borderRadius;
    height: 30px;
    font-size: $mediumTextSize;
    padding: 8px;
    outline: none;
}

.deposit {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    border-bottom: 1px solid black;
}
.deposit-unit {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin-right: 8px;
    margin-bottom: 4px;
    padding-top: 4px;
    font-size: $mediumTextSize;
    width: 46%;
}

.deposit-unit:first-child {
    width: 6%;
}

.deposit-unit:last-child {
    width: 12%;
}

.close-pos {
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

.close-pos:hover {
    background-color: $buttonTextColor;
    color: $buttonBgColor;
    transition: 0.3s;
    border: 1px solid $buttonBgColor;
}

.expand-pos {
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
    margin-left: 4px;
}

.expand-pos-reverse {
    transform: rotateZ(180deg);
}

.expand-pos-disabled {
    filter: grayscale(0.8);
}

.expand-pos:hover {
    background-color: $buttonTextColor;
    color: $buttonBgColor;
    transition: 0.3s;
    border: 1px solid $buttonBgColor;
}

.cell-loader-icon {
    width: $textSize;
    height: $textSize;
    margin-right: 24px;
}

@media screen and (max-width: 1050px) {
    .wrapper {
        width: auto;
        max-width: 85vw;
    }

    .token-table .heading {
        font-size: 18px;
    }
    
    .table_wrapper {
        max-width: none;
    }

    .icon {
        width: 16px;
    }

    .deposit-unit {
        font-size: 16px;
    }
}
</style>