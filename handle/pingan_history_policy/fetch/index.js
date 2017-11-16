const Crawler = require('webagent');

module.exports = async ({isWithSession}) => {
    const crawler = new Crawler();

    let request = new Crawler.Request.Get('https://icore-pts.pingan.com.cn/ebusiness/auto/rand-code-imgage.do');
    let response = await crawler.ajax(request);
    if(response.status != 200) {
        throw new Error(`failed to fetch captcha image! response.status: ${status}, response.textBody: ${response.textBody}`);
    }
    let res = {
        picture: response.body
    };

    return isWithSession ? Object.assign(res, {session: {crawler, imageKey: response.jsonBody.imageKey}}) : res;

};
