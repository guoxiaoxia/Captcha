const randomstring = require("randomstring");

module.exports = async (session, captcha) => {
    const {crawler, imageKey} = session;
    const username = randomstring.generate(10);
    let request = new Crawler.Request.Post('https://pacas.pa18.com/cas/PA003/ICORE_PTS/auth.do').setFormBody({
        username: username,
        password: 'B9F538AA1FA170617DB2169356C63D452F2230E80C44780EA4DE3812C6B1A18A82DF7CB55CBB925A796B610B7C1F79D4333E375AD557E25FA0E80B56BCD7900F15BBCF44D7CDFEB28C553A252E997E4525418325C4492D5C2CC1F284A53D71A875BA99F3031183FF',
        code: captcha,
        randCodeId: imageKey,
        appId: '9e90f8465e5298ac015e7041fa150006'
    });
    let response = await crawler.ajax(request);
    if ((response.status != 200) || (typeof response.jsonBody !== 'obejct') || (typeof response.jsonBody.errorMessage !== 'string')) {
        throw new Error('cannot verify code');
    }
    return (response.jsonBody.errorMessage !== 'WRONG_IMAGE_CODE');
};