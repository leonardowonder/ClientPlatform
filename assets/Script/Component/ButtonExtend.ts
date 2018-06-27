const { ccclass, property } = cc._decorator;

import AudioManager from "../AudioManager"
import AudioType from "../AudioType"

@ccclass
export default class ButtonExtend extends cc.Component {
    @property
    m_eventInterval: number = 1;

    @property
    m_scaleTo: number = 0.9;

    @property
    m_scaleDuration: number = 0.2;

    @property
    m_soundEffectType: string = AudioType.audio_TouchButton;

    _canEmitEvent: boolean = true;
    _button: cc.Button = null;

    _registEvent() {
        this._unregistEvent();
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchCancel, this);
    }

    _unregistEvent() {
        this.node.targetOff(this);
    }

    onLoad() {
        this._button = this.node.getComponent(cc.Button);
        if (this._button) {
            this._button.enabled = false;
        }

        this._registEvent();
    }

    onEnable() {
        this._registEvent();
    }

    onDisable() {
        this._unregistEvent();
    }

    onDestroy() {
        this._unregistEvent();
    }

    start() {

    }

    touchStart() {
        if (this._button && this._button.interactable) {
            AudioManager.prototype.getInstance().playerEffect(this.m_soundEffectType);
    
            this.node.runAction(cc.scaleTo(this.m_scaleDuration, this.m_scaleTo).easing(cc.easeIn(3.0)));
        }
    }

    touchEnd(event: cc.Event.EventCustom) {
        if (this._button && this._button.interactable) {
            this.node.runAction(cc.scaleTo(this.m_scaleDuration, 1).easing(cc.easeOut(3.0)));

            if (this._canEmitEvent) {
                if (this.m_eventInterval > 0) {
                    this._canEmitEvent = false;
        
                    setTimeout(function () {
                        this._canEmitEvent = true;
                    }.bind(this), this.m_eventInterval * 1000);
                }
    
                this._button.clickEvents.forEach(function (clickEvent, index) {
                    clickEvent.emit([event]);
                })
            }
        }
    }
    touchCancel() {
        this.node.runAction(cc.scaleTo(this.m_scaleDuration, 1).easing(cc.easeOut(3.0)));
    }
}
