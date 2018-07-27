import * as _ from 'lodash';

import { eGameType } from '../../Define/ClientDefine';
import { eRoomState, GoldenType, eBetPool } from '../../Define/GamePlayDefine';

export class TypeRecordInfo {
    T: GoldenType = GoldenType.Golden_None;
    V: number = 0;
    
    reset() {
        this.T = GoldenType.Golden_None;
        this.V = 0;
    }
}

export class RoomOptsInfo {
    // deskFee: number = 0;
    // enterLimitLow: number = 0;
    // enterLimitTop: number = 0;
    level: number = 0;
    gameType: eGameType = eGameType.eGame_Max;
    maxBet: number = 0;
    seatCnt: number = 0;

    reset() {
        this.level = 0;
        this.maxBet = 0;
        this.seatCnt = 0;
        this.gameType = eGameType.eGame_Max;
    }
}

export default class RoomData {
    bankerID: number = 0;
    roomID: number = 0;
    opts: RoomOptsInfo = null;
    state: eRoomState = eRoomState.eRoomState_StartGame;

    stateTime: number = 0;
    vBetPool: number[] = [];
    vTypeRecord: TypeRecordInfo[] = [];
    vWinRecord: eBetPool[] = [];

    constructor() {
        this.opts = new RoomOptsInfo();
    }

    setRoomData(data) {
        _.merge(this, data);
    }

    reset() {
        this.roomID = 0;
        this.opts && this.opts.reset();

        if (this.vTypeRecord) {
            this.vTypeRecord.length = 0;
        }
    }
}