const Config = require('../../component/config/index');
const fs = require('fs-extra');
const path = require('path');
const dataSource = {
    file: 1,
    code: 2
};

module.exports = class{
    constructor(){
        console.log('init check list');

        if (!Config.manualCode.isOpen && Config.manualCheck.isOpen){
            fs.ensureDirSync(Config.manualCheck.sourceDir);
            this.checkingList = fs.readdirSync(Config.manualCheck.sourceDir).splice(0,Config.targetNumber).map(file => {
                let nameArr = file.split('-');
                return {
                    path: `${Config.manualCheck.sourceDir}/${file}`,
                    image: fs.readFileSync(`${Config.manualCheck.sourceDir}/${file}`).toString('base64'),
                    captcha: nameArr[2],
                    user: nameArr[1]
                };
            });

            this.dataFrom = dataSource.file;
        }
        else{
            this.dataFrom = dataSource.code
        }
    }

    fetchChecking(){
        let obj = undefined;

        switch (this.dataFrom){
            case dataSource.code:
                if (codePathList.length <= 0) {
                    return undefined;
                }
                let filePath = codePathList.splice(0, 1)[0];
                let nameArr = path.basename(filePath).split('-');
                obj = {
                    path: filePath,
                    image: fs.readFileSync(filePath).toString('base64'),
                    captcha: nameArr[2].split('.')[0],
                    user: nameArr[1]
                };
                break;
            case dataSource.file:
                if (this.checkingList.length <= 0) {
                    return undefined;
                }
                obj = this.checkingList.splice(0, 1)[0];
                fs.unlinkSync(obj.path);
                break;
            default:
                throw new Error('data from wrong');
        }
        return obj;
    }

    submitChecking({image, captcha}){
        fs.ensureDirSync(Config.manualCheck.saveDir);
        let checkedFileName = Config.manualCheck.checkedNameFormat.replace(/%time%/,new Date().getTime()).replace(/%captcha%/,captcha.toUpperCase());
        fs.writeFileSync(`${Config.manualCheck.saveDir}/${checkedFileName}.png`, new Buffer(image, 'base64'));
    }
};