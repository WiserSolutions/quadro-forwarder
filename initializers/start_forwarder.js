module.exports = async function(endpoint, app) {
  await endpoint.waitUntilAvailable()

  // Just reference `messageForwarder` to initialize it
  await Q.container.getAsync('messageForwarder')
}
