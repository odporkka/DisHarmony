const axios = require('axios')
const perf = require('./performance')

let lamportClock = 1

/**
 * Lamport middleware function.
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
exports.onReceive = async (ctx, next) => {
    const body = ctx.request.body
    const senderIp = ctx.request.ip.split(':')[3]
    console.log(`${(ctx.request.method)} "${ctx.request.url}" FROM ${senderIp}: ${JSON.stringify(body, null, 2)}`)
    // Skip to next middleware if no body
    if (!body) await next()

    if (body.lamportClock) {
        // Adjust own clock on receive
        lamportClock = (body.lamportClock > lamportClock) ? body.lamportClock +1 : lamportClock +1
        switch (body.type) {
            // New song suggestion
            case "ADD_SONG":
                // Push new entry to the end
                global.eventQueue.push({
                    clock: body.lamportClock,
                    song: body.message,
                    by: senderIp,
                    ackList: global.clientList.map((client) => ({client:client, ack: false}))
                })
                // Check and adjust clocks if needed
                checkQueueClocks(body)
                // Sort the event array so that one with the smallest clock value is first
                global.eventQueue.sort((a, b) => a.clock.localeCompare(b.clock))
                // Multicast ACK to all the other clients
                multicast({type: "ACK_SONG", song: body.message, by: senderIp})
                // Respond back to client who suggested the song. This just closes the connection.
                ctx.body = { message: `${body.message} added to eventQueue.` }
                ctx.status = 200
                return
            // ACKs from all the clients
            case "ACK_SONG":
                // Find the entry in the event queue
                const entry = global.eventQueue.find((e) => (e.song === body.song && e.by === body.by))
                if (entry) {
                    // Mark the ACK received
                    const clientAck = entry.ackList.find((e) => (e.client === senderIp))
                    clientAck.ack = true
                    // Check if everything is ACKed and add to playlist if is
                    checkAcks()
                    // Respond back to ACK just to close the connection.
                    ctx.body = { message: "OK!" }
                    ctx.status = 200
                    return
                }
                break
        }
    }
    await next()
}

/**
 * Checks if same clock value exists. Decide by client address then.
 *
 * @param body
 */
const checkQueueClocks = (body) => {
    const entryWithSameClock = eventQueue.find((event) => (event.clock === body.lamportClock))
    // If no same clock value found, do nothing
    if (!entryWithSameClock) return

    if (entryWithSameClock.by < body.by) {
        // Increment duplicates clock value by 1
        entryWithSameClock.clock++
    } else {
        // Increment new entry's clock
        const newEntry = eventQueue[eventQueue.length -1]
        newEntry.clock++
    }
}

/**
 * Multicast to all clients in the clientList.
 *
 * @param data
 * @returns {Promise<void>}
 */
const multicast = async (data) => {
    // Adjust own clock when sending
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
// Export for the multicast function.
exports.multicast = async (data) => {
    return multicast(data)
}

/**
 * Check the first event in the queue for all the ACKs.
 * When all clients have ACKed, the suggestion is put into the playlist.
 */
const checkAcks = () => {
    const first = global.eventQueue[0]
    if (!first) {
        console.log('Nothing on list.')
        return
    }
    if (first.ackList.every((client) => (client.ack === true))) {
        console.log('All ACKs received for the first entry in the queue!')
        global.playlist.push(first.song)
        global.eventQueue.shift()
        perf.mark("add-song-end")
        perf.measure("add-song", "add-song-start", "add-song-end")
    } else {
        console.log(`Song ${first.song} is waiting for ACKs!`)
    }
}
// Export for the ACK check function.
exports.checkAcks = () => {
    checkAcks()
}

/**
 * Getter/Setter for clock value.
 * Used by network joining function and status query.
 * @param value
 */
exports.setClock = (value) => {
    lamportClock = value
}

exports.getClock = () => {
    return lamportClock
}