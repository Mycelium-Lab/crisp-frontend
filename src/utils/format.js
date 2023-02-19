import * as nearAPI from "near-api-js"

const { utils } = nearAPI

export function addDecimals(amount, tokenObj) {
    let resolve
    if (tokenObj.symbol === 'wNEAR') {
        resolve = utils.format.parseNearAmount(amount.toString())
    } else {
        resolve = amount * Math.pow(10, tokenObj.decimals)
    }
    return resolve.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 })
}