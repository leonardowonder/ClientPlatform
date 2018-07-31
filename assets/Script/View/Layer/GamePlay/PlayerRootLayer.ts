const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import { Game_Room_Players_Max_Count, Game_Room_Max_Coin_Idx, Game_Room_Max_Win_Rate_Idx } from '../../../Define/GamePlayDefine';

import GamePlayerData from '../../../Data/GamePlay/GamePlayerData';

import PlayerItem from './PlayerItem';
import GamePlayerDataManager from '../../../Manager/DataManager/GamePlayDataManger/GamePlayerDataManager';
// import TableDataManager from '../../../Manager/DataManager/GamePlayDataManger/TableDataManager';

@ccclass
export default class PlayerRootLayer extends cc.Component {
    @property(cc.Prefab)
    m_itemPrefab: cc.Prefab = null;

    @property(cc.Vec2)
    m_itemPositions: cc.Vec2[] = [];

    @property(cc.Node)
    m_othersNode: cc.Node = null;

    @property
    m_itemCount: number = Game_Room_Players_Max_Count;

    private _leftRightInfo: boolean[] = [true, true, true, true, true, false, false, false, false];
    private m_playerItems: PlayerItem[] = [];

    onLoad() {
        this._initPlayerItems();
    }

    getPlayerItem(clientIdx: number): PlayerItem {
        if (!this._checkIdxValid(clientIdx)) {
            cc.warn(`PlayerRootLayer setPlayerData invalid clientIdx = ${clientIdx}`);
            return;
        }

        return this.m_playerItems[clientIdx];
    }

    updateAllPlayerDatas() {
        this.updateSelfPlayer();

        for (let i = 1; i < Game_Room_Players_Max_Count; ++i) {
            this.refreshPlayerItem(i);
        }

        this.refreshMaxCoinPlayerItem();
        this.refreshMaxWinRatePlayerItem();
    }

    refreshPlayerItem(serverChairID: number) {
        if (!this._checkIdxValid(serverChairID)) {
            cc.warn(`PlayerRootLayer setPlayerData invalid serverChairID = ${serverChairID}`);
            return;
        }

        if (serverChairID != Game_Room_Max_Coin_Idx && serverChairID != Game_Room_Max_Win_Rate_Idx) {
            this.m_playerItems[serverChairID].refreshViewByServerIdx();
        }
    }

    refreshMaxCoinPlayerItem() {
        let targetPlayerItem = this.m_playerItems[Game_Room_Max_Coin_Idx];

        if (targetPlayerItem) {
            targetPlayerItem.refreshViewByMaxCoinInfo();
        }
    }

    refreshMaxWinRatePlayerItem() {
        let targetPlayerItem = this.m_playerItems[Game_Room_Max_Win_Rate_Idx];

        if (targetPlayerItem) {
            targetPlayerItem.refreshViewByMaxWinRateInfo();
        }
    }

    updateSelfPlayer() {
        this.m_playerItems[0].refreshViewBySelfData();
    }

    getPlayerHeadWorldPos(clientIdx: number): cc.Vec2 {
        let pos: cc.Vec2 = new cc.Vec2(0, 0);
        if (clientIdx < 0) {
            cc.warn(`PlayerRootLayer getPlayerHeadWorldPos invalid idx = ${clientIdx}`);
            return pos;
        }

        if (clientIdx < this.m_playerItems.length) {
            let playerItem: PlayerItem = this.m_playerItems[clientIdx];
            pos = playerItem.getHeadWorldPos();
        }
        else {
            pos = this.m_othersNode.parent.convertToWorldSpaceAR(this.m_othersNode.getPosition());
        }

        return pos;
    }

    clearAllAnim() {
        _.forEach(this.m_playerItems, (item: PlayerItem) => {
            item.hideResult();
        })
    }

    private _checkIdxValid(idx: number) {
        return idx >= 0 && idx < Game_Room_Players_Max_Count;
    }

    private _initPlayerItems() {
        for (let i = 0; i < this.m_itemCount; ++i) {
            let newNode: cc.Node = cc.instantiate(this.m_itemPrefab);
            if (newNode) {
                this.node.addChild(newNode);

                let comp: PlayerItem = newNode.getComponent(PlayerItem);
                if (comp) {
                    this.m_playerItems.push(comp);
                }
                else {
                    cc.warn(`PlayerRootLayer onLoad no component i = ${i}`);
                }
            }
            else {
                cc.warn(`PlayerRootLayer onLoad load player item failed i = ${i}`);
            }
        };

        _.forEach(this.m_playerItems, (item: PlayerItem, idx: number) => {
            if (item) {
                if (idx < this._leftRightInfo.length) {
                    item.updateLeftRight(this._leftRightInfo[idx]);
                }

                if (idx < this.m_itemPositions.length) {
                    item.node.setPosition(this.m_itemPositions[idx]);
                }

                if (idx != 0 && idx != Game_Room_Max_Coin_Idx && idx != Game_Room_Max_Win_Rate_Idx) {
                    item.setServerChairID(idx);
                }
            }
        });
    }
}