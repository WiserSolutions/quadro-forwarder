const waitPort = require('wait-port')
const URL = require('url')

const TimeoutError = Q.Errors.declareError('EndpointAvailabilityTimeoutError')

module.exports = function Endpoint(config) {
  const DEFAULT_TIMEOUT = 30000 // 30 seconds
  const DEFAULT_INTERVAL = 1000 // 1 second

  this.waitUntilAvailable = async function() {
    let timeout = config.get('service.forwarder.endpointAvailableTimeout', DEFAULT_TIMEOUT)
    let interval = config.get('service.forwarder.endpointAvailableInterval', DEFAULT_INTERVAL)
    let { port, hostname } = URL.parse(config.get('service.forwarder.endpoint'))

    let connected = await waitPort({ port: parseInt(port), host: hostname, interval, timeout })
    if (!connected) {
      throw new TimeoutError({ endpoint: { hostname, port }})
    }
  }

  this.buildMessageHandlerUrl = function(messageType) {
    return Q.config.get('service.forwarder.endpoint').replace(':type', messageType)
  }
}
