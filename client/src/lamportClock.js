const axios = require('axios')

let lamportClock = 1

exports.onReceive = async (ctx, next) => {
    const body = ctx.request.body
    console.log(`${(ctx.request.method)} "${ctx.request.url}" FROM ${ctx.request.ip}: ${JSON.stringify(body)}`)
    if (!body) await next()
    if (body.lamportClock) {

    }
    await next()
}

exports.multicast = async (data) => {
    for (let client of global.clientList) {
        try {
            // Getting initial state doesn't need lamport clock
            const response = await axios.post(`http://${client}:9999`,
                {...data, lamportClock: lamportClock},
                {timeout: 5000})
            console.log(`RESPONSE from ${client}: ${JSON.stringify(response.data)}`)
        } catch (e) {
            console.log(`Client ${client} unreachable! Informing monitor..`)
            try {
                const request = {
                    message: "Client unreachable!",
                    client: client
                }
                const response = await axios.post('http://monitor:3000/unreachable', request)
                if (response.data && response.data.message && response.data.message === "Client removed!") {
                    const index = global.clientList.indexOf(client)
                    if (index !== -1) {
                        global.clientList.splice(index, 1)
                        console.log(`Client ${client} removed!`)
                    }
                }
            } catch (e) {
                console.log(`Could not reach monitor.. Doing nothing..`)
            }
        }
    }
}

exports.getTimeStamp = () => {
    return lamportClock
}

exports.setClock = (value) => {
    lamportClock = value
}

exports.getClock = () => {
    return lamportClock
}