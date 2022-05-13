# Vscode上传图片到七牛云插件

## 本地打包
```js
vsce package
```

打包完成后会在根目录生产.vsix文件，点击右键选择“安装扩展VSIX”，先本地校验完没有问题就可以发布

## 发布

```js
vsce publish minor
```

默认会根据package.json的version次版本号的基础上加1