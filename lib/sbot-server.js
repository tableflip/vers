const fs = require('fs')
const path = require('path')
const config = require('./config')
const ssbKeys = require('ssb-keys')

const createServer = require('scuttlebot')
  .use(require('scuttlebot/plugins/plugins'))
  .use(require('scuttlebot/plugins/master'))
  .use(require('scuttlebot/plugins/gossip'))
  .use(require('scuttlebot/plugins/replicate'))
  .use(require('ssb-friends'))
  .use(require('scuttlebot/plugins/local'))
  .use(require('scuttlebot/plugins/logging'))
  .use(require('scuttlebot/plugins/private'))
  .use(require('ssb-query'))
  .use(require('ssb-links'))
  .use(require('ssb-ws'))

const keys = ssbKeys.loadOrCreateSync(path.join(config.path, 'secret'))

const server = createServer({keys, ...config})

const manifest = JSON.stringify(server.getManifest(), null, 2)

const manifestPath = path.join(config.path, 'manifest.json')

// write RPC manifest to ~/.vers/manifest.json
fs.writeFileSync(manifestPath, manifest)

// signal to the parent process that we're ready
process.send(manifest)
