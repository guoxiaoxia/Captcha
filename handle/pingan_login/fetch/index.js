const Crawler = require('webagent');
const uuid = require('uuid').v4;

module.exports = async ({isWithSession}) => {
    const crawler = new Crawler();

    let request = new Crawler.Request.Post('https://pacas.pa18.com/cas/genRandCode').setFormBody({appId:'9e90f8465e5298ac015e7041fa150006'});
    let response = await crawler.ajax(request);
    if(response.status != 200) {
        throw new Error(`failed to fetch captcha image! response.status: ${status}, response.textBody: ${response.textBody}`);
    }
    let res = {
        picture: response.jsonBody.dataImg.replace(/^data:image\/jpg;base64,/g, '').replace(/\r|\n/g, '')
    };

    return isWithSession ? Object.assign(res, {session: {crawler, imageKey: response.jsonBody.imageKey}}) : res;
};