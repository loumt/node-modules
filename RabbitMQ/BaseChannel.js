"use strict";

const {EventEmitter} = require('events')
const ConnectionHandler = require('./ConnectionHandler')

/**
 * MQ频道基类
 *
 * event:
 *  channel-close
 *  channel-error
 *  channel-return
 *  channel-drain
 */
class BaseChannel extends EventEmitter{
  constructor(){
    super()
  }

  async initChannel(){
    let connection = this.connection =  await ConnectionHandler.getConnection()
    this.channel = await connection.createChannel()
    this.channel.on('close', this.onChannelClose.bind(this))
    this.channel.on('error', this.onChannelError.bind(this))
    this.channel.on('return', this.onChannelReturn.bind(this))
    this.channel.on('drain', this.onChannelDrain.bind(this))
  }

  async closeConnection(){
    if(this.connection){
      await this.connection.close()
    }
  }

  //##########   Queue   ##############

  /**
   * 定义一个消息队列
   * @param queueName
   * @param options
   */
  async assertQueue(queueName,options){
    return await this.channel.assertQueue(queueName,options)
  }

  /**
   * 检测一个队列是否存在
   * @param queueName
   */
  async checkQueue(queueName){
    return await this.channel.checkQueue(queueName)
  }

  /**
   * 删除一个消息队列
   * @param queueName
   * @param options
   *  {
   *    ifUnused (boolean) 删除一个无消费者的消息队列,若不是,channel关闭
   *    ifEmpty (boolean) 删除一个无消息的消息队列,若不是,channel关闭
   *  }
   */
  async deleteQueue(queueName,options){
    return await this.channel.deleteQueue(queueName,options)
  }

  /**
   * 清除消息队列中所有未分发的消息
   * @param queueName
   */
  async purgeQueue(queueName){
    return await this.channel.purgeQueue(queueName)
  }


  /**
   * 将队列绑定到交换机
   * @param queueName
   * @param exchangeName
   * @param bindKey
   */
  async bindQueue(queueName,exchangeName,bindKey){
    return await this.channel.bindQueue(queueName,exchangeName,bindKey)
  }

  /**
   * 将队列从交换机上解绑
   * @param queueName
   * @param exchangeName
   * @param bindKey
   */
  async unbindQueue(queueName,exchangeName,bindKey){
    return await this.channel.unbindQueue(queueName,exchangeName,bindKey)
  }

  //##########   Exchange   ##############

  /**
   * 定义一个交换机
   * @param exchange
   * @param type
   * @param options
   * {
   *    durable(boolean) 当服务重启时,交换机被救赎
   * }
   */
  async assertExchange(exchange,type,options){
    return await this.channel.assertExchange(exchange,type,options)
  }


  /**
   * 检测交换机是否存在,若不存在,则频道断开
   * @param exchange
   */
  async checkExchange(exchange){
    return await this.channel.checkExchange(exchange)
  }

  /**
   *
   * @param exchange
   * @param options
   * {
   *  ifUnused (boolean) 删除不使用的交换机,若不是,则频道close
   * }
   */
  async deleteExchange(exchange,options){
    return await this.channel.deleteExchange(exchange)
  }


  /**
   * 将两个交换机绑定
   * exchange将会收到source上的信息
   * @param exchange
   * @param source
   * @param pattern
   */
  async bindExchange(exchange,source,pattern){
    return this.channel.bindExchange(exchange,source,pattern)
  }

  /**
   * 将两个交换机解绑
   * @param exchange
   * @param source
   * @param pattern
   */
  async unbindExchange(exchange,source,pattern){
    return this.channel.unbindExchange(exchange,source,pattern)
  }



  // ============  Send Message  =============
  /**
   * 发送消息到队列
   * @param channel 频道
   * @param queueName 队列名
   * @param msg 信息对象
   * @param options
   *  {
   *    expiration
   *    userId  (string)
   *    persistent  (boolean) 是否消息缓存,服务重启消息仍在
   *    mandatory  (boolean) 消息是否无路由下返回
   *    replyTo  (string) RPC reply
   *    messageId  (string) message指定ID
   *  }
   */
  async send2Queue(queueName,msg,options){
    await this.channel.sendToQueue(channel,queueName,msg,options)
  }

  /**
   *
   * @param channel
   * @param routingKey
   * @param exchangeName
   * @param msg
   * @param options
   */
  async send2Exchange(routingKey,exchangeName,msg,options){
    await this.channel.publish(exchangeName,routingKey,msg,options)
  }


  async close(){
    if(this.channel){
      await this.channel.close()
    }
  }

  getChannel(){
    return this.channel;
  }

  onChannelClose(){
    console.log('close')
    this.emit('channel-close')
  }

  onChannelError(){
    console.log('error')
    this.emit('channel-error')
  }

  onChannelReturn(){
    console.log('return')
    this.emit('channel-return')
  }

  onChannelDrain(){
    console.log('drain')
    this.emit('channel-drain')
  }
}

module.exports = BaseChannel