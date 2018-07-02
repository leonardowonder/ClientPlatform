import * as _ from 'lodash';

import Singleton from './Singleton';
import { Card } from './Cards';

export enum EmCardTpye {
    CardType_None = 0,
    CardType_Diamond,
    CardType_club,
    CardType_Heart,
    CardType_Spade,
    CardType_Max
}

export enum EmGroupType {
    GroupType_None = 0,
    GroupType_Pair,
    GroupType_Straight,
    GroupType_Flush,
    GroupType_FlushStraight,
    GroupType_AllSame,
    GroupType_Max
};

const findTypeOrder: EmGroupType[] = [
    EmGroupType.GroupType_AllSame,
    EmGroupType.GroupType_FlushStraight,
    EmGroupType.GroupType_Flush,
    EmGroupType.GroupType_Straight,
    EmGroupType.GroupType_Pair
];

class CardUtils extends Singleton {
    getGroupType(cards: Card[]): EmGroupType {
        if (!this._checkCardsValid(cards)) {
            cc.warn(`CardUtils getGroupType invalid cards = ${cards}`);
            return;
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

        let weight = this._getWeight(cards, this.getGroupType(cards)); 

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
    private _getWeight(cards: Card[], type: EmGroupType): number {
        let ret: number = type * 1000;

        switch (type) {
            case EmGroupType.GroupType_AllSame:
            case EmGroupType.GroupType_Flush:
            case EmGroupType.GroupType_None: {
                ret += this._getMaxValue(cards);
                break;
            }
            case EmGroupType.GroupType_FlushStraight:
            case EmGroupType.GroupType_Straight: {
                ret += this._getStraightWeight(cards);
                break;
            }
            case EmGroupType.GroupType_Pair: {
                ret += this._getPairWeight(cards);
                break;
            }
        }

        return ret;
    };

    private _getMaxValue(cards: Card[]): number {
        let cardValues: number[] = _.map(cards, (card: Card) => {
            return card.value;
        });

        return _.max(cardValues);
    }

    private _getStraightWeight(cards: Card[]): number {
        let cardValues: number[] = _.map(cards, (card: Card) => {
            return card.value;
        });

        return _.max(cardValues);
    }

    private _getPairWeight(cards: Card[]): number {
        let cardValues: number[] = _.map(cards, (card: Card) => {
            return card.value;
        });

        let sortedList = _.sortBy(cardValues);

        let pairValue = sortedList[0] == sortedList[1] ? sortedList[0] : sortedList[2];
        let singleValue = sortedList[0] == sortedList[1] ? sortedList[2] : sortedList[0];

        return pairValue * 100 + singleValue;
    }
}

export default new CardUtils();
