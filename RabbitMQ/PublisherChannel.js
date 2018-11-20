"use strict";

const BaseChannel = require('./BaseChannel')

/**
 * 发送者
 * RoutingKey 匹配 BindingKey
 * 例如Topic类型交换机下:
 *  routingKey = example.# 匹配 bindingKey = example.01.01
 *  routingKey = example.* 匹配 bindingKey = example.02
 */
class PublisherChannel extends BaseChannel{

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
  async send2Queue(queueName, msg ,options = {}){
    return await this.channel.sendToQueue(queueName, new Buffer(JSON.stringify(msg)) ,options)
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
    return await this.channel.publish(exchangeName,routingKey, new Buffer(JSON.stringify(msg)) ,options)
  }

}


module.exports = PublisherChannel