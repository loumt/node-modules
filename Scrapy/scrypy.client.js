'use strict'
var superagent = require('superagent');
var url = require('url');
var path = require('path');
var logger = require('./../../utils/logger').system();
var async = require('async');
var scrapyHandler = require('./../Scrapy/scrapy.handler');
const cheerio = require('cheerio');

const max_url_lenth = 50;

var default_options = {
    delay: 5000,
    limit: 5
};

class ThroughNet {

    constructor(rootUrl) {
        this._urls = [rootUrl];
        this._rootPath = [rootUrl];
        this._handler = scrapyHandler.action(rootUrl);
    }

    addUrl(url) {
        if (this._urls.length == max_url_lenth) {
            logger.info('urls length 已满');
            return;
        }
        this._urls.push(url);
    }

    getUrls() {
        return this._urls;
    }

    isUrlsEmpty() {
        return this._urls.length == 0;
    }

    getUrl() {
        if (!this.isUrlsEmpty()) {
            return this._urls.pop();
        } else {
            return "";
        }
    }

    fetchUrl(url, callback) {
        superagent.get(url)
            .end((error, result) => {
                var html_text = result.text;
                callback(null, html_text);
            });
    }

    run(options, callback) {
        //配置相关
        if (!options) {
            options = default_options;
        }

        var delayTimes = options.delay || default_options.delay;
        var limit = options.limit || default_options.limit;

        this.startTask(this._urls, delayTimes, limit);
        callback(null, 'Starting......')
    }

    startTask(urls, delay, limit) {
        async.mapLimit(urls, limit, (url) => {

            async.waterfall([
                (callback) => {
                    this.fetchUrl(url, callback);
                },
                (result, callback) => {
                    try{
                        this._handler(result);
                    }catch(error){
                        callback(error,'OK');
                    }
                }
            ], (error, result) => {
                if (error) {
                    console.error("爬取失败:" + error);
                    return;
                }
                console.log(result);
            });

        }), (err) => {
            console.error("爬取失败:" + err);
        }
    }
}



module.exports = ThroughNet;