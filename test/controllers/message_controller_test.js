/* eslint no-unused-expressions: 0 */
const amqp = require('amqplib')

describe('MessageController', function() {
  describe('send messages', function() {
    let connection
    let channel
    beforeEach(async function() {
      connection = await amqp.connect(Q.config.get('service.messages.host'))
      channel = await connection.createChannel()
    })
    it('send messages', async function() {
      // Get the channel
      await channel.assertExchange('service.test.producer', 'fanout', {durable: false})
      await channel.assertQueue('service_producer_queue')
      await channel.bindQueue('service_producer_queue', 'service.test.producer', '')
      let handler = this.sinon.spy()
      await channel.consume('service_producer_queue', handler, {noAck: true})
      await QT.httpTest.post('/message').send({
        type: 'service.test.producer',
        content: {hello: 'world'}
      }).expect(200, 'SUCCESS')
      await Promise.delay(200)
      expect(handler.called).to.be.true
      expect(JSON.parse(handler.args[0][0].content.toString())).to.be.eql({messageType: 'service.test.producer', content: {hello: 'world'}})
    })
  })
})
