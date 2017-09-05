module.exports = class MessageForwarder {
  constructor(request, endpoint, hubMessageProcessor = 'pubsub:hubMessageProcessor') {
    this.request = request
    this.hubMessageProcessor = hubMessageProcessor
    this.endpoint = endpoint
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
    try {
      await this.request({
        forever: true,
        method: 'POST',
        uri: this.endpoint.buildMessageHandlerUrl(messageContext.rawMessage.messageType),
        body: {
          messageType: messageContext.rawMessage.messageType,
          content: messageContext.message
        },
        json: true
      })
    } catch (err) {
      Q.log.error({err}, 'Error while handling message')
      failed = true
      messageContext.failure()
    }
    if (!failed) messageContext.success()
  }
}
