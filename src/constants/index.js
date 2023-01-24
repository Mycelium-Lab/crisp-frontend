export const CONTRACT_ID = "dev-1674131081257-52430382583822"
export const METHOD_NAMES = ['get_pools', 'get_balance', 'get_balance_all_tokens', 'open_position', 'close_position', 'swap', 'add_liquidity', 'remove_liquidity', /* 'swap_in', 'swap_out',*/'storage_deposit', 'ft_transfer_call', 'withdraw', 'get_return', 'get_expense']

export const DEFAULT_SWAP_PAIR = {
    token_in: {
        symbol:"USDC",
        token:"usdc.fakes.testnet"
    },
    token_out: {
        symbol:"USN",
        token:"usdn.testnet"
    }
}

export const SWAP_TOKENS = [
    // {
    //     symbol: 'USDT',
    //     token: 'usdt.fakes.testnet'
    // },
    {
        symbol: 'USDC',
        token: 'usdc.fakes.testnet'
    },
    {
        symbol: 'USN',
        token: 'usdn.testnet'
    }
    // {
    //     symbol: 'wNEAR',
    //     token: 'wrap.testnet'
    // }
]

export const NOT_ENOUGH_LIQUIDITY_ERROR = 'not enough liquidity in pool to cover this swap'