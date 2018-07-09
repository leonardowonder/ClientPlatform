import { EmRecordType } from '../../Define/GamePlayDefine';

export default class RecordUnitInfo {
    private m_recordType: EmRecordType = EmRecordType.Type_None;
    private m_recordItemGroupIdx: number = -1;
    private m_recordUnitRowIdx: number = -1;

    constructor(type: EmRecordType, groupIdx: number, recordIdx: number) {
        this.m_recordType = type;
        this.m_recordItemGroupIdx = groupIdx;
        this.m_recordUnitRowIdx = recordIdx;
    }

    getRecordType(): EmRecordType { return this.m_recordType; }
    getRecordItemGroupIdx(): number { return this.m_recordItemGroupIdx; }
    getRecordUnitRowIdx(): number { return this.m_recordUnitRowIdx; }

    setRecordType(type: EmRecordType) {
        this.m_recordType = type;
    }

    setGroupIdx(idx: number) {
        this.m_recordItemGroupIdx = idx;
    }

    setRecordIdx(idx: number) {
        this.m_recordUnitRowIdx = idx;
    }

    decreaseGroupIdx() {
        this.m_recordItemGroupIdx--;
    }
}