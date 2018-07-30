const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';
import * as async from 'async';

import { GroupTypeInfo } from '../../../Define/GamePlayDefine';

import { getGroupTypeStrFunc } from '../../../Utils/GamePlay/CardUtils';

import CardDisplay from '../../../Component/GamePlay/Common/CardDisplay';

@ccclass
export default class CardsContainer extends cc.Component {
    @property(cc.Label)
    m_cardTypeLabel: cc.Label = null;

    @property(CardDisplay)
    m_cards: CardDisplay[] = [];

    @property(cc.Layout)
    m_layout: cc.Layout = null;

    onLoad() {
        this.reset();
    }

    reset() {
        this.m_layout.enabled = true;

        this.m_cardTypeLabel.string = '';
        _.forEach(this.m_cards, (card: CardDisplay) => {
            // card.node.active = false;
            card.displayCardBack();
        });
    }

    setCards(nums: number[]) {
        if (nums.length != this.m_cards.length) {
            cc.warn(`CardsContainer setCards invalid length = ${nums.length}`);
            return;
        }
        
        _.forEach(this.m_cards, (card: CardDisplay, idx) => {
            card.setNum(nums[idx]);
        });
    }

    distributeCards() {
        this.m_cardTypeLabel.string = '';
        
        async.waterfall(
            [
                (next) => {
                    this.m_layout.enabled = false;

                    _.forEach(this.m_cards, (card: CardDisplay) => {
                        card.node.active = true;
                        card.node.opacity = 0;
                        card && card.displayCardBack();
                    });

                    next();
                },
                (next) => {
                    this._playDistributeCardsAnim(next);
                }
            ],
            () => {
                this.m_layout.enabled = true;
            }
        )
    }

    flipCards() {
        _.forEach(this.m_cards, (card: CardDisplay) => {
            card.flip();
        });
    }

    setCardType(typeInfo: GroupTypeInfo) {
        let str: string = getGroupTypeStrFunc(typeInfo);

        this.m_cardTypeLabel.string = str;
    }

    private _playDistributeCardsAnim(callback: Function) {
        let fadeAction: cc.ActionInterval = cc.fadeIn(0.5).easing(cc.easeIn(2));
        
        async.forEachOf(this.m_cards,
            (card: CardDisplay) => {
                let targetNode = card.node;
                targetNode.runAction(fadeAction.clone());
            },
            () => {
                callback && callback();
            });
    }
}