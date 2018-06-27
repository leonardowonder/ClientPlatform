// Learn TypeScript:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/typescript/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class StringConfigManager extends cc.Component {
    private static s_pInstance: StringConfigManager = null;

    private m_config = null;

    getInstance() {
        if (StringConfigManager.s_pInstance == null) {
            StringConfigManager.s_pInstance = new StringConfigManager();

            StringConfigManager.s_pInstance._init();
        }
        return StringConfigManager.s_pInstance;
    }
    
    _getConfig() {
        return this.m_config;
    }

    _init() {
        cc.loader.loadRes('config/string_config', function (err, res) {
            if (err == null) {
                if (res.cfg) {
                    this.m_config = res.cfg;
                }
            }
            else {
                cc.error(err);
            }
        }.bind(this))
    }

    getStrByKey(key, lan = 'cn') {
        let config = StringConfigManager.prototype.getInstance()._getConfig();
        let ret = '';

        if (config == null) {
            return key;
        }

        if (config[key] && config[key][lan]) {
            ret = config[key][lan];
        }

        return ret;
    }
}
