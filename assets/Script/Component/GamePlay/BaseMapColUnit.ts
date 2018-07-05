const { ccclass, property } = cc._decorator;

import BaseMapUnit from './BaseMapUnit';
import { RecordUnitInfo } from '../../Define/GamePlayDefine';

@ccclass
export default class BaseMapColUnit extends cc.Component {

    @property(cc.Prefab)
    m_mapUnitPrefab: cc.Prefab = null;

    @property(cc.Node)
    m_mapUnitNodes: cc.Node[] = [];

    private _rowCount: number = 0;

    onLoad() {
        this._initView();
    }

    isFull() {

    }

    private _initView() {
        this._updateCounts();
        this._initData();
    }

    private _updateCounts() {
        if (this.m_mapUnitPrefab && this.m_mapUnitPrefab.data) {
            this._rowCount = Math.floor(this.node.height / this.m_mapUnitPrefab.data.height);
        }
    }

    private _initData() {
        for (let row = 0; row < this._rowCount; row++) {
            let mapUnitPrefab: cc.Node = cc.instantiate(this.m_mapUnitPrefab);
            this.m_mapUnitNodes.push(mapUnitPrefab);
        }
    }
}
