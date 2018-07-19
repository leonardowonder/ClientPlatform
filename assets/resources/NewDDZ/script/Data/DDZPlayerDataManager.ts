import Singleton from '../../../../Script/Utils/Singleton';

import * as _ from 'lodash';

import { eMsgType } from '../../../../Script/Define/MessageIdentifer';

import ClientDefine from '../../../../Script/Define/ClientDefine';

import DDZGameDataLogic from './DDZGameDataLogic';
import { eRoomState, eRoomPeerState } from '../Define/DDZDefine';
import UserData from '../../../../Script/Data/UserData';
import PlayerData from '../../../../Script/Data/GamePlay/PlayerData';
var PlayerCount = 3;

let userData = UserData.getInstance();

export class DDZPlayerData {
    uid: number = 0;

    idx: number = 0;
    chips: number = 0;
    cards: number[] = [];
    name: string = '';
    head: string = '';
    state: number = 0;
    holdCardCnt: number = 0;
    isOnline: number = 0;

    setPlayerData(jsonMessage) {
        _.merge(this, jsonMessage);
    }

    reset() {
        this.uid = 0;
    
        this.idx = 0;
        this.chips = 0;
        this.cards = [];
        this.name = '';
        this.head = '';
        this.state = 0;
        this.holdCardCnt = 0;
        this.isOnline = 0;
    }
}

class DDZPlayerDataManager extends Singleton {

    _players: DDZPlayerData[] = [];
    _meServerID: number = -1;

    init() {
        super.init();

        this._players.length = 0;
        this._meServerID = -1;

        for (let idx = 0; idx < PlayerCount; idx++) {
            let player: DDZPlayerData = new DDZPlayerData();
            this._players.push(player);
        }
    }

    clearData() {
        _.forEach(this._players, (player: PlayerData) => {
            player.reset();
        })
    }

    getPlayerDataByUID(uid) {
        var data = null;
        if (this._players != null) {
            for (let idx = 0; idx < DDZGameDataLogic.getInstance()._seatCnt; idx++) {
                let playerData = this._players[idx];
                if (playerData != undefined && playerData.uid == uid) {
                    data = playerData;
                    break;
                }
            }
        }
        return data;
    }

    updatePlayerInfo(jsonMessage) {
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
                    }
                }
            }
        }
    }

    updatePlayerData(jsonMessage) {
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
    }

    onPlayerSitDown(jsonMessage) {
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
    }

    onPlayerStandUp(jsonMessage) {
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
    }

    onRoomChangeState(jsonMessage) {
        if (jsonMessage.newState == eRoomState.eRoomState_StartGame) {
            for (let i = 0; i < 3; i++) {
                let playerData = this._players[i];
                playerData.state = eRoomPeerState.eRoomPeer_CanAct;
                this._players[i] = playerData;
            }
        }
    }

    onStartGame(jsonMessage) {
        if (jsonMessage.vSelfCard && jsonMessage.vSelfCard.length) {
            let playerData = this._players[this._meServerID];
            playerData.cards = jsonMessage.vSelfCard;
            playerData.cards.sort(function (a, b) {
                return b - a;
            });
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

export default new DDZPlayerDataManager();