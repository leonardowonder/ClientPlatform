const { ccclass, property } = cc._decorator;

import ClientEventDefine from '../../../Define/ClientEventDefine';

import { loadHead } from '../../../Utils/MyUtils';

import RoomData from '../../../Data/GamePlay/RoomData';

import GameRoomLogic from '../../../Logic/GamePlay/GameRoomLogic';

import PrefabManager, { EmPrefabEnum } from '../../../Manager/CommonManager/PrefabManager';
import RoomDataManger from '../../../Manager/DataManager/GamePlayDataManger/RoomDataManger';
import PlayerDataManager from '../../../Manager/DataManager/PlayerDataManager';

@ccclass
export default class BankerRootLayer extends cc.Component {

    @property(cc.Sprite)
    m_bankerIcon: cc.Sprite = null;
    @property(cc.Label)
    m_bankerCoinLabel: cc.Label = null;

    @property(cc.Sprite)
    m_buttonSp: cc.Sprite = null;

    @property(cc.SpriteFrame)
    m_buttonFrames: cc.SpriteFrame[] = [];

    @property(cc.Node)
    m_sysBankerNode: cc.Node = null;

    onLoad() {
        this._registEvents();
        GameRoomLogic.getInstance().requestApplyBankerList();
    }

    onDestroy() {
        this._unregistEvents();
    }

    updateBankerInfo() {
        let roomInfo: RoomData = RoomDataManger.getInstance().getRoomData();

        let bankerID = roomInfo.bankerID;
        this._updateSysBankerNode(bankerID == -1);
    
        if (bankerID > 0) {
            let playerData = PlayerDataManager.getInstance().getPlayerData(bankerID);

            if (playerData) {
                loadHead(this.m_bankerIcon, playerData.headIcon);
            }
            else {
                PlayerDataManager.getInstance().reqPlayerData([bankerID]);
            }
        }

        if (roomInfo.bankerCoin) {
            this.m_bankerCoinLabel.string = roomInfo.bankerCoin.toString();
        }
        else {
            this.m_bankerCoinLabel.string = '';
        }
    }

    showApplyBanker() {
        this.m_buttonSp.spriteFrame = this.m_buttonFrames[0];
    }

    showCancelApplyBankerButton() {
        this.m_buttonSp.spriteFrame = this.m_buttonFrames[1];
    }

    showApplyQuitBankerButton() {
        this.m_buttonSp.spriteFrame = this.m_buttonFrames[2];
    }

    onButtonClick() {
        PrefabManager.showPrefab(EmPrefabEnum.Prefab_BankerListLayer);
    }

    private _registEvents() {
        this._unregistEvents();
        cc.systemEvent.on(ClientEventDefine.CUSTOM_EVENT_PLAYER_DATA_REQ_FINISHED, this.updateBankerInfo, this);
    }

    private _unregistEvents() {
        cc.systemEvent.targetOff(this);
    }

    private _updateSysBankerNode(isSysBanker: boolean) {
        this.m_sysBankerNode.active = isSysBanker;
        this.m_bankerCoinLabel.node.active = !isSysBanker;
    }
}