const { ccclass, property } = cc._decorator;

import LoginScenLogic from '../../Logic/LoginScenLogic';

@ccclass
export default class LoginScene extends cc.Component {
    @property(cc.EditBox)
    m_accountEditbox: cc.EditBox = null;

    @property(cc.EditBox)
    m_passwordEditbox: cc.EditBox = null;

    onLoad() {
        // this.test();
    }

    onLoginClick() {
        // let account: string = cc.sys.localStorage.getItem("YouKeLoginUserName");
        // let password: string = cc.sys.localStorage.getItem("YouKeLoginPassWord");
        let account: string = this.m_accountEditbox.string;
        let password: string = this.m_passwordEditbox.string;

        LoginScenLogic.getInstance().requestLogin(account, password);
    }

    onRegistClick() {
        LoginScenLogic.getInstance().requestRegistGuest();
    }
}