import * as nearAPI from "near-api-js"

const { keyStores } = nearAPI

export const CONFIG = {
    networkId: "testnet",
    keyStore: new keyStores.BrowserLocalStorageKeyStore(),
    // nodeUrl: "https://rpc.testnet.near.org",
    // nodeUrl: "https://beta.rpc.testnet.near.org",
    nodeUrl: "https://near-testnet.api.pagoda.co/rpc/v1/",
    headers: { 'x-api-key': '5935f624-29a2-44fb-acdb-1ab7d8653297'},
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
}