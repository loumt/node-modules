module.exports =  {
    connInfo: {
        host: "192.168.3.17",
        port: 5672,
        login: 'guest',
        password: 'guest'
    },
    messageInfo: {
        routingKey: 'test.routing.key',
        bindKey: 'test.routing.key',
        exchange: {
            type: 'topic',
            name: 'test.amqp.exchange'
        },
        queueName: 'test.amqp.queue'
    },
    ROLE_TYPE:{
        PUBLISHER:0,
        CUSTOMER:1
    }
}