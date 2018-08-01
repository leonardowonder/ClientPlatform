import Singleton from '../../../Utils/Singleton';

import GameRoomData from '../../../Data/GamePlay/GameRoomData';
import BankerData from '../../../Data/GamePlay/BankerData';

let gameRoomData = GameRoomData.getInstance();

class BankerDataManager extends Singleton {

    getBankerList(): BankerData[] {
        return gameRoomData.getBankerList();
    }

    setBankerList(bankerList: BankerData[]) {
        gameRoomData.setBankerList(bankerList);
    }
};

export default new BankerDataManager();