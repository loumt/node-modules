const _ = require('lodash')


let [command, file, ...args] = argv

let result = split(args)
console.log(result)

/**
 * 格式化进程参数
 * @param args --key=value --key2=value2 ....
 * @return {key:value,....}
 */
function split(args) {
  return _.fromPairs(args.map(item => {
    return _.trim(item, '--').split('=')
  }))
}