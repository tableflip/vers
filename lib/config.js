import rc from 'rc'
import Package from '../package.json'

export default rc(Package.name, {
  appName: Package.name,
  ssb: {
    port: 8139,
    local: true,
    friends: {
      dunbar: 150,
      hops: 1
    },
    logging: {
      level: 'error'
    }
  }
})
