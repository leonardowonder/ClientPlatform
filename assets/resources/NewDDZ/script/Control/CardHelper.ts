const { ccclass } = cc._decorator;

import GameLogic from '../Module/Game/GameLogic';
import { DDZCardType, SortType } from '../Module/DDZGameDefine';

let GameLogicIns = GameLogic.getInstance();

@ccclass
export default class CardHelper extends cc.Component {

    _delegate = null;
    _curTipID = 0;
    _searchResult = null;
    _sendCardType = 0;//myType
    _serverCardType = -1;//server type
    _sendCardVec = [];

    init (delegate) {
        this._delegate = delegate;
        this._sendCardVec = [];
        this._sendCardType = DDZCardType.Type_None;
        this._serverCardType = -1;
        this._curTipID = 0;
        this._searchResult = null;
    }

    clearSendCardType () {
        this._sendCardVec = [];
        this._sendCardType = DDZCardType.Type_None;
        this._serverCardType = -1;
        this._curTipID = 0;
        this._searchResult = null;
    }

    setCurSendCard (cardDataVec, serverCardType) {
        this._sendCardVec = [];
        for (let i in cardDataVec) {
            this._sendCardVec.push(cardDataVec[i]);
        }
        this._sendCardVec = GameLogicIns.sortCardList(this._sendCardVec, SortType.ST_NORMAL);
        this._sendCardType = GameLogicIns.switchServerTypeToCardType(serverCardType, this._sendCardVec);
        this._serverCardType = serverCardType;
        console.log('CurServerType:' + this._serverCardType + 'CurLocalType:' + this._sendCardType);
    }

    analyseSelectedCard (selectedCardVec) {
        let cardTypeVec = GameLogicIns.getCardType(selectedCardVec);
        if (cardTypeVec.length == 1 && cardTypeVec[0] == DDZCardType.Type_None) {
            return [];
        }
        return cardTypeVec;
    }

    searchOutCard (handCardVec) {
        if (this._sendCardVec.length == 0) {
            return null;
        }
        let searchResult = GameLogicIns.searchOutCard(handCardVec, this._sendCardVec, this._sendCardType);
        return searchResult;
    }

    setCurTipResult (searchResult) {
        this._searchResult = searchResult;
    }

    getTip () {
        if (this._searchResult == null) {
            return -1;
        }
        let searchCount = this._searchResult.cbSearchCount;
        if (searchCount == 0) {
            return -1;
        }
        if (this._curTipID == searchCount) {
            this._curTipID = 0;
        }
        let curTipID = this._curTipID;
        this._curTipID++;
        return {
            curID: curTipID,
            result: this._searchResult,
        }
    }

    compareCard (selectedCardVec) {
        if (this._sendCardType == DDZCardType.Type_None) {
            return true;
        }
        return GameLogicIns.compareCard(this._sendCardVec, selectedCardVec, this._sendCardType);
    }
};
