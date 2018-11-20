"use strict";

const CustomerChannel = require('./../CustomerChannel')

/**
 * 消费者
 */
class ReceiverChannel extends CustomerChannel{
  constructor(){
    super()
  }

}

module.exports = ReceiverChannel
