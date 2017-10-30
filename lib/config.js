const rc = require('rc')
const {name} = require('../package.json')

const conf = rc(name, {
  appName: name,
  ssb: {
    port: 8140,
    friends: {
      dunbar: 150,
      hops: 1
    },
    logging: {
      level: 'error'
    }
  }
})

// return an ssb-config object with all the ssb gubbins set for us.
module.exports = require('ssb-config/inject')(conf.appName, conf.ssb)
