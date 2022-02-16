"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bufferToStream = exports.getBufferFromFile = void 0;
const fs = require('fs');
const duplex = require('stream').Duplex;
// 获取buffer
const getBufferFromFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, function (err, res) {
            if (!err) {
                resolve(res);
            }
        });
    });
};
exports.getBufferFromFile = getBufferFromFile;
// buffer 转 stream
const bufferToStream = (buffer) => {
    let stream = new duplex();
    stream.push(buffer);
    stream.push(null);
    return stream;
};
exports.bufferToStream = bufferToStream;
//# sourceMappingURL=base.js.map