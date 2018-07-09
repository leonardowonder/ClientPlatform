const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import RecordItemGroup from './RecordItemGroup';
import { EmRecordType } from '../../Define/GamePlayDefine';
import RecordUnitInfo from '../../Data/GamePlay/RecordUnitInfo';

// export class RBRecordInfo {
//     private _redStartColIdx: number = -1;
//     private _blackStartColIdx: number = -1;
//     private _redEndColIdx: number = -1;
//     private _blackEndColId: number = -1;

//     getStartColIdx(type: EmRecordType): number {
//         if (!checkTypeValid(type)) {
//             cc.warn(`RBRecordInfo getStartColIdx invalid type = ${type}`);
//             return -1;
//         }

//         let idx = type == EmRecordType.Type_Red ? this._redStartColIdx : this._blackStartColIdx;

//         return idx;
//     }

//     getEndColIdx(type: EmRecordType): number {
//         if (!checkTypeValid(type)) {
//             cc.warn(`RBRecordInfo getEndColIdx invalid type = ${type}`);
//             return -1;
//         }

//         let idx = type == EmRecordType.Type_Red ? this._redEndColIdx : this._blackEndColId;

//         return idx;
//     }
// };

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
        this._latestRecordUnitInfo = new RecordUnitInfo(EmRecordType.Type_None, -1, -1);
        this._nodePool = new cc.NodePool(RecordItemGroup);
    }

    getLatestRecordUnitInfo(): RecordUnitInfo {
        return this._latestRecordUnitInfo;
    }

    getRecordItemGroupCount(): number {
        return this.m_recordItemGroups.length;
    }

    getRecordItemGroup(idx: number): RecordItemGroup {
        let ret: RecordItemGroup = null;

        if (idx >= 0 && idx < this.m_recordItemGroups.length) {
            ret = this.m_recordItemGroups[idx];
        }
        return ret;
    }

    getAllRecordItemGroups(): RecordItemGroup[] {
        return this.m_recordItemGroups;
    }

    getRedWinIdx(): number {
        return this._redWinIdx;
    }

    getBlackWinIdx(): number {
        return this._blackWinIdx;
    }

    addRecord(type: EmRecordType) {
        if (!this._checkTypeValid(type)) {
            cc.warn(`RecordRoot addRecord invalid type = ${type}`);
            return;
        }

        this._addRecordByLatestInfo(type);
    }

    removeFirstRecordItemGroup(): boolean {
        let ret: boolean = true;

        let firstGroup: RecordItemGroup = this.m_recordItemGroups.shift();

        if (firstGroup) {
            let targetNode = firstGroup.node;

            this._nodePool.put(targetNode);
        }
        else {
            ret = false;
            cc.warn(`RecordRoot removeFirstRecordItemGroup firstGroup null`);
        }

        return ret;
    }

    removeLastRecordItemGroup(): boolean {
        let ret: boolean = true;

        let lastGropp: RecordItemGroup = this.m_recordItemGroups.pop();

        if (lastGropp) {
            let targetNode = lastGropp.node;

            this._nodePool.put(targetNode);
        }
        else {
            ret = false;
            cc.warn(`RecordRoot removeFirstRecordItemGroup lastGropp null`);
        }

        return ret;
    }

    resetTargetItem(groupIdx: number, recordIdx: number) {
        if (!this._checkGroupIdxValid(groupIdx)) {
            cc.warn(`RecordRoot resetTargetItem invalid groupIdx =${groupIdx}`);
            return;
        }

        let targetGroup = this.m_recordItemGroups[groupIdx];
        targetGroup.resetTargetItem(recordIdx);
    }

    decreaseRedBlackIdx() {
        this._redWinIdx > 0 && this._redWinIdx--;
        this._blackWinIdx > 0 && this._blackWinIdx--;
    }

    private _checkTypeValid(type: EmRecordType) {
        return type == EmRecordType.Type_Red || type == EmRecordType.Type_Black;
    }

    private _checkGroupIdxValid(groupIdx: number): boolean {
        return groupIdx >= 0 && groupIdx < this.m_recordItemGroups.length;
    }

    private _addRecordByLatestInfo(type: EmRecordType) {
        let latestType: EmRecordType = this._latestRecordUnitInfo.getRecordType();
        if (type == latestType) {
            let colIdx: number = this._latestRecordUnitInfo.getRecordItemGroupIdx();

            let targetGroup: RecordItemGroup = this.m_recordItemGroups[colIdx];

            let extendResult = targetGroup.tryExtend(type);
            if (!extendResult) {
                this._moveToNextRecordItemGroup();
            }
            else {
                let targetRecordIdx = this._latestRecordUnitInfo.getRecordUnitRowIdx() + 1;
                this._latestRecordUnitInfo.setRecordIdx(targetRecordIdx);
            }
        }
        else {
            this._addNewTypeRecord(type);
        }
    }

    private _moveToNextRecordItemGroup() {
        let curGroupIdx = this._latestRecordUnitInfo.getRecordItemGroupIdx();
        if (curGroupIdx + 1 < this.m_recordItemGroups.length) {
            let targetGroup: RecordItemGroup = this.m_recordItemGroups[curGroupIdx + 1];

            let needIncreaseColIdx: boolean = targetGroup.updateRecord(this._latestRecordUnitInfo.getRecordType(), this._latestRecordUnitInfo.getRecordUnitRowIdx());

            if (needIncreaseColIdx) {
                if (this._latestRecordUnitInfo.getRecordType() == EmRecordType.Type_Red) {
                    this._redWinIdx++;
                }
                else {
                    this._blackWinIdx++;
                }
            }

            this._latestRecordUnitInfo.setGroupIdx(curGroupIdx + 1);
        }
        else {
            this._addNewRecordItemGroup();
            this._moveToNextRecordItemGroup();
        }
    }

    private _addNewRecordItemGroup() {
        if (this._nodePool.size() < 1) {
            var prefab = cc.instantiate(this.m_recordItemGroupPrefab);
            this._nodePool.put(prefab);
        }

        let newItemGroup = this._nodePool.get();

        let comp: RecordItemGroup = newItemGroup.getComponent(RecordItemGroup);

        this.m_recordItemGroups.push(comp);

        this.node.addChild(newItemGroup);
    }

    private _addNewTypeRecord(type: EmRecordType) {
        let curGroupIdx = type == EmRecordType.Type_Red ? this._blackWinIdx : this._redWinIdx;
        if (curGroupIdx + 1 < this.m_recordItemGroups.length) {
            let targetGroup: RecordItemGroup = this.m_recordItemGroups[curGroupIdx + 1];

            targetGroup.addFirstRecord(type);

            this._latestRecordUnitInfo.setRecordType(type);
            this._latestRecordUnitInfo.setGroupIdx(curGroupIdx + 1);
            this._latestRecordUnitInfo.setRecordIdx(0);

            if (type == EmRecordType.Type_Red) {
                this._redWinIdx = curGroupIdx + 1;
            }
            else {
                this._blackWinIdx = curGroupIdx + 1;
            }
        }
        else {
            this._addNewRecordItemGroup();
            this._addNewTypeRecord(type);
        }
    }
}
