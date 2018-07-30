const { ccclass, property } = cc._decorator;

import MapItem from './MapItem';

import { addNewNodeFunc } from '../../../Utils/NodePoolUtils';

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
        let node: cc.Node = addNewNodeFunc(this.node, this.m_mapItemPrefab, this._nodePool);

        let comp: MapItem = node.getComponent(MapItem);

        this.m_mapItemGroup.push(comp);

        // this._updateParentNodeSize();
    }

    removeLastItem() {
        let targetItem = this.m_mapItemGroup.pop();

        if (targetItem) {
            let targetNode: cc.Node = targetItem.node;

            this._nodePool.put(targetNode);
            
            // this._updateParentNodeSize();
        }
    }

    // private _updateParentNodeSize() {
    //     this.scheduleOnce(() => {
    //         this._resizeParentNodeContent();
    //     })
    // }

    // private _resizeParentNodeContent() {
    //     let parentNode: cc.Node = this.node.parent;
    //     if (parentNode) {
    //         cc.log('wd debug parentNode =', parentNode, 'size =', this.node.getContentSize());
    //         parentNode.setContentSize(this.node.getContentSize());
    //     }
    // }
}
