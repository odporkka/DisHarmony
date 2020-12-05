const Koa = require('koa')
const serve = require('koa-static-server')

const path = __dirname + '/dist'
const port = 3000

const app = new Koa()
app.use(serve({rootDir: path, index: 'index.html'}))
app.listen(port)
console.log('Monitor listening on port: ', port)

