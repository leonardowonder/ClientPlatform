const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import BaseMapUnit from './BaseMapUnit';
import { EmRecordType } from '../../Define/GamePlayDefine';

@ccclass
export default class BaseMapColUnit extends cc.Component {

    @property(BaseMapUnit)
    m_mapUnits: BaseMapUnit[] = [];

    private m_curIdx: number = 0;
    private m_recordType: EmRecordType = EmRecordType.Type_None;

    getRecordType(): EmRecordType {
        return this.m_recordType;
    }

    addFirstRecord(type: EmRecordType) {
        this.m_recordType = type;

        this.m_mapUnits[0].updateRecordUnit(type);
    }

    updateRecord(type: EmRecordType, idx: number) {
        if (!this._checkIdxValid(idx)) {
            cc.warn(`BaseMapColUnit updateRecord invalid idx = ${idx}, length = ${this.m_mapUnits.length}`);
            return;
        }

        let targetUnit: BaseMapUnit = this.m_mapUnits[idx];
        targetUnit.updateRecordUnit(type);
    }

    tryExtend(): boolean {
        let ret: boolean = true;

        if (!this._canExtend()) {
            ret = false;
        }
        else {
            this._doExtend();
        }

        return ret;
    }

    isFull(): boolean {
        let ret: boolean = _.every(this.m_mapUnits, (unit: BaseMapUnit) => {
            return unit && !unit.isAvailable();
        });

        return ret;
    }

    isEmpty(): boolean {
        let ret: boolean = _.every(this.m_mapUnits, (unit: BaseMapUnit) => {
            return unit && unit.isAvailable();
        });

        return ret;
    }

    private _checkIdxValid(idx: number): boolean {
        return idx < this.m_mapUnits.length;
    }

    private _canExtend(): boolean {
        let targetIdx: number = this.m_curIdx + 1;

        let ret: boolean = targetIdx < this.m_mapUnits.length && this.m_mapUnits[targetIdx].isAvailable();

        return ret;
    }

    private _doExtend() {
        this.m_curIdx++;

        this.m_mapUnits[this.m_curIdx].updateRecordUnit(this.m_recordType);
    }
}
