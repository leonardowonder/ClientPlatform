import * as _ from 'lodash';

import { EmCampType } from '../../Define/GamePlayDefine';

import { CardGroup } from '../../Utils/GamePlay/Cards';

export default class CardData {
    private m_cardGroups: CardGroup[] = [];

    constructor() {
        let cnt: number = 1;

        while(cnt++ < EmCampType.Type_Max) {
            let newGroup = new CardGroup();
            this.m_cardGroups.push(newGroup);
        }
    }
    
    clearCards() {
        _.forEach(this.m_cardGroups, (group: CardGroup) => {
            group && group.reset();
        });
    }

    getCardGroupByType(type: EmCampType): CardGroup {
        if (!this._checkTypeValid(type)) {
            cc.warn(`CardData getCardGroupByType invalid type =${type}`);
            return;
        }

        let targetIdx: number = this._getIdxByType(type);

        return this.m_cardGroups[targetIdx];
    }

    setCardGroupByType(type: EmCampType, nums: number[]) {
        if (!this._checkTypeValid(type)) {
            cc.warn(`CardData setCardGroupByType invalid type =${type}`);
            return;
        }

        let targetIdx: number = this._getIdxByType(type);

        this.m_cardGroups[targetIdx].setGroupByNumbers(nums);
    }

    private _checkTypeValid(type: EmCampType) {
        return type > EmCampType.Type_None && type < EmCampType.Type_Max;
    }

    private _getIdxByType(type: EmCampType): number {
        let idx: number = type == EmCampType.Type_Red ? 0 : 1;

        return idx;
    }
}