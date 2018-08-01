import { GoldenType, eBetPool } from './GamePlayDefine';
import BankerData from '../Data/GamePlay/BankerData';

export class CardsInfo {
    cards: number[] = [];
    T: GoldenType = GoldenType.Golden_None;
    V: number = 0;
}

export class WinInfo {
    idx: number = 0;
    offset: number = 0;

    constructor(info) {
        this.idx = info.idx;
        this.offset = info.offset;
    }
}

export class ResultMessegeInfo {
    bankerOffset: number = 0;
    bestBetOffset: number = 0;
    richestOffset: number = 0;
    selfOffset: number = 0;

    black: CardsInfo = null;
    red: CardsInfo = null;
    isRedWin: number = 0;
    result: WinInfo[] = [];
}

export class BetMessageInfo {
    uid: number = 0;
    idx: number = 0;
    coin: number = 0;
    poolType: eBetPool = eBetPool.eBet_Max;
}

export class UpdateBankerMessageInfo {
    newBankerID: number = 0;
    coin: number = 0;
}

export class BankerListMessageInfo {
    list: BankerData[] = [];
}