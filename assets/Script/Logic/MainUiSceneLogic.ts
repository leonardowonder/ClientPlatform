import Singleton from '../Utils/Singleton';

import { eMsgPort, eMsgType } from '../Define/MessageIdentifer';
import ClientDefine, { eGameType } from '../Define/ClientDefine';

import Network from '../Utils/Network';
import { NetMsg, praseMsg } from './LogicBasic';

import UserData from '../Data/UserData';
import SceneManager, { EmSceneID } from '../Manager/CommonManager/SceneManager';
import MyUtils from '../Utils/MyUtils';

import MainUiScene from '../View/Scene/MainUiScene';

import NetSink from '../../resources/NewDDZ/script/Module/Game/TableSink';
import GameRoomLogic from './GamePlay/GameRoomLogic';

let userData = UserData.getInstance().getUserData();

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

        super.init();
    }

    //net work
    requestRoomInfo(roomID: number, port: number) {
        Network.getInstance().sendMsg(
            {
                msgID: eMsgType.MSG_REQUEST_ROOM_INFO,
            },
            eMsgType.MSG_REQUEST_ROOM_INFO,
            port,
            roomID);
    }

    requestEnterDDZRoom() {
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

    requestEnterRBRoom() {
        Network.getInstance().sendMsg(
            {
                msgID: eMsgType.MSG_ENTER_COIN_GAME,
                level: 0,
                uid: userData.uid
            },
            eMsgType.MSG_ENTER_COIN_GAME,
            eMsgPort.ID_MSG_PORT_GOLDEN,
            userData.uid);
    }

    onNetClose() {

    }

    onNetReconnected() {

    }

    onMsg(event: cc.Event.EventCustom): void {
        let msg: NetMsg = praseMsg(event);

        switch (msg.nMsgID) {
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
    private _onMsgRoomInfoRsp(jsMsg) {
        if (jsMsg) {
            if (jsMsg.opts) {
                let gameType: eGameType = jsMsg.opts.gameType
                switch (gameType) {
                    case eGameType.eGame_CYDouDiZhu: {
                        NetSink.getInstance();
                        SceneManager.changeScene(EmSceneID.SceneID_DDZScene);
                        break;
                    }
                    case eGameType.eGame_Golden: {
                        GameRoomLogic.getInstance();
                        SceneManager.changeScene(EmSceneID.SceneID_GameRoomScene);
                        break;
                    }
                    default: {
                        cc.warn(`MainUiSceneLogic _onMsgRoomInfoRsp invalid gameType = ${gameType}`);
                    }
                }
            }
            else {
                cc.warn(`MainUiSceneLogic _onMsgRoomInfoRsp no opts info`);
            }
        }
    }

    private _onMsgEnterCoinGameRsp(jsMsg) {
        if (jsMsg.ret == 0) {
            let gamePort = jsMsg.gamePort;
            switch (gamePort) {
                case eMsgPort.ID_MSG_PORT_DOU_DI_ZHU: {
                    NetSink.getInstance();
                    SceneManager.changeScene(EmSceneID.SceneID_DDZScene);
                    break;
                }
                case eMsgPort.ID_MSG_PORT_GOLDEN: {
                    GameRoomLogic.getInstance();
                    SceneManager.changeScene(EmSceneID.SceneID_GameRoomScene);
                    break;
                }
                default: {
                    cc.warn(`MainUiSceneLogic _onMsgEnterCoinGameRsp invalid gamePort = ${gamePort}`);
                    break;
                }
            }
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