<template>
    <div class="wrapper">
        <template v-if="$store.state.account">
            <div class="heading">
                <span class="title">Signed in as {{$store.state.account.accountId}}</span>
            </div>
        </template>
        <template v-if="$store.state.tokenBalances[0]">
            <div class="heading">
                <span class="title">Your balances</span>
            </div>
            <div class="list-header">
                <span class="list-header_unit">
                    #
                </span>
                <span class="list-header_unit">
                    Token
                </span>
                <span class="list-header_unit">
                    Amount
                </span>
                <span class="list-header_unit">
                    
                </span>
            </div>
            <div class="list">
                <div class="pool" v-for="tokenObject in $store.state.tokenBalances" :key="tokenObject">
                    <span class="list-pool_unit">
                        <img class="icon" :src="tokenObject.icon">
                    </span>
                    <span class="list-pool_unit">
                        <!--{{tokenObject.token}} -->{{tokenObject.symbol}}
                    </span>
                    <span v-if="tokenObject.amount !== 0" class="list-pool_unit">
                        {{ tokenObject.amount }}
                    </span>
                    <span v-else class="list-pool_unit">
                        {{ tokenObject.amount }}
                    </span>
                    <span class="list-pool_unit">
                        <button @click="setWithdraw(tokenObject)" class="withdraw-btn">
                            Withdraw
                        </button>
                    </span>
                </div>
            </div>
        </template>
        <template v-else-if="$store.state.tokensBeingLoaded">
            <div class="heading">
                <span class="title">Loading your balances . . .</span>
            </div>
        </template>
        <template v-else>
            <div class="heading">
                <span class="title">You have no tokens on your balance yet. You can deposit them below.</span>
            </div>
        </template>
        <div class="modal-wrapper">
            <div class="modal">
                <div class="modal-header">
                <span class="modal-title">Deposit your token to Crisp</span>
                </div>
                <div class="modal-body">
                <div class="input-wrapper">
                    <span class="input-title">Token</span>
                    <!--<input v-model="token" class="modal-body_row-input"/>-->
                    <select v-model="token" @change="getTokenWalletBalance()" class="modal-body_row-input">
                        <option value="usdc.fakes.testnet">
                            USDC
                        </option>
                        <option value="usdt.fakes.testnet">
                            USDT
                        </option>
                        <option value="wrap.testnet">
                            wNEAR
                        </option>
                    </select>
                </div>
                <div class="input-wrapper">
                    <span class="input-title">Amount</span>
                    <input v-model="amount" ref="depositInput" class="modal-body_row-input"/>
                    <span class="input-caption">{{walletAmount}}</span>
                </div>
                </div>
                <div class="modal-footer">
                    <img v-if="txPending" class="loader-icon" src="../assets/icons/loader.gif">
                    <!--<button v-if="!txPending" @click="allow()" class="confirm-btn">Allow tokens</button>-->
                    <button v-if="!txPending" @click="deposit()" class="confirm-btn">Deposit</button>
                </div>
            </div>
            <div class="modal">
                <div id="withdraw" class="modal-header">
                    <span class="modal-title">Withdraw your token from Crisp</span>
                </div>
                <div class="modal-body">
                    <div class="input-wrapper">
                        <span class="input-title">Token</span>
                        <input v-if="!$store.state.tokenBalances[0]" v-model="tokenW" class="modal-body_row-input"/>
                        <select v-else v-model="tokenW" class="modal-body_row-input">
                            <option :value="token.token" v-for="(token, index) in $store.state.tokenBalances" :key="index">
                                {{token.symbol}}
                            </option>
                        </select>
                    </div>
                    <div class="input-wrapper">
                        <span class="input-title">Amount</span>
                        <input ref="withdrawAmount" v-model="amountW" class="modal-body_row-input"/>
                    </div>
                </div>
                <div class="modal-footer">
                    <img v-if="txPending" class="loader-icon" src="../assets/icons/loader.gif">
                    <button v-else @click="withdraw()" class="confirm-btn">Withdraw</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// @ is an alias to /src
import { CONTRACT_ID } from '../constants/index.js'
import { toFixed } from '../utils/number'
import { addDecimals } from '@/utils/format'
import store from '../store'
import * as nearAPI from "near-api-js"

export default {
  name: 'HomeView',
  store,
  data () {
    return {
      loading: true,

    
      // ft_balance_of ()
      walletAmount: null,

      txPending: false,
      /**
       * storage_deposit(), ft_transfer_call()
       */
      token: null, // e.g. 'usdt-ft.testnet'
      amount: null, // e.g. '1000000000000',

      /**
       * withdraw()
       */
      tokenW: null,
      amountW: null,

      toFixed: toFixed,
      addDecimals: addDecimals
    }
  },
  mounted() {
    if(this.$store.getters.tokenForDeposit) {
        this.token = this.$store.getters.tokenForDeposit.token
        this.$refs.depositInput.focus()
        this.getTokenWalletBalance()
    }
  },
  methods: {
    getTokenWalletBalance: async function () {
        // if (this.$store.state.walletConnection.account())
        // this.txPending = true
        this.walletAmount = ''

        if (this.$store.state.tokenBalances && this.$store.state.tokenBalances[0]) {
            const balanceObj = this.$store.state.tokenBalances.find(item => item.token === this.token)
            if (balanceObj) {
                this.walletAmount = balanceObj.symbol + ' balance on NEAR wallet:  ' + balanceObj.nearBalance
            }
        }
        // try {
        //     await this.$store.state.walletConnection.account().viewFunction(
        //         {
        //             contractId: this.token,
        //             methodName: 'ft_balance_of',
        //             args: {
        //                 account_id: this.$store.state.account.accountId
        //             }
        //         }
        //     ).then(async (res) => {
        //         if (this.$store.state.tokens && !this.$store.state.tokens[this.token]) {
        //             await this.$store.state.walletConnection.account().viewFunction(
        //                 {
        //                     contractId: this.token,
        //                     methodName: 'ft_metadata',
        //                     args: {
        //                         account_id: this.$store.state.account.accountId
        //                     }
        //                 }
        //             ).then((res2) => {
        //                 console.log(res2)
        //                 this.walletAmount = res2.symbol + ' balance on NEAR wallet: ' + (res / Math.pow(10, res2.decimals)).toFixed(4)
        //                 this.txPending = false
        //             })
        //         } else {
        //             console.log(res)
        //             this.walletAmount = this.$store.state.tokens[this.token].symbol + ' balance on NEAR wallet: ' + (res / Math.pow(10, this.$store.state.tokens[this.token].decimals)).toFixed(4)
        //             this.txPending = false
        //         }
        //     })
        // } catch (error) {
        //     console.log(error)
        //     this.walletAmount = null
        //     this.txPending = false
        // }
    },
    deposit: async function () {
        if (this.$store.state.account) {
            const { utils, transactions } = nearAPI
            console.log(utils, transactions)
            this.txPending = true
            try {
                let tokenObj
                if (this.$store.state.tokens[this.token]) {
                    tokenObj = this.$store.state.tokens[this.token]
                }
                
                const argsDeposit = { registration_only: true, account_id: CONTRACT_ID }
                const argsTransfer = { receiver_id: CONTRACT_ID, amount: addDecimals(this.amount, tokenObj), msg: "" }

                const wallet = await this.$store.state.selector.wallet("near-wallet")

                // const allowedStorage = await this.$store.state.walletConnection.account().viewFunction(
                //         {
                //             contractId: this.token,
                //             methodName: 'storage_balance_of',
                //             args: {
                //                 account_id: this.$store.state.account.accountId
                //             }
                //         }
                // )

                await wallet.signAndSendTransactions({
                    transactions: [
                        {
                            receiverId: this.token,
                            actions: [
                                            {
                                                type: "FunctionCall",
                                                params: {
                                                    methodName: "storage_deposit",
                                                    args: Buffer.from(JSON.stringify(argsDeposit)),
                                                    gas: 150000000000000,
                                                    deposit: utils.format.parseNearAmount("1")
                                                }
                                            },
                                            {
                                                type: "FunctionCall",
                                                params: {
                                                    methodName: "ft_transfer_call",
                                                    args: Buffer.from(JSON.stringify(argsTransfer)),
                                                    gas: 150000000000000,
                                                    deposit: 1
                                                }
                                            }
                            ]
                        }
                    ]
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
    setWithdraw: async function (token) {
        document.getElementById('withdraw').scrollIntoView()
        this.tokenW = token.token
        this.$refs.withdrawAmount.focus()
    },
    withdraw: async function () {
        if (this.$store.state.account && this.$store.state.tokens && this.tokenW) {
            const contract = this.$store.state.crispContract

            if (contract) {
                this.txPending = true
                let tokenObj
                if (this.$store.state.tokens[this.tokenW]) {
                    tokenObj = this.$store.state.tokens[this.tokenW]
                }

                try {
                    await contract.withdraw(
                        { 
                            token: this.tokenW,
                            amount: addDecimals(this.amountW, tokenObj),
                        }
                    ).then(data => {
                        console.log(data)
                        this.$store.commit('pushNotification', {
                            title: 'Success',
                            type: 'success',
                            // text: response
                            text: 'Withdraw is successful'
                        })
                        this.txPending = false
                        this.$store.dispatch('reload', store.state)
                    })
                }
                catch (error) {
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

.modal-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: $interfaceBlocksWidth;
    margin-top: 32px;
    box-sizing: border-box;
    margin-bottom: 32px;
}

.modal {
    width: ($interfaceBlocksWidth/2) - 32px;
    background-color: $cardBgColor;
    min-height: $defaultCardHeight;
    border: $brightBorder;
    border-radius: $borderRadius;
    box-sizing: border-box;
    padding: 26px;
}

.modal:first-child {
    margin-right: 16px;
}

.modal:last-child {
    margin-left: 16px;
}

.modal-header {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-bottom: $brightBorder;
    padding-bottom: 26px;
}

.modal-title {
    font-size: $textSize;
}

.modal-body {
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-bottom: 70px;
    margin-top: 48px;
}

.modal-body_row-input {
    border: $border;
    background: none;
    font-size: $lesserTextSize;
    border-radius: $borderRadius;
    padding: 4px;
    margin-left: 16px;
    margin-right: 16px;
    transition: 0.3s;
    width: 140px;
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

.input-caption {
    margin-top: 2px;
    font-size: $tinyTextSize - 2px;
    text-align: center;
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
    margin-left: 12px;
}

.confirm-btn:first-child {
    margin: 0;
}

.confirm-btn:hover {
    background-color: $buttonTextColor;
    color: $buttonBgColor;
    transition: 0.3s;
    border: 1px solid $buttonBgColor;
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
    justify-content: flex-start;
    align-items: center;
    padding: 16px;
}

.pool:hover {
    background-color: $cardHoverBgColor;
    border-radius: $borderRadius;
}

.title {
    color: $textColor;
    font-size: $greaterTextSize;
}

.list-header {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    padding: 16px;
    box-sizing: border-box;
}

.list-header_unit, .list-pool_unit {
    width: 30%;
    font-size: $tinyTextSize;
}

.icon {
    width: ($tinyTextSize*2);
}

.list-header_unit:first-child, .list-pool_unit:first-child {
    width: 12%;
}

.list-header_unit:first-child {
    padding-left: 6px;
    box-sizing: border-box;
}

.withdraw-btn {
    border: 1px solid transparent;
    padding: 8px;
    border-radius: $borderRadius;
    background-color: $buttonBgColor;
    color: $buttonTextColor;
    font-size: $tinyTextSize;
    cursor: pointer;
    transition: 0.3s;
}
</style>