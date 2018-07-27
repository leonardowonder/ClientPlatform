const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import DDZPlayerItem from './DDZPlayerItem';
import HandCardLogic from '../Control/HandCardLogic';

@ccclass
export default class DDZPlayerRootLayer extends cc.Component {
    @property(DDZPlayerItem)
    m_players: DDZPlayerItem[] = [];

    init() {
        _.forEach(this.m_players, (player: DDZPlayerItem, idx: number) => {
            player.init();
            player.setLocalChairID(idx);
        });
    }

    refreshPlayerItem(idx: number, serverChairID: number) {
        if (!this._checkIdxValid(idx)) {
            cc.warn(`PlayerRootLayer setPlayerData invalid idx = ${idx}`);
            return;
        }

        this.m_players[idx].setServerChairID(serverChairID);
        this.m_players[idx].refreshView();
    }

    clearAllCards() {
        _.forEach(this.m_players, (player: DDZPlayerItem, idx: number) => {
            player.clearCards();
        });
    }

    clearAllPlayers() {
        _.forEach(this.m_players, (player: DDZPlayerItem) => {
            player.clearCards();
            player.reset();
            player.hide();
        });
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

        return this.m_players[idx].getHandCard();
    }

    setHandCard(idx: number, cardDataVec: number[]) {
        if (!this._checkIdxValid(idx)) {
            cc.warn(`PlayerRootLayer removeHandCard invalid idx = ${idx}`);
            return null;
        }

        this.m_players[idx].setHandCard(cardDataVec);
    }

    getHandCard(idx: number): number[] {
        let card: HandCardLogic = this.getCardDataByClientIdx(idx);

        let ret = null;
        if (card) {
            ret = card.m_handCardData;
        }
        return ret;
    }

    removeHandCard(idx: number, removeVec: number[]) {
        if (!this._checkIdxValid(idx)) {
            cc.warn(`PlayerRootLayer removeHandCard invalid idx = ${idx}`);
            return null;
        }

        this.m_players[idx].removeHandCard(removeVec);
    }

    addHandCard(idx: number, addVec: number[]) {
        if (!this._checkIdxValid(idx)) {
            cc.warn(`PlayerRootLayer addHandCard invalid idx = ${idx}`);
            return null;
        }

        this.m_players[idx].addHandCard(addVec);
    }

    private _checkIdxValid(idx: number) {
        return idx >= 0 && idx < this.m_players.length;
    }
};
