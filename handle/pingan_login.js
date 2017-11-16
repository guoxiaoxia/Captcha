const Definition = require('../component/definition/index');
const IdentifyCaptchaSolver = require('./identify/captcha_solver/index');
const IdentifyJuhe = require('./identify/juhe/index');

const Crawler = require('webagent');
const fs = require('fs-extra');
const uuid = require('uuid').v4;
const images = require('images');
const randomstring = require("randomstring");

global.cache = require("lru-cache")(500);


(async (num=1) => {
    try{
        for(let i=0; i<num; ++i) {
            let crawler = new Crawler();
            let {id, picture} = await getCaptcha(crawler);
            picture = images(new Buffer(picture,'base64')).encode("jpg").toString('base64');
            let captcha = await IdentifyCaptchaSolver({picture, channel: "PINGAN_LOGIN"});
            if (await checkCaptcha(id, captcha)){
                await saveChecked(id, picture, captcha);
            }else{
                await saveFalse(id, picture,captcha);
            }
            console.log(i+ 'cap'+ captcha);
        }
    }catch (err){
        console.error(err);
    }
})();

async function getCaptcha(crawler) {
    let id = uuid().replace(/-/g, '');
    let request = new Crawler.Request.Post('https://pacas.pa18.com/cas/genRandCode').setFormBody({appId:'9e90f8465e5298ac015e7041fa150006'});
    let response = await crawler.ajax(request);
    if(response.status != 200) {
        throw new Error(`failed to fetch captcha image! response.status: ${status}, response.textBody: ${response.textBody}`);
    }
    cache.set(id, {crawler, imageKey: response.jsonBody.imageKey});

    return {
        id: id,
        picture: response.jsonBody.dataImg.replace(/^data:image\/jpg;base64,/g, '').replace(/\r|\n/g, '')
    };
}

async function checkCaptcha(id, captcha) {
    const item = cache.get(id);
    if (item === undefined) {
        throw new Error('no such id ' + id);
    }

    const {crawler, imageKey} = item;
    const username = randomstring.generate(10);
    let request = new Crawler.Request.Post('https://pacas.pa18.com/cas/PA003/ICORE_PTS/auth.do').setFormBody({
        username: username,
        password: 'B9F538AA1FA170617DB2169356C63D452F2230E80C44780EA4DE3812C6B1A18A82DF7CB55CBB925A796B610B7C1F79D4333E375AD557E25FA0E80B56BCD7900F15BBCF44D7CDFEB28C553A252E997E4525418325C4492D5C2CC1F284A53D71A875BA99F3031183FF',
        code: captcha,
        randCodeId: imageKey,
        appId: '9e90f8465e5298ac015e7041fa150006'
    });
    let response = await crawler.ajax(request);
    if ((response.status != 200) || (typeof response.jsonBody !== 'object') || (typeof response.jsonBody.errorMessage !== 'string')) {
        throw new Error('cannot verify code');
    }
    return (response.jsonBody.errorMessage !== 'WRONG_IMAGE_CODE');
}

function saveChecked(id, picture, captcha) {
    let checkedDir = `${__dirname}/../../../data/pingan_login/checked/`;
    let checkedFileName = Definition.common.checkedFileNameFormat.replace(/%time%/,id).replace(/%captcha%/,captcha.toUpperCase());
    fs.ensureDirSync(checkedDir);
    fs.writeFileSync(`${checkedDir}/${checkedFileName}.jpg`, new Buffer(picture, 'base64'));
}

async function saveFalse(id, picture, captcha) {
    let falsedDir = `${__dirname}/../../../data/pingan_login/machineFalse/`;
    let falseFileName = Definition.common.checkedFileNameFormat.replace(/%time%/,id).replace(/%captcha%/,captcha.toUpperCase());
    fs.ensureDirSync(falsedDir);
    fs.writeFileSync(`${falsedDir}/${falseFileName}.jpg`, new Buffer(picture, 'base64'));
}