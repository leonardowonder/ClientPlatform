const { ccclass, property } = cc._decorator;

import RecordItemGroup from './RecordItemGroup';
import { EmRecordType, RecordUnitInfo } from '../../Define/GamePlayDefine';

@ccclass
export default class RecordRoot extends cc.Component {
    @property(cc.Prefab)
    m_recordItemGroupPrefab: cc.Prefab = null;

    @property(RecordItemGroup)
    m_recordItemGroups: RecordItemGroup[] = [];

    private _nodePool: cc.NodePool = null;

    //logic
    private _latestRecordUnitInfo: RecordUnitInfo = null;
    private _redWinIdx: number = -1;
    private _blackWinIdx: number = -1;

    onLoad() {
        this._latestRecordUnitInfo = new RecordUnitInfo(EmRecordType.Type_None, 0, 0);
        this._nodePool = new cc.NodePool(RecordItemGroup);
    }

    getRecordItemGroupCount(): number {
        return this.m_recordItemGroups.length;
    }

    addRecord(type: EmRecordType) {
        if (!this._checkTypeValid(type)) {
            cc.warn(`RecordRoot addRecord invalid type = ${type}`);
            return;
        }

        this._addRecordByLatestInfo(type);
    }

    private _checkTypeValid(type: EmRecordType) {
        return type == EmRecordType.Type_Red || type == EmRecordType.Type_Black;
    }

    private _addRecordByLatestInfo(type: EmRecordType) {
        let latestType: EmRecordType = this._latestRecordUnitInfo.m_recordType;
        if (type == latestType) {
            let colIdx: number = this._latestRecordUnitInfo.m_mapColUnitIdx;
            let targetGroup: RecordItemGroup = this.m_recordItemGroups[colIdx];

            let extendResult = targetGroup.tryExtend(type);
            if (!extendResult) {
                this._moveToNextRecordItemGroup();
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

    private _moveToNextRecordItemGroup() {
        let curColIdx = this._latestRecordUnitInfo.m_mapColUnitIdx;
        if (curColIdx + 1 < this.m_recordItemGroups.length) {
            let targetGroup: RecordItemGroup = this.m_recordItemGroups[curColIdx + 1];

            let needIncreaseColIdx: boolean = targetGroup.updateRecord(this._latestRecordUnitInfo.m_recordType, this._latestRecordUnitInfo.m_recordUnitIdx);

            if (needIncreaseColIdx) {
                if (this._latestRecordUnitInfo.m_recordType == EmRecordType.Type_Red) {
                    this._redWinIdx++;
                }
                else {
                    this._blackWinIdx++;
                }
            }

            this._latestRecordUnitInfo.setColIdx(curColIdx + 1);
        }
        else {
            this._addNewRecordItemGroup();
            this._moveToNextRecordItemGroup();
        }
    }

    private _addNewRecordItemGroup() {
        if (this._nodePool.size() < 1) {
            var prefab = cc.instantiate(this.m_recordItemGroupPrefab);

            prefab.setPosition(0, 0);

            var node = new cc.Node();
            node.setAnchorPoint(0.5, 0.5);
            node.setContentSize(prefab.getContentSize());

            node.addChild(prefab);

            this._nodePool.put(node);
        }

        let newColUnitParent = this._nodePool.get();

        let comp: RecordItemGroup = newColUnitParent.children[0].getComponent(RecordItemGroup);

        this.m_recordItemGroups.push(comp);

        this.node.addChild(newColUnitParent);
    }

    private _addNewTypeRecord(type: EmRecordType) {
        let curColIdx = type == EmRecordType.Type_Red ? this._blackWinIdx : this._redWinIdx;
        if (curColIdx + 1 < this.m_recordItemGroups.length) {
            let targetGroup: RecordItemGroup = this.m_recordItemGroups[curColIdx + 1];

            targetGroup.addFirstRecord(type);

            this._latestRecordUnitInfo.setType(type);
            this._latestRecordUnitInfo.setColIdx(curColIdx + 1);
            this._latestRecordUnitInfo.setRecordIdx(0);

            if (type == EmRecordType.Type_Red) {
                this._redWinIdx = curColIdx + 1;
            }
            else {
                this._blackWinIdx = curColIdx + 1;
            }
        }
        else {
            this._addNewRecordItemGroup();
            this._addNewTypeRecord(type);
        }
    }
}
