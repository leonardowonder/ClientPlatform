import Singleton from '../../../Utils/Singleton';

import GameRoomData from '../../../Data/GamePlay/GameRoomData';

import RoomData from '../../../Data/GamePlay/RoomData';

class RoomDataManger extends Singleton {

    getRoomData(): RoomData {
        return GameRoomData.getInstance().getRoomData();
    }

    setRoomData(data: any) {
        cc.log('wd debug setRoomData data =', data);
        let roomData: RoomData = this.getRoomData();

        roomData.setRoomData(data);
        cc.log('wd debug setRoomData roomdata =', roomData);
    }

    getRoomID(): number {
        let roomData: RoomData = this.getRoomData();

        let roomID: number = 0;
        if (roomData) {
            roomID = roomData.roomID
        }
        
        return roomID;
    }
};

export default new RoomDataManger();