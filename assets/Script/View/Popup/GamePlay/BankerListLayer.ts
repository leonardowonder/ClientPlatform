const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import ClientEventDefine from '../../../Define/ClientEventDefine';

import TableView from '../../../Component/TableView';

import GameRoomLogic from '../../../Logic/GamePlay/GameRoomLogic';

import BankerData from '../../../Data/GamePlay/BankerData';
import RoomData from '../../../Data/GamePlay/RoomData';
import UserData, { UserInfo } from '../../../Data/UserData';

import BankerDataManager from '../../../Manager/DataManager/GamePlayDataManger/BankerDataManager';
import PlayerDataManager from '../../../Manager/DataManager/PlayerDataManager';
import RoomDataManger from '../../../Manager/DataManager/GamePlayDataManger/RoomDataManger';

@ccclass
export default class BankerListLayer extends cc.Component {

    @property(TableView)
    m_bankerListView: TableView = null;

    @property(cc.Node)
    m_applyBankerNode: cc.Node = null;
    @property(cc.Node)
    m_cancelBankerNode: cc.Node = null;
    @property(cc.Node)
    m_quitBankerNode: cc.Node = null;

    onLoad() {
        this._registEvents();
    }

    onDestroy() {
        this._unregistEvents();
    }

    init() {
        this._registEvents();

        GameRoomLogic.getInstance().requestApplyBankerList();

        this.updateBankerList();

        this.updateButton();
    }

    hide() {
        this._unregistEvents();
    }

    close() {
        this.node.active = false;
    }

    updateBankerList() {
        let bankerList: BankerData[] = BankerDataManager.getInstance().getBankerList();

        if (bankerList && bankerList.length > 0) {
            _.forEach(bankerList, (banker: BankerData) => {
                let playerData = PlayerDataManager.getInstance().getPlayerData(banker.uid);

                if (playerData) {
                    _.merge(banker, playerData);
                }
            });
        }

        this.m_bankerListView.initTableView(bankerList.length, bankerList);
    }

    updateButton() {
        let userData: UserInfo = UserData.getInstance().getUserData();

        let roomData: RoomData = RoomDataManger.getInstance().getRoomData();

        if (userData.uid == roomData.bankerID) {
            this._showApplyQuitBanker();
        }
        else {
            let bankerList: BankerData[] = BankerDataManager.getInstance().getBankerList();
            let idx = _.findIndex(bankerList, (banker: BankerData) => {
                return userData.uid == banker.uid;
            });

            if (idx == -1) {
                this._showApplyBanker();
            }
            else {
                this._showApplyCancelBanker();
            }
        }
    }

    onApplyBankerClick() {
        GameRoomLogic.getInstance().requestApplyBanker();
        this.close();
    }

    onCancelApplyBankerClick() {
        GameRoomLogic.getInstance().requestApplyResignBanker();
        this.close();
    }

    onQuitBankerClick() {
        GameRoomLogic.getInstance().requestApplyResignBanker();
        this.close();
    }

    private _registEvents() {
        this._unregistEvents();
        cc.systemEvent.on(ClientEventDefine.CUSTOM_EVENT_BANKER_LIST_GET, this.updateBankerList, this);
        cc.systemEvent.on(ClientEventDefine.CUSTOM_EVENT_PLAYER_DATA_REQ_FINISHED, this.updateBankerList, this);
    }

    private _unregistEvents() {
        cc.systemEvent.targetOff(this);
    }

    private _showApplyBanker() {
        this.m_applyBankerNode.active = true;
        this.m_cancelBankerNode.active = false;
        this.m_quitBankerNode.active = false;
    }

    private _showApplyCancelBanker() {
        this.m_applyBankerNode.active = false;
        this.m_cancelBankerNode.active = true;
        this.m_quitBankerNode.active = false;
    }

    private _showApplyQuitBanker() {
        this.m_applyBankerNode.active = false;
        this.m_cancelBankerNode.active = false;
        this.m_quitBankerNode.active = true;
    }
}