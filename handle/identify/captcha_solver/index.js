module.exports = ({picture, channel}) => {
    return new Promise((resolve, reject) => {
        require('request').post('http://127.0.0.1:29999', (err, resp, body) => {
            if (err) {
                reject(new Error(`http request to captcha process failed, message = ${err.stack}`));
                return;
            }
            resolve(body);
        }).form({
            channel: channel,
            captcha: picture
        });
    });
};