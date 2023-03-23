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
                                <input type="text" v-model.lazy="t0_liq" @keypress="isNumber" @change="calculateDefault()" ref="t0_liq" id="t0_liq" class="modal-body_row-input" :disabled="upperSmallerThanCurrent"/>
                                <span class="input-balance" v-if="t0_balance">{{$store.state.tokens[$store.state.pools[poolId].token0].symbol}} balance: {{t0_balance.toFixed(4)}}</span>
                                <button v-else-if="t0_balance === 0" @click="depositToken($store.state.tokens[$store.state.pools[poolId].token0])" class="deposit_nav_btn">Deposit {{$store.state.tokens[$store.state.pools[poolId].token0].symbol}}</button>
                            </div>
                            <div class="input-wrapper">
                                <span v-if="poolId !== null && tokensLoaded" class="input-title"><img class="small-icon" :src="$store.state.tokens[$store.state.pools[poolId].token1].icon"/><span>{{$store.state.tokens[$store.state.pools[poolId].token1].symbol}} liquidity</span></span>
                                <span v-else class="input-title">Token 1 liquidity</span>
                                <input type="text" v-model.lazy="t1_liq" @keypress="isNumber" @change="calculateAlternative()" ref="t1_liq" id="t1_liq" class="modal-body_row-input" :disabled="lowerGreaterThanCurrent" />
                                <span class="input-balance" v-if="t1_balance">{{$store.state.tokens[$store.state.pools[poolId].token1].symbol}} balance: {{t1_balance.toFixed(4)}}</span>
                                <button v-else-if="t1_balance === 0" @click="depositToken($store.state.tokens[$store.state.pools[poolId].token1])" class="deposit_nav_btn">Deposit {{$store.state.tokens[$store.state.pools[poolId].token1].symbol}}</button>
                            </div>
                        </template>
                        <span v-else>Please wait while we load pools. . .</span>
                    </div>
                    <div class="modal-body_row" v-if="graphSeries[0].data[0]">
                        <apexcharts style="max-width: 380px" type="area" width="380" :series="graphSeries" :options="defaultOptions"></apexcharts>
                    </div>
                    <div class="modal-body_row-placeholder" v-else>

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
            <div v-if="borrowModalActive" class="modal">
                <div class="modal-header">
                    <span class="modal-title">Supply your position as collateral</span>
                    <img @click="closeBorrowModal()" class="x-icon" src="../assets/icons/x.svg"/>
                </div>
                <div class="modal-body">
                    <div class="modal-body_row">
                        <div class="input-wrapper">
                            <span class="input-title"><span>Leverage</span></span>
                            <div class="input-wrapper-element">
                                <div class="input-wrapper-row">
                                    <input type="checkbox" class="leverage-checkbox" v-model="useLeverageInBorrow">
                                    <input @change="calculateBorrowAmount" class="block-rangeinput" :disabled="useLeverageInBorrow === false" v-model="leverageAmount" type="range" min="1.2" max="5" step="0.1">
                                </div>
                                <div v-if="useLeverageInBorrow" class="input-wrapper-row">
                                    Selected leverage amount: {{ leverageAmount }}
                                </div>
                            </div>
                        </div>
                        <div class="input-wrapper">
                            <span class="input-title">Expected borrow amount</span>
                            <span class="input-balance">{{ expectedBorrowAmount }}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <img v-if="txPending" class="loader-icon" src="../assets/icons/loader.gif">
                    <button v-else @click="confirmBorrowModal()" class="confirm-btn">Confirm</button>
                </div>
            </div>
            <div v-if="deletePositionModalActive" class="modal">
                <div class="modal-header">
                    <div></div>
                    <span class="modal-title">Confirm action</span>
                    <img @click="closeDeletePositionModal()" class="x-icon" src="../assets/icons/x.svg"/>
                </div>
                <div class="modal-body modal-body-deletepos">
                    Are you sure you want to close your position in pool 
                    {{$store.state.tokens[positionChosenForClosing.token0].symbol}} - {{$store.state.tokens[positionChosenForClosing.token1].symbol}}?
                </div>
                <div class="modal-footer">
                    <img v-if="txPending" class="loader-icon" src="../assets/icons/loader.gif">
                    <button v-if="!txPending" @click="closeDeletePositionModal()" class="confirm-btn">No</button>
                    <button v-if="!txPending" @click="closePosition(this.positionChosenForClosing)" class="confirm-btn confirm-btn-deletepos">Yes</button>
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
                <!--<div v-if="$store.state.userPositions[0]" class="list-header">
                    <span class="pos-list-header_unit" style="width: 7%">
                        # Pool
                    </span>
                    <span class="pos-list-header_unit" style="width: 7%">
                        # Pos
                    </span>
                    <span class="pos-list-header_unit" style="width: 7%">
                        Active
                    </span>
                    <span class="pos-list-header_unit" style="width: 14%">
                        Pool tokens
                    </span>
                    <span class="pos-list-header_unit">
                        Pool price
                    </span>
                    <span class="pos-list-header_unit">
                        L. bound price
                    </span>
                    <span class="pos-list-header_unit">
                        U. bound price
                    </span>
                    <span class="pos-list-header_unit">
                        T0 Liquidity
                    </span>
                    <span class="pos-list-header_unit">
                        T1 Liquidity
                    </span>
                    <span class="pos-list-header_unit close-header-unit">
                        Close
                    </span>
                </div>
                -->
                <template v-if="$store.state.userPositions[0]">
                    <div v-for="pos in $store.state.userPositions" :key="pos.id" class="pos-table_wrapper">
                        <div class="pos-table">
                            <div class="pos-table_header">
                                <div class="pos-table_header-cell">
                                    <div class="header-cell-unit">
                                        <template v-if="pos.isActive"><img src="../assets/icons/isActive/active.svg"><span class="status-caption status-caption-active">In range</span></template>
                                        <template v-else><img src="../assets/icons/isActive/error.svg"><span class="status-caption status-caption-error">Out of range</span></template>
                                    </div>
                                    <div class="header-cell-unit">
                                        <button @click="openBorrowModal(pos)" class="block-RA-suggestion">Borrow</button>
                                    </div>
                                </div>
                                <div class="pos-table_header-cell">
                                    Liquidity
                                </div>
                                <div class="pos-table_header-cell">
                                    Rewards
                                </div>
                                <div class="pos-table_header-cell">
                                    <img v-if="txPending" class="cell-loader-icon" src="../assets/icons/loader.gif">
                                    <button v-else @click="closePositionPrompt(pos)" class="close-pos">
                                        X
                                    </button>
                                </div>
                            </div>
                            <div class="pos-table_data">
                                <div class="pos-table_data-cell">
                                    <div v-if="$store.state.tokens" class="pos-table-tokens">
                                        <img class="cell-icon" :src="$store.state.tokens[pos.token0].icon">
                                        <img class="cell-icon" :src="$store.state.tokens[pos.token1].icon">
                                        <div>
                                            {{$store.state.tokens[pos.token0].symbol}} - {{$store.state.tokens[pos.token1].symbol}}
                                        </div>
                                    </div>
                                    <div v-else class="pos-table-tokens">
                                        {{pos.token0}} - {{pos.token1}}
                                    </div>
                                    <div class="pos-table-poolprice">
                                        <span>POOL PRICE</span>
                                        <span>{{($store.state.pools[pos.poolId].sqrt_price * $store.state.pools[pos.poolId].sqrt_price * Math.pow(10, $store.state.tokens[pos.token0].decimals - $store.state.tokens[pos.token1].decimals)).toFixed(2)}}</span>
                                    </div>
                                    <div class="pos-table-range">
                                        <span>({{(pos.lower_bound_price_decimals).toFixed(2)}} - </span>
                                        <span>{{(pos.upper_bound_price_decimals).toFixed(2)}})</span>
                                    </div>
                                </div>
                                <div class="pos-table_data-cell stacked">
                                    <div class="pos-table_data-cell_row">
                                        <div class="token_index">
                                            <img class="token_index_icon" :src="$store.state.tokens[pos.token0].icon">
                                            <span class="token_index_title">{{$store.state.tokens[pos.token0].symbol}}</span>
                                        </div>
                                        <span class="token_value">
                                            {{(pos.token0_real_liquidity).toFixed(6)}}
                                        </span>
                                    </div>
                                    <div class="pos-table_data-cell_row">
                                        <div class="token_index">
                                            <img class="token_index_icon" :src="$store.state.tokens[pos.token1].icon">
                                            <span class="token_index_title">{{$store.state.tokens[pos.token1].symbol}}</span>
                                        </div>
                                        <span class="token_value">
                                            {{(pos.token1_real_liquidity).toFixed(6)}}
                                        </span>
                                    </div>
                                </div>
                                <div class="pos-table_data-cell stacked">
                                    <div class="pos-table_data-cell_row">
                                        <div class="token_index">
                                            <img class="token_index_icon" :src="$store.state.tokens[pos.token0].icon">
                                            <span class="token_index_title">{{$store.state.tokens[pos.token0].symbol}}</span>
                                        </div>
                                        <span class="token_value">
                                            {{(pos.fees0).toFixed(6)}}
                                        </span>
                                    </div>
                                    <div class="pos-table_data-cell_row">
                                        <div class="token_index">
                                            <img class="token_index_icon" :src="$store.state.tokens[pos.token1].icon">
                                            <span class="token_index_title">{{$store.state.tokens[pos.token1].symbol}}</span>
                                        </div>
                                        <span class="token_value">
                                            {{(pos.fees1).toFixed(6)}}
                                        </span>
                                    </div>
                                </div>
                                <div class="pos-table_data-cell">
                                    <img @click="expandPos(pos)" src="../assets/icons/expand.svg">
                                </div>
                            </div>
                        </div>
                        <div v-if="pos.expanded" class="pos-table pos-table-expanded">
                            <template v-if="tokensLoaded">
                                <!--<img v-if="txPending" class="loader-icon" src="../assets/icons/loader.gif">
                                <button v-else @click="editAddLiq(pos)" class="edit-btn">
                                    Add liquidity
                                </button>
                                <div class="input-wrapper">
                                    <span class="input-title"><img class="small-icon" :src="$store.state.tokens[$store.state.pools[pos.poolId].token0].icon"/><span>{{$store.state.tokens[$store.state.pools[pos.poolId].token0].symbol}} liquidity</span></span>
                                    <input type="text" v-model.lazy="edit_t0_liq" @keypress="isNumber" @change="calcEditDefault(pos)" id="t0_liq" class="modal-body_row-input" :disabled="upperSmallerThanCurrent"/>
                                    <span v-if="t0_balance">{{$store.state.tokens[$store.state.pools[pos.poolId].token0].symbol}} balance: {{t0_balance.toFixed(4)}}</span>
                                </div>
                                <div class="input-wrapper">
                                    <span class="input-title"><img class="small-icon" :src="$store.state.tokens[$store.state.pools[pos.poolId].token1].icon"/><span>{{$store.state.tokens[$store.state.pools[pos.poolId].token1].symbol}} liquidity</span></span>
                                    <input type="text" v-model.lazy="edit_t1_liq" @keypress="isNumber" @change="calcEditAlternative(pos)" id="t1_liq" class="modal-body_row-input" :disabled="lowerGreaterThanCurrent" />
                                    <span v-if="t1_balance">{{$store.state.tokens[$store.state.pools[pos.poolId].token1].symbol}} balance: {{t1_balance.toFixed(4)}}</span>
                                </div>
                                <img v-if="txPending" class="loader-icon" src="../assets/icons/loader.gif">
                                <button v-else @click="editRemoveLiq(pos)" class="edit-btn">
                                    Remove liquidity
                                </button>-->

                                <div class="table-section" @click="pos.activeTab === 'out' ? toggleTab(pos) : 0">
                                    <div class="section-top" v-bind:class="{blurred: pos.activeTab === 'out'}">
                                        <div class="table-header">
                                            <span class="table-heading">Add liquidity</span>
                                        </div>
                                        <div class="section-block-wrapper">
                                            <span class="section-block-title">
                                                Current liquidity
                                            </span>
                                            <div class="section-block">
                                                <div class="block-row">
                                                    <div class="block-row-left">
                                                        <img class="small-icon" :src="$store.state.tokens[$store.state.pools[pos.poolId].token0].icon">
                                                        <span class="block-row_symbol">{{$store.state.tokens[$store.state.pools[pos.poolId].token0].symbol}}</span>
                                                    </div>
                                                    <div class="block-row-right">
                                                        <span class="block-row_liquidity">{{(pos.token0_real_liquidity).toFixed(6)}}</span>
                                                    </div>
                                                </div>
                                                <div class="block-row">
                                                    <div class="block-row-left">
                                                        <img class="small-icon" :src="$store.state.tokens[$store.state.pools[pos.poolId].token1].icon">
                                                        <span class="block-row_symbol">{{$store.state.tokens[$store.state.pools[pos.poolId].token1].symbol}}</span>
                                                    </div>
                                                    <div class="block-row-right">
                                                        <span class="block-row_liquidity">{{(pos.token1_real_liquidity).toFixed(6)}}</span>
                                                    </div>
                                                </div>
                                                <div class="block-row">
                                                    <div class="block-row-left">
                                                        <span class="block-row_fee-title">Fee tier</span>
                                                    </div>
                                                    <div class="block-row-right">
                                                        <span class="block-row_fee-amount">{{$store.state.pools[pos.poolId].protocol_fee}} %</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="section-block-wrapper">
                                            <div class="section-block-title">
                                                Add more liquidity
                                            </div>
                                            <div class="section-block">
                                                <div class="block-row">
                                                    <div class="block-row-left">
                                                        <input :ref="'edit_t0' + pos.id" id="edit_t0" type="text" v-model.lazy="edit_t0_liq" @keypress="isNumber" @change="calcEditDefault(pos)" class="block-input" :disabled="upperSmallerThanCurrent"/>
                                                    </div>
                                                    <div class="block-row-right">
                                                        <div class="block-row_token-wrapper">
                                                            <img class="big-icon" :src="$store.state.tokens[$store.state.pools[pos.poolId].token0].icon">
                                                            <span class="big-symbol">{{$store.state.tokens[$store.state.pools[pos.poolId].token0].symbol}}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="block-row">
                                                    <div class="block-row-left">
                                                        <!-- TODO: liquidity in $USD -->
                                                    </div>
                                                    <div class="block-row-right">
                                                        <div class="row-balance">
                                                            Balance: {{this.$store.state.tokenBalances.find(item => item.token === this.$store.state.pools[pos.poolId].token0).amount.toFixed(4)}}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="section-block">
                                                <div class="block-row">
                                                    <div class="block-row-left">
                                                        <input :ref="'edit_t1' + pos.id" id="edit_t1" type="text" v-model.lazy="edit_t1_liq" @keypress="isNumber" @change="calcEditAlternative(pos)" class="block-input" :disabled="lowerGreaterThanCurrent"/>
                                                    </div>
                                                    <div class="block-row-right">
                                                        <div class="block-row_token-wrapper">
                                                            <img class="big-icon" :src="$store.state.tokens[$store.state.pools[pos.poolId].token1].icon">
                                                            <span class="big-symbol">{{$store.state.tokens[$store.state.pools[pos.poolId].token1].symbol}}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="block-row">
                                                    <div class="block-row-left">
                                                        <!-- TODO: liquidity in $USD -->
                                                    </div>
                                                    <div class="block-row-right">
                                                        <div class="row-balance">
                                                            Balance: {{this.$store.state.tokenBalances.find(item => item.token === this.$store.state.pools[pos.poolId].token1).amount.toFixed(4)}}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="section-bottom">
                                        <span v-if="editAddLiqErrorMsg" class="error-msg">{{ editAddLiqErrorMsg }}</span>
                                        <span v-else class="error-msg-disabled"></span>
                                        <img v-if="txPending" class="loader-icon" src="../assets/icons/loader.gif">
                                        <button v-else-if="pos.activeTab === 'in'" @click="editAddLiq(pos)" class="edit-btn">
                                            Confirm
                                        </button>
                                        <button v-else @click="toggleTab(pos)" class="edit-btn">
                                            Add liquidity
                                        </button>
                                    </div>
                                </div>
                                <div class="table-section" @click="pos.activeTab === 'in' ? toggleTab(pos) : 0">
                                    <div class="section-top" v-bind:class="{blurred: pos.activeTab === 'in'}">
                                        <div class="table-header">
                                            <span class="table-heading">Remove liquidity</span>
                                        </div>
                                        <div class="section-block-wrapper">
                                            <span class="section-block-title">
                                                Amount to remove
                                            </span>
                                            <div class="section-block">
                                                <div class="block-row">
                                                    <div class="block-row-left">
                                                        <span class="remove-amount">
                                                            {{removeAmount}} %
                                                        </span>
                                                    </div>
                                                    <div class="block-row-right">
                                                        <button @click="setRemoveAmount(pos, 25)" class="block-RA-suggestion">25%</button>
                                                        <button @click="setRemoveAmount(pos, 50)" class="block-RA-suggestion">50%</button>
                                                        <button @click="setRemoveAmount(pos, 75)" class="block-RA-suggestion">75%</button>
                                                        <button @click="setRemoveAmount(pos, 100)" class="block-RA-suggestion">Max</button>
                                                    </div>
                                                </div>
                                                <div class="block-row">
                                                    <div class="block-row-left" style="padding-left: 8px;">
                                                        <img class="small-icon" :src="$store.state.tokens[$store.state.pools[pos.poolId].token0].icon">
                                                        <span class="block-row_symbol">{{$store.state.tokens[$store.state.pools[pos.poolId].token0].symbol}}</span>
                                                    </div>
                                                    <div class="block-row-right">
                                                        <span class="block-row_liquidity">{{(pos.desiredLiquidity0ForRemoval).toFixed(6)}}</span>
                                                    </div>
                                                </div>
                                                <div class="block-row">
                                                    <div class="block-row-left" style="padding-left: 8px;">
                                                        <img class="small-icon" :src="$store.state.tokens[$store.state.pools[pos.poolId].token1].icon">
                                                        <span class="block-row_symbol">{{$store.state.tokens[$store.state.pools[pos.poolId].token1].symbol}}</span>
                                                    </div>
                                                    <div class="block-row-right">
                                                        <span class="block-row_liquidity">{{(pos.desiredLiquidity1ForRemoval).toFixed(6)}}</span>
                                                    </div>
                                                </div>
                                                <div class="block-row" style="display: flex;flex-direction: row;justify-content: flex-end;">
                                                    <input class="block-rangeinput" v-model="removeAmount" @change="changeRemoveAmount(pos)" type="range" min="0.01" max="100" step="0.01">
                                                </div>
                                            </div>
                                            <div class="section-block">
                                                <div class="block-row">
                                                    <div class="block-row-left">
                                                        Pooled {{$store.state.tokens[$store.state.pools[pos.poolId].token0].symbol}}:
                                                    </div>
                                                    <div class="block-row-right">
                                                        <span class="block-parameter">{{(pos.token0_real_liquidity).toFixed(6)}}</span><img class="small-icon" :src="$store.state.tokens[$store.state.pools[pos.poolId].token0].icon">
                                                    </div>
                                                </div>
                                                <div class="block-row">
                                                    <div class="block-row-left">
                                                        Pooled {{$store.state.tokens[$store.state.pools[pos.poolId].token1].symbol}}:
                                                    </div>
                                                    <div class="block-row-right">
                                                        <span class="block-parameter">{{(pos.token1_real_liquidity).toFixed(6)}}</span><img class="small-icon" :src="$store.state.tokens[$store.state.pools[pos.poolId].token1].icon">
                                                    </div>
                                                </div>
                                                <div class="block-row" style="margin-top: 32px;">
                                                    <div class="block-row-left">
                                                        {{$store.state.tokens[$store.state.pools[pos.poolId].token0].symbol}} Fees Earned:
                                                    </div>
                                                    <div class="block-row-right">
                                                        <span class="block-parameter">{{(pos.fees0).toFixed(6)}}</span><img class="small-icon" :src="$store.state.tokens[$store.state.pools[pos.poolId].token0].icon">
                                                    </div>
                                                </div>
                                                <div class="block-row">
                                                    <div class="block-row-left">
                                                        {{$store.state.tokens[$store.state.pools[pos.poolId].token1].symbol}} Fees Earned:
                                                    </div>
                                                    <div class="block-row-right">
                                                        <span class="block-parameter">{{(pos.fees1).toFixed(6)}}</span><img class="small-icon" :src="$store.state.tokens[$store.state.pools[pos.poolId].token1].icon">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="section-bottom">
                                        <span class="error-msg-disabled"></span>
                                        <img v-if="txPending" class="loader-icon" src="../assets/icons/loader.gif">
                                        <button v-else-if="pos.activeTab === 'out'" @click="editRemoveLiq(pos)" class="edit-btn">
                                            Confirm
                                        </button>
                                        <button v-else @click="toggleTab(pos)" class="edit-btn">
                                            Remove liquidity
                                        </button>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </template>
                <!--<div v-if="$store.state.userPositions[0]" class="list">
                    <div class="pool" v-for="pos in $store.state.userPositions" :key="pos.id">
                        <span class="pos-list-pool_unit" style="width: 7%">
                            {{pos.poolId}}
                        </span>
                        <span class="pos-list-pool_unit" style="width: 7%">
                            {{pos.id}}
                        </span>
                        <span class="pos-list-pool_unit" style="width: 7%">
                            <template v-if="pos.isActive">Yes</template>
                            <template v-else>No</template>
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
                </div>-->
            </template>

            <div v-if="$store.state.pools && $store.state.tokens" class="heading pools-heading">
                <span class="title">Pools</span><!--<button @click="openNewPoolModal()" class="new-pool-btn">+ New pool</button>-->
            </div>

            <!-- Pools, mobile -->
            <template v-if="$store.state.pools && $store.state.tokens">
                <div v-if="$store.state.pools[0]" class="mob-pools-wrapper">
                    <div v-for="(pool, index) in $store.state.pools" :key="index" class="mob-pool">
                        <div class="mob-pool_header">
                            <div class="pool_data-wrapper">
                                <div class="pool_data-wrapper_heading">
                                    Icon
                                </div>
                                <div v-if="$store.state.tokens" class="pool_data-wrapper_value">
                                    <img class="pool-tokenicon" :src="$store.state.tokens[pool.token0].icon"/>
                                    <img class="pool-tokenicon" :src="$store.state.tokens[pool.token1].icon"/>
                                </div>
                                <div v-else class="pool_data-wrapper_value">
                            
                                </div>
                            </div>
                            <div class="pool_data-wrapper">
                                <div class="pool_data-wrapper_heading">
                                    Token pair
                                </div>
                                <div class="pool_data-wrapper_value column">
                                    <span>{{ $store.state.tokens[pool.token0].symbol }}</span>
                                    <span>{{ $store.state.tokens[pool.token1].symbol }}</span>
                                </div>
                            </div>
                            <div>

                            </div>
                        </div>
                        <div class="mob-pool_body">
                            <div class="pool_data-wrapper">
                                <div class="pool_data-wrapper_heading">
                                    Liquidity
                                </div>
                                <div class="pool_data-wrapper_value">
                                    {{ pool.liquidity }}
                                </div>
                            </div>
                        </div>
                        <div class="mob-pool_footer">
                            <div class="pool_data-wrapper">
                                <div class="pool_data-wrapper_heading">
                                    Protocol fee
                                </div>
                                <div class="pool_data-wrapper_value">
                                    {{ pool.protocol_fee / 100 }}%
                                </div>
                            </div>
                            <div class="pool_data-wrapper">
                                <div class="pool_data-wrapper_heading">
                                    Rewards
                                </div>
                                <div class="pool_data-wrapper_value">
                                    {{ pool.rewards / 100 }}%
                                </div>
                            </div>
                            <div class="pool_data-wrapper">
                                <div class="pool_data-wrapper_heading">
                                    Price
                                </div>
                                <div class="pool_data-wrapper_value">
                                    {{(pool.sqrt_price * pool.sqrt_price * Math.pow(10, $store.state.tokens[pool.token0].decimals - $store.state.tokens[pool.token1].decimals)).toFixed(2)}}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Pools, desktop -->
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
                <div class="heading allposheading">
                    <span class="title">All Positions</span>
                </div>

                <!-- All positions, mobile -->

                <div v-if="$store.state.positions[0]" class="mob-pos-wrapper">
                    <div v-for="pos in $store.state.positions" :key="pos.id" class="mob-pos">
                        <div class="mob-pos_row">
                            <div class="mob-pos_parameter">
                                Pool tokens
                            </div>
                            <div class="mob-pos_value">
                                <img class="icon" :src="$store.state.tokens[pos.token0].icon">
                                <img class="icon" :src="$store.state.tokens[pos.token1].icon">
                                <div>
                                    {{$store.state.tokens[pos.token0].symbol}}<br>
                                    {{$store.state.tokens[pos.token1].symbol}}
                                </div>
                            </div>
                        </div>
                        <div class="mob-pos_row">
                            <div class="mob-pos_parameter">
                                # Pool 
                            </div>
                            <div class="mob-pos_value">
                                {{pos.poolId}}
                            </div>
                        </div>
                        <div class="mob-pos_row">
                            <div class="mob-pos_parameter">
                                # Pos 
                            </div>
                            <div class="mob-pos_value">
                                {{pos.id}}
                            </div>
                        </div>
                        <div class="mob-pos_row">
                            <div class="mob-pos_parameter">
                                L. bound price 
                            </div>
                            <div class="mob-pos_value">
                                {{(pos.lower_bound_price_decimals).toFixed(2)}}
                            </div>
                        </div>
                        <div class="mob-pos_row">
                            <div class="mob-pos_parameter">
                                U. bound price 
                            </div>
                            <div class="mob-pos_value">
                                {{(pos.upper_bound_price_decimals).toFixed(2)}}
                            </div>
                        </div>
                        <div class="mob-pos_row">
                            <div class="mob-pos_parameter">
                                T0 Liquidity
                            </div>
                            <div class="mob-pos_value">
                                {{(pos.token0_real_liquidity).toFixed(6)}}
                            </div>
                        </div>
                        <div class="mob-pos_row">
                            <div class="mob-pos_parameter">
                                T1 Liquidity
                            </div>
                            <div class="mob-pos_value">
                                {{(pos.token1_real_liquidity).toFixed(6)}}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- All positions, desktop -->

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
                        T0 Liquidity
                    </span>
                    <span class="pos-list-header_unit">
                        T1 Liquidity
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
import apexcharts from "vue3-apexcharts"
import {
    defaultOptions
} from '../constants/charts'

export default {
    name: 'LiquidityView',
    store,
    components: {
        apexcharts
    },
    data () {
        return {
            /**
             * modal state handling
             */
            modalActive: false,
            newPoolModalActive: false,
            newPositionModalActive: false,
            deletePositionModalActive: false,
            borrowModalActive: false,
            
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

            edit_t0_liq: null,
            edit_t1_liq: null,
            editAddLiqErrorMsg: '',

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

            removeAmount: 20,

            positionChosenForClosing: null,

            defaultOptions: defaultOptions,
            graphSeries: [{
                name: 'graphSeries',
                data: []
            }],
            loading: false,

            useLeverageInBorrow: false,
            expectedBorrowAmount: null,
            leverageAmount: 2
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
        depositToken (token) {
            console.log(token)
            this.$store.dispatch('depositToken', token)
        },
        openNewPoolModal: function () {
            this.modalActive = true
            this.newPoolModalActive = true
        },
        closeNewPoolModal: function () {
            this.modalActive = false
            this.newPoolModalActive = false
        },
        changeRemoveAmount: function (pos) {
            const currentT0liquidity = pos.token0_real_liquidity
            const currentT1liquidity = pos.token1_real_liquidity

            pos.desiredLiquidity0ForRemoval = currentT0liquidity / 100 * this.removeAmount
            pos.desiredLiquidity1ForRemoval = currentT1liquidity / 100 * this.removeAmount
            // console.log(this.removeAmount)
        },
        setRemoveAmount: function (pos, val) {
            this.removeAmount = val
            this.changeRemoveAmount(pos)
        },
        toggleTab: function (pos) {
            this.editAddLiqErrorMsg = ''
            if (pos.activeTab === 'in') {
                pos.activeTab = 'out'
            } else if (pos.activeTab === 'out') {
                pos.activeTab = 'in'
            }
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
        openBorrowModal: function (pos) {
            this.modalActive = true
            this.borrowModalActive = true
            this.positionToBorrow = pos
            console.log(this.positionToBorrow)
            this.calculateBorrowAmount()
        },
        closeBorrowModal: function () {
            this.modalActive = false
            this.expectedBorrowAmount = null
            this.useLeverageInBorrow = false
            this.leverageAmount = 2
            this.borrowModalActive = false
        },
        calculateBorrowAmount: function () {
            const pos = this.positionToBorrow
            const p = (this.$store.state.pools[pos.poolId].sqrt_price * this.$store.state.pools[pos.poolId].sqrt_price * Math.pow(10, this.$store.state.tokens[pos.token0].decimals - this.$store.state.tokens[pos.token1].decimals)).toFixed(2)
            const x = Number(pos.token0_real_liquidity)
            const y = Number(pos.token1_real_liquidity)
            console.log(p)
            console.log(x)
            console.log(y)
            const res = p * x + y
            console.log(res)
            console.log(res / Math.pow(10, this.$store.state.tokens[pos.token0].decimals - this.$store.state.tokens[pos.token1].decimals))
            this.expectedBorrowAmount = res
        },
        confirmBorrowModal: async function () {
            if (this.useLeverageInBorrow === false) {
                const contract = this.$store.state.crispContract

                if (contract) {
                    try {
                        await contract.supply_collateral_and_borrow_simple(
                            { 
                                pool_id: Number(this.positionToBorrow.poolId),
                                position_id: Number(this.positionToBorrow.id)
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
            } else {
                const contract = this.$store.state.crispContract

                if (contract) {
                    try {
                        await contract.supply_collateral_and_borrow_leveraged(
                                { 
                                    pool_id: Number(this.positionToBorrow.poolId),
                                    position_id: Number(this.positionToBorrow.id),
                                    leverage: Number(this.leverageAmount)
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
            }
        },
        drawAnnotations: function (lp, up, cp) {
            console.log(lp, up, cp)
            this.defaultOptions = {
                ...this.defaultOptions,
                annotations: {
                    position: 'front',
                    xaxis: [
                        {
                            x: lp,
                            x2: up,
                            borderColor: '#E4AB47',
                            fillColor: '#F6E3C4',
                            opacity: 0.6
                        },
                        {
                            x: lp,
                            label: {
                                style: {
                                color: '#eca200',
                                },
                                text: 'Lower bound price'
                            }
                        },
                        {
                            x: up,
                            label: {
                                style: {
                                color: '#eca200',
                                },
                                text: 'Upper bound price',
                            }
                        },
                        {
                            x: cp,
                            strokeDashArray: 3,
                            borderColor: '#c2c2c2'
                        },
                    ]
                }
            }
        },
        calculateInit: function () {
            const tokenObj = this.$store.state.tokens[this.$store.state.pools[this.poolId].token0]
            const tokenObj2 = this.$store.state.tokens[this.$store.state.pools[this.poolId].token1]

            const sp = this.$store.state.pools[this.poolId].sqrt_price * this.$store.state.pools[this.poolId].sqrt_price * Math.pow(10, tokenObj.decimals - tokenObj2.decimals)

            const lp = sp * 0.9
            const up = sp * 1.1

            this.lowerPrice = lp
            this.upperPrice = up
            this.currentPrice = this.$store.state.pools[this.poolId].sqrt_price * this.$store.state.pools[this.poolId].sqrt_price * Math.pow(10, tokenObj.decimals - tokenObj2.decimals)
            const balance0 = this.$store.state.tokenBalances.find(item => item.token === this.$store.state.pools[this.poolId].token0)
            const balance1 = this.$store.state.tokenBalances.find(item => item.token === this.$store.state.pools[this.poolId].token1)
            this.t0_balance = balance0?.amount || 0
            this.t1_balance = balance1?.amount || 0

            // console.log(this.$store.state.pools[this.poolId])
            // console.log(this.$store.state.pools[this.poolId].positions[0].sqrt_lower_bound_price * this.$store.state.pools[this.poolId].positions[0].sqrt_lower_bound_price * Math.pow(10, tokenObj.decimals - tokenObj2.decimals))
            
            this.buildGraph()
        },
        buildGraph: function () {
            const tokenObj = this.$store.state.tokens[this.$store.state.pools[this.poolId].token0]
            const tokenObj2 = this.$store.state.tokens[this.$store.state.pools[this.poolId].token1]
            const positions = []
            let lowest
            const pool = this.$store.state.pools[this.poolId]

            const decs = Math.pow(10, tokenObj.decimals - tokenObj2.decimals)
            for (let [key, ] of Object.entries(pool.positions)) {
                const pos = this.$store.state.pools[this.poolId].positions[key]
                const lower = pos.sqrt_lower_bound_price * pos.sqrt_lower_bound_price * decs
                const upper = pos.sqrt_upper_bound_price * pos.sqrt_upper_bound_price * decs
                const liquidity = pos.liquidity
            
                positions.push({
                    lower: lower,
                    upper: upper,
                    liquidity: liquidity
                })
            }

            const graphTick = (this.upperPrice - this.lowerPrice) / 25
            lowest = this.lowerPrice - graphTick * 5

            const xAxisValues = []
            for (let i = 0; i < 36; i++) {
                xAxisValues.push((lowest + graphTick * i))
            }
            
            const graphSeries = []
            for (let i = 0; i < xAxisValues.length; i++) {
                let yValue = 0
                for (let j = 0; j < positions.length; j++) {
                    if (xAxisValues[i] > positions[j].lower && xAxisValues[i] < positions[j].upper) {
                        yValue += positions[j].liquidity
                    }
                }
                graphSeries.push({
                    x: xAxisValues[i],
                    y: yValue
                })
            }
            this.graphSeries = [{
                name: 'Available liquidity',
                data: graphSeries
            }]
            this.drawAnnotations(this.lowerPrice, this.upperPrice, this.currentPrice)
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
        calcEditDefault: function (pos) {
            this.editAddLiqErrorMsg = ''
            this.manual_input = 'first'
            if (this.$store.state.pools[0] && Number(this.edit_t0_liq)) {
                const poolId = pos.poolId

                const tokenObj = this.$store.state.tokens[this.$store.state.pools[poolId].token0]
                const x = Number(this.edit_t0_liq) * Math.pow(10, tokenObj.decimals)
                
                const tokenObj2 = this.$store.state.tokens[this.$store.state.pools[poolId].token1]
                const sa = pos.sqrt_lower_bound_price
                const sb = pos.sqrt_upper_bound_price
                let sp = this.$store.state.pools[poolId].sqrt_price

                const liquidity = (x * sp * sb) / (sb - sp)//  // amount of 2nd token
                sp = Math.max(Math.min(sp, sb), sa) // ?
                const res = liquidity * (sp - sa) / Math.pow(10, tokenObj2.decimals)// //  // ?
                console.log(liquidity + '* (' + sp + ' - ' + sa + ') / ' + Math.pow(10, tokenObj2.decimals) )
                console.log(x, sp, sb, sa)
                console.log(liquidity, res)

                this.edit_t1_liq = toFixed(res)

                const t0_balance = this.$store.state.tokenBalances.find(item => item.token === this.$store.state.pools[pos.poolId].token0).amount.toFixed(4)
                const t1_balance = this.$store.state.tokenBalances.find(item => item.token === this.$store.state.pools[pos.poolId].token1).amount.toFixed(4)

                if (Number(this.edit_t0_liq) > Number(t0_balance) || Number(this.edit_t1_liq) > Number(t1_balance)) {
                    this.editAddLiqErrorMsg = 'Not enough balance'
                }
            }
        },
        calcEditAlternative: function(pos) {
            this.editAddLiqErrorMsg = ''
            this.manual_input = 'second'
            if (this.$store.state.pools[0] && Number(this.edit_t1_liq)) {
                const poolId = pos.poolId

                const tokenObj = this.$store.state.tokens[this.$store.state.pools[poolId].token0]
                const tokenObj2 = this.$store.state.tokens[this.$store.state.pools[poolId].token1]
                const x = Number(this.edit_t1_liq) * Math.pow(10, tokenObj2.decimals)
                
                const sa = pos.sqrt_lower_bound_price
                const sb = pos.sqrt_upper_bound_price
                let sp = this.$store.state.pools[poolId].sqrt_price

                const liquidity = x / (sp - sa)// amount of 1st token
                sp = Math.max(Math.min(sp, sb), sa) // ?
                const res = liquidity * (sb - sp) / (sp * sb) / Math.pow(10, tokenObj.decimals)//  // ?

                this.edit_t0_liq = toFixed(res)
                // this.total = res
                const t0_balance = this.$store.state.tokenBalances.find(item => item.token === this.$store.state.pools[pos.poolId].token0).amount.toFixed(4)
                const t1_balance = this.$store.state.tokenBalances.find(item => item.token === this.$store.state.pools[pos.poolId].token1).amount.toFixed(4)

                if (Number(this.edit_t0_liq) > Number(t0_balance) || Number(this.edit_t1_liq) > Number(t1_balance)) {
                    this.editAddLiqErrorMsg = 'Not enough balance'
                }
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

            // if (this.lowerPrice > this.currentPrice || this.upperPrice < this.currentPrice) {
            //     this.calculateInit()
            // }
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
            this.calculatePricesRatio()
            this.buildGraph()
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

            // if (this.lowerPrice > this.currentPrice || this.upperPrice < this.currentPrice) {
            //     this.calculateInit()
            // }
            if (this.$store.state.pools[0] && this.lowerPrice < this.upperPrice) {
                if (this.manual_input === 'first') {
                    this.calculateDefault()
                } else if (this.manual_input === 'second') {
                    this.calculateAlternative()
                }
            }
            this.calculatePricesRatio()
            this.buildGraph()
        },
        confirmNewPositionModal: async function () {
            this.lowerPrice = Number(this.lowerPrice)
            this.upperPrice = Number(this.upperPrice)
            const contract = this.$store.state.crispContract
            const tokenObj = this.$store.state.tokens[this.$store.state.pools[this.poolId].token0]
            const tokenObj2 = this.$store.state.tokens[this.$store.state.pools[this.poolId].token1]
            let t0_balance = 0
            let t1_balance = 0

            if (tokenObj) {
                const balanceObj = this.$store.state.tokenBalances.find(item => item.token === this.$store.state.pools[this.poolId].token0)
                if (balanceObj) {
                    t0_balance = balanceObj.amount
                }
            }
            if (tokenObj2) {
                const balanceObj = this.$store.state.tokenBalances.find(item => item.token === this.$store.state.pools[this.poolId].token1)
                if (balanceObj) {
                    t1_balance = balanceObj.amount
                }
            }

            console.log(t0_balance)
            console.log(t1_balance)

            if (contract && this.t0_liq && this.t1_liq && t0_balance >= this.t0_liq && t1_balance >= this.t1_liq && this.lowerPrice < this.upperPrice && this.upperPrice >= 0 && this.lowerPrice >= 0) {
                this.txPending = true
                try {
                    console.log(Number(this.poolId))
                    console.log(Number(this.t0_liq).toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 }))
                    console.log(Number(this.t0_liq * Math.pow(10, tokenObj.decimals)).toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 }))
                    console.log(Number(this.lowerPrice))
                    console.log(Number(this.upperPrice))
                    console.log(tokenObj2)

                    await contract.open_position(
                        {
                            pool_id: Number(this.poolId),
                            token0_liquidity: Number(this.t0_liq * Math.pow(10, tokenObj.decimals)).toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 }),
                            lower_bound_price: Number(this.lowerPrice / Math.pow(10, tokenObj.decimals - tokenObj2.decimals)),
                            upper_bound_price: Number(this.upperPrice / Math.pow(10, tokenObj.decimals - tokenObj2.decimals))
                        }
                    ).then(async (response) => {
                        console.log(response)
                        this.$store.commit('pushNotification', {
                            title: 'Success',
                            type: 'success',
                            // text: response
                            text: 'Position successfully opened'
                        })
                        this.txPending = false
                        this.closeNewPositionModal()
                        await this.$store.dispatch('reload', store.state)
                        this.calculateInit()
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
            } else if (!this.t0_liq) {
                this.$refs.t0_liq.focus()
            } else if (!this.t1_liq) {
                this.$refs.t1_liq.focus()
            } else if (!t0_balance || t0_balance < this.t0_liq) {
                this.$refs.t0_liq.focus()
            } else if (!t1_balance || t1_balance < this.t1_liq) {
                this.$refs.t1_liq.focus()
            }
        },
        editAddLiq: async function (pos) {
            this.editAddLiqErrorMsg = ''
            const contract = this.$store.state.crispContract
            const t0_balance = this.$store.state.tokenBalances.find(item => item.token === this.$store.state.pools[pos.poolId].token0).amount.toFixed(4)
            const t1_balance = this.$store.state.tokenBalances.find(item => item.token === this.$store.state.pools[pos.poolId].token1).amount.toFixed(4)
            if (contract && Number(this.edit_t0_liq) > 0 && Number(this.edit_t0_liq) < Number(t0_balance) && Number(this.edit_t1_liq) < Number(t1_balance)) {
                this.txPending = true
                try {
                    let tokenObj = this.$store.state.tokens[this.$store.state.pools[pos.poolId].token0]
                    console.log(this.$store.state.tokens[this.$store.state.pools[pos.poolId].token0])
                    // const tokenObj2 = this.$store.state.tokens[this.$store.state.pools[pos.poolId].token1]

                    await contract.add_liquidity(
                        {
                            pool_id: Number(pos.poolId),
                            position_id: Number(pos.id),
                            token0_liquidity: Number(this.edit_t0_liq * Math.pow(10, tokenObj.decimals)).toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 })
                        }
                    ).then((response) => {
                        console.log(response)
                        this.$store.commit('pushNotification', {
                            title: 'Success',
                            type: 'success',
                            // text: response
                            text: 'Position successfully changed'
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
            } else if (!contract) {
                this.$store.commit('pushNotification', {
                    title: 'Error',
                    type: 'error',
                    text: 'Error: No contract!'
                })
            } else if (!this.edit_t0_liq) {
                this.editAddLiqErrorMsg = 'Wrong amount'
            } else if (Number(this.edit_t0_liq) > Number(t0_balance)) {
                const ref = 'edit_t0' + pos.id
                this.editAddLiqErrorMsg = 'Not enough balance'
                this.$refs[ref][0].focus()
            } else if (Number(this.edit_t1_liq) > Number(t1_balance)) {
                const ref = 'edit_t1' + pos.id
                this.editAddLiqErrorMsg = 'Not enough balance'
                this.$refs[ref][0].focus()
            }
        },
        editRemoveLiq: async function (pos) {
            const contract = this.$store.state.crispContract
            if (contract && this.removeAmount > 0) {
                this.txPending = true
                try {
                    let tokenObj = this.$store.state.tokens[this.$store.state.pools[pos.poolId].token0]
                    console.log(this.$store.state.tokens[this.$store.state.pools[pos.poolId].token0])
                    // const tokenObj2 = this.$store.state.tokens[this.$store.state.pools[pos.poolId].token1]

                    const currentT0liquidity = pos.token0_real_liquidity

                    const desiredLiquidityForRemoval = currentT0liquidity / 100 * this.removeAmount

                    await contract.remove_liquidity(
                        {
                            pool_id: Number(pos.poolId),
                            position_id: Number(pos.id),
                            token0_liquidity: Number(desiredLiquidityForRemoval * Math.pow(10, tokenObj.decimals)).toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 })
                        }
                    ).then((response) => {
                        console.log(response)
                        this.$store.commit('pushNotification', {
                            title: 'Success',
                            type: 'success',
                            // text: response
                            text: 'Position successfully changed'
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
        },
        closePositionPrompt: function (pos) {
            console.log('1')
            this.positionChosenForClosing = pos
            this.modalActive = true
            this.deletePositionModalActive = true
        },
        closeDeletePositionModal: function () {
            this.positionChosenForClosing = null
            this.modalActive = false
            this.deletePositionModalActive = false
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
                        this.modalActive = false
                        this.deletePositionModalActive = false
                        this.positionChosenForClosing = null
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
        expandPos: async function (pos) {
            this.editAddLiqErrorMsg = ''
            this.edit_t0_liq = 0
            this.edit_t1_liq = 0
            if (pos.expanded) {
                pos.expanded = undefined
                pos.desiredLiquidity0ForRemoval = null
                pos.desiredLiquidity1ForRemoval = null
            } else {
                for (let i = 0; i < this.$store.state.userPositions.length; i++) {
                    const position = this.$store.state.userPositions[i]
                    position.expanded = undefined
                }
                pos.desiredLiquidity0ForRemoval = pos.token0_real_liquidity / 100 * this.removeAmount
                pos.desiredLiquidity1ForRemoval = pos.token0_real_liquidity / 100 * this.removeAmount
                pos.expanded = true
            }
        }
    }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/main.scss";

.deposit_nav_btn{
    border: 1px solid transparent;
    border: 1px solid $buttonBgColor;
    background-color: $buttonAltBgColor;
    color: $buttonBgColor;
    box-sizing: border-box;
    transition: 0.3s;
    border-radius: 8px;
    padding: 4px 8px;
    margin-top: 4px;
    margin-left: 15px;
}

.input-balance {
    padding-left: 15px;
    margin-top: 4px;
}

.deposit_nav_btn:hover {
    background-color: $buttonBgColor;
    color: $buttonAltBgColor;
    cursor: pointer;
}

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

.pools-heading {
    margin-top: 64px;
}

.list {
    @extend %default-element;
    margin-bottom: 64px;
    display: flex;
    flex-direction: column;
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
    background-color: #FDDEA04D;
    border-radius: $borderRadius;
}

.title {
    color: $textColor;
    font-size: $mediumTextSize;
    font-weight: 600;
}

.new-pool-btn, .new-position-btn, .edit-btn {
    border: 1px solid transparent;
    width: 200px;
    padding: 8px;
    border-radius: 20px;
    background-color: $blockBgColor;
    color: $buttonTextColor;
    font-size: $lesserTextSize;
    cursor: pointer;
    transition: 0.3s;
    font-weight: 600;
}

.new-pool-btn:hover, .new-position-btn:hover, .edit-btn:hover {
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
    padding-left: 0;
    box-sizing: border-box;
}

.list-header_unit, .list-pool_unit {
    width: 19%;
    font-size: $tinyTextSize;
    font-weight: 600;
}

.list-header_unit:first-child {
    padding-right: 22px;
}

.list-header_unit:first-child, .list-pool_unit:first-child {
    width: 8%;
}
.list-header_unit:nth-child(2), .list-pool_unit:nth-child(2) {
    width: 12%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}

.list-pool_unit:nth-child(2) {
    padding-left: 4px;
}

.list-header_unit:nth-child(3), .list-pool_unit:nth-child(3) {
    width: 22%;
}

.pos-list-header_unit, .pos-list-pool_unit {
    width: 14%;
    font-size: $tinyTextSize;
    box-sizing: border-box;
    font-weight: 600;
}

.pos-list-header_unit:first-child, .pos-list-pool_unit:first-child, .pos-list-header_unit:nth-child(2), .pos-list-pool_unit:nth-child(2) {
    width: 5%;
}

.pos-list-header_unit:nth-child(2), .pos-list-pool_unit:nth-child(2) {
    width: 7%;
}

.pos-list-header_unit:nth-child(2) {
    margin-left: 22px;
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
    width: $textSize;
    height: $textSize;
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
    @extend %default-block;
    width: $interfaceBlocksWidth;
    min-height: $defaultCardHeight;
    padding: 26px;
    overflow: auto;
    max-height: 95vh;
}

.modal-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    // border-bottom: $brightBorder;
    padding-bottom: 26px;
    padding-left: 18px;
    padding-right: 18px;
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

.modal-body-deletepos {
    min-height: 320px;
    justify-content: center;
    font-size: $greaterTextSize;
}

.modal-body_row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    // margin-top: 48px;
    width: 100%;
    // padding-bottom: 48px;
}

.modal-body_row-placeholder {
    height: 40px;
}

/*.modal-body_row:first-child, .modal-body_row:nth-child(2) {
    border-bottom: $brightBorder;
}*/

.modal-body_row-input {
    border: 0;
    background-color: $elementBgColor;
    font-size: $lesserTextSize;
    border-radius: $borderRadius;
    padding: 4px;
    margin-left: 15px;
    margin-right: 15px;
    transition: 0.3s;
    min-width: 300px;
    min-height: 60px;
    box-sizing: border-box;
}

#currentPrice {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}

.modal-body_row-input:focus {
    outline: none;
    transition: 0.3s;
}

.input-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.input-wrapper-element {
    border: 0;
    background-color: $elementBgColor;
    font-size: $lesserTextSize;
    border-radius: $borderRadius;
    padding: 4px;
    padding-left: 15px;
    padding-right: 15px;
    transition: 0.3s;
    min-width: 300px;
    min-height: 60px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.input-wrapper-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.input-wrapper-row:nth-child(2) {
    margin-top: 8px;
    margin-bottom: 8px;
}

.leverage-checkbox {
    margin-right: 16px;
}

.input-title {
    font-size: $tinyTextSize;
    margin-bottom: 8px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding-left: 15px;
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

.confirm-btn-deletepos {
    margin-left: 12px;
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

.pos-table {
    display: flex;
    flex-direction: column;
    width: $interfaceBlocksWidth;
    border: $border;
    border-radius: $borderRadius;
    margin-bottom: 16px;
    -webkit-box-shadow: 4px 4px 8px 0px rgba(34, 60, 80, 0.4);
    -moz-box-shadow: 4px 4px 8px 0px rgba(34, 60, 80, 0.4);
    box-shadow: 4px 4px 8px 0px rgba(34, 60, 80, 0.4);
    transition: 0.5s;
    cursor: pointer;
}

.pos-table:hover {
    -webkit-box-shadow: 6px 6px 8px 0px rgba(34, 60, 80, 0.7);
    -moz-box-shadow: 6px 6px 8px 0px rgba(34, 60, 80, 0.7);
    box-shadow: 6px 6px 8px 0px rgba(34, 60, 80, 0.7);
    transition: 0.5s;
}

.pos-table:last-child {
    margin-bottom: 64px;
}

.pos-table-expanded {
    background: #fff;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    box-sizing: border-box;
    min-height: 300px;
}

.pos-table_header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-bottom: $border;
    background-color: #d9d9d9;
    border-radius: $borderRadius;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
}

.pos-table_header-cell {
    padding: 14px;
    width: 30%;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-size: $textSize;
    border-right: $border;
    height: 50px;
}

.pos-table_header-cell:first-child {
    justify-content: space-between;
    font-size: $lesserTextSize;
}

.pos-table_header-cell:last-child {
    justify-content: flex-end;
    border: 0;
    width: 10%;
}

.header-cell-unit {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.borrow-btn  {
    border: 1px solid transparent;
    padding: 8px;
    border-radius: 4px;
    background-color: $buttonBgColor;
    color: $buttonTextColor;
    font-size: $lesserTextSize;
    cursor: pointer;
    transition: 0.3s;
    margin-left: 4px;
}

.borrow-btn:hover {
    background-color: $buttonTextColor;
    color: $buttonBgColor;
    transition: 0.3s;
    border: 1px solid $buttonBgColor;
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

.status-caption {
    margin-left: 12px;
}

.close-pos:hover {
    background-color: $buttonTextColor;
    color: $buttonBgColor;
    transition: 0.3s;
    border: 1px solid $buttonBgColor;
}

.pos-table_data {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    border-bottom-left-radius: $borderRadius;
    border-bottom-right-radius: $borderRadius;
}

.pos-table_data-cell {
    width: 30%;
    font-size: $lesserTextSize;
    border-right: $border;
}

.pos-table_data-cell:last-child {
    width: 10%;
    border: 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.pos-table_data-cell:first-child {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
}

.pos-table-tokens {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    font-size: $textSize;
    margin-right: 16px;
    margin-bottom: 12px;
    margin-top: 12px;
    margin-left: 32px;
}

.cell-icon {
    margin-right: 6px;
    margin-top: 1px;
    width: $textSize;
    height: $textSize;
}

.cell-icon:first-child {
    margin-left: 6px;
}

.cell-icon:nth-child(2) {
    margin-right: 12px;
}

.pos-table-poolprice {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-bottom: 12px;
}

.pos-table-poolprice span:first-child {
    margin-right: 16px;
}

.pos-table-poolprice span:last-child {
    font-size: 20px;
}

.pos-table-range {
    margin-bottom: 12px;
}

.stacked {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    height: 120px;
}

.token_index {
    position: absolute;
    left: 3px;
    top: 3px;
    font-size: $tinyTextSize;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}

.token_index_icon {
    height: $tinyTextSize;
}

.token_index_title {
    margin-left: 2px;
}

.token_value {
    font-size: $textSize;
}

.pos-table_data-cell_row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: 50%;
    width: 100%;
    position: relative;
}

.pos-table_data-cell_row:first-child {
    border-bottom: $border;
}

.cell-loader-icon {
    width: $textSize;
    height: $textSize;
    margin-right: 24px;
}

.table-section {
    width: 50%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
}

.section-top {
    width: 100%;
    height: 500px;
    filter: none;
    transition: 0.3s;
}

.section-bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.error-msg {
    margin-bottom: 4px;
    color: red;
}

.blurred .section-block-wrapper {
    pointer-events: none;
    filter: blur(5px);
    transition: 0.3s;
}

.table-section:first-child {
    border-right: $border;
}

.table-header {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-bottom: $brightBorder;
    padding-bottom: 16px;
}

.table-heading {
    font-size: $mediumTextSize;
}

.section-block-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    box-sizing: border-box;
}

.section-block-title {
    font-size: $lesserTextSize;
    margin-bottom: 8px;
    width: 100%;
}

.section-block {
    width: 100%;
    background-color: #f5f6fb;
    border-radius: $borderRadius;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    margin-bottom: 8px;
}

.block-row {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    margin-bottom: 8px;
    font-weight: 500;
}

.block-row-left {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}

.block-row-right {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
}

.block-input {
    border: 0;
    border-radius: $borderRadius;
    background: $tokenWrapperBgColor;
    font-size: 16px;
    padding: 12px;
    padding-left: 8px;
    transition: 0.3s;
    box-sizing: border-box;
}

.block-row_token-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-radius: 16px;
    background-color: $tokenWrapperBgColor;
    padding: 8px;
    -webkit-box-shadow: 4px 4px 8px 0px rgba(34, 60, 80, 0.2);
    -moz-box-shadow: 4px 4px 8px 0px rgba(34, 60, 80, 0.2);
    box-shadow: 4px 4px 8px 0px rgba(34, 60, 80, 0.2);
}

.big-icon {
    height: $textSize;
    margin-right: 6px;
}

.big-symbol {
    font-size: $mediumTextSize;
}

.remove-amount {
    font-size: $greaterTextSize;
    padding-left: 8px;
}

.block-RA-suggestion {
    border: 1px solid transparent;
    padding: 8px;
    border-radius: 4px;
    background-color: $buttonBgColor;
    color: $buttonTextColor;
    font-size: $lesserTextSize;
    cursor: pointer;
    transition: 0.3s;
    margin-left: 4px;
}

.block-RA-suggestion:hover {
    background-color: $buttonTextColor;
    color: $buttonBgColor;
    transition: 0.3s;
    border: 1px solid $buttonBgColor;
}

.block-rangeinput {
    width: 98%;
}

.block-parameter {
    margin-right: 4px;
}

.mob-pools-wrapper {
    display: none;
}

.mob-pos-wrapper {
    display: none;
}

@media screen and (max-width: 1050px) {

    .list, .list-header, .pos-table_wrapper {
        display: none;
    }

    .wrapper {
        width: 340px;
    }

    .title {
        font-size: 16px;
    }

    .new-position-btn {
        font-size: 16px;
        padding: 8px 22px;
    }

    .pools-heading {
        margin-top: 40px;
        margin-bottom: 20px;
    }

    .mob-pools-wrapper {
        display: flex;
        flex-direction: column;
        width: 100%;
        border-radius: 15px;
    }

    .mob-pool {
        background: #FDEFD4;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 240px;
        border-bottom: 0.5px solid #000000;
        padding: 20px;
    }

    .mob-pool:first-child {
        border-top-left-radius: 15px;
        border-top-right-radius: 15px;
    }

    .mob-pool:last-child {
        border-bottom-left-radius: 15px;
        border-bottom-right-radius: 15px;
        border: 0;
    }

    .mob-pool_header, .mob-pool_body, .mob-pool_footer {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
    }

    .pool_data-wrapper_heading {
        font-size: 14px;
        font-weight: 500;
        color: #000000;
        margin-bottom: 12px;
    }

    .pool_data-wrapper_value {
        font-size: 16px;
        font-weight: 600;
    }

    .column {
        display: flex;
        flex-direction: column;
    }

    .pool-tokenicon {
        width: 30px;
        height: 30px;
    }

    .pool-tokenicon:first-child {
        margin-right: 5px;
    }

    .allposheading {
        margin-top: 40px;
        margin-bottom: 20px !important;
    }

    .mob-pos-wrapper {
        display: flex;
        flex-direction: column;
        width: 100%;
        border-radius: 15px;
        margin-bottom: 40px;
    }

    .mob-pos {
        background: #FDEFD4;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 320;
        border-bottom: 0.5px solid #000000;
        padding: 20px;
    }

    .mob-pos:first-child {
        border-top-left-radius: 15px;
        border-top-right-radius: 15px;
    }

    .mob-pos:last-child {
        border-bottom-left-radius: 15px;
        border-bottom-right-radius: 15px;
        border: 0;
    }

    .mob-pos_row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin-bottom: 22px;
    }

    .mob-pos_row:last-child {
        margin: 0;
    }

    .mob-pos_parameter, .mob-pos_value {
        width: 50%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
    }

    .mob-pos_parameter {
        font-size: 14px;
        font-weight: 500;
    }

    .mob-pos_value {
        font-size: 14px;
        font-weight: 600;
    }

    .modal {
        width: 340px;
    }

    .modal-body_row {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        overflow: hidden;
    }

    .input-wrapper {
        margin-top: 16px;
    }

    .modal-body_row-input {
        height: 40px;
        box-sizing: border-box;
        min-height: 40px;
    }

    .confirm-btn {
        width: 100%;
    }

    .deposit_nav_btn {
        margin-left: 15px;
        padding-left: 8px;
    }
}
</style>