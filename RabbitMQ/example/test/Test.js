
const TestChannel = require('./../TestChannel')

async function test1(){
  let test = new TestChannel();
  await test.initChannel();
  test.showChannelInfo()
  setTimeout(()=>{
    test.close()
  },2000)
}
test1()