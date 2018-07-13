import Singleton from '../../Utils/Singleton';

import CardData from './CardData';
import GameRecordData from './GameRecordData';
import PlayerData from './PlayerData';
import TableData from './TableData';

class GameRoomData extends Singleton {
    private cardData: CardData = null;
    private recordData: GameRecordData = null;
    private tableData: TableData = null;
    private sitPlayerDatas: PlayerData[] = [];
    private standPlayerDatas: PlayerData[] = [];

    init() {
        super.init();

        this.cardData = new CardData();
        this.recordData = new GameRecordData();
        this.tableData = new TableData();

        this.reset();
    }

    getCardData(): CardData {
        return this.cardData;
    }

    getRecordData(): GameRecordData {
        return this.recordData;
    }

    getTableData(): TableData {
        return this.tableData;
    }

    getSitPlayerDatas(): PlayerData[] {
        return this.sitPlayerDatas;
    }

    getStandPlayerDatas(): PlayerData[] {
        return this.standPlayerDatas;
    }

    reset() {
        this.cardData.clearCards();
        this.recordData.clearRecord();
        this.tableData.reset();

        this.sitPlayerDatas.length = 0;
        this.standPlayerDatas.length = 0;
    }
};

export default new GameRoomData();