const KaitaiStream = require("kaitai-struct/KaitaiStream")
const { decrypt, unlzss } = require("thrpy-decode")
const Th13 = require("../ksy/Th13")
const ThModern = require("../ksy/ThModern")
const C = require("../constants")
const { convertToRealPIV } = require("../utils")
const dayjs = require("dayjs")
    .extend(require("dayjs/plugin/utc"))

/**
 * Parses th13 replay and returns the replay's information
 * @param {Buffer} replay 
 * @returns Information about the replay
 */
function parse13(replay) {
    const header = new ThModern(new KaitaiStream(replay))
    let compData = Buffer.from(header.main.compData)
    decrypt(compData, 0x400, 0x5C, 0xE1)
    decrypt(compData, 0x100, 0x7D, 0x3A)

    // Replay
    const R = new Th13(new KaitaiStream(unlzss(compData)))

    // Base info
    const info = {
        game: C.GAME.TH13.ID,
        shot: R.header.shot,
        difficulty: R.header.difficulty,
        score: R.header.score * 10,
        // TODO: Will check if the date is shown properly
        date: dayjs.unix(R.header.timestamp).toDate(),
        name: R.header.name.replace(/\0/g, ""),
        slowdown: R.header.slowdown
    }

    // Spell practice
    if (R.header.spellPracticeId !== C.NO_SPELL_PRACTICE_ID) {
        info["type"] = C.REPLAY_TYPE.SPELL_PRACTICE
        info["spell_card_id"] = R.header.spellPracticeId

        return info
    }

    // Get info for each stage
    const stages = []
    R.stages.forEach((stage) => {
        stages.push({
            stage: C.STAGE_NAME[stage.stageNum - 1],
            score: stage.score * 10,
            graze: stage.graze,
            piv: convertToRealPIV(info.game, stage.piv),
            power: stage.power,
            lives: stage.lives,
            life_pieces: stage.lifePieces,
            bombs: stage.bombs,
            bomb_pieces: stage.bombPieces,
            trance: stage.trance,
            extends: stage.extends
        })
    })
    info["stages"] = stages

    // Type of replay
    info["type"] = (
        stages.filter(stages => stages !== null).length === 1 && 
        R.header.difficulty !== C.DIFFICULTY.EXTRA
    ) ? C.REPLAY_TYPE.STAGE_PRACTICE : C.REPLAY_TYPE.FULL_GAME
    
    return info
}

module.exports = parse13