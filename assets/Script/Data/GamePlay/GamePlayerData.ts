import * as _ from 'lodash';

import { EmCaptainType } from '../../Define/GamePlayDefine';

export default class GamePlayerData {
    uid: number = 0;

    idx: number = -1;
    headUrl: string = '';
    chips: number = 0;
    curGameResult: number = 0;
    captainType: EmCaptainType = EmCaptainType.Type_None;

    reset() {
        this.headUrl = '';
        this.chips = 0;
        this.curGameResult = 0;
        this.captainType = EmCaptainType.Type_None;

        this.idx = -1;
    }

    isValid() {
        return this.uid != 0;
    }

    setPlayerData(jsMsg) {
        _.merge(this, jsMsg);
    }

    clearCurGameResult() {
        this.curGameResult = 0;
    }
};