const { ccclass, property } = cc._decorator;

import BaseMapUnit from './BaseMapUnit';
import { EmRecordType, RecordUnitInfo } from '../../Define/GamePlayDefine';

@ccclass
export default class BaseMap extends cc.Component {
    @property(cc.Node)
    m_mapUnit: cc.Node[] = [];

    private _nodePool: cc.NodePool = null;

    //logic
    private _latestRecordUnitInfo: RecordUnitInfo = null;

    onLoad() {
        this._nodePool = new cc.NodePool(BaseMapUnit);
    }

    push() {

    }
}
