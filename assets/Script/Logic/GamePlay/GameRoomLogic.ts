import Singleton from '../../Utils/Singleton';

import { eMsgPort, eMsgType } from '../../Define/MessageIdentifer';
import ClientDefine from '../../Define/ClientDefine';
import { EmBetAreaType } from '../../Define/GamePlayDefine';
import { betAreaTypeToBetPool } from '../../Utils/GamePlay/GameUtils';

import Network from '../../Utils/Network';
import { NetMsg, praseMsg } from '../LogicBasic';

import UserData from '../../Data/UserData';
import GameRoomScene from '../../View/Scene/GameRoomScene';

import GameController from '../../Controller/GamePlay/GameController';
import PlayerDataManger from '../../Manager/DataManager/GamePlayDataManger/PlayerDataManger';
import CardDataManager from '../../Manager/DataManager/GamePlayDataManger/CardDataManager';
import GameRecordDataManager from '../../Manager/DataManager/GamePlayDataManger/GameRecordDataManager';
import RoomDataManger from '../../Manager/DataManager/GamePlayDataManger/RoomDataManger';

let gameController = GameController.getInstance();

let playerDataManger = PlayerDataManger.getInstance();
let cardDataManager = CardDataManager.getInstance();
let recordManager = GameRecordDataManager.getInstance();

class GameRoomLogic extends Singleton {

    private m_curView: GameRoomScene = null;

    init() {
        super.init();

        this._registEvent();
    }

    //net work
    requestBet(coin: number, type: EmBetAreaType) {
        Network.getInstance().sendMsg(
            {
                msgID: eMsgType.MSG_RB_PLAYER_BET,
                coin: coin,
                poolType: betAreaTypeToBetPool(type)
            },
            eMsgType.MSG_RB_PLAYER_BET,
            eMsgPort.ID_MSG_PORT_GOLDEN,
            RoomDataManger.getInstance().getRoomID());
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
            case eMsgType.MSG_ROOM_PLAYER_INFO: {
                this._onMsgRoomPlayerInfoRsp(msg.jsMsg);
                break;
            }
            case eMsgType.MSG_PLAYER_SIT_DOWN: {
                this._onMsgPlayerSitDownRsp(msg.jsMsg);
                break;
            }
            case eMsgType.MSG_ROOM_SIT_DOWN: {
                this._onMsgRoomSitDownRsp(msg.jsMsg);
                break;
            }
            case eMsgType.MSG_ROOM_STAND_UP: {
                this._onMsgRoomStandUpRsp(msg.jsMsg);
                break;
            }
            case eMsgType.MSG_PLAYER_LEAVE_ROOM: {
                this._onMsgPlayerLeaveRoomRsp(msg.jsMsg);
                break;
            }
            case eMsgType.MSG_RB_START_GAME: {
                this._onMsgRBStartGameRsp(msg.jsMsg);
                break;
            }
            case eMsgType.MSG_RB_PLAYER_BET: {
                this._onMsgRBPlayerBetRsp(msg.jsMsg);
                break;
            }
            case eMsgType.MSG_RB_ROOM_BET: {
                this._onMsgRBRoomBetRsp(msg.jsMsg);
                break;
            }
            case eMsgType.MSG_RB_ROOM_RESULT: {
                this._onMsgRBRoomResultRsp(msg.jsMsg);
                break;
            }
            default: {
                break;
            }
        }
    }

    //net msg rsp    
    private _onMsgRoomInfoRsp(jsMsg) {
        RoomDataManger.getInstance().setRoomData(jsMsg);

        // this.m_curView && this.m_curView.onGetRoomInfo();
    }

    private _onMsgRoomPlayerInfoRsp(jsMsg) {
        // DDZPlayerDataManager.getInstance().updatePlayerInfo(jsonMessage);
        // let players = jsonMessage.players;
        // if (players && players.length > 0) {
        //     let uidList: number[] = [];
        //     _.forEach(players, (player) => {
        //         uidList.push(player.uid);
        //     });

        //     PlayerDataManager.getInstance().reqPlayerData(uidList);
        // }
        
        // this.m_curView && this.m_curView.updateAllPlayerDatas();
    }

    private _onMsgPlayerSitDownRsp(jsMsg) {
        // var text = null;
        // if (jsonMessage.ret == 0) {

        // } else if (jsonMessage.ret == 1) {
        //     text = "该位置已经有人";
        // } else if (jsonMessage.ret == 2) {
        //     text = "您已经加入过其他房间";
        // } else if (jsonMessage.ret == 3) {
        //     text = "您没有在该房间";
        // } else {
        //     text = "坐下失败,code = " + jsonMessage.ret;
        // }
        // if (text) {
        //     PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_PromptDialogLayer, [text]);
        // }
    }

    private _onMsgRoomSitDownRsp(jsMsg) {
        // DDZPlayerDataManager.getInstance().onPlayerSitDown(jsonMessage);

        // let player = DDZPlayerDataManager.getInstance()._players[jsonMessage.idx];
        // if (userData.uid == player.uid) {
        //     if (jsonMessage.state == eRoomPeerState.eRoomPeer_WaitNextGame) {
        //         //auto sendReady
        //         this.requestReady();
        //     }
        // }

        // this.m_curView && this.m_curView.updatePlayerData(jsonMessage.idx);

        // PlayerDataManager.getInstance().reqPlayerData([player.uid]);
    }

    private _onMsgRoomStandUpRsp(jsMsg) {
        // if (jsonMessage.uid == userData.uid) {
        //     // DDZPlayerDataManager.getInstance().clearAllPlayerData();
        //     // this.m_curView && this.m_curView.clearTable();
        // }
        // else {
        //     DDZPlayerDataManager.getInstance().onPlayerStandUp(jsonMessage);

        //     // this.m_curView && this.m_curView.standUp(jsonMessage.idx);
        // }
    }

    private _onMsgPlayerLeaveRoomRsp(jsMsg) {
        // this.m_curView && this.m_curView.exitGame();
    }

    private _onMsgRBStartGameRsp(jsMsg) {
        if (jsMsg.ret == 0) {
            gameController.onGameStart();
            gameController.onGameStartBet();
        }
    }

    private _onMsgRBPlayerBetRsp(jsMsg) {

    }

    private _onMsgRBRoomBetRsp(jsMsg) {

    }

    private _onMsgRBRoomResultRsp(jsMsg) {
        if (jsMsg.ret == 0) {
            gameController.onGameStopBet();

            let type = jsMsg.type;
            let nums = jsMsg.nums;
            cardDataManager.udpateCardData(type, nums);

            gameController.distributeCards();
            recordManager.addRecord(jsMsg.type);
        }
    }

    //private
    private _registEvent() {
        cc.systemEvent.on(ClientDefine.netEventClose, this.onNetClose, this);
        cc.systemEvent.on(ClientDefine.netEventReconnectd, this.onNetReconnected, this);
        cc.systemEvent.on(ClientDefine.netEventMsg, this.onMsg, this);
    }
};

export default new GameRoomLogic();