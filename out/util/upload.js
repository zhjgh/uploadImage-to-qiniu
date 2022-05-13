"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upImageToQiniu = void 0;
const path = require('path');
const fs = require('fs');
const qiniu = require('qiniu');
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminJpegtran = require('imagemin-jpegtran');
const vscode = require("vscode");
const base_1 = require("./base");
// 获取七牛token
const getToken = (accessKey, secretKey, scope) => {
    const options = {
        scope,
    };
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(mac);
    return uploadToken;
};
// 图片压缩
const imageGzip = async (loaclFile) => {
    const bufferFile = await (0, base_1.getBufferFromFile)(loaclFile);
    let res;
    try {
        res = await imagemin.buffer(bufferFile, {
            plugins: [
                imageminJpegtran(),
                imageminPngquant({
                    quality: [0.6, 0.8],
                }),
            ],
        });
        console.log('图片压缩成功', res);
    }
    catch (err) {
        vscode.window.showInformationMessage('图片压缩失败');
        res = null;
    }
    return res;
};
// 上传图片到七牛云
const upImageToQiniu = async (loaclFile, cb, upConfig) => {
    // 将图片路径统一为 xx/xxx
    const filePathArr = loaclFile.split(path.sep);
    loaclFile = path.posix.join(...filePathArr);
    const config = new qiniu.conf.Config();
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();
    const token = getToken(upConfig.accessKey, upConfig.secretKey, upConfig.scope);
    let gzipImage;
    if (upConfig.gzip) {
        console.log('已经开启压缩');
        gzipImage = await imageGzip(loaclFile);
    }
    const file = filePathArr.pop();
    const fileName = file?.split('.')[0];
    const fileType = file?.split('.')[1];
    // 文件目录+文件名称
    const keyToOverwrite = `${upConfig.directory}/${fileName}-${new Date().getTime()}.${fileType}`;
    // 上传调用方法
    const uploadFnName = gzipImage ? 'putStream' : 'putFile';
    // 上传内容
    const uploadItem = gzipImage ? (0, base_1.bufferToStream)(gzipImage) : path.normalize(loaclFile);
    // 七牛上传
    formUploader[uploadFnName](token, keyToOverwrite, uploadItem, putExtra, function (respErr, respBody, respInfo) {
        if (respErr) {
            throw respErr;
        }
        if (respInfo.statusCode === 200) {
            const url = `${upConfig.domain}/${respBody.key}`;
            cb(url);
        }
        else {
            vscode.window.showInformationMessage(`上传失败: ${respInfo.statusCode}`);
        }
    });
};
exports.upImageToQiniu = upImageToQiniu;
//# sourceMappingURL=upload.js.map