

const ReceiverChannel = require('./../ReceiverChannel')

const QUEUE_NAME = 'center.queue.test'

async function createReceiver(){
  let receiverChannel = new ReceiverChannel()

  //初始化频道
  await receiverChannel.initChannel()

  let {queue,messageCount,consumerCount} = await receiverChannel.assertQueue(QUEUE_NAME)

  console.log(`queue: ${queue}`)
  console.log(`messageCount: ${messageCount}`)
  console.log(`consumerCount: ${consumerCount}`)

  let customer = (msg)=>{
    let msgModel = JSON.parse(msg.content.toString())
    console.log('===== receive =====')
    console.dir(msgModel)
  }

  receiverChannel.register(queue,customer,{noAck:true})
}



createReceiver()