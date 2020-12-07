const axios = require('axios')

const clientList = [

]

exports.get = async (ctx) => {
    console.log(`FROM ${ctx.request.ip} GET "/"`)
    ctx.body = {
        clients: clientList
    }
    ctx.status = 200
}

exports.join = async (ctx) => {
    const body = ctx.request.body
    const ip = ctx.request.ip.split(':')[3]
    console.log(`FROM ${ip} POST "/join": ${JSON.stringify(body)}`)
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
        yourName: ip
    }
    ctx.status = 200
}

exports.removeClient = async (ctx) => {
    const body = ctx.request.body
    const ip = ctx.request.ip.split(':')[3]
    console.log(`FROM ${ip} POST "/unreachable": ${JSON.stringify(body)}`)
    checkAndRemoveClient(body.client)
    ctx.body = { message: `Will check client ${body.client}. Thanks!`}
    ctx.status = 200
}

const checkAndRemoveClient = async (client) => {
    try {
        const response = await axios.get(`http://${client}:9999`, { timeout: 1000})
        if (response) {
            console.log(`Client ${client} is up! Will do nothing!`)
        }
    } catch (e) {
        console.log(`Client ${client} down! Informing other clients.`)
        const index = clientList.indexOf(client)
        if (index !== -1) {
            clientList.splice(index, 1)
            console.log(`Client ${client} removed from local list!`)
        }
        multiCast({ type: "REMOVE_USER", message: `Client ${client} removed!`,clientList: clientList })
    }
}

const multiCast = async (data) => {
    for (let client of clientList) {
        try {
            await axios.post(`http://${client}:9999`, data)
        } catch (e) {
            console.log(`Client ${client} unreachable! Firing remove routine..`)
            checkAndRemoveClient(client)
        }
    }
}
