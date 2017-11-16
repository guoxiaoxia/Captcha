const Crawler = require('webagent');
const fs = require('fs-extra');
const sha256 = require("crypto-js/sha256");
const Definition = require('../component/definition/index');
const solver = require('../../identification/captcha_solver');

(async (num=4000) => {
    try{
        for(let i=0; i<num; ++i) {
            let crawler = new Crawler();
            await startup(crawler);
            let picture = await getCaptcha(crawler);
            let captcha = await solver({picture: picture, name:'taibao'});
            if (await checkCaptcha(crawler, captcha)){
                // await saveChecked(picture, captcha);
            }else{
                await saveFalse(picture,captcha);
            }
            console.log(i);
        }
        if (num%200 == 0){
            setInterval(()=> {}, 5000);
        }
    }catch (err){
        console.error(err);
    }
})();

async function startup(crawler) {
    let startUpRequest = new Crawler.Request.Get('http://issue.cpic.com.cn/ecar/view/portal/page/common/login.html');
    await crawler.go(startUpRequest);
}

async function getCaptcha(crawler) {
    let getCaptchaRequest = new Crawler.Request.Get('http://issue.cpic.com.cn/ecar/auth/getCaptchaImage');
    return (await crawler.ajax(getCaptchaRequest)).body;
}

async function checkCaptcha(crawler, captcha) {
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
    }
}

async function saveChecked(picture, captcha) {
    let checkedDir = `${__dirname}/../../../data/taibao/checked/`;
    let checkedFileName = Definition.common.checkedFileNameFormat.replace(/%time%/,new Date().getTime()).replace(/%captcha%/,captcha.toUpperCase());
    fs.ensureDirSync(checkedDir);
    fs.writeFileSync(`${checkedDir}/${checkedFileName}.jpg`, picture);
}

async function saveFalse(picture, captcha) {
    let falsedDir = `${__dirname}/../../../data/taibao/machineFalse/`;
    let falseFileName = Definition.common.checkedFileNameFormat.replace(/%time%/,new Date().getTime()).replace(/%captcha%/,captcha.toUpperCase());
    fs.ensureDirSync(falsedDir);
    fs.writeFileSync(`${falsedDir}/${falseFileName}.jpg`, picture);
}