import Singleton from '../../../Utils/Singleton';

import { EmRecordType } from '../../../Define/GamePlayDefine';

import GameRoomData from '../../../Data/GamePlay/GameRoomData';
import GameRecordData from '../../../Data/GamePlay/GameRecordData';

let gameRoomData = GameRoomData.getInstance();

class GameRecordDataManager extends Singleton {

    getGameRecordData(): GameRecordData {
        return gameRoomData.getRecordData();
    }

    addRecord(type: EmRecordType) {
        let recordData: GameRecordData = gameRoomData.getRecordData();

        recordData.addRecord(type);
    }

    setGameRecords(types: EmRecordType[]) {
        let recordData: GameRecordData = gameRoomData.getRecordData();

        recordData.setRecords(types);
    }
};

export default new GameRecordDataManager();