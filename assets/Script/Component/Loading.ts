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

import { clientEventDefine } from '../clientDefine';
import RedDotHintManager, { eRedDotHintEnum } from '../Manager/RedDotHintManager';

@ccclass
export default class Loading extends cc.Component {

    _registEvent() {
        this._unregistEvent();
        cc.systemEvent.on(clientEventDefine.CUSTOM_EVENT_STOP_LOADING, this._hide, this);
    }

    _unregistEvent() {
        cc.systemEvent.off(clientEventDefine.CUSTOM_EVENT_STOP_LOADING, this._hide, this);
    }

    onLoad() {
    }

    onEnable() {
        this._registEvent();
    }

    onDisable() {
        this._unregistEvent();
    }

    onDestroy() {
        
    }

    _hide(event: cc.Event.EventCustom) {        
        this.node.active = false;
    }
}
