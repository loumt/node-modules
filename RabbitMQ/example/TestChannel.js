"use strict";

const ConnectionHandler = require('./../ConnectionHandler')
const BaseChannel = require('./../BaseChannel')


class TestChannel extends BaseChannel{
  constructor(){
    super()
  }

  showQueueInfo(){
    console.dir(this.queue)
  }

  showChannelInfo(){
    console.dir(this.channel)
  }
}


module.exports = TestChannel


