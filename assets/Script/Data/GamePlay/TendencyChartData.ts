import Singleton from '../../Utils/Singleton';

import { EmRecordType, Max_Record_Count } from '../../Define/GamePlayDefine';

class TendencyChartData extends Singleton{
    private allRecords: EmRecordType[] = [];

    clearRecord() {
        this.allRecords.length = 0;
    }

    getRecords(): EmRecordType[] {
        return this.allRecords;
    }

    addRecord(type: EmRecordType) {
        if (!this._checkTypeValid(type)) {
            cc.warn(`TendencyChartData addRecord type = ${type}`);
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

export default new TendencyChartData();