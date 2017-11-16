const sha256 = require("crypto-js/sha256");

module.exports = async ({session, captcha}) => {
    const {crawler} = session;
    let requestLogin = new Crawler.Request.Post('http://issue.cpic.com.cn/ecar/j_spring_security_check').setFormBody({
        j_username: 'xinyue1',
        j_password: sha256('ABcd1234' + 'xinyue1').toString(),
        verify_code: captcha
    });
    let response = await crawler.ajax(requestLogin);
    if(response.jsonBody.authentication === 'true') {
        return true;
    } else if (response.jsonBody.authentication === 'false' && response.jsonBody.errCode == '3') { //验证码错误
        return false;
    }else{
        throw new Error('error response');
    }
};

