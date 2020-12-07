const axios = require('axios')
const lamport = require('./lamportClock')

exports.post = async (ctx) => {
    const body = ctx.request.body
    let responseBody = {}

    switch (body.type) {
        case "NEW_USER":
        case "REMOVE_USER":
            clientList = body.clientList
            console.log('New client list: ')
            console.log(clientList)
            responseBody = {
                message: "OK!",
                clientList: clientList,
            }
            break
        case "NEW_SONG_REQUEST":
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
 * Inform monitor on startup
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

exports.get = async (ctx) => {
    ctx.body = getState()
    ctx.status = 200
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