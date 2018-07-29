import Singleton from '../../Utils/Singleton';

import * as _ from 'lodash';

import { eMsgPort, eMsgType } from '../../Define/MessageIdentifer';
import ClientDefine from '../../Define/ClientDefine';
import { EmBetAreaType, eBetPool } from '../../Define/GamePlayDefine';
import { betAreaTypeToBetPool } from '../../Utils/GamePlay/GameUtils';

import Network from '../../Utils/Network';
import { NetMsg, praseMsg } from '../LogicBasic';

import GameRoomScene from '../../View/Scene/GameRoomScene';

import GameController from '../../Controller/GamePlay/GameController';
import GamePlayerDataManager from '../../Manager/DataManager/GamePlayDataManger/GamePlayerDataManager';
import CardDataManager from '../../Manager/DataManager/GamePlayDataManger/CardDataManager';
import GameRecordDataManager from '../../Manager/DataManager/GamePlayDataManger/GameRecordDataManager';
import RoomDataManger from '../../Manager/DataManager/GamePlayDataManger/RoomDataManger';
import PrefabManager, { EmPrefabEnum } from '../../Manager/CommonManager/PrefabManager';
import PlayerDataManager from '../../Manager/DataManager/PlayerDataManager';

let gameController = GameController.getInstance();

let cardDataManager = CardDataManager.getInstance();
let recordManager = GameRecordDataManager.getInstance();

class GameRoomLogic extends Singleton {

    private m_curView: GameRoomScene = null;

    init() {
        super.init();

        this._registEvent();
    }

    setCurView(view: GameRoomScene) {
        this.m_curView = view;
    }

    unsetCurView() {
        this.m_curView = null;
    }

    //net work
    requestLeaveRoom() {
        Network.getInstance().sendMsg(
            {
                msgID: eMsgType.MSG_PLAYER_LEAVE_ROOM,
            },
            eMsgType.MSG_PLAYER_LEAVE_ROOM,
            eMsgPort.ID_MSG_PORT_GOLDEN,
            RoomDataManger.getInstance().getRoomID());
    }

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
            case eMsgType.MSG_ROOM_CHANGE_STATE: {
                this._onMsgRoomChangeState(msg.jsMsg);
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

        this.m_curView && this.m_curView.onGetRoomInfo();
    }

    private _onMsgRoomPlayerInfoRsp(jsMsg) {
        GamePlayerDataManager.getInstance().updatePlayerInfo(jsMsg);
        let players = jsMsg.players;
        if (players && players.length > 0) {
            let uidList: number[] = [];
            _.forEach(players, (player) => {
                uidList.push(player.uid);
            });

            PlayerDataManager.getInstance().reqPlayerData(uidList);
        }

        this.m_curView && this.m_curView.updatePlayersView();
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
        GamePlayerDataManager.getInstance().onPlayerSitDown(jsMsg);

        this.m_curView && this.m_curView.updatePlayerData(jsMsg.idx);

        PlayerDataManager.getInstance().reqPlayerData([jsMsg.uid]);
    }

    private _onMsgRoomStandUpRsp(jsMsg) {
        GamePlayerDataManager.getInstance().onPlayerStandUp(jsMsg);

        this.m_curView && this.m_curView.onPlayerStandUp(jsMsg.idx);
    }

    private _onMsgPlayerLeaveRoomRsp(jsMsg) {
        var errorText = null;
        if (jsMsg.ret == 0) {
            this.m_curView && this.m_curView.exitGame();
        } else if (jsMsg.ret == 1) {
            errorText = "您没有在该房间";
        } else if (jsMsg.ret == 200) {
            errorText = "没有找到该房间";
        } else if (jsMsg.ret == 201) {
            errorText = "操作超时";
        } else if (jsMsg.ret != 0) {
            errorText = "退出失败,code = " + jsMsg.ret;
        }
        if (errorText) {
            PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_PromptDialogLayer, [errorText]);
        }
    }

    private _onMsgRoomChangeState(jsMsg) {
        RoomDataManger.getInstance().changeRoomState(jsMsg.newState);
    }

    private _onMsgRBStartGameRsp(jsMsg) {
        if (jsMsg.ret == 0) {
            gameController.onGameStart();
        }
    }

    private _onMsgRBPlayerBetRsp(jsMsg) {

    }

    private _onMsgRBRoomBetRsp(jsMsg) {
        let serverIdx: number = jsMsg.idx;
        let coin: number = jsMsg.coin;
        let betPoolType: eBetPool = jsMsg.poolType;

        this.m_curView && this.m_curView.onRoomBet(serverIdx, coin, betPoolType);
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