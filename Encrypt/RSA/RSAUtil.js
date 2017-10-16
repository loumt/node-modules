// 1.const RSAUtil = require('./../utils/RSAUtil').install();
// 2.encryption加密
// 3.decryption解密
// ps:需要文件rsa_private_key.pem和rsa_public_key.pem

const crypto  = require('crypto');
const fs = require('fs');

var configDefault = {
    _algorithm:'RSA-SHA256',
    _output_format:'hex',
    _privateKey:'./modules/Encrypt/RSA/keys/rsa_private_key.pem',
    _publicKey:'./modules/Encrypt/RSA/keys/rsa_public_key.pem',
    _encoding:'hex'
};

//单例对象
var _instance = null;

class RSAUtil{

    constructor(preConfig = configDefault){
        //RSA加解密Config
        this.config = {};
        Object.assign(this.config,preConfig);

    }

    //init&get&default_config
    static install(){
        if(!_instance){
            _instance = new RSAUtil();
        }
        return _instance;
    }

    //init&get&own_config
    static installWithConfig(config){
        if(!_instance){
            _instance = new RSAUtil(config);
        }
        return _instance;
    }


    getSign(){
        return  crypto.createSign(this.config._algorithm);
    }

    getVerify(){
        return crypto.createVerify(this.config._algorithm);
    }

    getPrivateKey(){
        return fs.readFileSync(this.config._privateKey).toString();
    }

    getPublicKey(){
        return fs.readFileSync(this.config._publicKey).toString();
    }

    buf2string(buf){
        return buf.toString(this.config._output_format);
    }

    string2buf(str){
        return Buffer.from(str,this.config._output_format);
    }

    /**
     * 数据加密
     * @param data
     * @returns {string}
     */
    encryption(data){
        let publicKey = this.getPublicKey();
        let buf = new Buffer(data);
        let resultBuf =  crypto.publicEncrypt({key:publicKey},buf);
        return this.buf2string(resultBuf);
    }

    /**
     * 数据解密
     * @param data
     * @returns {string}
     */
    decryption(data){
        let privateKey = this.getPrivateKey();
        let buf = new Buffer(data,this.config._output_format);
        let resultBuf =  crypto.privateDecrypt({key:privateKey},buf);
        return resultBuf.toString();
    }

}

module.exports = RSAUtil;
