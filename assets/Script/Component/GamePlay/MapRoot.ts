const { ccclass, property } = cc._decorator;

import MapItem from './MapItem';

@ccclass
export default class MapRoot extends cc.Component {
    @property(cc.Prefab)
    m_mapItemPrefab: cc.Prefab = null;

    @property(MapItem)
    m_mapItemGroup: MapItem[] = [];

    private _nodePool: cc.NodePool = null;

    onLoad() {
        this._nodePool = new cc.NodePool(MapItem);
    }

    getMapItemCount(): number {
        return this.m_mapItemGroup.length;
    }

    addNewItem() {
        if (this._nodePool.size() < 1) {
            var prefab: cc.Node = cc.instantiate(this.m_mapItemPrefab);

            this._nodePool.put(prefab);
        }

        let newMapItem: cc.Node = this._nodePool.get();

        let comp: MapItem = newMapItem.getComponent(MapItem);

        this.m_mapItemGroup.push(comp);

        this.node.addChild(newMapItem);
    }

    removeLastItem() {
        let targetItem = this.m_mapItemGroup.pop();

        if (targetItem) {
            let targetNode: cc.Node = targetItem.node;

            this._nodePool.put(targetNode);
        }
    }
}
