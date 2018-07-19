import Singleton from '../Utils/Singleton';

import { eMsgPort, eMsgType } from '../Define/MessageIdentifer';
import ClientDefine from '../Define/ClientDefine';

import Network from '../Utils/Network';
import { NetMsg, praseMsg } from './LogicBasic';
import UserData from '../Data/UserData';

import SceneManager, { EmSceneID } from '../Manager/CommonManager/SceneManager';
import MainUiSceneLogic from './MainUiSceneLogic';

class LoginScenLogic extends Singleton {

    init() {
        super.init();
        this._registEvent();
    }

    //net work
    requestRegistGuest() {
        Network.getInstance().sendMsg(
            {
                cAccount: '',
                cPassword: '',
                msgID: eMsgType.MSG_PLAYER_REGISTER,
                cName: '',
                cRegisterType: 0,
                nChannel: 0,
            },
            eMsgType.MSG_PLAYER_REGISTER,
            eMsgPort.ID_MSG_PORT_GATE,
            0);
    }

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
                break;
            }
            case eMsgType.MSG_PLAYER_REGISTER: {
                this._onPlayerRegisterRsp(msg.jsMsg);
                break;
            }
            case eMsgType.MSG_PLAYER_BASE_DATA: {
                this._onPlayerBaseDataRsp(msg.jsMsg);
                break;
            }
            default: {
                break;
            }
        }
    }

    //net msg rsp
    private _onMsgPlayeLoginRsp(jsMsg) {
        
    }

    private _onPlayerRegisterRsp(jsMsg) {
        if (jsMsg.nRet == 0) {
            if (jsMsg.cRegisterType == 0) {
                //游客登陆
                cc.sys.localStorage.setItem("YouKeLoginExist", 1);
                cc.sys.localStorage.setItem("YouKeLoginUserName", jsMsg.cAccount);
                cc.sys.localStorage.setItem("YouKeLoginPassWord", jsMsg.cPassword);

                this.requestLogin(jsMsg.cAccount, jsMsg.cPassword);
            }
        }
    }

    private _onPlayerBaseDataRsp(jsMsg) {
        UserData.getInstance().setPlayerBaseData(jsMsg);
        
        if (jsMsg.stayRoomID && jsMsg.stayRoomID > 0) {
            MainUiSceneLogic.getInstance().requestRoomInfo(jsMsg.stayRoomID);
        }
        else {
            SceneManager.getInstance().changeScene(EmSceneID.SceneID_MainScene);
        }
    }

    //private
    private _registEvent() {
        cc.systemEvent.on(ClientDefine.netEventClose, this.onNetClose, this);
        cc.systemEvent.on(ClientDefine.netEventReconnectd, this.onNetReconnected, this);
        cc.systemEvent.on(ClientDefine.netEventMsg, this.onMsg, this);
    }
};

export default new LoginScenLogic();