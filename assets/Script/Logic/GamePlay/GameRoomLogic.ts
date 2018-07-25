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
            case 1: {
                this._onMsgPlayerDataRsp(msg.jsMsg);
            }
            case eMsgType.MSG_ROOM_INFO: {
                this._onMsgRoomInfoRsp(msg.jsMsg);
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
    private _onMsgPlayerDataRsp(jsMsg) {
        if (jsMsg.ret == 0) {
            playerDataManger.setSitPlayerDatas(jsMsg);
        }
    }
    
    private _onMsgRoomInfoRsp(jsMsg) {
        RoomDataManger.getInstance().setRoomData(jsMsg);

        // this.m_curView && this.m_curView.onGetRoomInfo();
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