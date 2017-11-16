module.exports = (picture) => {
    return new Promise((resolve, reject) => {
        require('request').post('http://op.juhe.cn/vercode/index', (err, resp, body) => {
            if (err) {
                reject(new Error(`http request to juhe captcha failed, message = ${err.stack}`));
                return;
            }

            resolve(JSON.parse(body).result);
        }).form({
            key: '5af08c239d17b5833d16316d1133d315',
            codeType: '1004',
            base64Str: picture
        });
    });
};