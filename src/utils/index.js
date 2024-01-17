import * as nearAPI from "near-api-js"

const { keyStores } = nearAPI

export const CONFIG = {
    networkId: "testnet",
    keyStore: new keyStores.BrowserLocalStorageKeyStore(),
    nodeUrl: "https://g.w.lavanet.xyz:443/gateway/neart/rpc-http/975c3a792300f0e7086c7ba824aca00b",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
}