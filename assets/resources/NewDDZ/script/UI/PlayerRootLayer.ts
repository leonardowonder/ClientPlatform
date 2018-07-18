const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import DDZPlayerItem from './DDZPlayerItem';
import HandCardLogic from '../Control/HandCardLogic';

@ccclass
export default class PlayerRootLayer extends cc.Component {
    @property(DDZPlayerItem)
    m_players: DDZPlayerItem[] = [];

    @property(HandCardLogic)
    m_cards: HandCardLogic[] = [];

    init() {
        _.forEach(this.m_players, (player: DDZPlayerItem) => {
            player.init();
        });

        _.forEach(this.m_cards, (card: HandCardLogic, idx: number) => {
            card.setLocalChairID(idx);
        });
    }

    setPlayerData(idx: number, data) {
        if (!this._checkIdxValid(idx)) {
            cc.warn(`PlayerRootLayer setPlayerData invalid idx = ${idx}`);
            return;
        }

        this.m_players[idx].setPlayerData(data);
    }

    clearPlayerData(idx: number) {
        if (!this._checkIdxValid(idx)) {
            cc.warn(`PlayerRootLayer clearPlayerData invalid idx = ${idx}`);
            return;
        }

        this.m_players[idx].clearPlayerData();
    }

    hide(idx: number) {
        if (!this._checkIdxValid(idx)) {
            cc.warn(`PlayerRootLayer hide invalid idx = ${idx}`);
            return;
        }

        this.m_players[idx].hide();
    }

    updateState(idx: number, state) {
        if (!this._checkIdxValid(idx)) {
            cc.warn(`PlayerRootLayer hide invalid idx = ${idx}`);
            return;
        }

        this.m_players[idx].setState(state);
    }

    getPlayerByClientIdx(idx: number): DDZPlayerItem {
        if (!this._checkIdxValid(idx)) {
            cc.warn(`PlayerRootLayer getPlayerByClientIdx invalid idx = ${idx}`);
            return null;
        }

        return this.m_players[idx];
    }

    getCardDataByClientIdx(idx: number): HandCardLogic {
        if (!this._checkIdxValid(idx)) {
            cc.warn(`PlayerRootLayer getCardDataByClientIdx invalid idx = ${idx}`);
            return null;
        }

        return this.m_cards[idx];
    }

    setHandCard(idx: number, cardDataVec) {
        let card: HandCardLogic = this.getCardDataByClientIdx(idx);

        card.setHandCard(cardDataVec);
    }

    getHandCard(idx: number) {
        let card: HandCardLogic = this.getCardDataByClientIdx(idx);

        let ret = null;
        if (card) {
            ret = card.m_handCardData;
        }
        return ret;
    }

    removeHandCard(idx: number, removeVec) {
        if (!this._checkIdxValid(idx)) {
            cc.warn(`PlayerRootLayer removeHandCard invalid idx = ${idx}`);
            return null;
        }
        
        this.m_cards[idx].removeHandCard(removeVec);
    }

    addHandCard(idx: number, addVec) {
        if (!this._checkIdxValid(idx)) {
            cc.warn(`PlayerRootLayer addHandCard invalid idx = ${idx}`);
            return null;
        }

        this.m_cards[idx].addHandCard(addVec);
    }

    private _checkIdxValid(idx: number) {
        return idx >= 0 && idx < this.m_players.length && idx < this.m_cards.length;
    }
};
