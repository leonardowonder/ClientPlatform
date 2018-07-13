import * as _ from 'lodash';

import Singleton from '../Singleton';

import { EmCardTpye, EmGroupType } from '../../Define/GamePlayDefine';

import { Card } from './Cards';
import StringUtils from '../StringUtils';

const findTypeOrder: EmGroupType[] = [
    EmGroupType.GroupType_AllSame,
    EmGroupType.GroupType_FlushStraight,
    EmGroupType.GroupType_Flush,
    EmGroupType.GroupType_Straight,
    EmGroupType.GroupType_Pair
];

const cardWeightDigitCount: number = 4;
const cardTypeWeightCoefficient: number = Math.floor(Math.pow(10, cardWeightDigitCount));
const cardGroupWeightCoefficient: number = Math.floor(Math.pow(10, cardWeightDigitCount * 2));

export function getGroupTypeStrFunc(groupType: EmGroupType): string {
    const baseKey: string = 'group_type_';

    let ret: string = '';
    let key: string = '';

    switch(groupType) {
        case EmGroupType.GroupType_None: {
            key = baseKey + 'none';
            break;
        }
        case EmGroupType.GroupType_Pair: {
            key = baseKey + 'pair';
            break;
        }
        case EmGroupType.GroupType_Straight: {
            key = baseKey + 'straight';
            break;
        }
        case EmGroupType.GroupType_Flush: {
            key = baseKey + 'flush';
            break;
        }
        case EmGroupType.GroupType_FlushStraight: {
            key = baseKey + 'flush_straight';
            break;
        }
        case EmGroupType.GroupType_AllSame: {
            key = baseKey + 'all_same';
            break;
        }
        default: {
            cc.warn(`CardUtils getGroupTypeStr invalid group type =${groupType}`);
            break;
        }
    }

    if (key.length > 0) {
        ret = StringUtils.getInstance().formatByKey(key);
    }
    
    return ret;
};

class CardUtils extends Singleton {
    getGroupType(cards: Card[]): EmGroupType {
        if (!this._checkCardsValid(cards)) {
            cc.warn(`CardUtils getGroupType invalid cards = ${cards}`);
            return EmGroupType.GroupType_None;
        }

        let type: EmGroupType = _.find(findTypeOrder, (type: EmGroupType) => {
            return this._isType(cards, type);
        })

        if (type == null) {
            type = EmGroupType.GroupType_None;
        }

        return type;
    }

    getGroupWeight(cards: Card[]): number {
        if (!this._checkCardsValid(cards)) {
            cc.warn(`CardUtils getGroupWeight invalid cards = ${cards}`);
            return 0;
        }

        let weight = this._getGroupWeight(cards, this.getGroupType(cards));

        return weight;
    }

    private _checkCardsValid(cards: Card[]): boolean {
        if (cards == null || cards.length != 3) {
            return false;
        }

        let valid = _.every(cards, (card: Card) => {
            return card.isCardValid();
        })

        return valid;
    }

    //card type
    private _isType(cards: Card[], type: EmGroupType): boolean {
        let ret = false;

        switch (type) {
            case EmGroupType.GroupType_AllSame: {
                ret = this._isAllSame(cards);
                break;
            }
            case EmGroupType.GroupType_FlushStraight: {
                ret = this._isFlushStraight(cards);
                break;
            }
            case EmGroupType.GroupType_Flush: {
                ret = this._isFlush(cards);
                break;
            }
            case EmGroupType.GroupType_Straight: {
                ret = this._isStraight(cards);
                break;
            }
            case EmGroupType.GroupType_Pair: {
                ret = this._isPair(cards);
                break;
            }
        }

        return ret;
    };

    private _isAllSame(cards: Card[]): boolean {
        let cardValues: number[] = _.map(cards, (card: Card) => {
            return card.value;
        });

        let valueList = _.uniq(cardValues);

        return valueList.length < 2;
    }

    private _isFlushStraight(cards: Card[]): boolean {
        return this._isFlush(cards) && this._isStraight(cards);
    }

    private _isFlush(cards: Card[]): boolean {
        let cardTypes: EmCardTpye[] = _.map(cards, (card: Card) => {
            return card.type;
        });

        let typeList = _.uniq(cardTypes);

        return typeList.length < 2;
    }

    private _isStraight(cards: Card[]): boolean {
        let cardValues: number[] = _.map(cards, (card: Card) => {
            return card.value;
        });

        let sortedList = _.sortedUniq(cardValues);

        if (sortedList.length < 3) {
            return false;
        }

        let ret = true;
        for (let i = 0; i < sortedList.length - 1; ++i) {
            if (sortedList[i + 1] - sortedList[i] != 1) {
                ret = false;
                break;
            }
        }

        // //judge A23
        // if (!ret) {
        //     ret = sortedList[0] == 2 && sortedList[1] == 3 && sortedList[2] == 14;
        // }

        return ret;
    }

    private _isPair(cards: Card[]): boolean {
        let cardValues: number[] = _.map(cards, (card: Card) => {
            return card.value;
        });

        let valueList = _.uniq(cardValues);

        return valueList.length == 2;
    }

    //get weight
    private _getGroupWeight(cards: Card[], type: EmGroupType): number {
        let weight: number = type * cardGroupWeightCoefficient;

        switch (type) {
            case EmGroupType.GroupType_AllSame: {
                weight += this._getMaxValue(cards);
                break;
            }
            case EmGroupType.GroupType_Flush:
            case EmGroupType.GroupType_None: {
                weight += this._getMaxWeight(cards);
            }
            case EmGroupType.GroupType_FlushStraight:
            case EmGroupType.GroupType_Straight: {
                weight += this._getStraightWeight(cards);
                break;
            }
            case EmGroupType.GroupType_Pair: {
                weight += this._getPairWeight(cards);
                break;
            }
        }

        return weight;
    };

    private _getMaxValue(cards: Card[]): number {
        let cardValues: number[] = _.map(cards, (card: Card) => {
            return card.value;
        });

        return _.max(cardValues);
    }

    private _getMaxWeight(cards: Card[]): number {
        let cardWeights: number[] = _.map(cards, (card: Card) => {
            return card.weight;
        });

        return _.max(cardWeights);
    }

    private _getStraightWeight(cards: Card[]): number {
        let cardWeights: number[] = _.map(cards, (card: Card) => {
            return card.weight;
        });

        return _.max(cardWeights);
    }

    private _getPairWeight(cards: Card[]): number {
        let sortedCards: Card[] = _.sortBy(cards, (card1: Card, card2: Card) => {
            return card1.weight - card2.weight;
        });

        let pairWeight = sortedCards[0].value == sortedCards[1].value ? sortedCards[1].weight : sortedCards[2].weight;
        let singleWeight = sortedCards[0].value == sortedCards[1].value ? sortedCards[2].weight : sortedCards[1].weight;

        return pairWeight * cardTypeWeightCoefficient + singleWeight;
    }
}

export default new CardUtils();
