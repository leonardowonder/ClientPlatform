import { EmRecordType } from '../../Define/GamePlayDefine';

export default class RecordUnitInfo {
    m_recordType: EmRecordType = EmRecordType.Type_None;
    m_recordItemGroupIdx: number = -1;
    m_recordUnitIdx: number = -1;

    constructor(type: EmRecordType, groupIdx: number, recordIdx: number) {
        this.m_recordType = type;
        this.m_recordItemGroupIdx = groupIdx;
        this.m_recordUnitIdx = recordIdx;
    }

    setType(type: EmRecordType) {
        this.m_recordType = type;
    }

    setGroupIdx(idx: number) {
        this.m_recordItemGroupIdx = idx;
    }

    setRecordIdx(idx: number) {
        this.m_recordUnitIdx = idx;
    }

    decreaseGroupIdx() {
        this.m_recordItemGroupIdx--;
    }
}