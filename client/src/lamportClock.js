const axios = require('axios')

let lamportClock = 1

const multicast = async (data) => {
    // Set own clock when sending
    lamportClock++
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

const checkAcks = () => {
    const first = global.eventQueue[0]
    if (first.ackList.every((client) => (client.ack === true))) {
        console.log('All ACKs received for the first entry in the queue!')
        global.playlist.push(first.song)
        global.eventQueue.shift()
    }
}

exports.onReceive = async (ctx, next) => {
    const body = ctx.request.body
    const senderIp = ctx.request.ip.split(':')[3]
    console.log(`${(ctx.request.method)} "${ctx.request.url}" FROM ${senderIp}: ${JSON.stringify(body)}`)
    // Skip to next middleware if no body
    if (!body) await next()

    if (body.lamportClock) {
        // Adjust own clock on receive
        lamportClock = (body.lamportClock > lamportClock) ? body.lamportClock +1 : lamportClock +1
        switch (body.type) {
            case "ADD_SONG":
                global.eventQueue.push({
                    clock: lamportClock,
                    song: body.message,
                    by: senderIp,
                    ackList: global.clientList.map((client) => ({client:client, ack: false}))
                })
                global.eventQueue.sort((a, b) => a.clock.localeCompare(b.clock))
                multicast({type: "ACK_SONG", song: body.message, by: senderIp})
                ctx.body = { message: `${body.message} added to eventQueue.` }
                ctx.status = 200
                return
            case "ACK_SONG":
                const entry = global.eventQueue.find((e) => (e.song === body.song && e.by === body.by))
                if (entry) {
                    const clientAck = entry.ackList.find((e) => (e.client === senderIp))
                    clientAck.ack = true
                    checkAcks()
                    ctx.body = { message: "OK!" }
                    ctx.status = 200
                    return
                } else {
                    // Not yet received initial request, storing ack anyway
                    // TODO
                    global.eventQueue.push({
                        clock: undefined,
                        song: body.song,
                        by: body.by,
                        ackList: global.clientList.map((client) => ({client:client, ack: false}))
                    })
                }
                break
        }
    }
    await next()
}

exports.multicast = async (data) => {
    return multicast(data)
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