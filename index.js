const {spawn} = require('child_process')
const findVersions = require('find-versions')
const asyncMap = require('async/map')
const explain = require('explain-error')

module.exports = function () {
  // squirt to the console
  scrapeVersions((err, res) => {
    if (err) throw explain(err)

    res
      .filter(r => !!r.ver)
      .forEach(({cmd, ver}) => console.log(`${cmd} ${ver}`))
  })
}

function scrapeVersions (cb) {
  const programs = [
    { cmd: 'git', args: ['--version'] },
    { cmd: 'node', args: ['--version'] },
    { cmd: 'npm', args: ['--version'] },
    { cmd: 'nosuch', args: ['--version'] }
  ]

  asyncMap(programs, ({cmd, args}, done) => {
    const proc = spawn(cmd, args)

    proc.once('error', e => done(null, {cmd}))

    proc.stdout.once('data', data => {
      const ver = findVersions(`${data}`, {loose: true})
      done(null, {cmd, args, ver})
    })
  }, cb)
}
