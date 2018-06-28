import Network from '../Network';
import { eMsgPort, eMsgType } from '../MessageIdentifer';
import clientDefine from '../clientDefine';

export class NetMsg {
    public nMsgID: number
    public jsMsg: any
}

export function praseMsg(event: cc.Event.EventCustom): NetMsg {
    let msg = new NetMsg();

    msg.nMsgID = event.detail[clientDefine.msgKey];
    msg.jsMsg = event.detail[clientDefine.msg];

    return msg;
}

export default class LogicBasic {
    private m_beenInit: boolean = false;

    private m_curView: any = null;

    getInstance() {
        if (!this.m_beenInit) {
            this.init();
        }

        return this;
    }

    setCurView(view) {
        this.m_curView = view;
    }

    unsetCurView() {
        this.m_curView = null;
    }

    onNetClose() {

    }

    onNetReconnected() {

    }

    onMsg(event: cc.Event.EventCustom) {

    }

    _registEvent() {
        cc.systemEvent.on(clientDefine.netEventClose, this.onNetClose, this);
        cc.systemEvent.on(clientDefine.netEventReconnectd, this.onNetClose, this);
        cc.systemEvent.on(clientDefine.netEventMsg, this.onMsg, this);
    }

    init() {
        this._registEvent();

        this.m_beenInit = true;
    }
};