const { ccclass } = cc._decorator;

import ClientDefine from '../../../../../Script/Define/ClientDefine';
import { eMsgPort, eMsgType } from '../../../../../Script/Define/MessageIdentifer';
import Network from '../../../../../Script/Utils/Network';
import { eRoomPeerState } from '../../Define/DDZDefine';
import UserData from '../../../../../Script/Data/UserData';
import DDZGameDataLogic from '../../Data/DDZGameDataLogic';
import GameLogic from './GameLogic';
import DDZPlayerData from '../../Data/DDZPlayerData';
import DDZLanguage from '../../Data/DDZLanguage';
import PrefabManager, { EmPrefabEnum } from '../../../../../Script/Manager/CommonManager/PrefabManager';
import TableMainUI from '../../UI/TableMainUI';

import { EmDDZPlayerState } from '../../Module/DDZGameDefine'

let userData = UserData.getInstance();
let DDZDataMgrIns = DDZGameDataLogic.getInstance();
let GameLogicIns = GameLogic.getInstance();
let DDZPlayerDataLogic = DDZPlayerData.getInstance();

//net module
@ccclass
export default class TableSink extends cc.Component {

    private m_curView: TableMainUI = null;

    init(view: TableMainUI) {
        this.m_curView = view;

        cc.systemEvent.on(ClientDefine.netEventMsg, this.onMsg, this);
        cc.systemEvent.on("reconnect", this.reconnect, this);
        cc.systemEvent.on("reconnectFailed", this.reconnectedFailed, this);
    }

    //customEvent
    reconnect() {

    }

    reconnectedFailed() {

    }


    ///send
    sendEnterRoom() {
        var enterRoomMessage = {
            msgID: eMsgType.MSG_PLAYER_SIT_DOWN,
            idx: 100
        };
        Network.getInstance().sendMsg(enterRoomMessage,
            eMsgType.MSG_PLAYER_SIT_DOWN, eMsgPort.ID_MSG_PORT_DOU_DI_ZHU, DDZDataMgrIns._roomID)
    }

    sendApplyDismissRoom() {
        var deleteRoomMessage = {
            msgID: eMsgType.MSG_APPLY_DISMISS_VIP_ROOM,
            dstRoomID: DDZDataMgrIns._roomID,
            uid: userData.uid,
        };
        Network.getInstance().sendMsg(deleteRoomMessage,
            eMsgType.MSG_APPLY_DISMISS_VIP_ROOM,
            eMsgPort.ID_MSG_PORT_DOU_DI_ZHU, DDZDataMgrIns._roomID);
    }

    sendLeaveRoom() {
        var deleteRoomMessage = {
            msgID: eMsgType.MSG_PLAYER_LEAVE_ROOM,
        };
        Network.getInstance().sendMsg(deleteRoomMessage,
            eMsgType.MSG_PLAYER_LEAVE_ROOM, eMsgPort.ID_MSG_PORT_DOU_DI_ZHU,
            DDZDataMgrIns._roomID);
    }

    sendReady() {
        var enterRoomMessage = {
            dstRoomID: DDZDataMgrIns._roomID,
            msgID: eMsgType.MSG_PLAYER_SET_READY,
        };
        Network.getInstance().sendMsg(enterRoomMessage, eMsgType.MSG_PLAYER_SET_READY,
            eMsgPort.ID_MSG_PORT_DOU_DI_ZHU, DDZDataMgrIns._roomID);
    }

    sendOpenRoom() {
        var message = {
            msgID: eMsgType.MSG_PLAYER_OPEN_ROOM,
            dstRoomID: DDZDataMgrIns._roomID,
        };
        Network.getInstance().sendMsg(message, eMsgType.MSG_PLAYER_OPEN_ROOM,
            eMsgPort.ID_MSG_PORT_DOU_DI_ZHU, DDZDataMgrIns._roomID);

    }

    reqOutCard(localChairID, sendCardData, cardType) {
        console.log('sendCardData' + JSON.stringify(sendCardData) + ', cardType' +
            GameLogicIns.switchCardTypeToServerType(cardType));
    }








    //receive
    onMsg(event: cc.Event.EventCustom) {
        let jsonMessage = event.detail.msg;
        DDZDataMgrIns.onMessage(jsonMessage);
        DDZPlayerDataLogic.onMessage(jsonMessage);

        switch (jsonMessage.msgID) {
            case eMsgType.MSG_VIP_ROOM_DO_CLOSED: {
                this.onMsgVIPRoomDoClosedRsp();
                break;
            }
            case eMsgType.MSG_PLAYER_BASE_DATA: {
                this.onMsgPlayerBaseDataRsp(jsonMessage);
                break;
            }
            case eMsgType.MSG_ENTER_ROOM: {
                this.onMsgEnterRoomRsp(jsonMessage);
                break;
            }
            case eMsgType.MSG_REQUEST_ROOM_INFO: {
                this.onMsgRequestRoomInfoRsp(jsonMessage);
                break;
            }
            case eMsgType.MSG_ROOM_INFO: {
                this.onMsgRoomInfoRsp();
                break;
            }
            case eMsgType.MSG_ROOM_PLAYER_READY: {
                this.onMsgRoomPlayerReadyRsp(jsonMessage);
                break;
            }
            case eMsgType.MSG_PLAYER_SIT_DOWN: {
                this.onMsgPlayerSitDownRsp(jsonMessage);
                break;
            }
            case eMsgType.MSG_ROOM_SIT_DOWN: {
                this.onMsgRoomSitDownRsp(jsonMessage);
                break;
            }
            case eMsgType.MSG_REQUEST_PLAYER_DATA: {
                this.onMsgRequestPlayerDataRsp(jsonMessage);
                break;
            }
            case eMsgType.MSG_PLAYER_LEAVE_ROOM: {
                this.onMsgPlayerLeaveRoomRsp(jsonMessage);
                break;
            }
            case eMsgType.MSG_ROOM_STAND_UP: {
                this.onMsgRoomStandUpRsp(jsonMessage);
                break;
            }
            case eMsgType.MSG_ROOM_DO_OPEN: {
                this.onMsgRoomDoOpenRsp();
                break;
            }
        }
    }

    //on rsp
    onMsgVIPRoomDoClosedRsp() {
        this.m_curView.exitGame(DDZLanguage.alreadyDismissRoom);
    }

    onMsgPlayerBaseDataRsp(jsonMessage) {
        userData.setPlayerBaseData(jsonMessage);
        if (DDZPlayerDataLogic.getPlayerDataByUID(userData.uid) && DDZPlayerDataLogic.getPlayerDataByUID(userData.uid).uid > 0) {
            var enterRoomMessage = {
                msgID: eMsgType.MSG_REQUEST_ROOM_INFO,
            };
            if (Network.getInstance().sendMsg(enterRoomMessage, eMsgType.MSG_REQUEST_ROOM_INFO, eMsgPort.ID_MSG_PORT_DOU_DI_ZHU, DDZDataMgrIns._roomID)) {
                // MyUtils.cloneWaitMsgLayer(DDZLanguage.reEnterRoom, false);
            }
        } else {
            if (Network.getInstance().sendMsg(
                {
                    msgID: eMsgType.MSG_ENTER_ROOM,
                    roomID: DDZDataMgrIns._roomID,
                    uid: userData.uid,
                }, eMsgType.MSG_ENTER_ROOM, eMsgPort.ID_MSG_PORT_DOU_DI_ZHU, DDZDataMgrIns._roomID)) {
                // MyUtils.cloneWaitMsgLayer(DDZLanguage.reEnterRoom, false);
            }
        }
    }

    onMsgEnterRoomRsp(jsonMessage) {
        if (jsonMessage.ret != 0) {
            this.m_curView.exitGame(DDZLanguage.donotFindRoom);
        }
    }

    onMsgRequestRoomInfoRsp(jsonMessage) {
        if (jsonMessage.ret != 0) {
            this.m_curView.exitGame();
        }
    }

    onMsgRoomInfoRsp() {
        this.node.stopAllActions();
    }

    onMsgRoomPlayerReadyRsp(jsonMessage) {
        this.m_curView.setStateTag(jsonMessage.idx, EmDDZPlayerState.State_None);
    }

    onMsgPlayerSitDownRsp(jsonMessage) {
        var text = null;
        if (jsonMessage.ret == 0) {

        } else if (jsonMessage.ret == 1) {
            text = "该位置已经有人";
        } else if (jsonMessage.ret == 2) {
            text = "您已经加入过其他房间";
        } else if (jsonMessage.ret == 3) {
            text = "您没有在该房间";
        } else {
            text = "坐下失败,code = " + jsonMessage.ret;
        }
        if (text) {
            PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_PromptDialogLayer, [text]);
        }
    }

    onMsgRoomSitDownRsp(jsonMessage) {
        let player = DDZPlayerDataLogic._players[jsonMessage.idx];
        if (userData.uid == player.uid) {
            if (jsonMessage.state == eRoomPeerState.eRoomPeer_WaitNextGame) {
                //auto sendReady
                var enterRoomMessage = {
                    dstRoomID: DDZDataMgrIns._roomID,
                    msgID: eMsgType.MSG_PLAYER_SET_READY,
                };
                Network.getInstance().sendMsg(enterRoomMessage, eMsgType.MSG_PLAYER_SET_READY, eMsgPort.ID_MSG_PORT_DOU_DI_ZHU, DDZDataMgrIns._roomID);
            }
            for (let idx = 0; idx < DDZDataMgrIns._seatCnt; idx++) {
                let player = DDZPlayerDataLogic._players[idx];
                if (player && player.uid > 0) {
                    this.m_curView.updatePlayerData(player, jsonMessage.idx);
                } else {
                    this.m_curView.standUp(idx);
                }
            }
        } else {
            //AudioManager.playerEffect("resources/ddz/sound/Player_Come_In.mp3");
            let player = DDZPlayerDataLogic._players[jsonMessage.idx];
            this.m_curView.updatePlayerData(player, jsonMessage.idx);
        }
    }

    onMsgRequestPlayerDataRsp(jsonMessage) {
        for (let idx = 0; idx < DDZDataMgrIns._seatCnt; idx++) {
            let player = DDZPlayerDataLogic._players[idx];
            if (player.uid == jsonMessage.uid) {
                this.m_curView.updatePlayerData(jsonMessage, idx);
                break;
            }
        }
    }

    onMsgPlayerLeaveRoomRsp(jsonMessage) {
        var errorText = null;
        if (jsonMessage.ret == 0) {
            this.m_curView.exitGame("退出成功");
        } else if (jsonMessage.ret == 1) {
            errorText = "您没有在该房间";
        } else if (jsonMessage.ret == 200) {
            errorText = "没有找到该房间";
        } else if (jsonMessage.ret == 201) {
            errorText = "操作超时";
        } else if (jsonMessage.ret != 0) {
            errorText = "退出失败,code = " + jsonMessage.ret;
        }
        if (errorText) {
            PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_PromptDialogLayer, [errorText]);
        }
    }

    onMsgRoomStandUpRsp(jsonMessage) {
        this.m_curView.standUp(jsonMessage.idx);
    }

    onMsgRoomDoOpenRsp() {
        this.m_curView.openRoom();
    }

    onDestroy() {
        // if (cc.sys.isNative) {
        //     cc.eventManager.removeCustomListeners("onWXShare");
        // }
        cc.systemEvent.targetOff(this);
        DDZDataMgrIns.clearAllData();
    }
}