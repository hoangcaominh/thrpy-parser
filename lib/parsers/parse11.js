const KaitaiStream = require("kaitai-struct/KaitaiStream")
const { decrypt, unlzss } = require("thrpy-decode")
const Th11 = require("../ksy/Th11")
const ThModern = require("../ksy/ThModern")
const C = require("../constants")
const dayjs = require("dayjs")
    .extend(require("dayjs/plugin/utc"))

/**
 * Parses th11 replay and returns the replay's information
 * @param {Buffer} replay 
 * @returns Information about the replay
 */
function parse11(replay) {
    const header = new ThModern(new KaitaiStream(replay))
    let compData = Buffer.from(header.main.compData)
    decrypt(compData, 0x800, 0xAA, 0xE1)
    decrypt(compData, 0x40, 0x3D, 0x7A)

    // Replay
    const R = new Th11(new KaitaiStream(unlzss(compData)))

    // Base info
    const info = {
        game: C.GAME.TH11.ID,
        shot: R.header.shot,
        subshot: R.header.subshot,
        difficulty: R.header.difficulty,
        score: R.header.score * 10,
        // TODO: Will check if the date is shown properly
        date: dayjs.unix(R.header.timestamp).toDate(),
        name: R.header.name.replace(/\0/g, ""),
        slowdown: R.header.slowdown
    }

    // Get info for each stage
    const stages = []
    R.stages.forEach((stage, i, S) => {
        // no next stage means this is the last stage, so use the final run score
        const nextStage = S[i + 1]

        stages.push((nextStage) ? {
            stage: C.STAGE_NAME[stage.stageNum - 1],
            score: nextStage.score * 10,
            graze: nextStage.graze,
            piv: nextStage.piv * 10,
            power: nextStage.power,
            lives: nextStage.lives,
            life_pieces: nextStage.lifePieces
        } : {
            stage: C.STAGE_NAME[stage.stageNum - 1],
            score: R.header.score * 10
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

module.exports = parse11