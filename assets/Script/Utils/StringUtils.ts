// let StringUtils = {};

// StringUtils['format'] = function(args) {
//     var result = this;
//     if (arguments.length > 0) {
//         if (arguments.length == 1 && typeof (args) == 'object') {
//             for (var key in args) {
//                 if (args[key] != undefined) {
//                     var reg = new RegExp('({' + key + '})', 'g');
//                     result = result.replace(reg, args[key]);
//                 }
//             }
//         }
//         else {
//             for (var i = 0; i < arguments.length; i++) {
//                 if (arguments[i] != undefined) {
//                     //var reg = new RegExp('({[' + i + ']})', 'g');//这个在索引大于9时会有问题，谢谢何以笙箫的指出
//                     var reg = new RegExp('({)' + i + '(})', 'g');
//                     result = result.replace(reg, arguments[i]);
//                 }
//             }
//         }
//     }
//     return result;
// }
// StringUtils['format'] 
// const { ccclass } = cc._decorator;

// @ccclass
import Singleton from './Singleton';
import StringConfigManager from '../Manager/ConfigManager/StringConfigManager';

class StringUtils extends Singleton {
    formatByKey = function (...args) {
        if (arguments.length == 0)
            return '';
        let orgStr = StringConfigManager.getInstance().getStrByKey(arguments[0]);

        let params = [];
        for (var i = 1; i < arguments.length; i++) {
            params.push(arguments[i]);
        }

        return this.formatByStr(orgStr, ...params);
    }

    formatByStr = function (...args) {
        if (arguments.length == 0)
            return '';

        var str = arguments[0];
        for (var i = 1; i < arguments.length; i++) {
            var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
            str = str.replace(re, arguments[i]);
        }
        return str;
    }

    getFormatTime(s) {
        var t;

        if (s > -1) {
            var hour = Math.floor(s / 3600);
            var min = Math.floor(s / 60) % 60;
            var sec = Math.floor(s % 60);
            if (hour < 10) {
                t = '0' + hour + ':';
            } else {
                t = hour + ':';
            }

            if (min < 10) { t += '0'; }
            t += min + ':';
            if (sec < 10) { t += '0'; }
            t += sec;
        }

        return t;
    }

    getFormatTimeChinese(s: number, withDayAndSec: boolean = true) {
        var t = '';

        if (s > -1) {
            let day = Math.floor(s / 86400);
            var hour = Math.floor(s / 3600);
            var min = Math.floor(s / 60) % 60;
            var sec = Math.floor(s % 60);
            if (withDayAndSec) {
                t += day + '天 ';
            }

            t += hour + '小时 ';
            
            t += min + '分 ';

            if (withDayAndSec) {
                t += sec + '秒';
            }
        }

        return t;
    }

    cutString(name: string, length: number) {
        if (!name) {
            return '';
        }
        if (name.length <= length) {
            return name;
        } else {
            return name.substr(0, length) + '...';
        }
    }
}

export default new StringUtils();