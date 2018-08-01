import Singleton from '../../Utils/Singleton';

import * as _ from 'lodash';

import { Game_Room_Players_Max_Count } from '../../Define/GamePlayDefine';

import CardData from './CardData';
import GameRecordData from './GameRecordData';
import GamePlayerData from './GamePlayerData';
import TableData from './TableData';
import RoomData from './RoomData';
import BankerData from './BankerData';

class GameRoomData extends Singleton {
    private cardData: CardData = null;
    private recordData: GameRecordData = null;
    private tableData: TableData = null;
    private roomData: RoomData = null;
    private gamePlayerDatas: GamePlayerData[] = [];
    private bankerDatas: BankerData[] = [];

    init() {
        super.init();

        this.roomData = new RoomData();
        this.cardData = new CardData();
        this.recordData = new GameRecordData();
        this.tableData = new TableData();
        this.bankerDatas = [];

        for (let idx = 0; idx < Game_Room_Players_Max_Count; idx++) {
            let player: GamePlayerData = new GamePlayerData();
            this.gamePlayerDatas.push(player);
        }

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

    getRoomData(): RoomData {
        return this.roomData;
    }

    getGamePlayerDatas(): GamePlayerData[] {
        return this.gamePlayerDatas;
    }

    getBankerList(): BankerData[] {
        return this.bankerDatas;
    }

    setGamePlayerDatas(players: GamePlayerData[]) {
        this.gamePlayerDatas = players;
    }

    setBankerList(list: BankerData[]) {
        if (list && list.length > 0) {
            this.bankerDatas = list;
        }
        else {
            this.bankerDatas.length = 0;
        }
    }

    reset() {
        this.cardData.clearCards();
        this.recordData.clearRecord();
        this.tableData.reset();
        this.roomData.reset();

        if (this.gamePlayerDatas && this.gamePlayerDatas.length > 0) {
            _.forEach(this.gamePlayerDatas, (playerData: GamePlayerData) => {
                playerData && playerData.reset();
            })
        }
    }
};

export default new GameRoomData();