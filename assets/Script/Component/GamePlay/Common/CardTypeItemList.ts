const { ccclass, property } = cc._decorator;

import { addNewNodeFunc } from '../../../Utils/NodePoolUtils';

import { EmGroupType, Tendency_Chart_Card_Type_Max_Count } from '../../../Define/GamePlayDefine';
import CardTypeItem from './CardTypeItem';

@ccclass
export default class CardTypeItemList extends cc.Component {

    @property(cc.Prefab)
    m_itemPrefab: cc.Prefab = null;

    @property(cc.Node)
    m_parentNode: cc.Node = null;

    _nodePool: cc.NodePool = null;

    m_cardTypeItemList: CardTypeItem[] = [];

    onLoad() {
        this._nodePool = new cc.NodePool(CardTypeItem);
    }

    addPair() {
        this.addGroupType(EmGroupType.GroupType_Pair);
    }

    addNone() {
        this.addGroupType(EmGroupType.GroupType_None);
    }

    addGroupType(type: EmGroupType) {
        let node: cc.Node = addNewNodeFunc(this.m_parentNode, this.m_itemPrefab, this._nodePool);
        let comp: CardTypeItem = node.getComponent(CardTypeItem);

        if (!comp) {
            cc.warn(`CardTypeItemList addGroupType CardTypeItem comp null`);
            return;
        }

        comp.updateView(type);

        this.m_cardTypeItemList.push(comp);

        if (this.m_cardTypeItemList.length > Tendency_Chart_Card_Type_Max_Count) {
            let comp: CardTypeItem = this.m_cardTypeItemList.shift();

            this._nodePool.put(comp.node);
        }
    }
}
