const Config = require('../../component/config/index');
const fs = require('fs-extra');
global.codePathList = [];

module.exports = class{
    constructor(){
        console.log('init code list');
        fs.ensureDirSync(Config.manualCode.sourceDir);
        this.codingList = fs.readdirSync(Config.manualCode.sourceDir).splice(0,Config.targetNumber).map(file => {
            return {
                path: `${Config.manualCode.sourceDir}/${file}`,
                image: fs.readFileSync(`${Config.manualCode.sourceDir}/${file}`).toString('base64'),
            }
        });
    }

    fetchCoding(){
        if (this.codingList.length <= 0) {
            return undefined;
        }
        let obj = this.codingList.splice(0, 1)[0];
        // fs.unlinkSync(obj.path);

        return obj;
    }

    submitCoding({image, captcha, user}){
        fs.ensureDirSync(Config.manualCode.saveDir);
        let codedFileName = Config.manualCode.codedNameFormat.replace(/%time%/, new Date().getTime()).replace(/%user%/,user).replace(/%captcha%/,captcha.toUpperCase());
        fs.writeFileSync(`${Config.manualCode.saveDir}/${codedFileName}.jpg`, new Buffer(image, 'base64'));

        if(Config.manualCheck.isOpen){
            codePathList.push(`${Config.manualCode.saveDir}/${codedFileName}.jpg`);
        }
    }

    // static submitUnknown({image, captcha, user}){
    //     let unknownDir = `${__dirname}/../../data/${this.name}/unkonwn/`;
    //     let unknownDirFileName = Definition.common.codedFileNameFormat.replace(/%time%/, new Date().getTime()).replace(/%user%/,user).replace(/%captcha%/,captcha.toUpperCase());
    //     fs.ensureDirSync(unknownDir);
    //     fs.writeFileSync(`${unknownDir}/${unknownDirFileName}.jpg`, new Buffer(image, 'base64'));
    // }
};