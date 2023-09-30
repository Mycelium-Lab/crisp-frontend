function sqrt_price_to_tick(sqrt_price) {
    return Math.floor(2 * Math.log(sqrt_price) / Math.log(1.0001))
}

function tick_to_sqrt_price(tick) {
    return Math.pow(1.0001, tick / 2)
}

export { sqrt_price_to_tick, tick_to_sqrt_price }