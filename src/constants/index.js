export const CONTRACT_ID = "dev-1705280229234-19875813623641"
export const METHOD_NAMES = ['get_pools', 'get_balance', 'get_balance_all_tokens', 'open_position', 'close_position', 'swap', 'add_liquidity', 'remove_liquidity', /* 'swap_in', 'swap_out',*/'storage_deposit', 'ft_transfer_call', 'withdraw', 'get_return', 'get_expense', 'create_reserve', 'create_deposit', 'close_deposit', 'refresh_deposits_growth', 'take_deposit_growth', 'get_account_deposits', 'supply_collateral_and_borrow', 'return_collateral_and_repay', 'get_liquidation_list', 'get_borrow_health_factor', 'liquidate', 'positions_opened', 'get_borrows_by_account', 'get_liquidation_price', 'get_max_leverage']

export const DEFAULT_SWAP_PAIR = {
    token_in: {
        symbol:"USDT",
        token:"usdt.fakes.testnet"
    },
    token_out: {
        symbol:"wNEAR",
        token:"wrap.testnet"
    }
}

export const SWAP_TOKENS = [
    {
        symbol: 'USDT',
        token: 'usdt.fakes.testnet'
    },
    {
        symbol: 'USDC',
        token: 'usdc.fakes.testnet'
    },
    {
        symbol: 'wNEAR',
        token: 'wrap.testnet'
    }
]

export const NOT_ENOUGH_LIQUIDITY_ERROR = 'not enough liquidity in pool to cover this swap'