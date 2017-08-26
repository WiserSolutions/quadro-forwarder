/* eslint no-unused-expressions: 0 */
const amqp = require('amqplib')

describe('MessageForwarderTest', function() {
  let connection
  let channel
  beforeEach(async function() {
    connection = await amqp.connect(Q.config.get('service.messages.host'))
    channel = await connection.createChannel()
  })

  it('send messages', async function() {
    await await Q.container.getAsync('messageForwarder')
    // Get the channel
    await channel.assertExchange('test.event1', 'fanout', {durable: false})
    await channel.bindQueue('service_in', 'test.event1', '')
    // Register a http handler
    let messageRecieved
    let remoteHandler = nock('http://forwarder')
      .post('/test.event1')
      .reply(200, function(uri, requestBody) {
        messageRecieved = requestBody
        return requestBody
      })
    // Send a message
    await QT.httpTest.post('/message').send({
      type: 'test.event1',
      content: {hello: 'world1'}
    }).expect(200, 'SUCCESS')
    // Wait for rabit mq to send message to consumer
    // and consumer to send a http request
    await Promise.delay(100)
    expect(messageRecieved).to.be.eql({
      messageType: 'test.event1',
      content: {hello: 'world1'}
    })
    // Send a message to queue
    expect(remoteHandler.isDone()).to.be.true
  })
})
