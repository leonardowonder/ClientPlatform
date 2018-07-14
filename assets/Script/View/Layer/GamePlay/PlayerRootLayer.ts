const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import PlayerItem from './PlayerItem';

@ccclass
export default class PlayerRootLayer extends cc.Component {
    @property(cc.Prefab)
    m_itemPrefab: cc.Prefab = null;

    @property(cc.Vec2)
    m_itemPositions: cc.Vec2[] = [];

    @property(cc.Node)
    m_othersNode: cc.Node = null;

    @property
    m_itemCount: number = 9;

    private _leftRightInfo: boolean[] = [true, true, true, true, true, false, false, false, false];
    private m_playerItems: PlayerItem[] = [];

    onLoad() {
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
        }

        _.forEach(this.m_playerItems, (item: PlayerItem, idx: number) => {
            if (item) {
                if (idx < this._leftRightInfo.length) {
                    item.updateLeftRight(this._leftRightInfo[idx]);
                }

                if (idx < this.m_itemPositions.length) {
                    item.node.setPosition(this.m_itemPositions[idx]);
                }
            }
        })
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
}