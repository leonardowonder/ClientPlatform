export enum EmRecordType {
    Type_None = 0,
    Type_Red,
    Type_Black
};

export class RecordUnitInfo {
    m_recordType: EmRecordType = EmRecordType.Type_None;
    m_mapUnitIdx: number = -1;
    m_recordUnitIdx: number = -1;

    updateInfo(type: EmRecordType, mapIdx: number, recordIdx: number) {
        this.m_recordType = type;
        this.m_mapUnitIdx = mapIdx;
        this.m_recordType = recordIdx;
    }
}