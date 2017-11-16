const Config = require('../component/config');
const code = require('./code');
const Code = new code();
const check = require('./check');
const Check = new check();

const express = require('express');
const app = express();//express框架的实例
const http = require('http');
//socket.io可以直接传递和解析对象，不需要先转成字符串
const server = http.Server(app);//建立一个express框架的http服务
const io = require('socket.io')(server);//建立一个http的socket长连接

server.listen(3000, "0.0.0.0");

//设置静态文件的挂载路径，默认/,直接http://localhost:3000/index.html
app.use(express.static(`${__dirname}/../public`));
app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

let rateMap = new Map();
let wrongList = [];
let crackCount = 1;
let checkCount = 1;

let clients = [];
io.set('transports', [ 'websocket' ]);//todo
io.on('connection', function (socket) {
    console.log('连接上客户端');
    clients.push(clients);//todo 为什么要client

    socket.emit('init', {Config});

    socket.on('fetch_config', () => {
        socket.emit('config_fetched', {Config});
    });

    socket.on('fetch_coding', () => {
        console.log('fetch_coding');

        let item = Code.fetchCoding();
        if (item !== undefined) {
            socket.emit('coding_fetched', {
                image: item.image,
                count: crackCount,
                fileName: item.fileName
            });
        }
        else {
            socket.emit('coding_pool_drained', {});
        }
    });

    socket.on('submit_coding', ({image, captcha, user}) => {
        console.log('submit_cracking');

        Code.submitCoding({image, captcha, user});
        addHero(user);
        crackCount++;
    });

    //todo 不懂得按q（quit）跳过
    // socket.on('submit_unknown', ({image, captcha, user}) => {
    //     console.log('submit_cracking');
    //
    //     Code.submitUnknown({image, captcha, user});
    // });

    socket.on('fetch_checking', () => {
        console.log('fetch_checking');

        let item = Check.fetchChecking();
        if (item !== undefined) {
            socket.emit('checking_fetched', {
                image: item.image,
                captcha: item.captcha,
                count: checkCount,
                codeUser: item.user
            });
        }
        else {
            socket.emit('checking_pool_drained', {});
        }
    });

    socket.on('submit_checking', ({image, captcha, user}) => {
        console.log('submit_checking');

        Check.submitChecking({image, captcha, user});
        addHero(user);
        checkCount++;
    });
    
    socket.on('deduct_points', ({image, codeCaptcha, codeUser, checkUser, checkCaptcha, finalCaptcha, wrongUserFlag}) => {
        console.log('deduct_points');

        switch (wrongUserFlag){
            case 'codeUser':
                changePoints(codeUser, Config.manualCheck.weight.false);
                changePoints(checkUser, Config.manualCheck.weight.foundFalse);
                break;
            case 'checkUser':
                changePoints(checkUser, Config.manualCheck.weight.foundFalse);
                break;
            case 'both':
                changePoints(codeUser, Config.manualCheck.weight.false);
                changePoints(checkUser, Config.manualCheck.weight.false);
                break;
        }
        wrongList.push({image, codeCaptcha, codeUser, checkUser, checkCaptcha, finalCaptcha, wrongUserFlag})
    });

    socket.on('get_wrong_list', () => {
        console.log('get_wrong_list');

        socket.emit('wrong_list_fetched', wrongList);
    });

    socket.on('disconnect', function () {
        clients = clients.filter(item => item !== socket);//todo 为什么记录client
    });
});


let nsp = io.of('/');//todo 作用
setInterval(function () {
    let rateList = sort();
    nsp.emit('rate', {rateList: rateList});
}, 5000);

function addHero(user) {
    if (!rateMap.get(user)) {
        rateMap.set(user, 1);
    }else {
        rateMap.set(user, rateMap.get(user)+1);
    }
}

function changePoints(user, point) {
    if (!rateMap.get(user)) {
        rateMap.set(user, point);
    }else {
        rateMap.set(user, rateMap.get(user) + point);
    }
}

function sort() {
    let rate = [];
    for (let user of rateMap.keys()){
        rate.push({
            name: user,
            count: rateMap.get(user)
        })
    }
    return rate.sort(function (a, b) {
        if (a.count < b.count) return 1;
        else return -1
    });
}