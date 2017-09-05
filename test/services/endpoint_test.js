describe("Endpoint service", function() {
  const TEST_PORT = 8313
  const TEST_ENDPOINT = `http://localhost:${TEST_PORT}`

  let server
  function startServerEndpoint() {
    const http = require('http')
    server = http.createServer((req, res) => {}).listen(TEST_PORT)
  }
  function stopServerEndpoint() {
    return new Promise((resolve) => server.close(resolve))
  }

  let endpoint

  beforeEach(async function() {
    QT.stubConfig('service.forwarder.endpoint', TEST_ENDPOINT)
    QT.stubConfig('service.forwarder.endpointAvailableInterval', 50)
    endpoint = await Q.container.getAsync('endpoint')
  })

  it('succeeds if endpoint is available', async function() {
    QT.stubConfig('service.forwarder.endpointAvailableTimeout', 1000)
    setTimeout(startServerEndpoint, 500)
    await endpoint.waitUntilAvailable()
    await stopServerEndpoint()
  })

  it('fails if the endpoint not available', async function() {
    QT.stubConfig('service.forwarder.endpointAvailableTimeout', 100)
    await expect(endpoint.waitUntilAvailable()).to.be.rejectedWith(
      Q.Errors.EndpointAvailabilityTimeoutError
    )
  })
})
