/**
 * Created by loumt on 2017/8/23.
 * 爬虫 {源:简书}
 */
'use strict'
var cheerio = require('cheerio');
var async = require('async');
var superagent = require('superagent');
var docService = require('./../../services/ScrapyService');
var logger = require('./../../utils/logger').system();

const NET_TYPE = {
    JianShu: {url:'http://www.jianshu.com',service:docService} //service should have method {createDocSafe}
};

exports.action = (type) => {
    switch (type) {
        case NET_TYPE.JianShu.url:
            return jianShuAction;
            break;
        default:
            logger.info("End~~");
    }
}


/**
 * 处理简书页面
 * @param text
 */
var jianShuAction = (text) => {
    let data = [];

    var $ = cheerio.load(text);
    var titleEles = $('.note-list .title');
    for (let i = 0; i < titleEles.length; i++) {
        let model;
        var titleEle = titleEles[i];
        if (titleEle) {
            let ch = titleEle.children;
            if (Array.isArray(ch) && ch[0]) {
                model = {
                    href: NET_TYPE.JianShu.url + titleEle.attribs.href,
                    target: titleEle.attribs.target,
                    title: typeof ch[0]['data'] == 'string' ? ch[0]['data'] : 'Title'
                };
            }
            async.waterfall([
                (callback)=>{
                    fetchUrl(model.href,callback);
                },
                (text,callback)=>{
                    var $ = cheerio.load(text);
                    model['author'] = $('.author .name').text();
                    model['content'] = $('.show-content').text();
                    callback(null,model);
                },
                (model,callback)=>{
                    NET_TYPE.JianShu.service.createDocSafe(model,callback);
                }
            ],(error,result)=>{
                if(error){
                    logger.error(`爬取失败[message:${error.message}]`);
                    return;
                }
            })
        }
    }
}

//抓取网页
function fetchUrl(url, callback) {
    superagent.get(url)
        .end((error, result) => {
            var html_text = result.text;
            callback(null, html_text);
        });
}

