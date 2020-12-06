const axios = require('axios')

const playlist = [

]
const clientList = [

]

exports.get = async (ctx) => {
    console.log(`FROM ${ctx.request.ip} GET "/"`)
    ctx.body = "Hello"
    ctx.status = 200
}

exports.post = async (ctx) => {
    const body = ctx.request.body
    const ip = ctx.request.ip.split(':')[3]
    console.log(`FROM ${ip} POST "/": ${JSON.stringify(body)}`)
    if (clientList.indexOf(ip) === -1) {
        clientList.push(ip)
        const informMessage = {
            type: "NEW_USER",
            message: `${ip} joined!`,
            clientList: clientList,
        }
        console.log('Informing other clients about new user')
        const responses = await Promise.all(clientList.map(async client => {
            if (client !== ip) {
                console.log(`INFORMING ${client} for new user!`)
                try {
                    await axios.post(`http://${client}:9999`, informMessage)
                } catch (e) {
                    console.log(`Error while informing client ${client} about new user`)
                    console.log(e)
                }
                return `${client}: OK!`
            } else {
                return `skipping ${client}`
            }
        }))
        console.log('Responses from clients:', responses)
    } else {
        console.log(`${ip} is already on the client list!`)
    }
    ctx.body = {
        message: "Welcome!",
        clientList: clientList,
    }
    ctx.status = 200
}

