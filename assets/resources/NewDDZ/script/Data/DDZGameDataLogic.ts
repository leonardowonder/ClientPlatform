//DDZ GameDataMgr
import Singleton from '../../../../Script/Utils/Singleton';

import * as _ from 'lodash';

export class DDZLastDiscardInfo {
    idx: number = 0;
    chu: number[] = [];

    // updateInfo(info) {
    //     if (info) {
    //         this.idx = info.idx;
    //         this.chu = info.chu;
    //     }
    // }

    reset() {
        this.idx = 0;
        this.chu.length = 0;
    }
}

export class DDZRoomOptsInfo {
    deskFee: number = 0;
    gameType: number = 0;
    seatCnt: number = 0;

    // updateInfo(info) {
    //     if (info) {
    //         this.deskFee = info.deskFee;
    //         this.gameType = info.gameType;
    //         this.seatCnt = info.seatCnt;
    //     }
    // }

    reset() {
        this.deskFee = 0;
        this.gameType = 0;
        this.seatCnt = 0;
    }
}

export class DDZRoomStateInfo {
    curActIdx: number = 0;
    curMaxTimes: number = 0;
    lastChu: DDZLastDiscardInfo[] = [];

    // updateInfo(stateInfo) {
    //     if (stateInfo) {
    //         this.curActIdx = stateInfo.curActIdx;
    //         this.curMaxTimes = stateInfo.curMaxTimes;
    //         _.forEach(stateInfo.lastChu, (chuInfo) => {
    //             if (chuInfo) {
    //                 let newInfo: DDZLastDiscardInfo = new DDZLastDiscardInfo();
    //                 newInfo.updateInfo(chuInfo);

    //                 this.lastChu.push(newInfo);
    //             }
    //         })
    //     }
    // }

    reset() {
        this.curActIdx = 0;
        this.curMaxTimes = 0;
    }
}

export class DDZRoomInfo {
    bombCnt: number = 0;
    bottom: number = 0;
    dzIdx: number = 0;
    diPai: number[] = [];
    opts: DDZRoomOptsInfo = null;
    leftWaitTime: number = 0;
    roomID: number = 0;
    state: number = 0;
    stateInfo: DDZRoomStateInfo = null;
    stateTime: number = 0;

    constructor() {
        this.opts = new DDZRoomOptsInfo();
        this.stateInfo = new DDZRoomStateInfo();
    }

    reset() {
        this.bombCnt = 0;
        this.bottom = 0;
        this.dzIdx = 0;
        this.diPai = [];
        this.opts && this.opts.reset();
        this.leftWaitTime = 0;
        this.roomID = 0;
        this.state = 0;
        this.stateInfo && this.stateInfo.reset();
        this.stateTime = 0;
    }
}

class DDZGameDataLogic extends Singleton {
    private _roomInfo: DDZRoomInfo = null;

    init() {//init all data
        this._roomInfo = new DDZRoomInfo();

        super.init();
    }

    getRoomInfo(): DDZRoomInfo {
        return this._roomInfo;
    }

    clearAllData() {
        this.clearRoomInfo();
    }

    setRoomInfo(info) {
        this.clearRoomInfo();
        _.merge(this._roomInfo, info);
    }

    changeRoomState(state: number) {
        if (this._roomInfo) {
            this._roomInfo.state = state;
        }
    }

    clearRoomInfo() {
        if (this._roomInfo) {
            this._roomInfo.reset();
        }
    }

    onceGameOver() {
        if (this._roomInfo) {
            this._roomInfo.reset();
        }
    }
};

export default new DDZGameDataLogic();