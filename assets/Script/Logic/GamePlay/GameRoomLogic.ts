import Singleton from '../../Utils/Singleton';

import { eMsgPort, eMsgType } from '../../Define/MessageIdentifer';
import ClientDefine from '../../Define/ClientDefine';

import Network from '../../Utils/Network';
import { NetMsg, praseMsg } from '../LogicBasic';

import UserData from '../../Data/UserData';

import GameController from '../../Controller/GamePlay/GameController';
import PlayerDataManger from '../../Manager/DataManager/GamePlayDataManger/PlayerDataManger';
import CardDataManager from '../../Manager/DataManager/GamePlayDataManger/CardDataManager';
import GameRecordDataManager from '../../Manager/DataManager/GamePlayDataManger/GameRecordDataManager';

let gameController = GameController.getInstance();

let playerDataManger = PlayerDataManger.getInstance();
let cardDataManager = CardDataManager.getInstance();
let recordManager = GameRecordDataManager.getInstance();

class GameRoomLogic extends Singleton {

    //net work
    requestUpdateSearchLimit() {
        Network.getInstance().sendMsg(
            {
                msgID: eMsgType.MSG_CLUB_INFO_UPDATE_SEARCH_LIMIT,
                uid: UserData.getInstance().uid,
            },
            eMsgType.MSG_CLUB_INFO_UPDATE_SEARCH_LIMIT,
            eMsgPort.ID_MSG_PORT_DATA,
            null);
    }

    onNetClose() {

    }

    onNetReconnected() {

    }

    onMsg(event: cc.Event.EventCustom): void {
        let msg: NetMsg = praseMsg(event);

        switch (msg.nMsgID) {
            case eMsgType.MSG_CLUB_QUIT_CLUB: {
                break;
            }
            case 1: {
                this._onMsgPlayerDataRsp(msg.jsMsg);
            }
            case 2: {
                this._onMsgGameStartRsp(msg.jsMsg);
            }
            case 2: {
                this._onMsgGameDistributeCardsRsp(msg.jsMsg);
            }
            case 3: {
                this._onMsgGameStartBetRsp(msg.jsMsg);
            }
            case 4: {
                this._onMsgGameStopBetRsp(msg.jsMsg);
            }
            case 4: {
                this._onMsgGameAccountRsp(msg.jsMsg);
            }
            default: {
                break;
            }
        }
    }

    //net msg rsp
    _onMsgPlayerDataRsp(jsMsg) {
        if (jsMsg.ret == 0) {
            playerDataManger.setSitPlayerDatas(jsMsg);
        }
    }

    _onMsgGameStartRsp(jsMsg) {
        if (jsMsg.ret == 0) {
            gameController.onGameStart();
        }
    }

    _onMsgGameDistributeCardsRsp(jsMsg) {
        if (jsMsg.ret == 0) {
            let type = jsMsg.type;
            let nums = jsMsg.nums;
            cardDataManager.udpateCardData(type, nums);

            gameController.distributeCards();
        }
    }

    _onMsgGameStartBetRsp(jsMsg) {
        if (jsMsg.ret == 0) {
            gameController.onGameStartBet();
        }
    }

    _onMsgGameStopBetRsp(jsMsg) {
        if (jsMsg.ret == 0) {
            gameController.onGameStopBet();
        }
    }

    _onMsgGameAccountRsp(jsMsg) {
        if (jsMsg.ret == 0) {
            recordManager.addRecord(jsMsg.type);
        }
    }

    //private
    _registEvent() {
        cc.systemEvent.on(ClientDefine.netEventClose, this.onNetClose, this);
        cc.systemEvent.on(ClientDefine.netEventReconnectd, this.onNetReconnected, this);
        cc.systemEvent.on(ClientDefine.netEventMsg, this.onMsg, this);
    }
};

export default new GameRoomLogic();