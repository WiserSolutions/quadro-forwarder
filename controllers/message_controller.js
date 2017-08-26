module.exports = class MessageController {
  constructor(pubsub) {
    this.pubsub = pubsub
  }

  async create(ctx) {
    await this.pubsub.publish(ctx.request.body.type, ctx.request.body.content)
    ctx.body = 'SUCCESS'
  }
}
