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
export default class MutiLanConfigManager extends cc.Component {
    private static s_pInstance: MutiLanConfigManager = null;

    private m_config = null;

    getInstance() {
        if (MutiLanConfigManager.s_pInstance == null) {
            MutiLanConfigManager.s_pInstance = new MutiLanConfigManager();

            MutiLanConfigManager.s_pInstance._init();
        }
        return MutiLanConfigManager.s_pInstance;
    }
    
    _getConfig() {
        return this.m_config;
    }

    _init() {
        cc.loader.loadRes('config/language_config', function (err, res) {
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

    _isLanChinese() {
        return cc.sys.language == cc.sys.LANGUAGE_CHINESE;
    }

    _getObjByScreenId(screenId) {
        let config = MutiLanConfigManager.prototype.getInstance()._getConfig();
        if (config == null) {
            return null;
        }

        let ret = null;
        config.forEach(function(obj) {
            if (obj.screenId && obj.screenId == screenId) {
                ret = obj;
            }
        })

        return ret;
    }

    getLabelStrsByScreenId(screenId) {
        let config = MutiLanConfigManager.prototype.getInstance()._getConfig();
        let ret = null;

        if (config == null) {
            return ret;
        }

        let obj = this._getObjByScreenId(screenId);
        if (obj == null) {
            return ret;
        }
        
        if (this._isLanChinese() == false) {
            if (obj.labelStrs != null) {
                ret = [];
                obj.labelStrs.forEach(function(strObj) {
                    ret.push(strObj.en);
                })
            }
        }

        return ret;
    }

    getSpritePathsByScreenId(screenId) {
        let config = MutiLanConfigManager.prototype.getInstance()._getConfig();
        let ret = null;

        if (config == null) {
            return null;
        }

        let obj = this._getObjByScreenId(screenId);
        if (obj == null) {
            return ret;
        }
        
        if (this._isLanChinese() == false) {
            if (obj.spritePaths != null) {
                ret = [];
                obj.spritePaths.forEach(function(pathObj) {
                    ret.push(pathObj.en);
                })
            }
        }

        return ret;
    }
}
