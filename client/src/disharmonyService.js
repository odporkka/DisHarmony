const axios = require('axios')
const lamport = require('./lamportClock')
const perf = require('./performance')

/**
 * GET controller function.
 * Returns status of the node.
 *
 * @param ctx
 * @returns {Promise<void>}
 */
exports.get = async (ctx) => {
    ctx.body = getState()
    ctx.status = 200
}

/**
 * POST controller function.
 * Takes in requests from the monitor and user.
 * After posting the suggestion the actual addition process
 * started lamportClock.js
 *
 * @param ctx
 * @returns {Promise<void>}
 */
exports.post = async (ctx) => {
    const body = ctx.request.body
    let responseBody = {}

    switch (body.type) {
        case "NEW_USER":
        case "REMOVE_USER":
            // Adjust clientList as monitor has it
            global.clientList = body.clientList
            // Remove dropped client from ackLists if present
            global.eventQueue.forEach((event) => {
                event.ackList = event.ackList.filter((entry) => (entry.client !== body.removed))
            })
            console.log('Checking eventQueue..')
            lamport.checkAcks()
            responseBody = {
                message: "OK!",
                clientList: clientList,
            }
            break
        case "NEW_SONG_REQUEST":
            perf.mark("add-song-start")
            responseBody = { message: "Song request accepted!"}
            lamport.multicast({type: "ADD_SONG", message: body.message}).then()
            break
        default:
            break
    }
    ctx.body = responseBody
    ctx.status = 200
}

/**
 * Inform monitor on startup.
 *
 * @returns {Promise<*>}
 */
exports.joinNetwork = async () => {
    console.log('TO http://monitor:3000/join: { message: "Hello! I want to join!" }')
    let response = undefined
    try {
        // Monitor doesn't use lamport clock
        response = await axios.post('http://monitor:3000/join', { message: "Hello! I want to join!" })
    } catch (e) {
        console.log('error')
    }
    console.log('RESPONSE http://monitor:3000:', JSON.stringify(response.data))
    global.clientList = response.data.clientList
    global.clientName = response.data.yourName
    for (let client of clientList) {
        if (client === clientName) continue
        try {
            // Getting initial state doesn't need lamport clock
            const response = await axios.get(`http://${client}:9999`)
            if (response.data.playlist && response.data.lamportClock) {
                lamport.setClock(response.data.lamportClock)
                global.playlist = response.data.playlist
                console.log(`INITIAL STATE from ${client}`)
                break
            }
        } catch (e) {
        }
    }
    return getState()
}

const getState = () => {
    return {
        clientName: clientName,
        lamportClock: lamport.getClock(),
        eventQueue: global.eventQueue,
        clientList: global.clientList,
        playlist: global.playlist,
    }
}