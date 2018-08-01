import Singleton from '../../../../Script/Utils/Singleton';

import * as _ from 'lodash';

import { eRoomState, eRoomPeerState } from '../Define/DDZDefine';
import UserData from '../../../../Script/Data/UserData';
var PlayerCount = 3;

let userData = UserData.getInstance().getUserData();


export class DDZPlayerData {
    uid: number = 0;

    idx: number = 0;
    chips: number = 0;
    holdCards: number[] = [];
    name: string = '';
    head: string = '';
    state: number = 0;
    holdCardCnt: number = 0;
    isOnline: number = 0;

    setPlayerData(jsonMessage) {
        _.merge(this, jsonMessage);
    }

    isValid(): boolean {
        return this.uid > 0;
    }

    isTuoGuan(): boolean {
        return this.haveState(eRoomPeerState.eRoomPeer_SysAutoAct);
    }

    haveState(targetState: number): boolean {
        return (this.state & targetState) == targetState;
    }

    reset() {
        this.uid = 0;

        this.idx = 0;
        this.chips = 0;
        this.holdCards = [];
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

    clearAllPlayerData() {
        _.forEach(this._players, (player: DDZPlayerData) => {
            player.reset();
        })
    }

    getPlayerDataByUID(uid) {
        var data = null;

        data = _.find(this._players, (player: DDZPlayerData) => {
            return uid == player.uid;
        })

        return data;
    }

    getPlayerDataByServerIdx(idx: number) {
        var data = null;

        if (idx >= 0 && idx < this._players.length) {
            data = this._players[idx];
        }

        return data;
    }

    updatePlayerInfo(jsonMessage) {
        this.clearAllPlayerData();
        if (jsonMessage.players && jsonMessage.players.length) {
            for (let idx = 0; idx < jsonMessage.players.length; idx++) {
                if (jsonMessage.players[idx].idx < 3) {
                    let serverIDx = jsonMessage.players[idx].idx;
                    let playerData: DDZPlayerData = this._players[serverIDx];
                    if (playerData) {
                        playerData.setPlayerData(jsonMessage.players[idx]);
                        if (playerData.uid == userData.uid) {
                            this._meServerID = serverIDx;
                            this.showMeServerID();
                        }
                    }
                }
            }
        }
    }

    onPlayerSitDown(jsonMessage) {
        let playerData = this._players[jsonMessage.idx];
        playerData.setPlayerData(jsonMessage);
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
        let playerData: DDZPlayerData = this._players[jsonMessage.idx];
        playerData && playerData.reset();
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
            playerData.holdCards = jsonMessage.vSelfCard;
            playerData.holdCards.sort(function (a, b) {
                return b - a;
            });
        }
    }

    showMeServerID() {
        cc.log('DDZPlayerDataManager showMeServerID meServerID:' + this._meServerID);
    }

    onceGameOver() {
        this.clearAllPlayerData();
    }
};

export default new DDZPlayerDataManager();