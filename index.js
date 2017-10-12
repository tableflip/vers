const {spawn} = require('child_process')
const findVersions = require('find-versions')
const asyncMap = require('async/map')
const explain = require('explain-error')
const columnify = require('columnify')
const pull = require('pull-stream')

module.exports.show = function show () {
  // squirt to the console
  scrapeVersions((err, res) => {
    if (err) throw explain(err)
    const cols = columnify(res.filter(r => !!r.version), {
      showHeaders: false,
      columnSplitter: '  ',
      columns: ['cmd', 'version'],
      config: { cmd: { align: 'right' } }
    })
    console.log('\n' + cols)
  })
}

module.exports.share = function share () {
  initSbot((err, sbot) => {
    if (err) throw explain(err, 'failed to init sbot')
    process.on('SIGINT', () => {
      console.log('\nClosing')
      sbot.close()
      process.exit(0)
    })
    sbot.whoami((err, {id}) => {
      if (err) throw explain(err, 'sbot.whoami failed')
      pull(
        sbot.messagesByType({ type: 'tableflip-vers-data', values: true, keys: false }),
        pull.reduce((res, msg) => {
          if (err) throw explain(err, 'failed to pull the messagesByType stream')
          res[msg.content.username] = msg.content.versions
          return res
        }, {}, (err, usermap) => {
          if (err) throw explain(err, 'failed to reduce the steam')
          const table = Object.keys(usermap).map(username => {
            const versions = usermap[username]
            const row = {
              name: username
            }
            versions.reduce((row, data) => {
              row[data.cmd] = data.version[0]
              return row
            }, row)
            return row
          })

          console.log('\n' + columnify(table, {
            columnSplitter: '  '
          }))
        })
      )
    })
  })
}

module.exports.publish = function publish () {
  initSbot((err, sbot) => {
    if (err) throw explain(err)
    scrapeVersions((err, versions) => {
      if (err) throw explain(err, 'failed to scrape the `--version`s')
      sbot.publish({type: 'tableflip-vers-data', versions, username: getUsername()}, (err, msg) => {
        if (err) throw explain(err, 'failed to publish to sbot')
        console.log('published:', msg)
        sbot.close()
        process.exit(0)
      })
    })
  })
}

module.exports.whoami = function share () {
  initSbot((err, sbot) => {
    if (err) throw explain(err)
    sbot.whoami((err, info) => {
      if (err) throw explain(err)
      console.log(`id ${info.id}`)
      process.exit(0)
    })
  })
}

function scrapeVersions (cb) {
  const programs = [
    { cmd: 'git', args: ['--version'] },
    { cmd: 'node', args: ['--version'] },
    { cmd: 'npm', args: ['--version'] }
  ]

  asyncMap(programs, ({cmd, args}, done) => {
    const proc = spawn(cmd, args)

    proc.once('error', e => done(null, {cmd}))

    proc.stdout.once('data', data => {
      const version = findVersions(`${data}`, {loose: true})
      done(null, {cmd, args, version})
    })
  }, cb)
}

function getUsername () {
  return require('os').userInfo().username
}

require('reify')
const {createSbot, createSsbConfig} = require('./lib/sbot')
const Config = require('./lib/config').default

function initSbot (cb) {
  createSsbConfig(Config.appName, { config: Config.ssb }, (err, ssbConfig) => {
    if (err) throw explain(err)
    createSbot(ssbConfig, cb)
  })
}
