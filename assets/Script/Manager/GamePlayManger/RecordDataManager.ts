import * as _ from 'lodash';

import Singleton from '../../Utils/Singleton';

import { EmRecordType, EmViceRoadType, EmDeciderType } from '../../Define/GamePlayDefine';

const cViceRoadTypeList: EmViceRoadType[] = [EmViceRoadType.Type_Road1, EmViceRoadType.Type_Road2, EmViceRoadType.Type_Road3];

class RecordDataManager extends Singleton {

    getActiveRecordTypes(types: EmRecordType[]): EmRecordType[] {
        let activeRocordTypes: EmRecordType[] = [];

        let baseTypes: EmRecordType[] = this.getBaseTypes(types);
        let targetRowIdx: number = baseTypes.length;

        let refrenceTypesList: EmRecordType[][] = this.getAllRefrenceTypesList(types);

        _.forEach(refrenceTypesList, (types: EmRecordType[]) => {
            let deciderType: EmRecordType = this.getActiveRecordType(types, targetRowIdx);

            activeRocordTypes.push(deciderType);
        })

        return activeRocordTypes;
    }

    getPassiveRecordTypes(types: EmRecordType[]): EmRecordType[] {
        let passiveTypes: EmRecordType[] = [];

        let baseTypes: EmRecordType[] = this.getBaseTypes(types);
        let targetRowIdx: number = baseTypes.length;

        let refrenceTypesList: EmRecordType[][] = this.getAllRefrenceTypesList(types);

        _.forEach(refrenceTypesList, (types: EmRecordType[]) => {
            let deciderType: EmRecordType = this.getPassiveRecordType(types, targetRowIdx);

            passiveTypes.push(deciderType);
        })

        return passiveTypes;
    }

    getActiveDeciderType(types: EmRecordType[]): EmDeciderType {
        let lastRecordType: EmRecordType = this.getLastRecordType(types);

        let type: EmDeciderType = EmDeciderType.Type_None;
        switch (lastRecordType) {
            case EmRecordType.Type_Black: {
                type = EmDeciderType.Type_Black;
                break;
            }
            case EmRecordType.Type_Red: {
                type = EmDeciderType.Type_Red;
                break;
            }
            default: {
                cc.warn(`RecordDataManager getActiveDeciderType invalid type = ${lastRecordType}`);
                type = EmDeciderType.Type_Red;
                break;
            }
        }

        return type;
    }

    getAllRefrenceTypesList(types: EmRecordType[]): EmRecordType[][] {
        let list: EmRecordType[][] = [];
        _.forEach(cViceRoadTypeList, (type: EmViceRoadType) => {
            list.push(this.getRefrenceRecordsByViceRoadType(types, type));
        })

        return list;
    }

    getBaseTypes(types: EmRecordType[]): EmRecordType[] {
        let baseTypes: EmRecordType[] = [];

        let curRecordType: EmRecordType = this.getLastRecordType(types);

        for (let i = types.length - 1; i >= 0; --i) {
            if (types[i] != curRecordType) {
                break;
            }

            baseTypes.push(types[i]);
        }

        return baseTypes;
    }

    getActiveRecordType(refrenceTypes: EmRecordType[], rowIdx: number): EmRecordType {
        let type = EmRecordType.Type_Red;
        if (rowIdx < 1) {
            cc.warn(`RecordDataManager getActiveDeciderType invalide rowIdx = ${rowIdx}`);
            return type;
        }

        if (refrenceTypes.length != rowIdx) {
            type = EmRecordType.Type_Red;
        }
        else {
            type = EmRecordType.Type_Black;
        }

        return type;
    }

    getPassiveRecordType(refrenceTypes: EmRecordType[], rowIdx: number): EmRecordType {
        let activeDeciderType = this.getActiveRecordType(refrenceTypes, rowIdx);

        let type: EmRecordType = EmRecordType.Type_Black;
        if (activeDeciderType == EmRecordType.Type_Black) {
            type = EmRecordType.Type_Red;
        }
        else {
            type = EmRecordType.Type_Black;
        }

        return type;
    }

    getLastRecordType(types: EmRecordType[]): EmRecordType {
        let lastRecordType: EmRecordType = _.last(types);

        return lastRecordType;
    }

    getRefrenceRecordsByViceRoadType(types: EmRecordType[], type: EmViceRoadType): EmRecordType[] {
        let refrenceTypes: EmRecordType[] = [];

        let curRecordType: EmRecordType = this.getLastRecordType(types);
        let curRefrenceCnt: number = 0;
        let targetRefrenceCnt: number = this.getRefrenceCnt(type);

        for (let i = types.length - 1; i >= 0; --i) {
            if (types[i] != curRecordType) {
                curRecordType = types[i];
                curRefrenceCnt++;
            }

            if (curRefrenceCnt == targetRefrenceCnt) {
                refrenceTypes.push(types[i]);
            }
            else if (curRefrenceCnt > targetRefrenceCnt) {
                break;
            }
        }

        return refrenceTypes;
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