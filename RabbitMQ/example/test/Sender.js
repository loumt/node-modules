

const PublisherChannel = require('./../PublisherChannel')

const QUEUE_NAME = 'center.queue.test'

async function sendMessage(){
  let publisherChannel = new PublisherChannel()

  //初始化频道
  await publisherChannel.initChannel()

  let msg = {name:'loumt',age: 17 , degree: 'No.1'}

  let result = await publisherChannel.send2Queue(QUEUE_NAME, msg ,{})
  console.dir(result)
}

sendMessage()