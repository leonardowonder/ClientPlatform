import { EmBetAreaType, eBetPool, EmChipType, GoldenType, EmGroupType } from '../../Define/GamePlayDefine';

export function betAreaTypeToBetPool(type: EmBetAreaType): eBetPool {
    let ret: eBetPool = eBetPool.eBet_Max;
    switch (type) {
        case EmBetAreaType.Type_Red: {
            ret = eBetPool.eBet_Red;
            break;
        }
        case EmBetAreaType.Type_Black: {
            ret = eBetPool.eBet_Black;
            break;
        }
        case EmBetAreaType.Type_Special: {
            ret = eBetPool.eBet_Other;
            break;
        }
        default: {
            break;
        }
    }

    return ret;
};

export function betPoolToBetAreaType(type: eBetPool): EmBetAreaType {
    let ret: EmBetAreaType = EmBetAreaType.Type_Max;
    switch (type) {
        case eBetPool.eBet_Red: {
            ret = EmBetAreaType.Type_Red;
            break;
        }
        case eBetPool.eBet_Black: {
            ret = EmBetAreaType.Type_Black;
            break;
        }
        case eBetPool.eBet_Other: {
            ret = EmBetAreaType.Type_Special;
            break;
        }
        default: {
            break;
        }
    }

    return ret;
};

export function chipTypeToCoin(type: EmChipType): number {
    let coin: number = 0;

    switch (type) {
        case EmChipType.Type_Ten: {
            coin = 10;
            break;
        }
        case EmChipType.Type_Hundred: {
            coin = 100;
            break;
        }
        case EmChipType.Type_Thousand: {
            coin = 1000;
            break;
        }
        case EmChipType.Type_TenTh: {
            coin = 10000;
            break;
        }
        default: {
            cc.warn(`GameUtils chipTypeToCoin invalid type = ${type}`);
            break;
        }
    }

    return coin;
};

export function coinToChipType(coin: number): EmChipType {
    let type: EmChipType = EmChipType.Type_None;

    switch (coin) {
        case 10: {
            type = EmChipType.Type_Ten;
            break;
        }
        case 100: {
            type = EmChipType.Type_Hundred;
            break;
        }
        case 1000: {
            type = EmChipType.Type_Thousand;
            break;
        }
        case 10000: {
            type = EmChipType.Type_TenTh;
            break;
        }
        default: {
            cc.warn(`GameUtils coinToChipType invalid coin = ${coin}`);
            break;
        }
    }

    return type;
};

export function groupTypeToGoldenType(type: EmGroupType) {
    let ret: GoldenType = GoldenType.Golden_Max;
    switch (type) {
        case EmGroupType.GroupType_None: {
            ret = GoldenType.Golden_Single;
            break;
        }
        case EmGroupType.GroupType_Pair: {
            ret = GoldenType.Golden_Double;
            break;
        }
        case EmGroupType.GroupType_Straight: {
            ret = GoldenType.Golden_Straight;
            break;
        }
        case EmGroupType.GroupType_Flush: {
            ret = GoldenType.Golden_Flush;
            break;
        }
        case EmGroupType.GroupType_FlushStraight: {
            ret = GoldenType.Golden_StraightFlush;
            break;
        }
        case EmGroupType.GroupType_AllSame: {
            ret = GoldenType.Golden_ThreeCards;
            break;
        }
        default: {
            cc.warn(`GameUtils groupTypeToGoldenType invalid type =${type}`);
            break;
        }
    }

    return ret;
};

export function goldenTypeToGroupType(type: GoldenType) {
    let ret: EmGroupType = EmGroupType.GroupType_None;
    switch (type) {
        case GoldenType.Golden_Single: {
            ret = EmGroupType.GroupType_None;
            break;
        }
        case GoldenType.Golden_Double: {
            ret = EmGroupType.GroupType_Pair;
            break;
        }
        case GoldenType.Golden_Straight: {
            ret = EmGroupType.GroupType_Straight;
            break;
        }
        case GoldenType.Golden_Flush: {
            ret = EmGroupType.GroupType_Flush;
            break;
        }
        case GoldenType.Golden_StraightFlush: {
            ret = EmGroupType.GroupType_FlushStraight;
            break;
        }
        case GoldenType.Golden_ThreeCards: {
            ret = EmGroupType.GroupType_AllSame;
            break;
        }
        default: {
            cc.warn(`GameUtils groupTypeToGoldenType invalid type =${type}`);
            break;
        }
    }

    return ret;
};