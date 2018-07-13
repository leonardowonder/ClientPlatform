import * as _ from 'lodash';

import { EmCardTpye, EmGroupType } from '../../Define/GamePlayDefine';

import CardUtils from './CardUtils';

const CardTypeStrList: string[] = ['♦', '♣', '♥', '♠'];
const CardValueStrList: string[] = ['err', 'err', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

export class Card {
    orgNum: number = 0;
    type: EmCardTpye = EmCardTpye.CardType_None;
    value: number = 0;
    weight: number = 0;

    constructor(num: number = 0) {
        this.setCard(num);
    }

    setCard(num: number) {
        this.orgNum = num;
        this.type = this._parseCardType(num);
        this.value = this._parseCardValue(num);
        this.weight = this._parseCardWeight(num);
    }

    reset() {
        this.orgNum = 0;
        this.type = 0;
        this.value = 0;
        this.weight = 0;
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
    private _cards: Card[] = [];
    private _groupType: EmGroupType = EmGroupType.GroupType_None;
    private _groupWeight: number = 0;

    constructor() {
        let cnt: number = 0;

        while(cnt++ < 3) {
            let newCard: Card = new Card();
            this._cards.push(newCard);
        }

        this.reset();
    }

    setGroupByNumbers(numbers: number[]) {
        this._cards = _.map(numbers, (number) => {
            return new Card(number);
        });

        this._updateTypeAndWeight();
    }

    setGroupByCards(cards: Card[]) {
        this._cards = cards;

        this._updateTypeAndWeight();
    }

    getCards(): Card[] { return this._cards; }
    getGroupType(): EmGroupType { return this._groupType; }
    getWeight(): number { return this._groupWeight; }

    reset() {
        _.forEach(this._cards, (card: Card) => {
            card && card.reset();
        });

        this._updateTypeAndWeight();
    }

    private _updateTypeAndWeight() {
        this._groupType = CardUtils.getInstance().getGroupType(this._cards);
        this._groupWeight = CardUtils.getInstance().getGroupWeight(this._cards);
    }
}