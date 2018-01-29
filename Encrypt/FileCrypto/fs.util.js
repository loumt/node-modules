const fs = require('fs');
const zlib = require('zlib');
const crypto = require('crypto');
const path = require('path');
const Config = require('./Config');

function geFileList(p) {
    let filesList = [];
    readFile(p, filesList);
    return filesList;
}

function readFile(p, filesList) {
    let files = fs.readdirSync(p);
    files.forEach(walk);

    function walk(file) {
        let filePath = path.join(p, file);

        let states = fs.statSync(filePath);
        if (states.isDirectory()) {
            readFile(filePath, filesList);
        }
        else {
            let model = {
                size: states.size,
                name: file,
                path: filePath
            };
            filesList.push(model);
        }
    }
}

var getFileName = function (p) {
    return path.basename(p);
};

var mkDirSync = function (dirname, mode) {
    fs.mkdirSync(dirname, mode);
}

var exist = function (filepath) {
    return fs.existsSync(filepath);
}

var existAndCreate = function (filepath, mode) {
    if (!exist(filepath))
        mkDirSync(filepath, mode);
}

var getFileContent = function (filePath, cb) {
    fs.readFile(filePath, function (err, buf) {
        cb(err, buf);
    });
};

var writeFileSync = function (filePath, text) {
    fs.writeFileSync(filePath, text);
};

var writeFileAsync = function (filePath, text, cb) {
    fs.writeFile(filePath, text, function (err) {
        cb(err);
    });
};


/********************加密解密部分**************************/

function util() {

}
var prot = util.prototype;

prot.md5 = function (str) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
};

prot.encode = function (content) {
    var cipher = crypto.createCipheriv('aes-128-cbc', Config.CRYPTO_KEY, Config.IV);
    cipher.setAutoPadding(true);
    var bf = [];
    bf.push(cipher.update(content));
    bf.push(cipher.final());
    return Buffer.concat(bf);
};


prot.decode = function (content) {
    var decipher = crypto.createDecipheriv('aes-128-cbc', Config.CRYPTO_KEY, Config.IV);
    decipher.setAutoPadding(true);
    try {
        var a = [];
        a.push(decipher.update(content));
        a.push(decipher.final());
        return Buffer.concat(a);
    } catch (e) {
        console.error('decode error:', e.message);
        return null;
    }
};


/**********************压缩解压缩部分************************/
function gZip(strText, cb) {
    zlib.gzip(strText, function (err, bufData) {
        cb(err, bufData);
    });
}

function unZip(buffer, cb) {
    zlib.unzip(buffer, function (err, buf) {
        cb(err, buf);
    });
}

module.exports = {
    FileUtil: {
        getDirFiles: geFileList,
        getFileName: getFileName,
        writeFileAsync: writeFileAsync,
        writeFileSync: writeFileSync,
        getFileContent: getFileContent,
        mkDirSync: mkDirSync,
        exist: exist
    },

    EncodeUtil: util,

    ZipUtil: {
        gZip: gZip,
        unZip: unZip
    }
};
