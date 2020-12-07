const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')

const httpController = require('./httpController.js')

const app = new Koa()
app.use(bodyParser())

const monitorRouter = new Router()
monitorRouter.get('/', httpController.get)
monitorRouter.post('/join', httpController.join)
monitorRouter.post('/unreachable', httpController.removeClient)
app.use(monitorRouter.routes())
app.use(monitorRouter.allowedMethods())

app.listen(3000)

console.log('DisHarmony monitor started..')

