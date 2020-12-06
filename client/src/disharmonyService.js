const axios = require('axios')

let playlist = [

]
let clientList = [

]

exports.get = async (ctx) => {
    console.log(`FROM ${ctx.request.ip} GET "/"`)
    ctx.body = {
        clients: clientList,
        playlist: playlist
    }
    ctx.status = 200
}

exports.post = async (ctx) => {
    const body = ctx.request.body
    console.log(`FROM ${ctx.request.ip} POST "/": ${JSON.stringify(body)}`)
    let responseBody = {}

    switch (body.type) {
        case "NEW_USER":
            clientList = body.clientList
            console.log('New client list: ')
            console.log(clientList)
            responseBody = {
                message: "OK!",
                clientList: clientList,
            }
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
exports.informMonitor = async () => {
    console.log('TO http://monitor:3000: { message: "Hello! I want to join!" }')
    let response = undefined
    try {
        response = await axios.post('http://monitor:3000', { message: "Hello! I want to join!" })
    } catch (e) {
        console.log('error')
    }
    console.log('RESPONSE http://monitor:3000:', JSON.stringify(response.data))
    playlist = response.data.playlist
    clientList = response.data.clientList
    return response.data
}