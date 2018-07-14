import Singleton from '../../../Utils/Singleton';

import { Game_Room_Seat_Max_Count } from '../../../Define/GamePlayDefine';

import GameRoomData from '../../../Data/GamePlay/GameRoomData';
import TableData from '../../../Data/GamePlay/TableData';

let tableData = GameRoomData.getInstance().getTableData();

class TableDataManager extends Singleton {

    getTableData(): TableData {
        return tableData;
    }

    getSelfClientIdx(): number {
        return 0;
    }

    private _svrIdxToClientIdx(svrIdx: number): number {
        return (svrIdx - tableData.clientIdxZeroPosSvrIdx + Game_Room_Seat_Max_Count) % Game_Room_Seat_Max_Count;
    }

    private _clientIdxToSvrIdx(clientIdx: number): number {
        return (clientIdx + tableData.clientIdxZeroPosSvrIdx) % Game_Room_Seat_Max_Count;
    }
};

export default new TableDataManager();