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
            var prefab = cc.instantiate(this.m_mapItemPrefab);

            prefab.setPosition(0, 0);

            var node = new cc.Node();
            node.setAnchorPoint(0.5, 0.5);
            node.setContentSize(prefab.getContentSize());

            node.addChild(prefab);

            this._nodePool.put(node);
        }

        let newColUnitParent = this._nodePool.get();

        let comp: MapItem = newColUnitParent.children[0].getComponent(MapItem);

        this.m_mapItemGroup.push(comp);

        this.node.addChild(newColUnitParent);
    }

    removeFirstItem() {

    }
}
