import * as _ from 'lodash';

import CardUtils, { EmCardTpye, EmGroupType } from './CardUtils';

const CardTypeStrList: string[] = ['♦', '♣', '♥', '♠'];
const CardValueStrList: string[] = ['err', 'err', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

export class Card {
    readonly type: EmCardTpye;
    readonly value: number;
    readonly weight: number;

    constructor(number: number) {
        this.type = this._parseCardType(number);
        this.value = this._parseCardValue(number);
        this.weight = this._parseCardWeight(number);
    }

    isCardValid(): boolean {
        return this.type > EmCardTpye.CardType_None && this.type < EmCardTpye.CardType_Max &&
            this.value > 1 && this.value < 15;
    }

    getStr(): string {
        return CardTypeStrList[this.type] + CardValueStrList[this.value];
    }

    private _parseCardType(cardNum: number): number {
        return (cardNum & 0x07);
    }

    private _parseCardValue(cardNum: number): number {
        return (cardNum >> 3);
    }

    private _parseCardWeight(cardNum: number): number {
        return 100 * this._parseCardType(cardNum) + this._parseCardValue(cardNum);
    }
}

export class CardGroup {
    private readonly _cards: Card[] = [];
    private readonly _groupType: EmGroupType = EmGroupType.GroupType_None;
    private readonly _groupWeight: number = 0;

    constructor(numbers: number[]) {
        this._cards = _.map(numbers, (number) => {
            return new Card(number);
        });

        this._groupType = CardUtils.getInstance().getGroupType(this._cards);
        this._groupWeight = CardUtils.getInstance().getGroupWeight(this._cards);
    }

    getCards(): Card[] { return this._cards; }
    getGroupType(): EmGroupType { return this._groupType; }
    getWeight(): number { return this._groupWeight; }
}