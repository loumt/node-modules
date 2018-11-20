"use strict";


const Connection =  require('./Connection')
const config = require('./../configure/RabbitMQ').connection
/**
 * RabbitMQ Handler Center
 */
class ConnectionHandler{

  constructor(myConfig){
    this.connection = null
    this.config = myConfig
  }

  async getConnection(){
    if(this.connection){
      return this.connection
    }else{
      let connectionModel = this.connectionModel =  new Connection(this.config)
      this.connection =  await connectionModel.getConnection()
      return this.connection
    }
  }

  async exit(){
    await this.connectionModel.close()
  }

}

module.exports = new ConnectionHandler(config)