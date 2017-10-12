import Fs from 'fs'
import Path from 'path'
import Scuttlebot from 'scuttlebot'
import Master from 'scuttlebot/plugins/master'
import Gossip from 'scuttlebot/plugins/gossip'
import Replicate from 'scuttlebot/plugins/replicate'
import Invite from 'scuttlebot/plugins/invite'
import Local from 'scuttlebot/plugins/local'
import Frineds from 'ssb-friends'
import Blobs from 'ssb-blobs'
import Backlinks from 'ssb-backlinks'
import Private from 'ssb-private'
import Query from 'ssb-query'
import About from 'ssb-about'
import inject from 'ssb-config/inject'
import Keys from 'ssb-keys'

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

  Keys.loadOrCreate(keyPath, (err, keys) => cb(err, Object.assign({}, ssbConfig, keys)))
}

export function createSbot (config, cb) {
  const sbot = Scuttlebot
    .use(Master)
    .use(Gossip)
    .use(Replicate)
    .use(Frineds)
    .use(Blobs)
    .use(Backlinks)
    .use(Private)
    .use(Invite)
    .use(Local)
    .use(Query)
    .use(About)(config)

  const manifest = sbot.getManifest()
  const manifestPath = Path.join(config.path, 'manifest.json')

  Fs.writeFile(manifestPath, JSON.stringify(manifest), (err) => cb(err, sbot))
}
