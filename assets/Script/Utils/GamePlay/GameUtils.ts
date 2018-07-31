import { EmBetAreaType, eBetPool, EmChipType, GoldenType, EmGroupType, EmRecordType, EmCardTpye, eCardType, GroupTypeInfo, Normal_Type_Max_Value } from '../../Define/GamePlayDefine';

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

export function recordTypeToBetPool(type: EmRecordType): eBetPool {
    let ret: eBetPool = eBetPool.eBet_Max;
    switch (type) {
        case EmRecordType.Type_Red: {
            ret = eBetPool.eBet_Red;
            break;
        }
        case EmRecordType.Type_Black: {
            ret = eBetPool.eBet_Black;
            break;
        }
        default: {
            cc.warn(`GameUtils recordTypeToBetPool invalid type = ${type}`);
            break;
        }
    }

    return ret;
};

export function betPoolToRecordType(type: eBetPool): EmRecordType {
    let ret: EmRecordType = EmRecordType.Type_None;
    switch (type) {
        case eBetPool.eBet_Red: {
            ret = EmRecordType.Type_Red;
            break;
        }
        case eBetPool.eBet_Black: {
            ret = EmRecordType.Type_Black;
            break;
        }
        default: {
            cc.warn(`GameUtils betPoolToRecordType invalid type = ${type}`);
            break;
        }
    }

    return ret;
};

export function emCardTypeToCardType(type: EmCardTpye): eCardType {
    let ret: eCardType = eCardType.eCard_Max;
    switch (type) {
        case EmCardTpye.CardType_Diamond: {
            ret = eCardType.eCard_Diamond;
            break;
        }
        case EmCardTpye.CardType_Club: {
            ret = eCardType.eCard_Club;
            break;
        }
        case EmCardTpye.CardType_Heart: {
            ret = eCardType.eCard_Heart;
            break;
        }
        case EmCardTpye.CardType_Spade: {
            ret = eCardType.eCard_Sword;
            break;
        }
        default: {
            cc.warn(`GameUtils emCardTypeToCardType invalid type = ${type}`);
            break;
        }
    }

    return ret;
};

export function cardTypeToBetEmCardType(type: eCardType): EmCardTpye {
    let ret: EmCardTpye = EmCardTpye.CardType_None;
    switch (type) {
        case eCardType.eCard_Diamond: {
            ret = EmCardTpye.CardType_Diamond;
            break;
        }
        case eCardType.eCard_Club: {
            ret = EmCardTpye.CardType_Club;
            break;
        }
        case eCardType.eCard_Heart: {
            ret = EmCardTpye.CardType_Heart;
            break;
        }
        case eCardType.eCard_Sword: {
            ret = EmCardTpye.CardType_Spade;
            break;
        }
        default: {
            cc.warn(`GameUtils cardTypeToBetEmCardType invalid type = ${type}`);
            break;
        }
    }

    return ret;
};

export function judgeSpecialType(typeInfo: GroupTypeInfo) {
    let isSpecial: boolean = false;
    if (typeInfo.type > EmGroupType.GroupType_None && typeInfo.type < EmGroupType.GroupType_Max) {
        if (typeInfo.type == EmGroupType.GroupType_Pair) {
            if (typeInfo.value > Normal_Type_Max_Value) {
                isSpecial = true;
            }
        }
        else {
            isSpecial = true;
        }
    }

    return isSpecial;
}