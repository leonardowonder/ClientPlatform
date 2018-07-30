import Singleton from '../../../Utils/Singleton';

// import { Game_Room_Players_Max_Count } from '../../../Define/GamePlayDefine';

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

    setBaseServerIdx(idx: number) {
        tableData.baseServerIdx = idx;
    }

    // svrIdxToClientIdx(svrIdx: number): number {
    //     let clientIdx: number = svrIdx;
    //     if (svrIdx >= 0 && svrIdx < Game_Room_Players_Max_Count) {
    //         clientIdx = (svrIdx - tableData.baseServerIdx + Game_Room_Players_Max_Count) % Game_Room_Players_Max_Count;
    //     }
        
    //     return clientIdx;
    // }

    // clientIdxToSvrIdx(clientIdx: number): number {
    //     let svrIdx: number = -1;
    //     if (clientIdx >= 0 && clientIdx < Game_Room_Players_Max_Count) {
    //         svrIdx = (clientIdx + tableData.baseServerIdx) % Game_Room_Players_Max_Count;
    //     }

    //     return svrIdx;
    // }
};

export default new TableDataManager();