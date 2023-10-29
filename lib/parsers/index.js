/**
 * A list of parsers for supported Touhou games
 */
const PARSERS = {
    "T6RP": require("./parse06"),
    "T7RP": require("./parse07"),
    "T8RP": require("./parse08"),
    "T9RP": require("./parse09"),
    "t10r": require("./parse10"),
    "t11r": require("./parse11"),
    "t12r": require("./parse12"),
    "128r": require("./parse128"),
    /**
     * ZUN was drunk and did not change the gamecode for TH14, so this is now used for two games
     * and thus we have to do fuckery to find which one it is
     * fun fact: the games themselves don't test this so if you rename the file you can crash them
     * - raviddog
     */
    "t13r": require("./parse13or14"),
    "t15r": require("./parse15"),
    "t16r": require("./parse16"),
    "t17r": require("./parse17"),
    "t18r": require("./parse18"),   
}

/**
 * Parse a Touhou replay file. Supported games are
 * th06, th07, th08, th09, th10, th11, th12, th128, th13, th14, th15, th16, th17, th18
 * @param {*} replay 
 */
function parse(replay) {
    // Get the magic number
    const magic = [0x0]

    // If the magic number matches, pick that parser and parse the replay
    if (String.fromCharCode(magic) in PARSERS)
        return PARSERS[magic](replay)

    // Otherwise, this replay is either unsupported or not a replay file
    throw "Unsupported replay"
}

module.exports = {
    PARSERS,
    parse
}