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
export default class CreateRoomDataConfigManager extends cc.Component {
    private static s_pInstance: CreateRoomDataConfigManager = null;

    private m_config = null;

    getInstance() {
        if (CreateRoomDataConfigManager.s_pInstance == null) {
            CreateRoomDataConfigManager.s_pInstance = new CreateRoomDataConfigManager();

            CreateRoomDataConfigManager.s_pInstance._init();
        }
        return CreateRoomDataConfigManager.s_pInstance;
    }
    
    _getConfig() {
        return this.m_config;
    }

    _init() {
        cc.loader.loadRes('config/create_room_config', function (err, res) {
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

    _getObjByRoomType(roomType) {
        let config = CreateRoomDataConfigManager.prototype.getInstance()._getConfig();
        if (config == null) {
            return null;
        }

        let ret = null;
        config.forEach(function(obj) {
            if (obj.room_type && obj.room_type == roomType) {
                ret = obj;
            }
        })

        return ret;
    }

    getToggleOptionsByRoomType(roomType) {
        let config = CreateRoomDataConfigManager.prototype.getInstance()._getConfig();
        let ret = null;

        if (config == null) {
            return ret;
        }

        let obj = this._getObjByRoomType(roomType);
        if (obj == null) {
            return ret;
        }

        return obj.toggle_options;
    }

    getSliderOptionsByScreenId(screenId) {
        let config = CreateRoomDataConfigManager.prototype.getInstance()._getConfig();
        let ret = null;

        if (config == null) {
            return null;
        }

        let obj = this._getObjByRoomType(screenId);
        if (obj == null) {
            return ret;
        }

        return obj.slider_options;
    }
}
