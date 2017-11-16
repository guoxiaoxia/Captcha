




const http = require("http");

module.exports = class {
    constructor(host, port) {
        this._host = host;
        this._port = port;
    }

    async cardAdd(request) {
        await this._send('/card/add', JSON.stringify(request));
    }

    async orderAdd(request) {
        await this._send('/order/add', JSON.stringify(request));
    }

    async promotionAdd(request) {
        await this._send('/promotion/add', JSON.stringify(request));
    }

    async clear() {
        await this._send('/clear', '');
    }

    _send(path, request, timeout = 3000) {
        return new Promise((resolve, reject) => {
            let options = {
                method: "POST",
                hostname: this._host,
                port: this._port,
                path: path,
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.from(request).length
                }
            };
            let data = [];
            let req = http.request(options, response => {
                response.on("data", chunk => data.push(chunk));
                response.on("end", () => {
                    if (response.statusCode === 200) {
                        resolve(Buffer.concat(data));
                    }
                    else {
                        reject(new Error('bad http response status = ' + response.statusCode));
                    }
                });
            });
            req.on('socket', function (socket) {
                socket.setTimeout(timeout);  
                socket.on('timeout', function() {
                    req.abort();
                });
            });
            req.on("error", err => reject(err));
        
            req.write(request);
            req.end();
        });
    }
};
