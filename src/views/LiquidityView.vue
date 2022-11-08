<template>
    <div class="wrapper">
        <template v-if="!loading">
            <div class="heading">
                <span class="title">Pools</span><button class="new-pool-btn">+ New pool</button>
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
                <span class="list-header_unit">
                    Tick
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
                        {{pool.sqrt_price}}
                    </span>
                    <span class="list-pool_unit">
                        {{pool.tick}}
                    </span>
                </div>
            </div>
            <!-- list of pools goes here -->
            <div class="heading">
                <span class="title">Positions</span><button class="new-position-btn">+ New position</button>
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
        }
        this.loading = false
    },
    methods: {

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
    width: 16%;
    font-size: $tinyTextSize;
}

.list-header_unit:first-child, .list-pool_unit:first-child {
    width: 4%;
}
</style>