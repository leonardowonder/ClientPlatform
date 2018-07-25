import * as _ from 'lodash';

import { eGameType } from '../../Define/ClientDefine';

export class RoomOptsInfo {
    gameType: eGameType = eGameType.eGame_Max;
    seatCnt: number = 0;

    reset() {
        this.gameType = eGameType.eGame_Max;
    }
}

export default class RoomData {
    roomID: number = 0;
    opts: RoomOptsInfo = null;

    stateTime: number = 0;

    constructor() {
        this.opts = new RoomOptsInfo();
    }

    setRoomData(data) {
        _.merge(this, data);
    }

    reset() {
        this.roomID = 0;
        this.opts && this.opts.reset();
    }
}