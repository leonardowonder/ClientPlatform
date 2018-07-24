import GameLogic from '../Module/Game/GameLogic';
import { SortType } from '../Module/DDZGameDefine';

let GameLogicIns = GameLogic.getInstance();

export default class HandCardLogic {
    
    m_handCardData: number[] = [];

    setHandCard(cardData: number[]) {
        this.m_handCardData = GameLogicIns.sortCardList(cardData, SortType.ST_NORMAL);
    }

    removeHandCard(removeCardData) {
        this.m_handCardData = GameLogicIns.removeCardList(removeCardData, removeCardData.length, this.m_handCardData,
            this.m_handCardData.length);
        this.m_handCardData = GameLogicIns.sortCardList(this.m_handCardData, SortType.ST_NORMAL);
    }

    addHandCard(addCardData) {
        this.m_handCardData = this.m_handCardData.concat(addCardData);
        this.m_handCardData = GameLogicIns.sortCardList(this.m_handCardData, SortType.ST_NORMAL);
    }

    clear() {
        this.m_handCardData.length = 0;
    }
};
