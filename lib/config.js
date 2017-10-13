import rc from 'rc'
import Package from '../package.json'

export default rc(Package.name, {
  appName: Package.name,
  ssb: {
    host: 'localhost',
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
