const C = require("./constants")

/**
 * Convert raw PIV stored in the replay to PIV shown and used by point items
 * @param {*} gameId ID of the game
 * @param {*} rawPIV PIV stored in the replay
 * @returns real PIV used
 */
function convertToRealPIV(gameId, rawPIV) {
    // Return PIV * 10 for th10-th11
    if ([
        C.GAME.TH10.ID,
        C.GAME.TH11.ID,
    ].includes(gameId))
        return rawPIV * 10
    
    // Return PIV * 10 for th12 onwards
    // "piv is stored with extra precision, we trunctate the value to what is shown ingame"
    if ([
        C.GAME.TH12.ID,
        C.GAME.TH13.ID,
        C.GAME.TH14.ID,
        C.GAME.TH15.ID,
        C.GAME.TH16.ID,
        C.GAME.TH17.ID,
        C.GAME.TH18.ID,
    ].includes(gameId))
        return Math.trunc(rawPIV / 1000) * 10
    
    // Return default value for other games
    return rawPIV
}

module.exports = {
    convertToRealPIV,
}