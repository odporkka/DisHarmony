const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')

const disharmony = require('./disharmonyService')

const app = new Koa()
app.use(bodyParser())

const clientRouter = new Router()
clientRouter.get('/', disharmony.get)
clientRouter.post('/', disharmony.post)
app.use(clientRouter.routes())
app.use(clientRouter.allowedMethods())

app.listen(9999)

// Broadcast when joining here?
    // init.scan().then((devices) => console.log('client', devices))

disharmony.informMonitor().then()

console.log('DisHarmony client started..')

