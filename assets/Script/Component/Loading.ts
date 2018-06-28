const { ccclass, property } = cc._decorator;

@ccclass
export default class Loading extends cc.Component {

    _registEvent() {
        this._unregistEvent();
        // cc.systemEvent.on(clientEventDefine.CUSTOM_EVENT_STOP_LOADING, this.hide, this);
    }

    _unregistEvent() {
        // cc.systemEvent.off(clientEventDefine.CUSTOM_EVENT_STOP_LOADING, this.hide, this);
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

    hide() {        
        this.node.active = false;
    }
}
