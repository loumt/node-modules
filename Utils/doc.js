/**
 * File Operation Util
 */
'use strict'
/**
 @date 2013-5-3 fix copy method bug while indicate filter param.
 **/
var fs = require('fs');
var path = require('path');
var async = require('async');
var util = require('util');
var fse = require('fs-extra');
var docConfig = require('../configure/doc.config');
var logger = require('./../utils/logger').system();
var formidable = require('formidable');
var archiver = require('archiver');

//判断某个对象是否是函数
var isFunction = function (fn) {
    return Object.prototype.toString.call(fn) == '[object Function]';
}

//判断某个对象是否是字符串
var isString = function (fn) {
    return Object.prototype.toString.call(fn) == '[object String]';
}
//B转KB
var b2Kb = function (size) {
    if (size == 0) {
        return 0;
    } else if (size < 1024) {
        return 1;
    } else {
        return (size / 1024).toFixed(2);
        ;
    }
}


//同步拷贝文件
var copyFile = function (src, dest) {
    var len = 64 * 1024;
    var buff = new Buffer(len);
    var fdr = fs.openSync(src, 'r');
    var fdw = fs.openSync(dest, 'w');
    var bytesRead = 1;
    var pos = 0;
    while (bytesRead > 0) {
        bytesRead = fs.readSync(fdr, buff, 0, len, pos);
        fs.writeSync(fdw, buff, 0, bytesRead);
        pos += bytesRead;
    }
    fs.closeSync(fdr);
    fs.closeSync(fdw);
}
/**
 `file-util` module is an easy utility class for file operation

 文件夹权限:mode
 owner = rwx = 4 + 2 + 1 = 7 自身权限
 group = rwx = 4 + 2 + 1 = 7 组权限
 others = — = 0 + 0 + 0 = 0 第三者权限


 @class file-util
 @static
 @example

 var fu = require('file-util');

 fu.exist(file); //是否存在
 fu.copy(file, 'new-path'); //复制到某个新目录
 fu.move(file, 'new-path'); //移动到某个新目录
 fu.rename(file, 'new-name'); 1
 fu.delete(file); //删除文件或文件夹 1

 fu.mkdir(src); //创建目录 1
 fu.touch(my-file-name); //创建文件

 fu.write(my-file-name, data); //写入内容
 fu.append(my-file-name, append_data); //追加内容
 fu.read(my-file-name); //读取内容

 fu.type(my-file-name); //类型

 fu.extname(my-file-name); //文件后缀, 带.
 fu.extname(my-file-name); //文件后缀，不带.

 fu.copy('tmp', 'tmp2'); //复制文件或者文件夹tmp中的文件到目录tmp2
 fu.move('tmp', 'tmp2'); //移动文件或者文件夹tmp中的文件到文件夹tmp2

 fu.each(src, function(item){
      console.log('遍历文件');
    });

 //异步的方式遍历
 var options = {
      sync: false,
      matchFunction: function(itm){
        return item.name.match(/\.css$/i);
      }
    }
 var onComplete = function(){
      console.log('遍历完成');
    }
 fu.each(src, function(item), options, onComplete);
 **/


var fu = {

    /**
     * 文件名上传处理
     */
    abtainFileName:function(fileName,filePath,index){
        let f = fileName.split('.');
        f[f.length-2] = f[f.length-2]+"("+index+")"+".";
        let resultName = f.join('');
        if(fu.exist(path.join(filePath,resultName))){
            return fu.abtainFileName(fileName,filePath,++index);
        }else{
            return resultName;
        }
    },

    /**
     * 获取一个随机文件名(依据时间)
     */
    randomName: function () {
        return new Date().getTime();
    },

    /**
     判断某个或某些文件(夹)是否存在
     @method exist
     @static
     @param {String} f 一个文件(夹)名称
     @return Boolean 文件是否存在
     @example

     fu.isFile('src/app');
     **/
    exist: function (f) {
        return fs.existsSync(f);
    },

    /**
     是否是文件
     @method isFile
     @static
     @param {String} f 文件名称
     @return Boolean 是否是文件
     @example

     fu.isFile('src/app.js');
     **/
    isFile: function (f) {
        return this.exist(f) && fs.statSync(f).isFile();
    },

    /**
     是否是文件夹
     @method isDirectory
     @static
     @param {String} f 文件名称
     @return Boolean 是否是文件夹
     @exmaple

     fu.isFile('src/app');
     **/
    isDirectory: function (f, dir) {
        return this.exist(f) && fs.statSync(f).isDirectory();
    },

    /**
     @method extname
     @static
     @param {String} f 文件名称
     @param {String} (optional) withDot 是否带上.
     @return String 文件后缀
     @example

     console.log(fu.extname('image.jpg')); // jpg

     **/
    extname: function (f, withDot) {
        var extname = path.extname(f);
        if (!withDot && extname && extname.charAt(0) == '.') {
            return extname.substr(1);
        }
        return extname;
    },

    /**
     创建目录
     @method mkdir
     @static
     @param {String|Array} f 一个或多个文件夹
     @param {Number} permission 文件权限
     @example

     fu.mkdir('model');
     fu.mkdir(['view', 'controller']);
     fu.mkdir('mydir', 0775);
     **/
    mkdir: function (f, permission) {
        if (util.isArray(f)) {
            var self = this;
            f.forEach(function (item) {
                self.mkdir(item, permission);
            })
        } else {
            if (!this.exist(f)) {
                fse.mkdirsSync(f);
            }
        }
    },

    /**
     创建文件
     @method touch
     @static
     @param {String|Array} f 一个或多个文件
     @param {int} (optional)[0777] permission 文件权限
     @param {String} (optional) data 文件内容
     @example

     fu.touch('README.md');
     fu.touch('app.js', 0777);
     fu.touch(['view/view.js', 'model/model.js']);
     fu.touch('app.js', 0777, 'window.app = (function(){ return "app" })()');

     **/
    touch: function (f, permission, data) {
        if (util.isArray(f)) {
            var self = this;
            f.forEach(function (item) {
                self.touch(item, permission);
            })
        } else {
            data = data || '';
            this.mkdir(path.dirname(f));
            this.write(f, data);
        }
    },
    /**
     删除文件或文件夹
     @method delete
     @static
     @param {String|Array} f 一个或多个文件或文件夹
     @example

     fu.delete('/var/www/tmp/data/one.txt');
     fu.delete('/var/www/tmp/data/')
     **/
    delete: function (f) {
        if (util.isArray(f)) {
            var self = this;
            f.forEach(function (item) {
                self.delete(item);
            })
        } else {
            if (this.exist(f)) {
                if (this.isDirectory(f)) {
                    fse.removeSync(f);
                } else {
                    fs.unlinkSync(f);
                }
            }
        }
    },


    /**
     * 遍历删除文件
     * @param path
     */
    deleteall: function (path) {
        var files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach(function (file, index) {
                var curPath = path + "/" + file;
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    fu.deleteall(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    },


    /**
     读取文件内容
     @method read
     @static
     @param {String} f 文件名
     @param {String} (optional) encoding 编码，默认`utf-8`
     @example

     console.log(fu.read('README.md'));

     **/
    read: function (f, encoding) {
        return fs.readFileSync(f, encoding || 'utf-8');
    },

    /**
     写入内容到文件
     @method read
     @static
     @param {String} f 文件名
     @param {String} data 文件内容
     @param {String} (optional) encoding 编码，默认`utf-8`
     @example

     console.log(fu.write('README.md'), data);

     **/
    write: function (f, data, encoding) {
        return fs.writeFileSync(f, data, encoding || 'utf-8');
    },

    /**
     追加内容到文件
     @method append
     @static
     @param {String} f 文件名
     @param {String} data 文件内容
     @param {String} (optional) encoding 编码，默认`utf-8`
     @example

     console.log(fu.append('README.md'), data);

     **/
    append: function (f, data, encoding) {
        return fs.appendFileSync(f, data, encoding);
    },
    /**
     更改名称
     @method rename
     @static
     @param {String|Array} name 文件名
     @param {String} (optional) newName 新的文件名
     @example

     fu.rename('app.js', 'app_bak.js');
     fu.rename('app.js', '/usr/local/bak/app.js');

     **/
    rename: function (name, newName) {
        this.mkdir(path.dirname(newName));
        fs.renameSync(name, newName);
    },

    /**
     * 获取文件状态
     * @param f 文件名
     * @param callback
     */
    stateSync: function (f) {
        return fs.statSync(f);
    },


    /**
     移动文件或文件夹中的文件到新的目录
     @method move
     @static
     @param {String|Array} f 一个或多个文件
     @param {String} target 目标文件目录
     @param {String} (optional) filter_or_newName 过滤正则或者过滤函数或者新名称
     @example

     //移动js文件
     fu.move(fu.list(src), targetDir, /\.js$/i);
     fu.move(fu.list(src), targetDir, function(f){
        return f.match(/\.js$/i);
      });

     //移动并且改名
     fu.move('src/app.js', 'dest', 'app-min.js');

     **/
    move: function (f, target, filter_or_newName) {
        var self = this;
        var isValid = function (item) {
            if (self.isDirectory(item)) {
                return true;
            }
            if (filter_or_newName) {
                if (util.isRegExp(filter_or_newName)) {
                    return filter_or_newName.test(item);
                } else if (isFunction(filter_or_newName)) {
                    return filter_or_newName(item);
                }
            }
            return true;
        }
        if (util.isArray(f)) {
            f.forEach(function (item) {
                self.move(item, target);
            });
        } else {
            var name;
            if (!isValid(f)) {
                return;
            }
            if (filter_or_newName && isString(filter_or_newName)) {
                name = filter_or_newName;
                filter_or_newName = null;
            } else {
                name = path.basename(f);
            }
            var newName = path.normalize(target + path.sep + name);

            try {
                //如果是文件
                if (this.isFile(f)) {
                    this.rename(f, newName);
                }
                //如果没有过滤参数
                if (!filter_or_newName) {
                    return this.rename(f, target);
                }

                //可能有过滤，被过滤掉的文件不能被移动
                var deleteList = [];
                this.each(f, function (item) {
                    var dir, t;
                    if (item.directory) {
                        dir = path.relative(f, item.name);
                        t = path.normalize(target + path.sep + dir);
                        self.mkdir(t);
                        deleteList.push(item.name);
                    } else {
                        dir = path.dirname(path.relative(f, item.name))
                        t = path.normalize(target + path.sep + dir);
                        self.move(item.name, t, filter_or_newName);
                    }
                }, {
                    matchFunction: function (item) {
                        return isValid(item.name);
                    }
                });

                deleteList.forEach(function (item) {
                    self.delete(item);
                });
                self.delete(f);

            } catch (err) {
                if (this.isFile(f)) {
                    this.copy(f, target, filter_or_newName);
                    this.delete(f);
                } else if (this.isDirectory(f)) {
                    this.copy(f, target, filter_or_newName);
                    this.delete(f);
                }
            }
        }
    },

    /**
     复制文件或文件夹中的文件到新的目录
     @method copy
     @static
     @param {String|Array} f 一个或多个文件
     @param {String} target 目标文件目录
     @param {String} (optional) filter_or_newName 过滤正则或者过滤函数或者新名称
     @example

     //拷贝js文件
     fu.copy(fu.list(src), targetDir, /\.js$/i);
     fu.copy(fu.list(src), targetDir, function(f){
        return f.match(/\.js$/i);
      });

     //拷贝并且改名
     fu.copy('src/app.js', 'dest', 'app-min.js');
     **/
    copy: function (f, target, filter_or_newName) {
        var self = this;
        var isValid = function (item) {
            if (self.isDirectory(item)) {
                return true;
            }
            if (filter_or_newName) {
                if (util.isRegExp(filter_or_newName)) {
                    return filter_or_newName.test(item);
                } else if (isFunction(filter_or_newName)) {
                    return filter_or_newName(item);
                }
            }
            return true;
        }
        if (util.isArray(f)) {
            f.forEach(function (item) {
                self.copy(item, dir);
            });
        } else {
            var name;
            if (!isValid(f)) {
                return;
            }
            if (filter_or_newName && isString(filter_or_newName)) {
                name = filter_or_newName;
                filter_or_newName = null;
            } else {
                name = path.basename(f);
            }

            var newName = path.normalize(target + path.sep + name);

            if (this.isFile(f)) {
                this.mkdir(path.dirname(newName));
                copyFile(f, newName);
            } else if (this.isDirectory(f)) {
                this.each(f, function (item) {
                    var dir, t;
                    if (!item.directory) {
                        dir = path.dirname(path.relative(f, item.name))
                        t = path.normalize(target + path.sep + dir);
                        self.copy(item.name, t, filter_or_newName);
                    }
                });
            }
        }
    },


    /**
     遍历目录下的文件和文件夹

     @method each
     @static
     @param {String} dir 目录
     @param {Function} callback 遍历时的回调函数
     @param {Object} options 过滤参数
     @param {Boolean} options.recursive 是否遍历子文件夹，默认true
     @param {Boolean} options.excludeFile 是否屏蔽文件
     @param {Boolean} options.excludeDirectory 是否屏蔽文件夹
     @param {Boolean} options.sync 是否异步，默认同步
     @param {Function} options.matchFunction 匹配函数
     @param {Function} (optional) onComplete 完成文件遍历的回调函数
     @example

     fu.each('src', function(item){
        console.log(item.filename);
      }, {
        excludeDirectory: true,
        matchFunction: function(item){
          return item.filename.match(/\.js$/i);
        }
      });

     //以异步方式调用
     fu.each('src', function(item){
        console.log(item.filename);
      }, { sync: false}, function(){
        console.log('读取完毕')
      });

     **/
    each: function (dir, callback, options, onComplete) {
        options = options || {};
        dir = dir.replace(/(\/+)$/, '');

        var self = this;
        var sync = options.sync != undefined ? options.sync : true;
        var excludeFile = options.excludeFile;
        var excludeDirectory = options.excludeDirectory;
        var matchFunction = options.matchFunction;
        var breakFunction = options.breakFunction;
        var preventRecursiveFunction = options.preventRecursiveFunction;
        var recursive = true;
        var checkCount = 0;
        var p, i, l;

        var onFinished = function () {
            if (checkCount <= 0 && onComplete) {
                onComplete();
            }
        }

        if (options.recursive === false) {
            recursive = false;
        }

        if (!this.isDirectory(dir)) {
            onFinished();
            return [];
        }

        var handleItem = function (filename) {
            var name = dir + path.sep + filename;
            var isDir = self.isDirectory(name);
            var stat = self.stateSync(name);
            //大小
            var info = {
                directory: isDir,
                path: name,
                filename: filename,
                birthTime: stat.birthtime,
                modifyTime: stat.mtime,
                size: stat.size
            };

            if (isDir) {
                if (recursive) {
                    if (!preventRecursiveFunction || !preventRecursiveFunction(info)) {
                        checkCount++;
                        self.each(name, callback, options, function () {
                            checkCount--;
                            onFinished();
                        });
                    }
                }

                if (!excludeDirectory) {
                    if (!matchFunction || (matchFunction && matchFunction(info))) {
                        callback(info);
                    }
                }
            } else if (self.isFile(name)) {
                if (!excludeFile) {
                    if (!matchFunction || (matchFunction && matchFunction(info))) {
                        callback(info);
                    }
                }
            }
            checkCount--;
            onFinished();
        }
        if (sync) {
            p = fs.readdirSync(dir);
            p.forEach(handleItem);
            checkCount = 0;
            onFinished();
        } else {
            fs.readdir(dir, function (e, arr) {
                if (e) {
                    onFinished();
                } else {
                    checkCount = arr.length;
                    onFinished();
                    arr.forEach(function (item) {
                        handleItem(item);
                    });

                }
            });
        }
    },

    /**
     列出目录下的文件和文件夹

     @method list
     @static
     @param {String} dir 目录
     @param {Object} options 过滤参数
     @param {Boolean} options.recursive 是否遍历子文件夹，默认true
     @param {Boolean} options.excludeFile 是否屏蔽文件
     @param {Boolean} options.excludeDirectory 是否屏蔽文件夹
     @param {Function} options.breakFunction 终止函数
     @param {Function} options.matchFunction 匹配函数
     @param {Boolean} fullView 是否返回更完整的文件信息
     @return Array 文件和文件夹信息
     @example

     //列出所有js文件
     var list = fu.list('src', {
        excludeDirectory: true,
        matchFunction: function(item){
          return item.filename.match(/\.js$/i);
        }
      }); //list = ['a.js', 'b/c.js', ...]

     //列出所有js文件，包含完整信息
     var list = fu.list('src', {
        excludeDirectory: true,
        matchFunction: function(item){
          return item.filename.match(/\.js$/i);
        }
      }, true);

     //list = [{filename: 'a.js', name: 'a.js', directory: false},
     //  {filename: 'c.js', name: 'b/c.js', directory: false},
     //  ...]
     **/
    list: function (dir, options, fullView) {
        var result = [];
        options = options || {};
        options.sync = true;
        this.each(dir, function (item) {
            if (fullView) {
                result.push(item);
            } else {
                result.push(item.name);
            }
        }, options);
        return result;
    },


    /**
     * 遍历目录结构树
     * auth:loumt
     * @param dir
     * @param name
     * @returns {Array}
     */
    catalog: function (dir, name) {
        var children = [];
        fs.readdirSync(dir).forEach(function (filename) {
            var p = dir + "/" + filename;
            var stat = fs.statSync(p);

            if (stat && stat.isDirectory()) {
                let pp = fileUrl.docPathDiscard(path.normalize(p), name);
                children.push({name: filename, path: pp, sub: fu.catalog(p, name)});
                // children = children.concat(fu.catalog(p,name));
            }
        });
        return children;
    },

    /**
     * 文件移动
     * auth:loumt
     * @param originalPath {源路径}
     * @param target {目标路径}
     */
    fileMove: function (originalPath, target) {
        this.move(originalPath, target, path.basename(originalPath));
    },
    /**
     * 文件夹移动
     * auth:loumt
     * @param originalPath
     * @param target
     */
    dirMove: function (originalPath, target) {
        let newName = path.join(target, path.basename(originalPath));
        if (this.exist(newName)) {
            newName = path.join(target, this.randomName());
        }
        this.rename(originalPath, newName);
    },
    /**
     * 文件的移动(多个)
     */
    docMove: function (pathArr, target, callback) {
        var self = this;
        if (!pathArr || pathArr.length == 0) {
            callback('文件路径不存在');
            return;
        }
        pathArr.forEach((item) => {
            if (self.isDirectory(item)) {
                self.dirMove(item, target);
            } else {
                self.fileMove(item, target);
            }
        });

        callback(null, '移动完成');
    }
};

/**
 * Http处理File工具
 * @type {{}}
 */
var file2Http = {

    /**
     * 文件上传
     * formidable {只支持multipart/form-data数据}
     * @param req
     * @param folderPath 每个用户拥有对应自身的总目录文件
     * @param callback
     */
    upload: function (req, callback) {
        let name = req.session.user.name;
        // let curPath = fileUrl.docPathJoin("1111", name);

        var fileModel = {};
        //创建上传表单
        var form = new formidable.IncomingForm();
        //设置编辑
        form.encoding = 'utf-8';
        //设置上传目录
        // form.uploadDir = curPath;
        form.uploadDir = fileUrl.getRootPath(name);
        //保留后缀(不可更改)
        form.keepExtensions = true;
        //文件大小
        form.maxFieldsSize = docConfig.maxSize;

        form.parse(req, (err, fields, files) => {
            if (err) {
                callback(err);
                return;
            }
            //获取文件名
            var fileName = files.resource.name;
            // var nameArray = fileName.split('.');
            //获取文件类型
            // var fileType = nameArray[nameArray.length - 1];

            //文件存储路径
            var fileCur = fileUrl.formatter(fields.curPath);
            var basePath = path.join(form.uploadDir, fileCur);
            var newPath = path.join(basePath, fileName);

            if(fu.exist(newPath)){
                let newFileName = fu.abtainFileName(fileName,basePath,1);
                newPath = path.join(basePath, newFileName);
            }

            var p = files.resource.path;
            //旧文件路径不存在
            if(!fu.exist(p)){
                logger.error('File Path:'+p+" 路径不存在,可能是文件出现了同一时间多次上传");
                callback(new Error('文件路径不存在'));
                return;
            }

            fu.rename(p, newPath);

            fileModel.fileName = fileName;
            fileModel.path = newPath;
            fileModel.success = true;
            fileModel.message = "文件[" + fileName + "]上传成功";
            fileModel.originalPath = path;
            callback(null, fileModel);
        });
    },

    /**
     * 文件夹下载，流传递
     * @param p 路径
     * @param fileName 文件名
     * @param isDir 是否为文件夹
     * @param res
     */
    downloadFolderZip: (p, fileName, res) => {
        try {
            var archive = archiver('zip', docConfig.zipConfig);
            archive.on('warning', function (err) {
                if (err.code === 'ENOENT') {
                    logger.warn("docZip Utils err.code=" + err.code);
                } else {
                    logger.error("文件夹下载出错" + err);
                }
            });
            archive.on('error', function (err) {
                logger.error("文件夹下载出错" + err);

            });
            archive.pipe(res);
            archive.directory(p, fileName);
            archive.finalize();
        } catch (e) {
            logger.error('压缩文件夹失败' + e);
            res.status(200).json({success: false, message: "下载失败"});
        }
    },
    /**
     * 文件夹压缩
     * @param req
     * @param callback
     */
    docZip: (p, isDir, callback) => {
        var output = fs.createWriteStream(p + ".zip");
        var archive = archiver('zip', docConfig.zipConfig);
        output.on('close', function () {
            logger.info(archive.pointer() + ' total bytes');
        });
        archive.on('warning', function (err) {
            if (err.code === 'ENOENT') {
                logger.warn("docZip Utils err.code=" + err.code);
            } else {
                callback(err);
            }
        });
        archive.on('error', function (err) {
            callback(err);
        });
        archive.pipe(output);
        //false:当前目录下的文件压缩
        if (isDir) {
            logger.info('文件夹的压缩:' + p);
            archive.directory(p, false);
        } else {
            logger.info('文件的压缩:' + p);
            archive.append(fs.createReadStream(p), {name: path.basename(p)});
        }
        archive.finalize();
        callback(null, "已压缩成zip压缩包");
    }
}

var DATA_ROOT = docConfig.rootPath || path.dirname('.');

var fileUrl = {
    filePath: function (relPath, decodeURI) {
        if (decodeURI) relPath = decodeURIComponent(relPath);
        if (relPath.indexOf('..') >= 0) {
            var e = new Error('Do Not Contain .. in relPath!');
            e.status = 400;
            throw e;
        }
        else {
            return path.join(DATA_ROOT, relPath);
        }
    },
    /**
     * 计算相对路径
     * @param p
     * @param rootPath
     * @param name
     */
    docPathDiscard: function (p, name) {
        var normalPath = path.normalize(p);
        var root = path.join(docConfig.rootPath, name);
        var relativePath = path.relative(root, normalPath);
        return relativePath;
    },

    /**
     * 合并路径 3333 => {rootPath}/{name}/3333
     * @param p
     * @param rootPath
     * @param name
     * @returns {string}
     */
    docPathJoin: function (p, name) {
        var normalPath = path.normalize(this.formatter(p));
        return path.join(docConfig.rootPath, name, normalPath);
    },
    /**
     * 获取用户根目录
     * @param name
     * @returns {string}
     */
    getRootPath: function (name) {
        return path.join(docConfig.rootPath, name);
    },
    //文件路径格式化
    formatter:function(path){
        if(path.indexOf('\\')=== -1){
            return path;
        }else{
            return path.split('\\').join('/');
        }
    },
}

module.exports = {fu, file2Http, fileUrl};