import { EmGroupType } from '../../Define/GamePlayDefine';

export function getOddsByType(type: EmGroupType): number {
    let odds: number = 0;

    switch(type) {
        case EmGroupType.GroupType_Pair: {
            odds = 2;
            break;
        }
        case EmGroupType.GroupType_Straight: {
            odds = 3;
            break;
        }
        case EmGroupType.GroupType_Flush: {
            odds = 4;
            break;
        }
        case EmGroupType.GroupType_FlushStraight: {
            odds = 10;
            break;
        }
        case EmGroupType.GroupType_AllSame: {
            odds = 15;
            break;
        }
        default: {
            cc.warn(`OddsUtils getOddsByType invalid groupType = ${type}`);
            break;
        }
    }

    return odds;
}