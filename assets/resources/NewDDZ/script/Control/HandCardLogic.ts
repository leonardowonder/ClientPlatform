const { ccclass, property } = cc._decorator;
import GameLogic from '../Module/Game/GameLogic';
import { SortType } from '../Module/DDZGameDefine';

let GameLogicIns = GameLogic.getInstance();

@ccclass
export default class HandCardLogic extends cc.Component {

    @property
    m_localChairID: number = -1;

    @property
    m_serverChairID: number = -1;

    m_handCardData = [];

    init () {
        this.m_handCardData = [];
    }

    start() {

    }

    setLocalChairID (chairID) {
        this.m_localChairID = chairID;
    }

    setServerChairID (serverID) {
        this.m_serverChairID = serverID;
    }

    setHandCard (cardData) {
        this.m_handCardData = GameLogicIns.sortCardList(cardData, SortType.ST_NORMAL);
        console.log(JSON.stringify(this.m_handCardData));
    }

    removeHandCard (removeCardData) {
        this.m_handCardData = GameLogicIns.removeCardList(removeCardData, removeCardData.length, this.m_handCardData,
            this.m_handCardData.length);
        this.m_handCardData = GameLogicIns.sortCardList(this.m_handCardData, SortType.ST_NORMAL);
    }

    addHandCard (addCardData) {
        this.m_handCardData = this.m_handCardData.concat(addCardData);
        this.m_handCardData = GameLogicIns.sortCardList(this.m_handCardData, SortType.ST_NORMAL);
    }

    clear () {
        this.m_handCardData = [];
    }
};
