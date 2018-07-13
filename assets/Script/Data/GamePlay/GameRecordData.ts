import * as _ from 'lodash';

import { EmRecordType, Max_Record_Count } from '../../Define/GamePlayDefine';

export default class GameRecordData {
    private allRecords: EmRecordType[] = [];

    constructor() {
        this.clearRecord();
    }

    clearRecord() {
        this.allRecords.length = 0;
    }

    getRecords(): EmRecordType[] {
        return this.allRecords;
    }

    setRecords(types: EmRecordType[]) {
        _.forEach(types, (type: EmRecordType) => {
            this.addRecord(type);
        });
    }

    addRecord(type: EmRecordType) {
        if (!this._checkTypeValid(type)) {
            cc.warn(`GameRecordData addRecord type = ${type}`);
            return;
        }
        
        this.allRecords.push(type);

        if (this.allRecords.length > Max_Record_Count) {
            this.allRecords.shift();
        }
    }
    
    private _checkTypeValid(type: EmRecordType) {
        return type > EmRecordType.Type_None && type < EmRecordType.Type_Max;
    }
};