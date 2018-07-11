const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import StringUtils from '../../../../Utils/StringUtils';

import { EmRecordType } from '../../../../Define/GamePlayDefine';
import RecordUnitInfo from '../../../../Data/GamePlay/RecordUnitInfo';

import RecordMapController from '../../../../Component/GamePlay/TendencyChart/RecordMapController';
import NextGameMarkerRoot from '../../../../Component/GamePlay/TendencyChart/NextGameMarkerRoot';
import RecentRecordsLayer from './RecentRecordsLayer';
import WinRateLayer from './WinRateLayer';

@ccclass
export default class RoadsRootLayer extends cc.Component {

    @property(RecordMapController)
    m_mainRoad1Controller: RecordMapController = null;
    
    @property(RecordMapController)
    m_mainRoad2Controller: RecordMapController = null;

    @property(RecordMapController)
    m_viceRoadControllers: RecordMapController[] = [];

    @property(RecentRecordsLayer)
    m_recentRecordsLayer: RecentRecordsLayer = null;

    @property(NextGameMarkerRoot)
    m_markerRoot: NextGameMarkerRoot = null;
    
    @property(WinRateLayer)
    m_winRateLayer: WinRateLayer = null;

    @property(cc.Label)
    m_redWinCountLabel: cc.Label = null;
    @property(cc.Label)
    m_blackWinCountLabel: cc.Label = null;
    @property(cc.Label)
    m_totalGamesLabel: cc.Label = null;

    addRecord(type: EmRecordType) {
        let lastGameType: EmRecordType = this.m_mainRoad1Controller.getLastGameRecordType();

        let types: EmRecordType[] = null;
        if (type == lastGameType) {
            types = this.m_markerRoot.getActiveNextGameRecordTypes();
        }
        else {
            types = this.m_markerRoot.getPassiveNextGameRecordTypes();
        }

        _.forEach(this.m_viceRoadControllers, (controller: RecordMapController, idx: number) => {
            controller.addRecord(types[idx]);
        });

        this.m_mainRoad1Controller.addRecord(type, false);
        this.m_mainRoad2Controller.addRecord(type);
        this.m_recentRecordsLayer.addRecord(type);

        let records: RecordUnitInfo[] = this.m_mainRoad1Controller.getRecordUnitInfos();

        this.m_markerRoot.updateNextGameMarker(records);

        this._updateLabels(records);
    }

    addRed() {
        this.addRecord(EmRecordType.Type_Red);
    }

    addBlack() {
        this.addRecord(EmRecordType.Type_Black);
    }

    private _updateLabels(records: RecordUnitInfo[]) {
        let redWinCount: number = this._getWinCnt(records, EmRecordType.Type_Red);
        let blackWinCount: number = this._getWinCnt(records, EmRecordType.Type_Black);

        let totalCount: number = records.length;

        this.m_redWinCountLabel.string = StringUtils.getInstance().formatByKey('red_win', redWinCount);
        this.m_blackWinCountLabel.string = StringUtils.getInstance().formatByKey('black_win', blackWinCount);

        this.m_totalGamesLabel.string = StringUtils.getInstance().formatByKey('total_games', totalCount);
        
        this.m_winRateLayer.updateRateNode(redWinCount, blackWinCount);
    }

    private _getWinCnt(records: RecordUnitInfo[], type: EmRecordType): number {
        let cnt: number = 0;
        _.forEach(records, (record: RecordUnitInfo) => {
            if (record && record.getRecordType() == type) {
                cnt++;
            }
        });

        return cnt;
    }
}