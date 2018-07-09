const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import { EmActiveDeciderType, EmViceRoadType, EmRecordType } from '../../Define/GamePlayDefine';
import NextGameItem from './NextGameItem';
import RecordUnitInfo from '../../Data/GamePlay/RecordUnitInfo';

@ccclass
export default class NextGameMarkerRoot extends cc.Component {
    @property(NextGameItem)
    m_nextGameItems: NextGameItem[] = [];

    clearAllInfos() {
        _.forEach(this.m_nextGameItems, (item: NextGameItem) => {
            item.clearAllMarkers();
        })        
    }

    updateNextGameMarker(records: RecordUnitInfo[]) {
        if (records == null || records.length < 1) {
            this.clearAllInfos();
            return;
        }

        let lastRecordInfo: RecordUnitInfo = _.last(records);
        let lastRecordType: EmRecordType = lastRecordInfo.getRecordType();

    }
    
    private _checkViceRoadTypeValid(type: EmViceRoadType): boolean {
        return type > EmViceRoadType.Type_None && type < EmViceRoadType.Type_Max;
    }
}
