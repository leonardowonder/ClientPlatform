import * as _ from 'lodash';

import Singleton from '../../Utils/Singleton';

import { EmRecordType, EmViceRoadType, EmActiveDeciderType } from '../../Define/GamePlayDefine';
import RecordUnitInfo from '../../Data/GamePlay/RecordUnitInfo';

const cViceRoadTypeList: EmViceRoadType[] = [EmViceRoadType.Type_Road1, EmViceRoadType.Type_Road2, EmViceRoadType.Type_Road3];

class RecordDataManager extends Singleton {

    getActiveRecordTypes(records: RecordUnitInfo[]): EmRecordType[] {
        let types: EmRecordType[] = [];

        let baseRecords: RecordUnitInfo[] = this.getBaseRecords(records);
        let targetRowIdx: number = baseRecords.length;

        let refrenceRecordsList: RecordUnitInfo[][] = this.getAllRefrenceRecordsList(records);

        _.forEach(refrenceRecordsList, (records: RecordUnitInfo[]) => {
            let deciderType: EmRecordType = this.getActiveRecordType(records, targetRowIdx);

            types.push(deciderType);
        })

        return types;
    }

    getPassiveRecordTypes(records: RecordUnitInfo[]): EmRecordType[] {
        let types: EmRecordType[] = [];

        let baseRecords: RecordUnitInfo[] = this.getBaseRecords(records);
        let targetRowIdx: number = baseRecords.length;

        let refrenceRecordsList: RecordUnitInfo[][] = this.getAllRefrenceRecordsList(records);

        _.forEach(refrenceRecordsList, (records: RecordUnitInfo[]) => {
            let deciderType: EmRecordType = this.getPassiveRecordType(records, targetRowIdx);

            types.push(deciderType);
        })

        return types;
    }

    getActiveDeciderType(records: RecordUnitInfo[]): EmActiveDeciderType {
        let lastRecordType: EmRecordType = this.getLastRecordType(records);

        let type: EmActiveDeciderType = EmActiveDeciderType.Type_None;
        switch(lastRecordType) {
            case EmRecordType.Type_Black: {
                type = EmActiveDeciderType.Type_Black;
                break;
            }
            case EmRecordType.Type_Red: {
                type = EmActiveDeciderType.Type_Red;
                break;
            }
            default: {
                cc.warn(`RecordDataManager getActiveDeciderType invalid type = ${lastRecordType}`);
                type = EmActiveDeciderType.Type_Red;
                break;
            }
        }

        return type;
    }

    getAllRefrenceRecordsList(records: RecordUnitInfo[]): RecordUnitInfo[][] {
        let list: RecordUnitInfo[][] = [];
        _.forEach(cViceRoadTypeList, (type: EmViceRoadType) => {
            list.push(this.getRefrenceRecordsByViceRoadType(records, type));
        })

        return list;
    }

    getBaseRecords(records: RecordUnitInfo[]): RecordUnitInfo[] {
        let list: RecordUnitInfo[] = [];

        let curRecordType: EmRecordType = this.getLastRecordType(records);

        for (let i = records.length - 1; i >= 0; ++i) {
            if (records[i].getRecordType() != curRecordType) {
                break;
            }

            list.push(records[i]);
        }

        return list;
    }

    getActiveRecordType(refrenceRecords: RecordUnitInfo[], rowIdx: number): EmRecordType {
        let type = EmRecordType.Type_Red;
        if (rowIdx < 1) {
            cc.warn(`RecordDataManager getActiveDeciderType invalide rowIdx = ${rowIdx}`);
            return type;
        }

        if (refrenceRecords.length != rowIdx) {
            type = EmRecordType.Type_Red;
        }
        else {
            type = EmRecordType.Type_Black;
        }

        return type;
    }

    getPassiveRecordType(refrenceRecords: RecordUnitInfo[], rowIdx: number): EmRecordType {
        let activeDeciderType = this.getActiveRecordType(refrenceRecords, rowIdx);

        let type: EmRecordType = EmRecordType.Type_Black;
        if (activeDeciderType == EmRecordType.Type_Black) {
            type = EmRecordType.Type_Red;
        }
        else {
            type = EmRecordType.Type_Black;
        }

        return type;
    }

    getLastRecordType(records: RecordUnitInfo[]): EmRecordType {
        let lastRecordInfo: RecordUnitInfo = _.last(records);
        let lastRecordType: EmRecordType = lastRecordInfo.getRecordType();

        return lastRecordType;
    }

    getRefrenceRecordsByViceRoadType(records: RecordUnitInfo[], type: EmViceRoadType): RecordUnitInfo[] {
        let list: RecordUnitInfo[] = [];

        let curRecordType: EmRecordType = this.getLastRecordType(records);
        let curRefrenceCnt: number = 0;
        let targetRefrenceCnt: number = this.getRefrenceCnt(type);

        for (let i = records.length - 1; i >= 0; ++i) {
            if (records[i].getRecordType() != curRecordType) {
                curRefrenceCnt++;
            }

            if (curRefrenceCnt == targetRefrenceCnt) {
                list.push(records[i]);
            }
            else if (curRefrenceCnt > targetRefrenceCnt) {
                break;
            }
        }

        return list;
    }

    getRefrenceCnt(type: EmViceRoadType): number {
        let ret: number = 0;

        switch (type) {
            case EmViceRoadType.Type_Road1: {
                ret = 1;
                break;
            }
            case EmViceRoadType.Type_Road2: {
                ret = 2;
                break;
            }
            case EmViceRoadType.Type_Road3: {
                ret = 3;
                break;
            }
            default: {
                cc.warn(`RecordDataManager getRefrenceChangeCnt invalid type = ${type}`);
                break;
            }
        }

        return ret;
    }
}

export default new RecordDataManager();