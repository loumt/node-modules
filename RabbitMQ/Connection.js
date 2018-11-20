"use strict";

const amqplib = require('amqplib')


/**
 * MQ Connection
 */
class Connection {
  constructor(options) {
    this.defaultOptions = {
      protocol: 'amqp',
      hostname: '192.168.3.203',
      port: '5672',
      username: 'guest',
      password: 'guest'
    }
    //连接参数
    this.configOptions = Object.assign(this.defaultOptions, options)
  }

  async connect() {
    try {
      this.connection = await amqplib.connect(this.configOptions)
    } catch (err) {
      this.msg(err)
    }
  }

  close() {
    if (this.connection)
      this.connection.close()
  }

  showConnection() {
    this.msg(this.connection)
  }

  async getConnection() {
    if(this.connection){
      return this.connection
    }else{
      await this.connect()
      return this.connection
    }
  }

  msg(info) {
    console.log('============ MQ ===========>')
    console.dir(info)
  }
}

module.exports = Connection