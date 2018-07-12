const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import { EmRecordType } from '../../../Define/GamePlayDefine';

import RecordUnit from '../../../Component/GamePlay/TendencyChart/RecordUnit';

@ccclass
export default class RecentRecordsLayer extends cc.Component {
    @property(cc.Prefab)
    m_recordUnitPrefab: cc.Prefab = null;

    @property(RecordUnit)
    m_recordUnitList: RecordUnit[] = [];

    @property
    m_maxRecordCount: number = 20;

    private _nodePool: cc.NodePool = null;

    onLoad() {
        this._nodePool = new cc.NodePool(RecordUnit);
    }

    addRecord(type: EmRecordType) {
        if (!this._checkTypeValid(type)) {
            cc.warn(`RecentRecordsLayer addRecord invalid type = ${type}`);
            return;
        }

        this._addNewNode();

        this._updateRecordUnitType(type);

        if (this._needRemoveFirstRecord()) {
            this._doRemoveFirstRecord();
        }
    }

    private _checkTypeValid(type: EmRecordType) {
        return type > EmRecordType.Type_None && type < EmRecordType.Type_Max;
    }

    private _addNewNode() {
        if (this._nodePool.size() < 1) {
            var prefab = cc.instantiate(this.m_recordUnitPrefab);
            this._nodePool.put(prefab);
        }

        let newRecordNode = this._nodePool.get();

        let comp: RecordUnit = newRecordNode.getComponent(RecordUnit);

        this.m_recordUnitList.push(comp);

        this.node.addChild(newRecordNode);
    }

    private _updateRecordUnitType(type: EmRecordType) {
        let unit: RecordUnit = _.last(this.m_recordUnitList);
        if (!unit) {
            cc.warn('RecentRecordsLayer _updateRecordUnitType last unit null');
            return;
        }

        unit.updateViewByType(type);
    }

    private _needRemoveFirstRecord(): boolean {
        return this.m_recordUnitList.length > this.m_maxRecordCount;
    }

    private _doRemoveFirstRecord() {
        let unit: RecordUnit = this.m_recordUnitList.shift();
        
        this._nodePool.put(unit.node);
    }
}