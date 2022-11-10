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
                    Token
                </span>
                <span class="list-header_unit">
                    Amount
                </span>
            </div>
            <div class="list">
                <div class="pool" v-for="tokenObject in $store.state.tokenBalances" :key="tokenObject">
                    <span class="list-pool_unit">
                        {{tokenObject.token}}
                    </span>
                    <span class="list-pool_unit">
                        {{tokenObject.amount}}
                    </span>
                </div>
            </div>
        </template>
        <div class="modal">
            <div class="modal-header">
            <span class="modal-title">Deposit your token to Crisp</span>
            </div>
            <div class="modal-body">
            <div class="input-wrapper">
                <span class="input-title">Token</span>
                <input v-model="token" class="modal-body_row-input"/>
            </div>
            <div class="input-wrapper">
                <span class="input-title">Amount</span>
                <input v-model="amount" class="modal-body_row-input"/>
            </div>
            </div>
            <div class="modal-footer">
                <button @click="allow()" class="confirm-btn">Allow tokens</button>
                <button @click="deposit()" class="confirm-btn">Deposit</button>
            </div>
        </div>
        <div class="modal">
            <div class="modal-header">
                <span class="modal-title">Withdraw your token from Crisp</span>
            </div>
            <div class="modal-body">
                <div class="input-wrapper">
                    <span class="input-title">Token</span>
                    <input v-model="tokenW" class="modal-body_row-input"/>
                </div>
                <div class="input-wrapper">
                    <span class="input-title">Amount</span>
                    <input v-model="amountW" class="modal-body_row-input"/>
                </div>
            </div>
            <div class="modal-footer">
                <button @click="withdraw()" class="confirm-btn">Withdraw</button>
            </div>
        </div>
    </div>
</template>

<script>
// @ is an alias to /src
import { CONTRACT_ID } from '../constants/index.js'
import store from '../store'

export default {
  name: 'HomeView',
  store,
  data () {
    return {
      loading: true,

      /**
       * storage_deposit(), ft_transfer_call()
       */
      token: null, // e.g. 'usdt-ft.testnet'
      amount: null, // e.g. '1000000000000',

      /**
       * withdraw()
       */
      tokenW: null,
      amountW: null
    }
  },
  components: {
  },
  methods: {
    allow: async function () {
        if (this.$store.state.account) {
            await this.$store.state.walletConnection.account().functionCall({
                contractId: this.token,
                methodName: 'storage_deposit',
                args: {
                    account_id: CONTRACT_ID
                },
                attachedDeposit: '1000000000000000000000000'
            }).then(async (res) => {
                console.log(res)
            })
        }
    },
    deposit: async function () {
        if (this.$store.state.account) {
            await this.$store.state.walletConnection.account().functionCall({
                contractId: this.token,
                methodName: 'ft_transfer_call',
                args: {
                    receiver_id: CONTRACT_ID,
                    amount: this.amount,
                    msg: ''
                },
                gas: 1,
                // gas: DEFAULT_FUNCTION_CALL_GAS,
                attachedDeposit: this.amount
            }).then((res) => {
                console.log(res)
            })
        }
    },
    withdraw: async function () {
        if (this.$store.state.account) {
            const contract = this.$store.state.crispContract

            if (contract) {
                await contract.withdraw(
                    { 
                        token: this.tokenW,
                        amount: Number(this.amountW)
                    }
                ).then(data => {
                    console.log(data)
                })
            }
        }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/main.scss";
.modal {
    width: $interfaceBlocksWidth;
    background-color: $cardBgColor;
    min-height: $defaultCardHeight;
    border: $brightBorder;
    border-radius: $borderRadius;
    padding: 26px;
    margin-top: 32px;
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
    margin-left: 12px;
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
    padding: 16px;
    box-sizing: border-box;
}

.pool {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
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

.list-header_unit:first-child, .list-pool_unit:first-child {
    width: 30%;
}
</style>