const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import BaseMapColUnit from './BaseMapColUnit';
import BaseMapColUnitParent from './BaseMapColUnitParent';
import { EmRecordType, RecordUnitInfo } from '../../Define/GamePlayDefine';

@ccclass
export default class BaseMap extends cc.Component {
    @property(cc.Prefab)
    m_mapColUnitParentPrefab: cc.Prefab = null;

    @property(cc.Node)
    m_mapRootNode: cc.Node = null;

    @property(BaseMapColUnit)
    m_mapColUnitList: BaseMapColUnit[] = [];

    private _nodePool: cc.NodePool = null;

    //logic
    private _latestRecordUnitInfo: RecordUnitInfo = null;
    private _redWinIdx: number = -1;
    private _blackWinIdx: number = -1;

    onLoad() {
        this._nodePool = new cc.NodePool(BaseMapColUnitParent);
    }

    addRed() {
        this.addRecord(EmRecordType.Type_Red);
    }

    addBlack() {
        this.addRecord(EmRecordType.Type_Black);
    }

    addRecord(type: EmRecordType) {
        if (!this._checkTypeValid(type)) {
            cc.warn(`BaseMap addRecord invalid type = ${type}`);
            return;
        }

        if (this._latestRecordUnitInfo == null) {
            this._addFirstRecord(type);
        }
        else {
            this._addRecordByLatestInfo(type);
        }
    }

    private _checkTypeValid(type: EmRecordType) {
        return type == EmRecordType.Type_Red || type == EmRecordType.Type_Black;
    }

    private _addFirstRecord(type: EmRecordType) {
        this.m_mapColUnitList[0].addFirstRecord(type);

        this._latestRecordUnitInfo = new RecordUnitInfo(type, 0, 0);

        if (type == EmRecordType.Type_Red) {
            this._redWinIdx = 0;
        }
        else {
            this._blackWinIdx = 0;
        }
    }

    private _addRecordByLatestInfo(type: EmRecordType) {
        let latestType: EmRecordType = this._latestRecordUnitInfo.m_recordType;
        if (type == latestType) {
            let colIdx: number = this._latestRecordUnitInfo.m_mapColUnitIdx;
            let targetColUnit: BaseMapColUnit = this.m_mapColUnitList[colIdx];

            let extendResult = targetColUnit.tryExtend();
            if (!extendResult) {
                this._moveToNextColUnit();
            }
            else {
                let targetRecordIdx = this._latestRecordUnitInfo.m_recordUnitIdx + 1;
                this._latestRecordUnitInfo.setRecordIdx(targetRecordIdx);
            }
        }
        else {
            this._addNewTypeRecord(type);
        }
    }

    private _moveToNextColUnit() {
        let curColIdx = this._latestRecordUnitInfo.m_mapColUnitIdx;
        if (curColIdx + 1 < this.m_mapColUnitList.length) {
            let targetColUnit: BaseMapColUnit = this.m_mapColUnitList[curColIdx + 1];

            targetColUnit.updateRecord(this._latestRecordUnitInfo.m_recordType, this._latestRecordUnitInfo.m_recordUnitIdx);

            this._latestRecordUnitInfo.setColIdx(curColIdx + 1);
        }
        else {
            this._extendMapUnit();
            this._moveToNextColUnit();
        }
    }

    private _extendMapUnit() {
        if (this._nodePool.size() < 1) {
            var prefab = cc.instantiate(this.m_mapColUnitParentPrefab);

            prefab.setPosition(0, 0);

            var node = new cc.Node();
            node.setAnchorPoint(0.5, 0.5);

            node.addChild(prefab);

            this._nodePool.put(node);
        }

        let newColUnitParent = this._nodePool.get();

        let comp = newColUnitParent.children[0].getComponent(BaseMapColUnitParent);

        this.m_mapColUnitList = _.concat(this.m_mapColUnitList, comp.getColUnits());

        this.m_mapRootNode.addChild(newColUnitParent);
    }

    private _addNewTypeRecord(type: EmRecordType) {
        let curColIdx = this._latestRecordUnitInfo.m_mapColUnitIdx;
        if (curColIdx + 1 < this.m_mapColUnitList.length) {
            let targetColUnit: BaseMapColUnit = this.m_mapColUnitList[curColIdx + 1];

            targetColUnit.addFirstRecord(type);

            this._latestRecordUnitInfo.setColIdx(curColIdx + 1);

            if (type == EmRecordType.Type_Red) {
                this._redWinIdx = curColIdx + 1;
            }
            else {
                this._blackWinIdx = curColIdx + 1;
            }
        }
        else {
            this._extendMapUnit();
            this._addNewTypeRecord(type);
        }
    }
}
