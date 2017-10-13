import Fs from 'fs'
import Path from 'path'
import Scuttlebot from 'scuttlebot'
import Master from 'scuttlebot/plugins/master'
import Gossip from 'scuttlebot/plugins/gossip'
import Replicate from 'scuttlebot/plugins/replicate'
import Invite from 'scuttlebot/plugins/invite'
import Local from 'scuttlebot/plugins/local'
import Logging from 'scuttlebot/plugins/logging'
import Frineds from 'ssb-friends'
import Backlinks from 'ssb-backlinks'
import Private from 'ssb-private'
import Query from 'ssb-query'
import About from 'ssb-about'
import inject from 'ssb-config/inject'
import Keys from 'ssb-keys'
import ssbClient from 'ssb-client'

export function createSsbConfig (name, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  opts = opts || {}

  const ssbConfig = inject(name, opts.config)

  if (opts.config && opts.config.keys) {
    return process.nextTick(() => cb(null, ssbConfig))
  }

  const keyPath = opts.getKeyPath
    ? opts.getKeyPath(ssbConfig)
    : Path.join(ssbConfig.path, 'secret')

  Keys.loadOrCreate(keyPath, (err, keys) => {
    const conf = {ssbConfig, keys}
    cb(err, conf)
  })
}

export function createSbot ({ssbConfig, keys}, cb) {
  // squirt the keys in like in https://github.com/ssbc/ssb-client/blob/f45ee70ab4c9714ff1395ff4947d528a4f10a488/test/index.js
  ssbConfig.master = keys.id
  ssbConfig.keys = keys
  const sbot = Scuttlebot
    .use(Master)
    .use(Gossip)
    .use(Replicate)
    .use(Frineds)
    .use(Backlinks)
    .use(Private)
    .use(Invite)
    .use(Local)
    .use(Query)
    .use(Logging)
    .use(About)(ssbConfig)

  const manifest = sbot.getManifest()
  const manifestPath = Path.join(ssbConfig.path, 'manifest.json')

  Fs.writeFile(manifestPath, JSON.stringify(manifest), (err) => {
    if (err) throw err
    // pass the ssb client back
    ssbClient(keys, {
      port: ssbConfig.port,
      manifest: sbot.getManifest()
    }, cb)
  })
}
