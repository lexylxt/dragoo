function getItemPrice(item, lotCount = 1) {
    switch (item) {
        case "candle": // 10 bougies = 400 bonbons
            return lotCount * 400;
        case "pumpkin": // 3 citrouilles = 1200 bonbons
            return lotCount * 1200;
        case "book": // 1 grimoire = 3000 bonbons
            return lotCount * 3000;
        default:
            return 0;
    }
}

function getItemQuantity(item, lotCount = 1) {
    switch (item) {
        case "candle":
            return lotCount * 10;
        case "pumpkin":
            return lotCount * 3;
        case "book":
            return lotCount * 1;
        default:
            return lotCount;
    }
}

function formatItemName(item, quantity = 1) {
    let base;
    switch (item) {
        case "candle": base = "bougie"; break;
        case "pumpkin": base = "citrouille"; break;
        case "book": base = "grimoire"; break;
        default: base = "objet"; break;
    }

    return quantity > 1 ? `${base}s` : base;
}

module.exports = { getItemPrice, getItemQuantity, formatItemName };
