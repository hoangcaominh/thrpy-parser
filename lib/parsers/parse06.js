const KaitaiStream = require("kaitai-struct/KaitaiStream")
const { decrypt06, unlzss } = require("thrpy-decode")
const Th06 = require("../ksy/Th06")
const C = require("../constants")
const dayjs = require("dayjs")
    .extend(require("dayjs/plugin/utc"))

/**
 * Parses th06 replay and returns the replay's information
 * @param {Buffer} replay 
 * @returns Information about the replay
 */
function parse06(replay) {
    let compData = replay.subarray(15)
    decrypt06(compData, replay.at(14))

    const decrypted = Buffer.concat([replay.subarray(0, 15), compData])

    // Replay
    const R = new Th06(new KaitaiStream(decrypted))

    // Base info
    const info = {
        game: C.GAME.TH06.ID,
        shot: R.header.shot,
        difficulty: R.header.difficulty,
        score: R.fileHeader.score,
        date: dayjs.utc(R.fileHeader.date).toDate(),
        name: R.fileHeader.name.replace(/\0/g, ""),
        slowdown: R.fileHeader.slowdown
    }

    // Get info for each stage
    const stages = []
    R.stages.forEach((stage, i) => {
        if (R.fileHeader.stageOffsets[i] === 0)
            return
        // console.log(stage.body)
        stages.push({
            stage: C.STAGE_NAME[i],
            score: stage.body.score,
            power: stage.body.power,
            lives: stage.body.lives,
            bombs: stage.body.bombs,
            rank: stage.body.rank
        })
    })
    info["stages"] = stages

    // Type of replay
    info["type"] = (
        stages.filter(stages => stages !== null).length === 1 && 
        R.header.difficulty === C.DIFFICULTY.EXTRA
    ) ? C.REPLAY_TYPE.STAGE_PRACTICE : C.REPLAY_TYPE.FULL_GAME
    
    return info
}

module.exports = parse06