export enum EmRecordType {
    Type_None = 0,
    Type_Red,
    Type_Black
};

export class RecordUnitInfo {
    m_recordType: EmRecordType = EmRecordType.Type_None;
    m_mapColUnitIdx: number = -1;
    m_recordUnitIdx: number = -1;

    constructor(type: EmRecordType, mapIdx: number, recordIdx: number) {
        this.m_recordType = type;
        this.m_mapColUnitIdx = mapIdx;
        this.m_recordUnitIdx = recordIdx;
    }

    setType(type: EmRecordType) {
        this.m_recordType = type;
    }

    setColIdx(idx: number) {
        this.m_mapColUnitIdx = idx;
    }

    setRecordIdx(idx: number) {
        this.m_recordUnitIdx = idx;
    }
}