module.exports = {
    manualCode: {
        isOpen: false,//是否人工打码
        sourceDir: `${__dirname}/../../data/source/`,//数据源地址
        saveDir: `${__dirname}/../../data/coded/`,//打码数据存储地址
        codedNameFormat: '%time%-%user%-%captcha%',
        weight: {
            code: 1 //打码分值
        },
    },
    manualCheck: {
        isOpen: true,//是否人工验证
        sourceDir: `${__dirname}/../../data/coded/`,//数据源地址
        saveDir: `${__dirname}/../../data/checked/`,//验证数据存储地址
        checkedNameFormat: '%time%-%captcha%',
        weight: {
            check: 1, //检查分值
            false: -5, //打错分值
            foundFalse: 5 //发现错误分值
        }
    },
    captchaPattern: '^[0-9a-zA-Z]{4}$',//验证码检验规则，不验证写undefined
    targetNumber: 1000,//需要打码数量，全部写undefined
};