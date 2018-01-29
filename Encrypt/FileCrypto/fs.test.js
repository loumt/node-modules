const utils = require('./fs.util');
const async = require('async');
const path = require('path');
const Config = require('./Config');

const encodeUtil = new utils.EncodeUtil();
const FileUtils = utils.FileUtil;
const ZipUtil = utils.ZipUtil;


/**
 * 文件夹加密解密
 * 测试文件：txt json png mp3
 * 优化md5值判断文件完整性
 */


const fileDirContants = {
    //加密文件位置
    input: Config.INPUT_FILES,
    //输出文件位置(加密后)
    output: Config.EN_OUT_PUT_FILES,
    //输出文件位置(解密后)
    reply: Config.DE_PUT_FILES,
}


function zipEncode() {
    var fileList = FileUtils.getDirFiles(fileDirContants.input);

    // console.log('---------File List---------');
    // console.dir(fileList);
    // console.log('------------------');


    async.each(fileList, function (item, callback) {
        var filepath = item.path;
        FileUtils.getFileContent(filepath, function (err, buf) {
            if (!err) {
                var bpstr = new Buffer(buf);
                ZipUtil.gZip(bpstr, function (err, bufData) {
                    let encodeBuffer = encodeUtil.encode(bufData);
                    let relativePath = path.relative(fileDirContants.input, filepath);
                    let resultPath = path.join(fileDirContants.output, relativePath);

                    let outDir = path.dirname(resultPath);

                    if (!FileUtils.exist(outDir))
                        FileUtils.mkDirSync(outDir);

                    FileUtils.writeFileSync(resultPath, encodeBuffer);
                    callback();
                });
            } else {
                callback(err);
            }
        });
    }, function (err) {
        if (err) {
            console.log("decodeUnzip err :", err);
        } else {
            console.log(" -------- Zip Encode Success --------- ");
        }
    });
}

function decodeUnzip() {
    var fileList = FileUtils.getDirFiles(fileDirContants.output);
    async.each(fileList, function (item, callback) {
        var filepath = item.path;
        FileUtils.getFileContent(filepath, function (err, buf) {
            if (!err) {
                var bpstr = new Buffer(buf);
                var decodeBuffer = encodeUtil.decode(bpstr);
                ZipUtil.unZip(decodeBuffer, function (err, buf) {

                    let relativePath = path.relative(fileDirContants.output, filepath);
                    let resultPath = path.join(fileDirContants.reply, relativePath);
                    let dirName = path.dirname(resultPath);

                    if (FileUtils.exist(dirName)) {
                        FileUtils.writeFileSync(resultPath, buf);
                    } else {
                        FileUtils.mkDirSync(dirName);
                        FileUtils.writeFileSync(resultPath, buf);
                    }
                    callback(err);
                });
            } else {
                callback();
            }
        });
    }, function (err, resp) {
        if (err) {
            console.log("decodeUnzip err :", err);
        } else {
            console.log(" ------------ decodeUnzip success ------------ ");
        }
    });
}


zipEncode();
// decodeUnzip();


// let files = FileUtils.getDirFiles(fileDirContants.input);
// files.forEach((item)=>{
//     console.log('-------------');
//     console.log(item.path);
//     console.log(fileDirContants.input);
//     console.log(path.relative(fileDirContants.input,item.path));
//     console.log('-------------');
// });