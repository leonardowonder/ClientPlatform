import { EmCaptainType } from '../../Define/GamePlayDefine';

export default class PlayerData {
    uid: number = 0;

    headUrl: string = '';
    coin: number = 0;
    curGameResult: number = 0;
    captainType: EmCaptainType = EmCaptainType.Type_None;

    clientSeatIdx: number = -1;
    serverSeatIdx: number = -1;

    reset() {
        this.headUrl = '';
        this.coin = 0;
        this.curGameResult = 0;
        this.captainType = EmCaptainType.Type_None;

        this.clientSeatIdx = -1;
        this.serverSeatIdx = -1;
    }

    clearCurGameResult() {
        this.curGameResult = 0;
    }
};