"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const upload_1 = require("./util/upload");
const handleHover_1 = require("./util/handleHover");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let texteditor = vscode.commands.registerTextEditorCommand('extension.choosedImage', async (textEditor, edit, args) => {
        console.log('选择图片');
        const qiniuConfig = vscode.workspace.getConfiguration('upload_qiniu_config');
        const uri = await vscode.window.showOpenDialog({
            canSelectFolders: false,
            canSelectMany: false,
            filters: {
                images: ['png', 'jpg'],
            },
        });
        if (!uri) {
            return;
        }
        const upConfig = {
            accessKey: qiniuConfig.accessKey,
            secretKey: qiniuConfig.secretKey,
            domain: qiniuConfig.domain,
            gzip: qiniuConfig.gzip,
            scope: qiniuConfig.scope,
            directory: qiniuConfig.directory
        };
        const loaclFile = uri[0].fsPath;
        (0, upload_1.upImageToQiniu)(loaclFile, (res) => {
            let url = res;
            // 将图片链接写入编辑器
            console.log('图片上传成功', url);
            addImageUrlToEditor(url);
        }, upConfig);
    });
    // 鼠标悬浮预览图片
    vscode.languages.registerHoverProvider('*', {
        async provideHover(document, position) {
            try {
                const { character } = position;
                // 当前行的文本内容
                const currentLineText = document.lineAt(position).text;
                // 匹配当前行内
                const httpLink = (0, handleHover_1.getHoverHttpLink)(currentLineText, character);
                var strToBase64 = await (0, handleHover_1.translateImageUrlToBase64)(httpLink);
                const markString = strToBase64 ? new vscode.MarkdownString(`![](${strToBase64})`, true) : '';
                return {
                    contents: [markString],
                };
            }
            catch (err) {
                console.log('error', err);
            }
        },
    });
    context.subscriptions.push(texteditor);
}
exports.activate = activate;
// 将图片链接写入编辑器
function addImageUrlToEditor(url) {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    // 替换内容
    const selection = editor.selection;
    editor.edit((editBuilder) => {
        editBuilder.replace(selection, url);
    });
}
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map