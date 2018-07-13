import Singleton from '../Utils/Singleton';

class UserData extends Singleton {
    name: string = '';
    headUrl: string = '';

    uid: number = 0;
    sex: number = 0;
    coin: number = 0;
    diamoned: number = 0;

    roomID: number = 0;

    login(data) {
        console.log(JSON.stringify(data));
        this.logOut();
        this.coin = data.coin;
        this.diamoned = data.diamond;
        this.headUrl = data.headIcon;
        this.name = data.name;
        this.sex = data.sex;
        this.uid = data.uid;
    }

    logOut() {
        this.name = '';
        this.uid = 0;
        this.sex = 0;
        this.headUrl = '';
        this.coin = 0;
        this.diamoned = 0;
        this.roomID = 0;
    }
}

export default new UserData();
