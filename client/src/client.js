const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const lamport = require('./lamportClock')
const disharmony = require('./disharmonyService')

const app = new Koa()
app.use(bodyParser())

// Client list globally so that lamport can use it
global.clientName = undefined
global.clientList = []
global.playlist = []
global.eventQueue = []

// Lamport clock for totally ordered events
app.use(lamport.onReceive)

const clientRouter = new Router()
clientRouter.get('/', disharmony.get)
clientRouter.post('/', disharmony.post)
app.use(clientRouter.routes())
app.use(clientRouter.allowedMethods())

app.listen(9999)

console.log('DisHarmony client started..')
disharmony.joinNetwork().then((state) => console.log("Joined network, current state: ", state))


