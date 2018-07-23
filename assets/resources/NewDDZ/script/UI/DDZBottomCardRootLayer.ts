const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import DDZSmallCardNode from './DDZSmallCardNode'

@ccclass
export default class DDZBottomCardRootLayer extends cc.Component {
    @property(DDZSmallCardNode)
    m_bottomCards: DDZSmallCardNode[] = [];

    @property(cc.Label)
    m_basescoreLabel: cc.Label = null;

    @property(cc.Label)
    m_timesLabel: cc.Label = null;

    setBottomCards(cards: number[]) {
        if (cards == null || cards.length != this.m_bottomCards.length) {
            cc.warn(`DDZBottomCardRootLayer setBottomCards invalid cards len = ${cards.length}`);
            return;
        }

        _.forEach(this.m_bottomCards, (card: DDZSmallCardNode, idx) => {
            card.initWithCardData(cards[idx]);
        });
    }

    setBaseScroe(baseScore: number) {
        this.m_basescoreLabel.string = baseScore.toString();
    }

    setTimesLabel(times: number) {        
        this.m_timesLabel.string = times.toString();
    }

    reset() {
        this.resetBottomCards();
        this.m_basescoreLabel.string = '';
        this.m_timesLabel.string = '';
    }

    resetBottomCards() {
        _.forEach(this.m_bottomCards, (card: DDZSmallCardNode) => {
            card.setCardBack();
        });
    }
}