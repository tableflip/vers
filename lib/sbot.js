const path = require('path')
const {fork} = require('child_process')
const ssbClient = require('ssb-client')
const ssbKeys = require('ssb-keys')
const config = require('./config')

let serverProc = null

function createSbotServer (cb) {
  serverProc = fork(path.join(__dirname, 'sbot-server.js'), [], {silent: true})
  serverProc.on('message', (msg) => {
    cb(null, JSON.parse(msg))
  })
  process.on('exit', () => {
    serverProc.kill()
  })
}

module.exports = function initSbot (cb) {
  const keys = ssbKeys.loadOrCreateSync(path.join(config.path, 'secret'))
  createSbotServer((err, manifest) => {
    if (err) throw err
    ssbClient(keys, {
      manifest: manifest,
      config: config.host || 'localhost',
      port: config.port,
      caps: config.caps,
      key: config.key || keys.id
    }, cb)
  })
}
