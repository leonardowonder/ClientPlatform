// Learn TypeScript:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/typescript/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

const {ccclass, property} = cc._decorator;

import MutiLanConfigManager from '../Manager/MutiLanConfigManager';

@ccclass
export default class NewClass extends cc.Component {

    @property
    screenId: string = '';

    @property(cc.Label)
    m_labels: cc.Label[] = [];

    @property(cc.Sprite)
    m_sprites: cc.Sprite[] = [];
    
    onLoad () {
        let strs = MutiLanConfigManager.prototype.getInstance().getLabelStrsByScreenId(this.screenId);
        if (strs && strs.length > 0) {
            strs.forEach(function(str, index) {
                if (this.m_labels[index] && this.m_labels[index].string) {
                    this.m_labels[index].string = str;
                }
            }.bind(this))
        }

        let paths = MutiLanConfigManager.prototype.getInstance().getSpritePathsByScreenId(this.screenId);
        if (paths && paths.length > 0) {
            paths.forEach(function(path, index) {
                cc.loader.loadRes(path, cc.SpriteFrame, function (err, spriteFrame) {
                    if (err == null && this.m_sprites[index]) {
                        this.m_sprites[index].spriteFrame = spriteFrame
                    }
                    else {
                        cc.error(err, this.m_sprites, index);
                    }
                }.bind(this))
            }.bind(this))
        }
    }

    start () {

    }

    // update (dt) {},
}
