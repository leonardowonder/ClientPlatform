const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import { EmDeciderType, EmRecordType } from '../../../Define/GamePlayDefine';
import NextGameItem from './NextGameItem';
import RecordUnitInfo from '../../../Data/GamePlay/RecordUnitInfo';
import RecordDataManager from '../../../Manager/GamePlayManger/RecordDataManager';

@ccclass
export default class NextGameMarkerRoot extends cc.Component {
    @property(NextGameItem)
    m_nextGameItems: NextGameItem[] = [];

    m_activeNextGameTypes: EmRecordType[] = [];
    m_passiveNextGameTypes: EmRecordType[] = [];

    clearAllInfos() {
        _.forEach(this.m_nextGameItems, (item: NextGameItem) => {
            item.clearAllMarkers();
        })        
    }

    getActiveNextGameRecordTypes(): EmRecordType[] {
        return this.m_activeNextGameTypes;
    }

    getPassiveNextGameRecordTypes(): EmRecordType[] {
        return this.m_passiveNextGameTypes;
    }

    updateNextGameMarker(records: RecordUnitInfo[]) {
        if (records == null || records.length < 1) {
            this.clearAllInfos();
            return;
        }

        let deciderType: EmDeciderType = RecordDataManager.getInstance().getActiveDeciderType(records);

        let idx: number = this._getItemIdx(deciderType);

        this.m_activeNextGameTypes = RecordDataManager.getInstance().getActiveRecordTypes(records);
        this.m_nextGameItems[idx].updateNextGameMarkers(this.m_activeNextGameTypes);

        this.m_passiveNextGameTypes = RecordDataManager.getInstance().getPassiveRecordTypes(records);
        this.m_nextGameItems[1 - idx].updateNextGameMarkers(this.m_passiveNextGameTypes);
    }
    
    private _checkDeciderTypeValid(type: EmDeciderType): boolean {
        return type > EmDeciderType.Type_None && type < EmDeciderType.Type_Max;
    }

    private _getItemIdx(type: EmDeciderType) {
        if (!this._checkDeciderTypeValid(type)) {
            cc.warn(`NextGameMarkerRoot _getItemIdx invalid type =${type}`);
            return 0;
        }

        let idx: number = 0;
        switch(type) {
            case EmDeciderType.Type_Red: {
                idx = 1;
                break;
            }
            case EmDeciderType.Type_Black: {
                idx = 0;
                break;
            }
        }

        return idx;
    }
}
