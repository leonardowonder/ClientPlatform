const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import { EmDeciderType, EmViceRoadType, EmRecordType } from '../../Define/GamePlayDefine';
import RecordUnit from './RecordUnit';

@ccclass
export default class NextGameItem extends cc.Component {
    @property(RecordUnit)
    m_recordUnits: RecordUnit[] = [];

    clearAllMarkers() {
        _.forEach(this.m_recordUnits, (recordUnit: RecordUnit) => {
            recordUnit.resetData();
        });
    }

    updateNextGameMarkers(types: EmRecordType[]) {
        if (types == null || types.length != this.m_recordUnits.length) {
            cc.warn(`NextGameItem updateNextGameMarkers invalid types = ${types}`);
            return;
        }
        
        _.forEach(this.m_recordUnits, (recordUnit: RecordUnit, idx: number) => {
            recordUnit && recordUnit.updateViewByType(types[idx]);
        });
    }
}
