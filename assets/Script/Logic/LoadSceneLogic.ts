import Singleton from '../Utils/Singleton';

import { eMsgPort, eMsgType } from '../Define/MessageIdentifer';
import ClientDefine from '../Define/ClientDefine';

import Network from '../Utils/Network';
import { NetMsg, praseMsg } from './LogicBasic';

import UserData from '../Data/UserData';

import LoadScene from '../View/Scene/LoadScene';

class LoadSceneLogic extends Singleton {

    private m_curView: LoadScene = null;

    init() {
        super.init();

        this._registEvent();
    }

    setCurView(view: LoadScene) {
        this.m_curView = view;
    }

    unsetCurView() {
        this.m_curView = null;
    }
    //net work
    requestLogin(account: string, password: string) {
        var msg = {
            msgID: eMsgType.MSG_PLAYER_LOGIN,
            cAccount: account,
            cPassword: password,
        };
        Network.getInstance().sendMsg(msg, eMsgType.MSG_PLAYER_LOGIN, eMsgPort.ID_MSG_PORT_GATE, 0)
    }

    onNetClose() {

    }

    onNetReconnected() {

    }

    onMsg(event: cc.Event.EventCustom): void {
        let msg: NetMsg = praseMsg(event);

        switch (msg.nMsgID) {
            case eMsgType.MSG_PLAYER_LOGIN: {
                this._onMsgPlayeLoginRsp(msg.jsMsg);
            }
            default: {
                break;
            }
        }
    }

    //net msg rsp
    private _onMsgPlayeLoginRsp(jsMsg) {
        if (jsMsg.ret == 0) {
            this.m_curView && this.m_curView.onLoginSuccess();
        }
        else {
            this.m_curView && this.m_curView.onLoginFail();
        }
    }

    //private
    private _registEvent() {
        cc.systemEvent.on(ClientDefine.netEventClose, this.onNetClose, this);
        cc.systemEvent.on(ClientDefine.netEventReconnectd, this.onNetReconnected, this);
        cc.systemEvent.on(ClientDefine.netEventMsg, this.onMsg, this);
    }
};

export default new LoadSceneLogic();