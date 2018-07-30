import Singleton from '../../../Utils/Singleton';

import { eRoomState } from '../../../Define/GamePlayDefine';

import GameRoomData from '../../../Data/GamePlay/GameRoomData';

import RoomData from '../../../Data/GamePlay/RoomData';

class RoomDataManger extends Singleton {

    getRoomData(): RoomData {
        return GameRoomData.getInstance().getRoomData();
    }

    setRoomData(data: any) {
        let roomData: RoomData = this.getRoomData();

        roomData.setRoomData(data);
    }

    getRoomID(): number {
        let roomData: RoomData = this.getRoomData();

        let roomID: number = 0;
        if (roomData) {
            roomID = roomData.roomID
        }
        
        return roomID;
    }

    changeRoomState(state: eRoomState) {
        let roomData: RoomData = this.getRoomData();

        roomData.state = state;
    }
};

export default new RoomDataManger();