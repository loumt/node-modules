'use strict'
var schedule = require('node-schedule');
var logger = require('./../../utils/logger').system();
var ScrapyClient = require('./../Scrapy/scrypy.client');

// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    |
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)

// var job1 = new schedule.scheduleJob('5 * * * * *',function(){
//     console.log('每分钟的第五秒运行一次.....');
// });

// var job2 = new schedule.scheduleJob('*/1 * * * *',function(){
//     console.log('每1分钟运行一次.....');
// });

// var rule3 = new schedule.RecurrenceRule();
// rule3.minute = 3;
// var job3 = schedule.scheduleJob(rule3, function(){
//     console.log('每小时的第三分钟跑一次...');
// });

// let startTime = new Date(Date.now() + 5000);
// let endTime = new Date(startTime.getTime() + 5000);
// var job4 = schedule.scheduleJob({ start: startTime, end: endTime, rule: '*/1 * * * * *' }, function(){
//     console.log('start - end 时间段里每1秒钟运行一次');
// });

var scrapyRule = new schedule.RecurrenceRule();

scrapyRule.hour = 1;

var scrypySchedule = schedule.scheduleJob(scrapyRule, function () {

    logger.info('----' + new Date() + '-----start scrapy task --------------');

    let client = new ScrapyClient('http://www.jianshu.com');
    client.run({}, (error, message) => {
        console.log(message);
    });
});


module.exports = scrypySchedule;