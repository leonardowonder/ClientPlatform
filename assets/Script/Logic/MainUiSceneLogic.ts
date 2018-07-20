import Singleton from '../Utils/Singleton';

import { eMsgPort, eMsgType } from '../Define/MessageIdentifer';
import ClientDefine from '../Define/ClientDefine';

import Network from '../Utils/Network';
import { NetMsg, praseMsg } from './LogicBasic';

import UserData from '../Data/UserData';
import SceneManager, { EmSceneID } from '../Manager/CommonManager/SceneManager';
import MyUtils from '../Utils/MyUtils';

import MainUiScene from '../View/Scene/MainUiScene';

import NetSink from '../../resources/NewDDZ/script/Module/Game/TableSink';

let userData = UserData.getInstance();

class MainUiSceneLogic extends Singleton {

    private m_curView: MainUiScene = null;

    setCurView(scene: MainUiScene) {
        this.m_curView = scene;
    }

    unsetCurView() {
        this.m_curView = null;
    }

    init() {
        this._registEvent();

        NetSink.getInstance();
        super.init();
    }

    //net work
    requestRoomInfo(roomID: number) {
        Network.getInstance().sendMsg(
            {
                msgID: eMsgType.MSG_REQUEST_ROOM_INFO,
            },
            eMsgType.MSG_REQUEST_ROOM_INFO,
            eMsgPort.ID_MSG_PORT_DOU_DI_ZHU,
            roomID);
    }

    requestEnterRoom(roomID: number) {
        Network.getInstance().sendMsg(
            {
                msgID: eMsgType.MSG_ENTER_ROOM,
                roomID: roomID,
                uid: userData.uid
            },
            eMsgType.MSG_ENTER_ROOM,
            eMsgPort.ID_MSG_PORT_DOU_DI_ZHU,
            // MyUtils.getInstance().parePortTypte(roomID),
            roomID);
    }

    requestEnterNewRoom() {
        Network.getInstance().sendMsg(
            {
                msgID: eMsgType.MSG_ENTER_COIN_GAME,
                level: 0,
                uid: userData.uid
            },
            eMsgType.MSG_ENTER_COIN_GAME,
            eMsgPort.ID_MSG_PORT_DOU_DI_ZHU,
            userData.uid);
    }

    onNetClose() {

    }

    onNetReconnected() {

    }

    onMsg(event: cc.Event.EventCustom): void {
        let msg: NetMsg = praseMsg(event);

        switch (msg.nMsgID) {
            case eMsgType.MSG_CREATE_ROOM: {
                this._onMsgCreateRoomRsp(msg.jsMsg);
                break;
            }
            case eMsgType.MSG_ROOM_INFO: {
                this._onMsgRoomInfoRsp(msg.jsMsg);
                break;
            }
            case eMsgType.MSG_ENTER_COIN_GAME: {
                this._onMsgEnterCoinGameRsp(msg.jsMsg);
                break;
            }
            default: {
                break;
            }
        }
    }

    //net msg rsp
    private _onMsgCreateRoomRsp(jsMsg) {
        if (jsMsg.ret == 0) {
            let roomID: number = jsMsg.roomID;

            this.requestEnterRoom(roomID);
        }
    }

    private _onMsgRoomInfoRsp(jsMsg) {
        SceneManager.changeScene(EmSceneID.SceneID_DDZScene);
    }

    private _onMsgEnterCoinGameRsp(jsMsg) {
        if (jsMsg.ret == 0) {
            SceneManager.changeScene(EmSceneID.SceneID_DDZScene);
        }
    }

    //private
    private _registEvent() {
        cc.systemEvent.on(ClientDefine.netEventClose, this.onNetClose, this);
        cc.systemEvent.on(ClientDefine.netEventReconnectd, this.onNetReconnected, this);
        cc.systemEvent.on(ClientDefine.netEventMsg, this.onMsg, this);
    }
};

export default new MainUiSceneLogic();