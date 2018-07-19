//DDZ GameDataMgr
import Singleton from '../../../../Script/Utils/Singleton';

import { eRoomState } from '../Define/DDZDefine';

class DDZGameDataLogic extends Singleton {
    _roomID: number = 0
    _roomState: number = 0
    _leftCircle: number = 0;
    _isOpen: boolean = false;
    _waitTimer: number = 0
    _curActIdex: number = 0
    _stateTime: number = 0;
    _createUID: number = 0;
    _level: number = 0;//多少局
    _payType: number = 0;
    _leftWaitTime: number = 0;
    _clubID: number = 0;
    _clubName: number = 0;
    _roomIdx: number = 0;
    _isWaitingDismiss: boolean = false;
    _applyDismissUID: number = 0;
    _agreeIdxs: number[] = [];
    _DismissLeftWaitTime: number = 0;
    _seatCnt: number = 0;
    _dzIdx: number = -1;
    _curMaxTimes: number = 0;
    _bombCnt: number = 0;
    _isChaoZhuang: number = 0;
    _forbidJoin: boolean = false;
    _maxBet: number = 0;
    _waitTiLaChuaiPlayers = [];
    _chosed: boolean = false;
    _readyPlayers = new Array();
    _diPai = new Array();
    _lastChu = new Array(3);

    init() {//init all data

    }

    clearAllData() {

    }

    setRoomInfo(info) {
        this.clearRoomInfo();
        this._roomID = info.roomID;
        this._roomState = info.state;
        this._leftCircle = info.leftCircle - 1;
        this._isOpen = info.isOpen == 1;
        this._waitTimer = 15
        this._stateTime = info.stateTime;
        this._diPai = info.diPai;
        this._dzIdx = info.dzIdx;
        this._bombCnt = info.bombCnt;
        this._curMaxTimes = info.curMaxTimes;
        if (info.opts) {
            this._clubName = info.opts.clubName;
            this._roomIdx = info.opts.roomIdx;
            this._clubID = info.opts.clubID;
            this._createUID = info.opts.uid;
            this._level = info.opts.level;//多少局
            this._payType = info.opts.payType;
            this._seatCnt = info.opts.seatCnt;
            this._maxBet = info.opts.maxBet;
            this._isChaoZhuang = info.opts.isChaoZhuang;
            this._forbidJoin = info.opts.forbidJoin == 1;
        }
        this._leftWaitTime = info.leftWaitTime;
        this._isWaitingDismiss = info.isWaitingDismiss == 1;
        if (info.stateInfo) {
            this._curActIdex = info.stateInfo.curActIdx
            if (info.stateInfo.readyPlayers) this._readyPlayers = info.stateInfo.readyPlayers;
            if (info.stateInfo.lastChu && info.stateInfo.lastChu.length) {
                for (let i = 0; i < info.stateInfo.lastChu.length; i++) {
                    this._lastChu[info.stateInfo.lastChu[i].idx] = info.stateInfo.lastChu[i].chu;
                }
            }
            if (info.stateInfo.waitTiLaChuaiPlayers && info.stateInfo.waitTiLaChuaiPlayers.length) {
                this._waitTiLaChuaiPlayers = info.stateInfo.waitTiLaChuaiPlayers
            }
            if (info.stateInfo.chosed && info.stateInfo.chosed.length) {
                this._chosed = info.stateInfo.chosed;
            }
        }
        if (this._isWaitingDismiss) {
            this._applyDismissUID = info.applyDismissUID;
            this._agreeIdxs = info.agreeIdxs;
            this._DismissLeftWaitTime = info.leftWaitTime;
        }
    }

    setRoomOpen(open) {
        this._isOpen = open;
    }

    changeRoomState(state) {
        this._roomState = state;
    }

    clearRoomInfo() {
        this._roomID = 0;
        this._roomState = 0;
        this._leftCircle = 0;
        this._isOpen = false;
        this._waitTimer = 0
        this._curActIdex = 0
        this._stateTime = 0;
        this._createUID = 0;
        this._level = 0;//多少局
        this._payType = 0;
        this._leftWaitTime = 0;
        this._clubID = 0;
        this._clubName = 0;
        this._roomIdx = 0;
        this._isWaitingDismiss = false;
        this._applyDismissUID = 0;
        this._agreeIdxs = [];
        this._DismissLeftWaitTime = 0;
        this._seatCnt = 0;
        this._dzIdx = -1;
        this._curMaxTimes = 0;
        this._bombCnt = 0;
        this._isChaoZhuang = 0;
        this._forbidJoin = false;
        this._readyPlayers = new Array();
        this._diPai = new Array();
        this._lastChu = new Array(3);
    }

    onceGameOver() {
        this._roomState = eRoomState.eRoomSate_WaitReady;
        this._dzIdx = -1;
        this._curMaxTimes = 0;
        this._readyPlayers = new Array();
        this._bombCnt = 0;
        this._diPai = new Array();
        this._lastChu = new Array(3);
        this._waitTiLaChuaiPlayers = new Array();
        // if (DDZGameData.players) {
        //     for (let idx = 0; idx < DDZGameData.players.length; idx++) {
        //         if (DDZGameData.players[idx]) {
        //             DDZGameData.players[idx].cards = new Array();
        //             DDZGameData.players[idx].state = MyUtils.eRoomPeerState.eRoomPeer_WaitNextGame;
        //             DDZGameData.players[idx].nJiaBei = 0;
        //             DDZGameData.players[idx].isTiLaChuai = 0;
        //         }
        //     }
        // }
    }
};

export default new DDZGameDataLogic();