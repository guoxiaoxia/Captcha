const Crawler = require('webagent');

module.exports = async ({isWithSession}) => {
    let crawler = new Crawler();
    await startup(crawler);
    let res = {
        picture: await getCaptcha(crawler),
    };
    return isWithSession ?  Object.assign(res, {session: {crawler}}) : res;
};

async function startup(crawler) {
    let startUpRequest = new Crawler.Request.Get('http://issue.cpic.com.cn/ecar/view/portal/page/common/login.html');
    await crawler.go(startUpRequest);
}

async function getCaptcha(crawler) {
    let getCaptchaRequest = new Crawler.Request.Get('http://issue.cpic.com.cn/ecar/auth/getCaptchaImage');
    return (await crawler.ajax(getCaptchaRequest)).body;
}
