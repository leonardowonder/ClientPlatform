import Singleton from '../../../../../Script/Utils/Singleton';

import * as _ from 'lodash';
import ClientDefine from '../../../../../Script/Define/ClientDefine';
import { eMsgPort, eMsgType } from '../../../../../Script/Define/MessageIdentifer';
import Network from '../../../../../Script/Utils/Network';
import { eRoomPeerState } from '../../Define/DDZDefine';
import UserData from '../../../../../Script/Data/UserData';
import DDZGameDataLogic from '../../Data/DDZGameDataLogic';
import GameLogic from './GameLogic';
import DDZPlayerDataManager from '../../Data/DDZPlayerDataManager';
import DDZLanguage from '../../Data/DDZLanguage';
import PrefabManager, { EmPrefabEnum } from '../../../../../Script/Manager/CommonManager/PrefabManager';
import TableMainUI from '../../UI/TableMainUI';
import { DDZCardType, DDZ_Type } from '../DDZGameDefine';
import PlayerDataManager from '../../../../../Script/Manager/DataManager/PlayerDataManager';

import { EmDDZPlayerState } from '../DDZGameDefine';

let userData = UserData.getInstance().getUserData();
let GameLogicIns = GameLogic.getInstance();

//net module
class TableSink extends Singleton {

    private m_curView: TableMainUI = null;

    init() {
        this._registEvents();
        super.init();
    }

    setCurView(view: TableMainUI) {
        this.m_curView = view;
    }

    unsetCurView() {
        this.m_curView = null;
        DDZGameDataLogic.getInstance().clearAllData();
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
            eMsgType.MSG_PLAYER_SIT_DOWN, eMsgPort.ID_MSG_PORT_DOU_DI_ZHU, DDZGameDataLogic.getInstance().getRoomInfo().roomID)
    }

    sendLeaveRoom() {
        var deleteRoomMessage = {
            msgID: eMsgType.MSG_PLAYER_LEAVE_ROOM,
        };
        Network.getInstance().sendMsg(deleteRoomMessage,
            eMsgType.MSG_PLAYER_LEAVE_ROOM, eMsgPort.ID_MSG_PORT_DOU_DI_ZHU,
            DDZGameDataLogic.getInstance().getRoomInfo().roomID);
    }

    requestNotDiscard() {
        Network.getInstance().sendMsg(
            {
                msgID: eMsgType.MSG_DDZ_PLAYER_CHU,
            },
            eMsgType.MSG_DDZ_PLAYER_CHU,
            eMsgPort.ID_MSG_PORT_DOU_DI_ZHU,
            DDZGameDataLogic.getInstance().getRoomInfo().roomID);
    }

    requestCallBanker(times: number) {
        Network.getInstance().sendMsg(
            {
                msgID: eMsgType.MSG_DDZ_PLAYER_ROBOT_DZ,
                times: times,
            },
            eMsgType.MSG_DDZ_PLAYER_ROBOT_DZ,
            eMsgPort.ID_MSG_PORT_DOU_DI_ZHU,
            DDZGameDataLogic.getInstance().getRoomInfo().roomID);
    }

    sendOpenRoom() {
        var message = {
            msgID: eMsgType.MSG_PLAYER_OPEN_ROOM,
            dstRoomID: DDZGameDataLogic.getInstance().getRoomInfo().roomID,
        };
        Network.getInstance().sendMsg(message, eMsgType.MSG_PLAYER_OPEN_ROOM,
            eMsgPort.ID_MSG_PORT_DOU_DI_ZHU, DDZGameDataLogic.getInstance().getRoomInfo().roomID);

    }

    reqOutCard(localChairID, sendCardData: number[], cardType: DDZCardType) {
        // console.log('sendCardData' + JSON.stringify(sendCardData) + ', cardType' +
        //     GameLogicIns.switchCardTypeToServerType(cardType));
        let serverType: DDZ_Type = GameLogicIns.switchCardTypeToServerType(cardType);
        Network.getInstance().sendMsg(
            {
                msgID: eMsgType.MSG_DDZ_PLAYER_CHU,
                cards: sendCardData,
                type: serverType
            },
            eMsgType.MSG_DDZ_PLAYER_CHU,
            eMsgPort.ID_MSG_PORT_DOU_DI_ZHU,
            DDZGameDataLogic.getInstance().getRoomInfo().roomID);
    }

    requestReady() {
        Network.getInstance().sendMsg(
            {
                dstRoomID: DDZGameDataLogic.getInstance().getRoomInfo().roomID,
                msgID: eMsgType.MSG_PLAYER_SET_READY,
            },
            eMsgType.MSG_PLAYER_SET_READY,
            eMsgPort.ID_MSG_PORT_DOU_DI_ZHU,
            DDZGameDataLogic.getInstance().getRoomInfo().roomID);
    }

    requestTuoGuan(isTuoGuan: number) {
        Network.getInstance().sendMsg(
            {
                msgID: eMsgType.MSG_DDZ_PLAYER_UPDATE_TUO_GUAN,
                isTuoGuan: isTuoGuan
            },
            eMsgType.MSG_DDZ_PLAYER_UPDATE_TUO_GUAN,
            eMsgPort.ID_MSG_PORT_DOU_DI_ZHU,
            DDZGameDataLogic.getInstance().getRoomInfo().roomID);
    }

    //receive
    onMsg(event: cc.Event.EventCustom) {
        let jsonMessage = event.detail.msg;

        switch (jsonMessage.msgID) {
            case eMsgType.MSG_VIP_ROOM_DO_CLOSED: {
                this.onMsgVIPRoomDoClosedRsp();
                break;
            }
            // case eMsgType.MSG_PLAYER_BASE_DATA: {
            //     this.onMsgPlayerBaseDataRsp(jsonMessage);
            //     break;
            // }
            // case eMsgType.MSG_ENTER_ROOM: {
            //     this.onMsgEnterRoomRsp(jsonMessage);
            //     break;
            // }
            case eMsgType.MSG_REQUEST_ROOM_INFO: {
                this.onMsgRequestRoomInfoRsp(jsonMessage);
                break;
            }
            case eMsgType.MSG_ROOM_INFO: {
                this.onMsgRoomInfoRsp(jsonMessage);
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
            // case eMsgType.MSG_REQUEST_PLAYER_DATA: {
            //     this.onMsgRequestPlayerDataRsp(jsonMessage);
            //     break;
            // }
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
            case eMsgType.MSG_DDZ_ROOM_WAIT_ROBOT_DZ: {
                this.onMsgRoomWaitRobDZRsp(jsonMessage);
                break;
            }
            case eMsgType.MSG_DDZ_PLAYER_ROBOT_DZ: {
                this.onMsgDDZPlayerRobDZRsp(jsonMessage);
                break;
            }
            case eMsgType.MSG_DDZ_ROOM_ROBOT_DZ: {
                this.onMsgDDZRoomRobDZRsp(jsonMessage);
                break;
            }
            case eMsgType.MSG_DDZ_ROOM_PRODUCED_DZ: {
                this.onMsgRoomProducedDZRsp(jsonMessage);
                break;
            }
            case eMsgType.MSG_DDZ_ROOM_WAIT_CHU: {
                this.onMsgDDZRoomWaitChuRsp(jsonMessage);
                break;
            }
            case eMsgType.MSG_DDZ_PLAYER_CHU: {
                this.onMsgDDZPlayerChuRsp();
                break;
            }
            case eMsgType.MSG_DDZ_ROOM_CHU: {
                this.onMsgDDZRoomChuRsp(jsonMessage);
                break;
            }
            case eMsgType.MSG_DDZ_ROOM_RESULT: {
                this.onMsgDDZRoomResutRsp(jsonMessage);
                break;
            }
            case eMsgType.MSG_DDZ_PLAYER_UPDATE_TUO_GUAN: {
                this.onMsgDDZPlayerUpdateTuoGuanRsp();
                break;
            }
            case eMsgType.MSG_DDZ_ROOM_UPDATE_TUO_GUAN: {
                this.onMsgDDZRoomUpdateTuoGuanRsp(jsonMessage);
                break;
            }
            case eMsgType.MSG_ROOM_DDZ_START_GAME: {
                this.onMsgRoomDDZStartGameRsp(jsonMessage);
                break;
            }
            case eMsgType.MSG_ROOM_CHANGE_STATE: {
                this.onMsgRoomChangeState(jsonMessage);
                break;
            }
            case eMsgType.MSG_ROOM_PLAYER_INFO: {
                this.onMsgRoomPlayerInfoRsp(jsonMessage);
                break;
            }
        }
    }

    //on rsp
    onMsgVIPRoomDoClosedRsp() {
        this.m_curView && this.m_curView.exitGame(DDZLanguage.alreadyDismissRoom);
    }

    // onMsgPlayerBaseDataRsp(jsonMessage) {
    //     UserData.getInstance().setPlayerBaseData(jsonMessage);
    //     if (DDZPlayerDataManager.getInstance().getPlayerDataByUID(userData.uid) && DDZPlayerDataManager.getInstance().getPlayerDataByUID(userData.uid).uid > 0) {
    //         var enterRoomMessage = {
    //             msgID: eMsgType.MSG_REQUEST_ROOM_INFO,
    //         };
    //         if (Network.getInstance().sendMsg(enterRoomMessage, eMsgType.MSG_REQUEST_ROOM_INFO, eMsgPort.ID_MSG_PORT_DOU_DI_ZHU, DDZGameDataLogic.getInstance().getRoomInfo().roomID)) {
    //             // MyUtils.cloneWaitMsgLayer(DDZLanguage.reEnterRoom, false);
    //         }
    //     } else {
    //         if (Network.getInstance().sendMsg(
    //             {
    //                 msgID: eMsgType.MSG_ENTER_ROOM,
    //                 roomID: DDZGameDataLogic.getInstance().getRoomInfo().roomID,
    //                 uid: userData.uid,
    //             }, eMsgType.MSG_ENTER_ROOM, eMsgPort.ID_MSG_PORT_DOU_DI_ZHU, DDZGameDataLogic.getInstance().getRoomInfo().roomID)) {
    //             // MyUtils.cloneWaitMsgLayer(DDZLanguage.reEnterRoom, false);
    //         }
    //     }
    // }

    // onMsgEnterRoomRsp(jsonMessage) {
    //     if (jsonMessage.ret != 0) {
    //         this.m_curView && this.m_curView.exitGame(DDZLanguage.donotFindRoom);
    //     }
    // }

    onMsgRequestRoomInfoRsp(jsonMessage) {
        if (jsonMessage.ret != 0) {
            this.m_curView && this.m_curView.exitGame();
        }
    }

    onMsgRoomInfoRsp(jsonMessage) {
        DDZGameDataLogic.getInstance().setRoomInfo(jsonMessage);

        this.m_curView && this.m_curView.onGetRoomInfo();
    }

    onMsgRoomPlayerReadyRsp(jsonMessage) {
        this.m_curView && this.m_curView.setStateTag(jsonMessage.idx, EmDDZPlayerState.State_None);
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
        DDZPlayerDataManager.getInstance().onPlayerSitDown(jsonMessage);

        let player = DDZPlayerDataManager.getInstance()._players[jsonMessage.idx];
        if (userData.uid == player.uid) {
            if (jsonMessage.state == eRoomPeerState.eRoomPeer_WaitNextGame) {
                //auto sendReady
                this.requestReady();
            }
        }

        this.m_curView && this.m_curView.updatePlayerData(jsonMessage.idx);

        PlayerDataManager.getInstance().reqPlayerData([player.uid]);
    }

    onMsgPlayerLeaveRoomRsp(jsonMessage) {
        // var errorText = null;
        // if (jsonMessage.ret == 0) {
        //     this.m_curView.exitGame("退出成功");
        // } else if (jsonMessage.ret == 1) {
        //     errorText = "您没有在该房间";
        // } else if (jsonMessage.ret == 200) {
        //     errorText = "没有找到该房间";
        // } else if (jsonMessage.ret == 201) {
        //     errorText = "操作超时";
        // } else if (jsonMessage.ret != 0) {
        //     errorText = "退出失败,code = " + jsonMessage.ret;
        // }
        // if (errorText) {
        //     PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_PromptDialogLayer, [errorText]);
        // }
        this.m_curView && this.m_curView.exitGame();
    }

    onMsgRoomStandUpRsp(jsonMessage) {
        if (jsonMessage.uid == userData.uid) {
            // DDZPlayerDataManager.getInstance().clearAllPlayerData();
            // this.m_curView && this.m_curView.clearTable();
        }
        else {
            DDZPlayerDataManager.getInstance().onPlayerStandUp(jsonMessage);

            // this.m_curView && this.m_curView.standUp(jsonMessage.idx);
        }
    }

    onMsgRoomDoOpenRsp() {
        this.m_curView && this.m_curView.openRoom();
        // DDZGameDataLogic.getInstance().setRoomOpen(true);
    }

    onMsgRoomWaitRobDZRsp(jsonMessage) {
        let serverIdxToRob: number = jsonMessage.idx;

        this.m_curView && this.m_curView.setCurLocalChairID(serverIdxToRob);
        this.m_curView && this.m_curView.onWaitPlayerRob(serverIdxToRob);
    }

    onMsgDDZPlayerRobDZRsp(jsonMessage) {
        if (jsonMessage.ret == 0) {
            // let serverIdxToRob: number = jsonMessage.idx;

            this.m_curView && this.m_curView.onPlayerRob();
        }
        else {
            cc.warn('TableSink onMsgDDZPlayerRobDZRsp failed ret =', jsonMessage.ret);
        }
    }

    onMsgDDZRoomRobDZRsp(jsonMessage) {
        let serverIdxToRob: number = jsonMessage.idx;
        let times: number = jsonMessage.times;

        this.m_curView && this.m_curView.onRoomPlayerRob(serverIdxToRob, times);
    }

    onMsgRoomProducedDZRsp(jsonMessage) {
        let bankerIdx = jsonMessage.dzIdx;
        let baseScore = jsonMessage.times;
        let cards = jsonMessage.cards;

        this.m_curView && this.m_curView.onBankerProduced(bankerIdx);
        this.m_curView && this.m_curView.onRoomProducedDZ(bankerIdx, baseScore, cards);
    }

    onMsgDDZRoomWaitChuRsp(jsonMessage) {
        let serverIdxToDiscard: number = jsonMessage.idx;

        this.m_curView && this.m_curView.setCurLocalChairID(serverIdxToDiscard);
        this.m_curView && this.m_curView.onWaitPlayerDiscard(serverIdxToDiscard);
    }

    onMsgDDZPlayerChuRsp() {
        this.m_curView && this.m_curView.onPlayerDiscard();
    }

    onMsgDDZRoomChuRsp(jsonMessage) {
        let cards: number[] = jsonMessage.cards;
        let type: DDZ_Type = jsonMessage.type;
        let serverIdx: number = jsonMessage.idx;

        let clientType: DDZCardType = GameLogicIns.switchServerTypeToCardType(type, cards);

        this.m_curView && this.m_curView.onRoomPlayerDiscard(cards, clientType, serverIdx);
    }

    onMsgDDZRoomResutRsp(jsonMessage) {
        DDZPlayerDataManager.getInstance().clearAllPlayerData();
        this.m_curView && this.m_curView.onRoomResult(jsonMessage);

        if (jsonMessage.isChunTian) {
            this.m_curView && this.m_curView.playSpringEffect();
        }
    }

    onMsgDDZPlayerUpdateTuoGuanRsp() {

    }

    onMsgDDZRoomUpdateTuoGuanRsp(jsonMessage) {
        let trusteeshipIdx: number = jsonMessage.idx;
        let isTrusteeship: boolean = jsonMessage.isTuoGuan != 0;

        this.m_curView && this.m_curView.onPlayerTuoGuan(trusteeshipIdx, isTrusteeship);
    }

    onMsgRoomDDZStartGameRsp(jsonMessage) {
        DDZPlayerDataManager.getInstance().onStartGame(jsonMessage);

        let cards = jsonMessage.vSelfCard;

        this.m_curView && this.m_curView.onDistrbuteCards(cards);
    }

    onMsgRoomChangeState(jsonMessage) {
        DDZPlayerDataManager.getInstance().onRoomChangeState(jsonMessage);
        DDZGameDataLogic.getInstance().changeRoomState(jsonMessage.newState);
    }

    onMsgRoomPlayerInfoRsp(jsonMessage) {
        DDZPlayerDataManager.getInstance().updatePlayerInfo(jsonMessage);
        let players = jsonMessage.players;
        if (players && players.length > 0) {
            let uidList: number[] = [];
            _.forEach(players, (player) => {
                uidList.push(player.uid);
            });

            PlayerDataManager.getInstance().reqPlayerData(uidList);
        }
        
        this.m_curView && this.m_curView.updateAllPlayerDatas();
    }

    private _registEvents() {
        // cc.systemEvent.targetOff(this);
        cc.systemEvent.on(ClientDefine.netEventMsg, this.onMsg, this);
        cc.systemEvent.on('reconnect', this.reconnect, this);
        cc.systemEvent.on('reconnectFailed', this.reconnectedFailed, this);
    }
}

export default new TableSink();