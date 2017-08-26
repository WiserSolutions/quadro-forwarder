module.exports = class MessageForwarder {
  constructor(request, hubMessageProcessor = 'pubsub:hubMessageProcessor') {
    this.request = request
    this.hubMessageProcessor = hubMessageProcessor
  }

  async initialize() {
    let subscriptions = Q.config.get(`service.forwarder.subscriptions`)
    if (subscriptions) {
      subscriptions.forEach(async subscription => {
        await this.hubMessageProcessor.register(subscription, this)
      })
    }
  }

  async handle(messageContext) {
    let failed = false
    try{
      await this.request({
        forever: true,
        method: 'POST',
        uri: this.getMessageEndpoint(messageContext.rawMessage.messageType),
        body: {
          messageType: messageContext.rawMessage.messageType,
          content: messageContext.message
        },
        json: true
      })
    } catch(err) {
      Q.log.info(err)
      failed = true
      messageContext.failure()
    }
    if(!failed) messageContext.success()
  }

  getMessageEndpoint(messageType) {
    return Q.config.get('service.forwarder.endpoint').replace(':type', messageType)
  }
}
