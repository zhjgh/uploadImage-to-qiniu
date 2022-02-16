"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateImageUrlToBase64 = exports.addImageCropParam = exports.getHoverHttpLink = void 0;
const https = require("https");
const http = require("http");
// 将链接左右两边的引号删掉
const filterHttpLink = (link) => {
    if (link) {
        link = link.substr(0, link.length - 1);
        link = link.substr(1);
    }
    return link;
};
// 获取http链接 在字符串中的位置
const getHttpLinkPosition = (content) => {
    const regx = /["|'][http(s)://](.*?)["|']/g;
    // @ts-ignore
    const matchArr = [...content.matchAll(regx)];
    const arr = [];
    matchArr.forEach((item) => {
        const url = filterHttpLink(item[0]);
        arr.push({
            start: item.index - 1,
            end: item.index - 1 + url.length,
            value: url,
            length: url.length
        });
    });
    return arr;
};
// 获取hover的 http链接
const getHoverHttpLink = (content, position) => {
    let link = '';
    const httpPositions = getHttpLinkPosition(content);
    if (httpPositions.length) {
        httpPositions.forEach((item) => {
            if (item.start <= position && item.end >= position) {
                link = item.value;
            }
        });
    }
    return link;
};
exports.getHoverHttpLink = getHoverHttpLink;
// 图片添加裁剪参数
const addImageCropParam = (url, width, height, type) => {
    // 如果url中已经带有裁剪参数，先去掉之前的参数
    const [path] = url.split('?imageView2');
    url = path;
    let cropUrl = type ? `?imageView2/${type}` : '?imageView2/2';
    if (!!width) {
        cropUrl += `/w/${width}`;
    }
    if (!!height) {
        cropUrl += `/h/${height}`;
    }
    if (!!width || !!height) {
        url += cropUrl;
    }
    return url;
};
exports.addImageCropParam = addImageCropParam;
// 将图片链接转为base64
const translateImageUrlToBase64 = (url) => {
    return new Promise((resolve, reject) => {
        let resUrl = '';
        // 链接是否为https
        const isHttps = url.includes('https');
        if (!url) {
            resolve(resUrl);
        }
        else {
            url = (0, exports.addImageCropParam)(url, 100);
            (isHttps ? https : http).get(url, {}, function (res) {
                const contentType = res.headers['content-type'];
                // 请求为图片
                if (contentType && contentType.includes('image')) {
                    var chunks = []; //用于保存网络请求不断加载传输的缓冲数据
                    var size = 0; //保存缓冲数据的总长度
                    res.on('data', function (chunk) {
                        chunks.push(chunk);
                        //累加缓冲数据的长度
                        size += chunk.length;
                    });
                    res.on('end', function (err) {
                        //Buffer.concat将chunks数组中的缓冲数据拼接起来，返回一个新的Buffer对象赋值给data
                        var data = Buffer.concat(chunks, size);
                        //将Buffer对象转换为字符串并以base64编码格式显示
                        const base64Img = data.toString('base64');
                        resolve(`data:image/png;base64,${base64Img}`);
                    });
                }
                else {
                    resolve(resUrl);
                }
            });
        }
    });
};
exports.translateImageUrlToBase64 = translateImageUrlToBase64;
//# sourceMappingURL=handleHover.js.map