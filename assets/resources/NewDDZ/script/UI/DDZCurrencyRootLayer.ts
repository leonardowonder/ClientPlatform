const { ccclass, property } = cc._decorator;

import UserData, { UserInfo } from '../../../../Script/Data/UserData';
import DDZPlayerDataManager, { DDZPlayerData } from '../Data/DDZPlayerDataManager';

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

    refreshInfo(offset: number = 0) {
        let user: UserInfo = UserData.getInstance().getUserData();

        if (user) {
            let player: DDZPlayerData = DDZPlayerDataManager.getInstance().getPlayerDataByUID(user.uid);
            if (player) {
                if (offset != 0) {
                    player.chips += offset;
                }
    
                this.m_coinLabel.string = player.chips.toString();
    
                this.m_diamondLabel.string = user.diamond.toString();
            }
            else {
                this.m_coinLabel.string = user.coin.toString();
    
                this.m_diamondLabel.string = user.diamond.toString();
            }
        }
    }

    reset() {
        this.m_coinLabel.string = '';
        this.m_diamondLabel.string = '';
        this.m_ticketLabel.string = '';
    }
}