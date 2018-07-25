const { ccclass, property } = cc._decorator;

import UserData, { UserInfo } from '../../../../Script/Data/UserData';

@ccclass
export default class DDZCurrencyRootLayer extends cc.Component {
    @property(cc.Label)
    m_coinLabel: cc.Label = null;

    @property(cc.Label)
    m_diamondLabel: cc.Label = null;

    @property(cc.Label)
    m_ticketLabel: cc.Label = null;

    onLoad() {

    }

    refreshInfo() {
        let user: UserInfo = UserData.getInstance().getUserData();

        if (user) {
            this.m_coinLabel.string = user.coin.toString();

            this.m_diamondLabel.string = user.diamond.toString();
        }
    }

    reset() {
        this.m_coinLabel.string = '';
        this.m_diamondLabel.string = '';
        this.m_ticketLabel.string = '';
    }
}