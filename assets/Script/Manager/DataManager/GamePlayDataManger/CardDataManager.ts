import Singleton from '../../../Utils/Singleton';

import { EmCampType } from '../../../Define/GamePlayDefine';

import GameRoomData from '../../../Data/GamePlay/GameRoomData';
import CardData from '../../../Data/GamePlay/CardData';

let gameRoomData = GameRoomData.getInstance();

class CardDataManager extends Singleton {

    getCardData(): CardData {
        return gameRoomData.getCardData();
    }

    udpateCardData(type: EmCampType, nums: number[]) {
        let cardData: CardData = gameRoomData.getCardData();

        cardData.setCardGroupByType(type, nums);
    }
};

export default new CardDataManager();