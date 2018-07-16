const { ccclass } = cc._decorator;

import LoginScenLogic from '../../Logic/LoginScenLogic';

@ccclass
export default class LoginScene extends cc.Component {

    onLoad() {
        // this.test();
    }

    onGuestClick() {
        if (cc.sys.localStorage.getItem("YouKeLoginExist") == 1) {
            let account: string = cc.sys.localStorage.getItem("YouKeLoginUserName");
            let password: string = cc.sys.localStorage.getItem("YouKeLoginPassWord");
            
            LoginScenLogic.getInstance().requestLogin(account, password);
        } else {
            LoginScenLogic.getInstance().requestRegistGuest();
        }
    }
}