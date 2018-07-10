const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import RecordItem from './RecordItem';
import { EmRecordType } from '../../../Define/GamePlayDefine';

@ccclass
export default class RecordItemGroup extends cc.Component {

    @property(RecordItem)
    m_recordItemGroup: RecordItem[] = [];

    private m_curIdx: number = -1;
    private m_initalRecordType: EmRecordType = EmRecordType.Type_None;

    //node pool
    reuse() {
        this._resetData();
    }

    unuse() {
        // this._resetData();
    }

    getInitRecordType(): EmRecordType {
        return this.m_initalRecordType;
    }

    getRecordItems(): RecordItem[] {
        return this.m_recordItemGroup;
    }

    addFirstRecord(type: EmRecordType) {
        this.m_initalRecordType = type;

        this.m_recordItemGroup[0].updateRecordUnit(type);
    }

    updateRecord(type: EmRecordType, idx: number): boolean {
        let needIcreaseColIdx: boolean = false;
        if (!this._checkIdxValid(idx)) {
            cc.warn(`RecordItemGroup updateRecord invalid idx = ${idx}, length = ${this.m_recordItemGroup.length}`);
            return needIcreaseColIdx;
        }

        let targetUnit: RecordItem = this.m_recordItemGroup[idx];

        targetUnit.updateRecordUnit(type);

        needIcreaseColIdx = idx < 1;

        return needIcreaseColIdx;
    }

    resetTargetItem(idx: number) {
        if (!this._checkIdxValid(idx)) {
            cc.warn(`RecordItemGroup resetTargetItem invalid idx = ${idx}, length = ${this.m_recordItemGroup.length}`);
            return;
        }

        let targetUnit: RecordItem = this.m_recordItemGroup[idx];

        targetUnit.updateRecordUnit(EmRecordType.Type_None);
    }

    tryExtend(type: EmRecordType, mustSameType: boolean = true): boolean {
        let ret: boolean = true;

        if (!this._canExtend(type, mustSameType)) {
            ret = false;
        }
        else {
            this._doExtend(type);
        }

        return ret;
    }

    isFull(): boolean {
        let ret: boolean = _.every(this.m_recordItemGroup, (unit: RecordItem) => {
            return unit && !unit.isAvailable();
        });

        return ret;
    }

    isEmpty(): boolean {
        let ret: boolean = _.every(this.m_recordItemGroup, (unit: RecordItem) => {
            return unit && unit.isAvailable();
        });

        return ret;
    }

    private _checkIdxValid(idx: number): boolean {
        return idx >= 0 && idx < this.m_recordItemGroup.length;
    }

    private _canExtend(type: EmRecordType, mustSameType: boolean): boolean {
        let ret: boolean = true;

        if (mustSameType) {
            if (type != this.m_initalRecordType) {
                ret = false;
            }
            else {
                let targetIdx: number = this.m_curIdx + 1;
    
                ret = targetIdx < this.m_recordItemGroup.length && this.m_recordItemGroup[targetIdx].isAvailable();
            }
        }
        else {
            let targetIdx: number = this.m_curIdx + 1;

            ret = targetIdx < this.m_recordItemGroup.length && this.m_recordItemGroup[targetIdx].isAvailable();
        }

        return ret;
    }

    private _doExtend(type: EmRecordType) {
        this.m_curIdx++;

        this.m_recordItemGroup[this.m_curIdx].updateRecordUnit(type);
    }

    private _resetData() {
        this.m_recordItemGroup.forEach((recordItem: RecordItem)=> {
            recordItem && recordItem.resetData();
        });

        this.m_curIdx = 0;
        this.m_initalRecordType = EmRecordType.Type_None;
    }
}
