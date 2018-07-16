import Singleton from '../Utils/Singleton';

class UserData extends Singleton {
    name: string = '';
    headIcon: string = '';

    uid: number = 0;
    sex: number = 0;
    coin: number = 0;
    diamoned: number = 0;
    IP: string = '';
    clubs = [];

    isLogin: boolean = false;

    roomID: number = 0;

    login(data) {
        console.log(JSON.stringify(data));
        this.logOut();
        this.coin = data.coin;
        this.diamoned = data.diamond;
        this.headIcon = data.headIcon;
        this.name = data.name;
        this.sex = data.sex;
        this.uid = data.uid;
    }
    
    setPlayerBaseData (jsonObj) {
        this.name = jsonObj.name;
        this.uid = jsonObj.uid;
        this.sex = jsonObj.sex;
        this.coin = jsonObj.coin;
        this.diamoned = jsonObj.diamond;
        this.headIcon = jsonObj.headIcon;
        this.IP = jsonObj.IP;
        this.isLogin = true;
        this.clubs = jsonObj.clubs;
    }

    logOut() {
        this.name = '';
        this.uid = 0;
        this.sex = 0;
        this.headIcon = '';
        this.coin = 0;
        this.diamoned = 0;
        this.roomID = 0;
        this.IP = '';
    }
}

export default new UserData();
