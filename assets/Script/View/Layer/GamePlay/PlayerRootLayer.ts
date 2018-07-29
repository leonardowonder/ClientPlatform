const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import { Game_Room_Seat_Max_Count } from '../../../Define/GamePlayDefine';

import GamePlayerData from '../../../Data/GamePlay/GamePlayerData';

import PlayerItem from './PlayerItem';
import GamePlayerDataManager from '../../../Manager/DataManager/GamePlayDataManger/GamePlayerDataManager';
import TableDataManager from '../../../Manager/DataManager/GamePlayDataManger/TableDataManager';

import UserData from '../../../Data/UserData';

@ccclass
export default class PlayerRootLayer extends cc.Component {
    @property(cc.Prefab)
    m_itemPrefab: cc.Prefab = null;

    @property(cc.Vec2)
    m_itemPositions: cc.Vec2[] = [];

    @property(cc.Node)
    m_othersNode: cc.Node = null;

    @property
    m_itemCount: number = Game_Room_Seat_Max_Count;

    private _leftRightInfo: boolean[] = [true, true, true, true, false, false, false, false];
    private m_playerItems: PlayerItem[] = [];
    private m_myPlayerItem: PlayerItem = null;

    onLoad() {
        this._initOtherPlayerItems();
    }

    updateAllPlayerDatas() {
        let playerDatas: GamePlayerData[] = GamePlayerDataManager.getInstance().getGamePlayerDatas();

        this.updateSelfPlayer();

        _.forEach(playerDatas, (playerData: GamePlayerData) => {
            let serverIdx = playerData.idx;

            let clientIdx = TableDataManager.getInstance().svrIdxToClientIdx(serverIdx);

            this.refreshPlayerItem(clientIdx, serverIdx);
        });
    }

    refreshPlayerItem(clientIdx: number, serverChairID: number) {
        if (!this._checkIdxValid(clientIdx)) {
            cc.warn(`PlayerRootLayer setPlayerData invalid clientIdx = ${clientIdx}`);
            return;
        }

        if (clientIdx >= 0) {
            this.m_playerItems[clientIdx].setServerChairID(serverChairID);
            this.m_playerItems[clientIdx].refreshView();
        }
    }

    updateSelfPlayer() {
        this.m_myPlayerItem.refreshViewBySelfData();
    }

    getPlayerHeadWorldPos(clientIdx: number): cc.Vec2 {
        let pos: cc.Vec2 = new cc.Vec2(0, 0);
        if (clientIdx < 0) {
            cc.warn(`PlayerRootLayer getPlayerHeadWorldPos invalid idx = ${clientIdx}`);
            return pos;
        }

        if (clientIdx < this.m_playerItems.length) {
            let selfPlayerItem: PlayerItem = this.m_playerItems[clientIdx];
            pos = selfPlayerItem.getHeadWorldPos();
        }
        else {
            pos = this.m_othersNode.parent.convertToWorldSpaceAR(this.m_othersNode.getPosition());
        }

        return pos;
    }

    private _checkIdxValid(idx: number) {
        return idx < Game_Room_Seat_Max_Count;
    }

    private _initOtherPlayerItems() {
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

                item.hide();
            }
        });
    }
}