"use strict";

const BaseChannel = require('./BaseChannel')

/**
 * 消费者
 */
class CustomerChannel extends BaseChannel{

  /**
   * 另队列注册一个消费者
   * @param channel
   * @param queueName
   * @param customerHandler  处理消息的函数对象
   * @param options
   *  {
   *    consumerTag (string) 用户表示这个消费者,channel.cancel(customerTag)
   *    noLocal (boolean)
   *    noAck (boolean)
   *    exclusive (boolean)
   *    priority (integer)
   *    arguments (object)
   *  }
   */
  async register(queueName,customerHandler,options){
    return await this.channel.consume(queueName, customerHandler, options)
  }

  /**
   * 取消某个消费者的消息
   * @param channel
   * @param customerTag 定义customer时options
   */
  async cancel(channel,customerTag){
    return await channel.cancel(customerTag)
  }

  /**
   * 向队列获取一个消息
   * @param channel
   * @param queueName
   * @param options
   * @returns {Promise.<void>}
   */
  async get(channel,queueName,options){
    return await channel.get(queueName,options)
  }


  /**
   * 应答一个消息
   * @param channel
   * @param message
   */
  async ack(channel,message){
    return await channel.ack(message)
  }

  /**
   * 应答某个频道的所有消息
   * @param channel
   * @param message
   */
  async ackAll(channel){
    return await channel.ackAll()
  }

  /**
   * 拒绝一个消息。这指示服务器要么重新请求消息，要么将其丢弃(这可能导致消息被彻底删除)
   * @param channel
   * @param message
   */
  async nack(channel,message){
    return await channel.nack(message)
  }

  /**
   * 拒绝某个频道的所有消息
   * @param channel
   * @param message
   */
  async nackAll(channel){
    return await channel.nackAll()
  }

  /**
   * 定义一个频道的最大消息存在数目
   * @param channel
   * @param count
   */
  async prefetch(channel,count){
    return await channel.prefetch(count)
  }

  /**
   * 重新接收频道上的所有信息
   * @param channel
   * @returns {Promise.<void>}
   */
  async recover(channel){
    return await channel.recover()
  }
}

module.exports = CustomerChannel