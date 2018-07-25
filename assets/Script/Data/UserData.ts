import Singleton from '../Utils/Singleton';

import * as _ from 'lodash';

export class UserInfo {
    name: string = '';
    headIcon: string = '';

    uid: number = 0;
    sex: number = 0;
    coin: number = 0;
    diamond: number = 0;
    ip: string = '';
    clubs = [];

    isLogin: boolean = false;

    roomID: number = 0;

    updateUserData(data) {
        _.merge(this, data);
    }

    reset() {
        this.name = '';
        this.uid = 0;
        this.sex = 0;
        this.headIcon = '';
        this.coin = 0;
        this.diamond = 0;
        this.roomID = 0;
        this.ip = '';
    }
}

class UserData extends Singleton {
    private _data: UserInfo = null;

    init() {
        super.init();
        this._data = new UserInfo();
    }

    login(data) {
        console.log(JSON.stringify(data));
        this.logOut();

        this._data.updateUserData(data);
    }

    setPlayerBaseData(jsonObj) {
        this._data.updateUserData(jsonObj);
    }

    logOut() {
        this._data.reset();
    }

    getUserData(): UserInfo {
        return this._data;
    }
}

export default new UserData();
