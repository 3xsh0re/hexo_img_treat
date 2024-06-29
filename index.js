/*
 * @Author: 3xsh0re
 * @Date: 2024-06-29 15:41:26
 * @FilePath: index.js
 * @description: 
 * @LastEditors: remixxyh
 */
var hexoLog = require('hexo-log');
var log = typeof hexoLog["default"] === 'function' ? hexoLog["default"]({
  debug: false,
  silent: false
}) : hexoLog({
  debug: false,
  silent: false
});
const htmlparser2 = require("htmlparser2");

function getFileExtension(filename) {
    return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
}

function JudgeIfMd(data) {
    var ext = getFileExtension(data.source);
    // 如果文件扩展名是 'md'，则返回 false，表示不忽略；否则返回 true，表示忽略
    return ['md'].indexOf(ext) === -1;
}

function transform(img, fileName) {
    img = htmlparser2.parseDocument(img, "text/html").children[0]
    src = img.attribs.src
    title = img.attribs.title ? img.attribs.title : ""
    alt = img.attribs.alt ? img.attribs.alt : ""
    style = img.attribs.style ? img.attribs.style : ""
    imgFile = src.match(RegExp(".*?" + fileName + "/(.+?)$"))[1]
    className = "inMiddle"
    imgTag = "{% asset_img " + className + " " + imgFile + " \'\"" + title + "\"\"" + alt + "\"\' %}"
    var styleTag = "<style>." + className + "{display: block; margin-left: auto; margin-right: auto; " + style + "}</style>";
    return styleTag + imgTag
}

function Treat(data) {
    var reverseSource = data.source.split("").reverse().join("");
    var fileName = reverseSource.substring(3, reverseSource.indexOf("/")).split("").reverse().join("");

    // ![example](postname/example.jpg)  -->  {% asset_img example.jpg example %}
    var regExp = RegExp("!\\[(.*?)\\]\\(<?" + fileName + '/(.+?)>?\\)', "g");
    var imgExp = RegExp("(<img.*?src=\"" + fileName + "/.+?\".*?>)", "g")
    // hexo g
    data.content = data.content.replace(regExp, "{% asset_img $2 $1 %}", "g");
    data.content = data.content.replace(imgExp, (match, img) => {return transform(img, fileName)}, "g")
    
    return data;
}

hexo.extend.filter.register('before_post_render',(data)=>{
    if(!JudgeIfMd(data)){
        Treat(data)
    }
}, 0);