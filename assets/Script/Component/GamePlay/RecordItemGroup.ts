const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import RecordItem from './RecordItem';
import { EmRecordType } from '../../Define/GamePlayDefine';

@ccclass
export default class RecordItemGroup extends cc.Component {

    @property(RecordItem)
    m_recordItemGroup: RecordItem[] = [];

    private m_curIdx: number = 0;
    private m_initalRecordType: EmRecordType = EmRecordType.Type_None;

    getInitRecordType(): EmRecordType {
        return this.m_initalRecordType;
    }

    getRecordItemGroup(): RecordItem[] {
        return this.m_recordItemGroup;
    }

    addFirstRecord(type: EmRecordType) {
        this.m_initalRecordType = type;

        //update at next frame, item will not move from center to top
        this.scheduleOnce(() => {
            this.m_recordItemGroup[0].updateRecordUnit(type);
        })
    }

    updateRecord(type: EmRecordType, idx: number): boolean {
        let needIncreaseColIdx = false;

        if (!this._checkIdxValid(idx)) {
            cc.warn(`RecordItemGroup updateRecord invalid idx = ${idx}, length = ${this.m_recordItemGroup.length}`);
            return needIncreaseColIdx;
        }

        let targetUnit: RecordItem = this.m_recordItemGroup[idx];

        //update at next frame, item will not move from center to top
        this.scheduleOnce(() => {
            targetUnit.updateRecordUnit(type);
        })

        needIncreaseColIdx = idx < 1;

        return needIncreaseColIdx;
    }

    tryExtend(type: EmRecordType): boolean {
        let ret: boolean = true;

        if (!this._canExtend(type)) {
            ret = false;
        }
        else {
            this._doExtend();
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
        return idx < this.m_recordItemGroup.length;
    }

    private _canExtend(type: EmRecordType): boolean {
        let ret: boolean = true;

        if (type != this.m_initalRecordType) {
            ret = false;
        }
        else {
            let targetIdx: number = this.m_curIdx + 1;
    
            ret = targetIdx < this.m_recordItemGroup.length && this.m_recordItemGroup[targetIdx].isAvailable();
        }

        return ret;
    }

    private _doExtend() {
        this.m_curIdx++;

        this.m_recordItemGroup[this.m_curIdx].updateRecordUnit(this.m_initalRecordType);
    }
}
