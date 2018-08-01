import * as _ from 'lodash';

import { eGameType } from '../../Define/ClientDefine';
import { eRoomState, GoldenType, eBetPool } from '../../Define/GamePlayDefine';

export class TypeRecordInfo {
    T: GoldenType = GoldenType.Golden_None;
    V: number = 0;

    constructor(type: GoldenType, value: number) {
        this.T = type;
        this.V = value;
    }
    
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
    roomID: number = 0;

    bankerID: number = 0;
    bankerCoin: number = 0;
    opts: RoomOptsInfo = null;
    state: eRoomState = eRoomState.eRoomState_StartGame;
    bestBetUID: number = 0;
    bestBetCoin: number = 0;
    richestUID: number = 0;
    richestCoin: number = 0;

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

    addTypeRecord(recordInfo: TypeRecordInfo) {
        if (this.vTypeRecord == null) {
            this.vTypeRecord = [];
        }
        this.vTypeRecord.push(recordInfo);
    }

    addWinRecrod(record: eBetPool) {
        if (this.vWinRecord == null) {
            this.vWinRecord = [];
        }
        this.vWinRecord.push(record);
    }

    updateSpecialInfo(richestUID: number, richestCoin: number, bestBetUID: number, bestBetCoin: number) {
        this.richestUID = richestUID;
        this.richestCoin = richestCoin;
        
        this.bestBetUID = bestBetUID;
        this.bestBetCoin = bestBetCoin;
    }

    reset() {
        this.roomID = 0;

        this.bankerID = 0;
        this.state = eRoomState.eRoomState_StartGame;
        this.bestBetUID = 0;
        this.bestBetCoin = 0;
        this.richestUID = 0;
        this.richestCoin = 0;

        this.opts && this.opts.reset();

        if (this.vBetPool) {
            this.vBetPool.length = 0;
        }

        if (this.vTypeRecord) {
            this.vTypeRecord.length = 0;
        }

        if (this.vWinRecord) {
            this.vWinRecord.length = 0;
        }
    }
}