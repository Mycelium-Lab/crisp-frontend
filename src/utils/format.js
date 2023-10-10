import * as nearAPI from "near-api-js"
import { ethers } from "ethers"

const { utils } = nearAPI

export function addDecimals(amount, tokenObj) {
    let resolve
    if (tokenObj.symbol === 'wNEAR') {
        resolve = utils.format.parseNearAmount(amount.toString())
    } else {
        resolve = ethers.parseUnits(Number(amount).toFixed(6), tokenObj.decimals) // amount * Math.pow(10, tokenObj.decimals)
    }
    return resolve.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 })
}

export function removeDecimals(amount, tokenObj) {
    let resolve
    if (tokenObj.symbol === 'wNEAR') {
        resolve = utils.format.formatNearAmount(amount.toString())
    } else {
        resolve = ethers.formatUnits(amount.toString(), tokenObj.decimals)
    }
    console.log(tokenObj.symbol, resolve)
    return resolve.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 })
}

// export function addDecimalsToPrice(amount, decimals) {
//     const resolve = ethers.formatUnits(amount.toString(), decimals)
//     return resolve
// }