class PlayerData {
    private static m_sInstance: PlayerData = null;

    private name = "";
    private headUrl = "";
    private phoneNumber = "";
    private binadCode = "";
    private IP = "";

    private uid = 0;
    private sex = 0;
    private emojiCnt = 0;
    private coin = 0;
    private diamoned = 0;
    private J = 0.0;
    private W = 0.0;

    private roomID = 0;

    getInstance() {
        if (!PlayerData.m_sInstance) {
            PlayerData.m_sInstance = new PlayerData();
            PlayerData.m_sInstance.logOut();
        }
        return PlayerData.m_sInstance;
    }

    getPlaterData() {
        return {
            name: this.name,
            uid: this.uid,
            sex: this.sex,
            headUrl: this.headUrl,
            phoneNumber: this.phoneNumber,
            emojiCnt: this.emojiCnt,
            binadCode: this.binadCode,
            coin: this.coin,
            diamoned: this.diamoned,
            J: this.J,
            W: this.W,
            IP: this.IP,
            roomID: this.roomID,
        };
    }
    setSex (sex: number) {
        this.sex = sex;
    }
    setUserName (name: string) {
        this.name = name;
    }
    setLocation (latitude, longitude) {
        this.J = longitude;
        this.W = latitude;
    }
    setHeadIcon (head: string) {
        this.headUrl = head;
    }
    setRoomID(roomID: number) {
        this.roomID = roomID;
    }
    setCoin(num){
        this.coin = num;
    }
    setDiamoned(num){
        this.diamoned = num;
    }

    login(data) {
        console.log(JSON.stringify(data));
        this.logOut();
        this.coin = data.coin;
        this.diamoned = data.diamond;
        this.emojiCnt = data.emojiCnt;
        this.headUrl = data.headIcon;
        this.IP = data.ip;
        this.name = data.name;
        this.sex = data.sex;
        this.uid = data.uid;
    }
    
    logOut() {
        this.name = "";
        this.uid = 0;
        this.sex = 0;
        this.headUrl = "";
        this.phoneNumber = "";
        this.emojiCnt = 0;
        this.binadCode = "";
        this.coin = 0;
        this.diamoned = 0;
        this.J = 0.0;
        this.W = 0.0;
        this.IP = "";
        this.roomID = 0;
    }
}

export default new PlayerData();
