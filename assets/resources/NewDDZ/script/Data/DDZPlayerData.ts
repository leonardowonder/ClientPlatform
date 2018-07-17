import Singleton from '../../../../Script/Utils/Singleton';
import { eMsgType } from '../../../../Script/Define/MessageIdentifer';

import DDZGameDataLogic from './DDZGameDataLogic';
import { eRoomState, eRoomPeerState } from '../Define/DDZDefine';
import UserData from '../../../../Script/Data/UserData';
var PlayerCount = 3;

let DDZDataMgrIns = DDZGameDataLogic.getInstance();
let userData = UserData.getInstance();

class DDZPlayerData extends Singleton {

    _players: any = null;
    _meServerID: number = -1;

    init() {
        this._players = {};
        this._meServerID = -1;
        for (let idx = 0; idx < PlayerCount; idx++) {
            let playerDefault: any = new Object();
            playerDefault.idx = idx;
            playerDefault.uid = 0;
            playerDefault.chips = 0;
            playerDefault.isOnline = 1;
            playerDefault.state = 0;
            playerDefault.cards = [];
            playerDefault.nJiaBei = 0;//超庄
            playerDefault.isTiLaChuai = 0;
            playerDefault.sex = 0;
            playerDefault.name = "";
            playerDefault.head = "";
            playerDefault.J = 0;
            playerDefault.W = 0;
            this._players[idx] = playerDefault;
        }
    }

    clearData() {
        for (let idx = 0; idx < PlayerCount; idx++) {
            let player = this._players[idx];
            if (player) {
                player.idx = 0;
                player.uid = 0;
                player.chips = 0;
                player.state = 0;
                player.nJiaBei = 0;
                player.isTiLaChuai = 0;
                player.sex = 0;
                player.name = "";
                player.head = "";
                player.ip = "";
                player.cards = new Array();
                player.isOnline = 1;
                player.J = 0;
                player.W = 0;
            }
            this._players[idx] = player;
        }
    }

    getPlayerDataByUID(uid) {
        var data = null;
        if (this._players != null) {
            for (let idx = 0; idx < DDZDataMgrIns._seatCnt; idx++) {
                let playerData = this._players[idx];
                if (playerData != undefined && playerData.uid == uid) {
                    data = playerData;
                    break;
                }
            }
        }
        return data;
    }

    onMessage(event) {
        var jsonMessage = event;
        if (jsonMessage.msgID == eMsgType.MSG_ROOM_PLAYER_INFO) {
            this.clearData();
            if (jsonMessage.players && jsonMessage.players.length) {
                for (let idx = 0; idx < jsonMessage.players.length; idx++) {
                    if (jsonMessage.players[idx].idx < 3) {
                        let serverIDx = jsonMessage.players[idx].idx;
                        let playerData = this._players[serverIDx];
                        if (playerData) {
                            playerData.uid = jsonMessage.players[idx].uid;
                            if (playerData.uid == userData.uid) {
                                this._meServerID = serverIDx;
                                this.showMeServerID();
                            }
                            playerData.chips = jsonMessage.players[idx].chips;
                            playerData.state = jsonMessage.players[idx].state;
                            if (jsonMessage.players[idx].nJiaBei) {
                                playerData.nJiaBei = jsonMessage.players[idx].nJiaBei;
                            }
                            if (jsonMessage.players[idx].isTiLaChuai) {
                                playerData.isTiLaChuai = jsonMessage.players[idx].isTiLaChuai;
                            }
                            playerData.cards = new Array();
                            if (jsonMessage.players[idx].holdCards) {
                                jsonMessage.players[idx].holdCards.sort(function (a, b) {
                                    return b - a;
                                });
                                playerData.cards = jsonMessage.players[idx].holdCards;
                            } else if (jsonMessage.players[idx].holdCardCnt) {
                                for (let i = 0; i < jsonMessage.players[idx].holdCardCnt; i++) {
                                    playerData.cards.push(0);
                                }
                            }
                            playerData.isOnline = jsonMessage.players[idx].isOnline;
                            this._players[serverIDx] = playerData;
                        }
                    }
                }
            }
        } else if (jsonMessage.msgID == eMsgType.MSG_REQUEST_PLAYER_DATA) {
            for (let idx = 0; idx < this._players.length; idx++) {
                let playerData = this._players[idx];
                if (playerData && playerData.uid == jsonMessage.uid) {
                    if (playerData.uid == userData.uid) {
                        this._meServerID = jsonMessage.idx;
                        this.showMeServerID();
                    }
                    playerData.name = jsonMessage.name;
                    playerData.head = jsonMessage.headIcon;
                    playerData.sex = jsonMessage.sex;
                    playerData.ip = jsonMessage.ip;
                    playerData.J = jsonMessage.J;
                    playerData.W = jsonMessage.W;
                    this._players[idx] = playerData;
                    break;
                }
            }
        } else if (jsonMessage.msgID == eMsgType.MSG_ROOM_SIT_DOWN) {
            let playerData = this._players[jsonMessage.idx];
            playerData.uid = jsonMessage.uid;
            playerData.chips = jsonMessage.chips;
            playerData.state = jsonMessage.state;
            playerData.isOnline = jsonMessage.isOnline;
            if (playerData.uid == userData.uid) {
                this._meServerID = jsonMessage.idx;
                this.showMeServerID();
            }
            this._players[jsonMessage.idx] = playerData;
        } else if (jsonMessage.msgID == eMsgType.MSG_ROOM_STAND_UP) {
            if (jsonMessage.idx > 2) {
                return;
            }
            let playerData = this._players[jsonMessage.idx];
            if (playerData) {
                playerData.uid = 0;
                playerData.chips = 0;
                playerData.state = 0;
                playerData.nJiaBei = 0;
                playerData.isTiLaChuai = 0;
                playerData.sex = 0;
                playerData.name = "";
                playerData.head = "";
                playerData.ip = "";
                playerData.cards = new Array();
                playerData.isOnline = 1;
                playerData.J = 0;
                playerData.W = 0;
                this._players[jsonMessage.idx] = playerData;
            }
        } else if (jsonMessage.msgID == eMsgType.MSG_ROOM_CHANGE_STATE) {
            if (jsonMessage.newState == eRoomState.eRoomState_StartGame) {
                for (let i = 0; i < 3; i++) {
                    let playerData = this._players[i];
                    playerData.state = eRoomPeerState.eRoomPeer_CanAct;
                    this._players[i] = playerData;
                }
            }
        } else if (jsonMessage.msgID == eMsgType.MSG_ROOM_DDZ_START_GAME) {
            // svr : { vSelfCard : [23,23,23,2,23] }
            // if (!DDZGameData.isChaoZhuang) {
            //     DDZGameData.onceGameOver();
            // }
            if (jsonMessage.vSelfCard && jsonMessage.vSelfCard.length) {
                let playerData = this._players[this._meServerID];
                playerData.cards = jsonMessage.vSelfCard;
                playerData.cards.sort(function (a, b) {
                    return b - a;
                });
            }
        }
    }

    showMeServerID() {
        console.log('meServerID:' + this._meServerID);
    }

    onceGameOver() {
        for (let idx = 0; idx < PlayerCount; idx++) {
            let playerData = this._players[idx];
            playerData.cards = new Array();
            playerData.state = eRoomPeerState.eRoomPeer_WaitNextGame;
            playerData.nJiaBei = 0;
            playerData.isTiLaChuai = 0;
            this._players[idx] = playerData;
        }
    }
};

export default new DDZPlayerData();