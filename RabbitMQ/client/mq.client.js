'use strict'
const amqp = require('amqp');
const logger = require('../../../utils/logger').rabbitMq();
const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;

const MQ_CONFIG = require('../configs/example.config');
var customerHandler = require('../handlers/example.handler');

var client = null;

//建立一个缓存机制
var retainTask = [];

class MQClient extends EventEmitter {
    constructor(role = MQ_CONFIG.ROLE_TYPE.PUBLISHER,connConfig = {}) {
        super();
        //连接参数
        this.connectParams = {};
        Object.assign(this.connectParams, MQ_CONFIG.connInfo, connConfig);

        this._exchange = null;
        this._queue = null;

        //role[Customer,Publisher]
        this._role = role;

        //create conn
        this._connection = amqp.createConnection(this.connectParams, {
            reconnect: true,
            defaultExchangeName: MQ_CONFIG.messageInfo.exchange.name
        });
        this._connection.on('error', this.connError.bind(this));
        this._connection.on('connect', this.connReady.bind(this));

        this._connection.on('ready', this.initClient.bind(this));
    }

    connError() {
        this.loggerInfo('Connection Error!!!');
    }
    connReady() {
        this.loggerInfo('Connection Ready!!!');
    }

    initExchange(exc) {
        this._exchange = exc;
        this.loggerInfo('Exchange Init OK')
    }

    initQueue(queue) {
        this._queue = queue;
        this.queueBindExchange(queue);
        if(this._role === MQ_CONFIG.ROLE_TYPE.CUSTOMER){
            this.createCustomer(queue);
        }
        this.loggerInfo('Queue Init OK')
    }
    bindInfo(){
        this.loggerInfo('Queue Bind Exchange OK');
    }

    queueBindExchange(q) {
        q.bind(MQ_CONFIG.messageInfo.exchange.name, MQ_CONFIG.messageInfo.bindKey,this.bindInfo.bind(this));
    }

    createCustomer(q) {
        // Subscribe to the queue
        q.subscribe(customerHandler);
    }

    initClient() {
        //init exchange
        let exchangeConfig = {
            type: MQ_CONFIG.messageInfo.exchange.type,
            autoDelete: false,
            durable: true //durable:服务器重启不影响MQ内消息
        };
        let queueConfig = {
            autoDelete: false,
            durable: true
        };

        this._connection.exchange(MQ_CONFIG.messageInfo.exchange.name, exchangeConfig, this.initExchange.bind(this));
        //init queue
        this._connection.queue(MQ_CONFIG.messageInfo.queueName, queueConfig, this.initQueue.bind(this));

    }

    loggerInfo(msg) {
        logger.info(`[MQ]_${this.connectParams.host} : ${msg}`);
    }

    //send message
    sendMsg(sendData) {
        //validate useful
        if (this._exchange && this._queue) {
            this._exchange.publish(MQ_CONFIG.messageInfo.routingKey, sendData, {exchange: MQ_CONFIG.messageInfo.exchange.name},this.sendReact.bind(this));
        } else {
            retainTask.push(sendData);
        }
    }

    sendReact(isSuccess,error){
        if (isSuccess) {
            this.loggerInfo(`MSG PUBLISHED SUCCESS`);
        } else {
            this.loggerInfo(`MSG PUBLISHED FALSE:${error}`);
        }
    }

    //Close Conn
    disConnection() {
        this._connection.disconnect();
    }

    static  getInstance() {
        //return
        if (client == null) {
            client = new MQClient();
        }
        return client;
    }

    //reset client
    static clear() {
        client.disconnect();
        client = null;
    }
}

module.exports = MQClient;








