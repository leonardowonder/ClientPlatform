import { EmBetAreaType, eBetPool } from '../../Define/GamePlayDefine';

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
}

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
}