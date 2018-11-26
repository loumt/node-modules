const path = require('path')
const fs = require('fs')
const util = require('util')
const _ = require('lodash')

class FsUtil {

  /**
   * 是否存在
   * @param f
   * @returns {boolean}
   */
  static exist(f) {
    return fs.existsSync(f)
  }


  static isFunction(fn) {
    return Object.prototype.toString.call(fn) == '[object Function]'
  }

  static isString(fn) {
    return Object.prototype.toString.call(fn) == '[object String]'
  }

  /**
   * 创建目录
   * @param f
   * @param permission
   */
  static mkdir(f, permission) {
    if (util.isArray(f)) {
      f.forEach(function (item) {
        FsUtil.mkdir(item, permission)
      })
    } else {
      if (!FsUtil.exist(f)) {
        fs.mkdirSync(f)
      }
    }
  }


  /**
   * 获取文件状态
   * @param f 文件名
   * @param callback
   */
  static stateSync(f) {
    return fs.statSync(f)
  }

  /**
   * 是否是文件夹
   * @param f
   * @returns {boolean}
   */
  static isDirectory(f) {
    return FsUtil.exist(f) && fs.statSync(f).isDirectory()
  }

  /**
   * 列出目录下的文件和文件夹
   */
  static list(dir, options, fullView) {
    var result = []
    options = options || {}
    options.sync = true
    FsUtil.each(dir, function (item) {
      if (fullView) {
        result.push(item)
      } else {
        result.push(item.name)
      }
    }, options)
    return result
  }

  /**
   * 是否是文件
   * @param f
   * @returns {boolean}
   */
  static isFile(f) {
    return FsUtil.exist(f) && fs.statSync(f).isFile()
  }

  static copyFile(src, dest) {
    var len = 64 * 1024
    var buff = new Buffer(len)
    var fdr = fs.openSync(src, 'r')
    var fdw = fs.openSync(dest, 'w')
    var bytesRead = 1
    var pos = 0
    while (bytesRead > 0) {
      bytesRead = fs.readSync(fdr, buff, 0, len, pos)
      fs.writeSync(fdw, buff, 0, bytesRead)
      pos += bytesRead
    }
    fs.closeSync(fdr)
    fs.closeSync(fdw)
  }


  /**
   * 获取某个文件在指定文件夹中不冲突的文件名/文件夹名
   * @param options
   * @param options.source <String> 文件全路径
   * @param options.index <Integer> 文件序号
   * @param options.isFile <Boolean> 是否是文件
   * @param options.returnFilePath <String> 返回路径或者文件名,默认文件名
   * @return {*}
   */
  static abtainIterationName(options) {
    let defaultOptions = {
      isFile: false,
      index: 1,
      returnFilePath: false
    }

    let allOptions = _.assign(defaultOptions,options)

    if(!options || !allOptions.source || allOptions.isFile === undefined){
      return ''
    }

    if(!FsUtil.exist(allOptions.source)){
      return allOptions.returnFilePath ?  allOptions.source : path.basename(allOptions.source)
    }

    let resultName
    let fileName = path.basename(allOptions.source)
    let folderName = path.dirname(allOptions.source)

    if (allOptions.isFile) {
      let fileParts = fileName.split('.')

      if (fileParts.length === 1) {
        resultName = fileParts[0] + '(' + allOptions.index + ')'
      } else {
        fileParts.splice(fileParts.length - 2, 1, fileParts[fileParts.length - 2] + '(' + allOptions.index + ')')
        resultName = fileParts.join('.')
      }
    } else {
      resultName = fileName + '(' + allOptions.index + ')'
    }

    if (FsUtil.exist(path.join(folderName, resultName))) {
      return FsUtil.abtainIterationName({
        source: allOptions.source,
        isFile: allOptions.isFile,
        index: ++ allOptions.index,
        returnFilePath: allOptions.returnFilePath
      })
    }else{
      return allOptions.returnFilePath ?  path.join(folderName, resultName) : resultName
    }
  }

  static each(dir, callback, options, onComplete) {
    options = options || {}
    dir = dir.replace(/(\/+)$/, '')

    var sync = options.sync != undefined ? options.sync : true
    var excludeFile = options.excludeFile
    var excludeDirectory = options.excludeDirectory
    var matchFunction = options.matchFunction
    var breakFunction = options.breakFunction
    var preventRecursiveFunction = options.preventRecursiveFunction
    var recursive = true
    var checkCount = 0
    var p, i, l

    var onFinished = function () {
      if (checkCount <= 0 && onComplete) {
        onComplete()
      }
    }

    if (options.recursive === false) {
      recursive = false
    }

    if (!FsUtil.isDirectory(dir)) {
      onFinished()
      return []
    }

    var handleItem = function (filename) {
      var name = dir + path.sep + filename
      var isDir = FsUtil.isDirectory(name)
      var stat = FsUtil.stateSync(name)
      //大小
      var info = {
        directory: isDir,
        path: name,
        filename: filename,
        birthTime: stat.birthtime,
        modifyTime: stat.mtime,
        size: stat.size
      }

      if (isDir) {
        if (recursive) {
          if (!preventRecursiveFunction || !preventRecursiveFunction(info)) {
            checkCount++
            FsUtil.each(name, callback, options, function () {
              checkCount--
              onFinished()
            })
          }
        }

        if (!excludeDirectory) {
          if (!matchFunction || (matchFunction && matchFunction(info))) {
            callback(info)
          }
        }
      } else if (FsUtil.isFile(name)) {
        if (!excludeFile) {
          if (!matchFunction || (matchFunction && matchFunction(info))) {
            callback(info)
          }
        }
      }
      checkCount--
      onFinished()
    }
    if (sync) {
      p = fs.readdirSync(dir)
      p.forEach(handleItem)
      checkCount = 0
      onFinished()
    } else {
      fs.readdir(dir, function (e, arr) {
        if (e) {
          onFinished()
        } else {
          checkCount = arr.length
          onFinished()
          arr.forEach(function (item) {
            handleItem(item)
          })

        }
      })
    }
  }


  static copy(f, target, filter_or_newName) {
    console.log(arguments)
    var isValid = function (item) {
      if (FsUtil.isDirectory(item)) {
        return true
      }
      if (filter_or_newName) {
        if (util.isRegExp(filter_or_newName)) {
          return filter_or_newName.test(item)
        } else if (FsUtil.isFunction(filter_or_newName)) {
          return filter_or_newName(item)
        }
      }
      return true
    }
    if (util.isArray(f)) {
      f.forEach(function (item) {
        FsUtil.copy(item, target, filter_or_newName)
      })
    } else {
      var name
      if (!isValid(f)) {
        return
      }
      if (filter_or_newName && FsUtil.isString(filter_or_newName)) {
        name = filter_or_newName
        filter_or_newName = null
      } else {
        name = path.basename(f)
      }
      var newName = path.normalize(target + path.sep + name)
      if (FsUtil.isFile(f)) {
        FsUtil.mkdir(path.dirname(newName))
        FsUtil.copyFile(f, newName)
      } else if (FsUtil.isDirectory(f)) {
        FsUtil.mkdir(newName)
        let f_l = FsUtil.list(f, {sync: true, recursive: false}, true)
        f_l.forEach(item => {
          if (item.directory) {
            FsUtil.copy(item.path, newName, filter_or_newName)
          } else {
            FsUtil.copy(item.path, newName, filter_or_newName)
          }
        })
      }
    }
  }
}

// let fileModel = {
//   source: 'F:\\mnt\\loumt\\1.txt',
//   isFile: true,
//   returnFilePath:false
// }
// let folderModel = {
//   source: 'F:\\mnt\\loumt\\1',
//   isFile: false,
//   returnFilePath:true
// }
//
// console.log(FsUtil.abtainIterationName(fileModel))
