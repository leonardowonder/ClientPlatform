import * as _ from 'lodash';

export default class BankerData {
    uid: number = 0;
    coin: number = 0;

    constructor(data) {
        _.merge(this, data);
    }

    reset() {
        this.uid = 0;
        this.coin = 0;
    }
}