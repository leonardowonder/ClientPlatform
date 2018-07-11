const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import StringUtils from '../../../../Utils/StringUtils';

import TendencyChartData from '../../../../Data/GamePlay/TendencyChartData';

import { EmRecordType } from '../../../../Define/GamePlayDefine';

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
        this._addRecordToChartData(type);

        let lastGameType: EmRecordType = this.m_mainRoad1Controller.getLastGameRecordType();

        let nextGameTypes: EmRecordType[] = null;
        if (type == lastGameType) {
            nextGameTypes = this.m_markerRoot.getActiveNextGameRecordTypes();
        }
        else {
            nextGameTypes = this.m_markerRoot.getPassiveNextGameRecordTypes();
        }

        _.forEach(this.m_viceRoadControllers, (controller: RecordMapController, idx: number) => {
            controller.addRecord(nextGameTypes[idx]);
        });

        this.m_mainRoad1Controller.addRecord(type, false);
        this.m_mainRoad2Controller.addRecord(type);
        this.m_recentRecordsLayer.addRecord(type);

        let types: EmRecordType[] = TendencyChartData.getInstance().getRecords();

        this.m_markerRoot.updateNextGameMarker(types);

        this._updateLabels(types);
    }

    addRed() {
        this.addRecord(EmRecordType.Type_Red);
    }

    addBlack() {
        this.addRecord(EmRecordType.Type_Black);
    }

    private _addRecordToChartData(type: EmRecordType) {
        TendencyChartData.getInstance().addRecord(type);
    }

    private _updateLabels(types: EmRecordType[]) {
        let redWinCount: number = this._getWinCnt(types, EmRecordType.Type_Red);
        let blackWinCount: number = this._getWinCnt(types, EmRecordType.Type_Black);

        let totalCount: number = types.length;

        this.m_redWinCountLabel.string = StringUtils.getInstance().formatByKey('red_win', redWinCount);
        this.m_blackWinCountLabel.string = StringUtils.getInstance().formatByKey('black_win', blackWinCount);

        this.m_totalGamesLabel.string = StringUtils.getInstance().formatByKey('total_games', totalCount);
        
        this.m_winRateLayer.updateRateNode(redWinCount, blackWinCount);
    }

    private _getWinCnt(types: EmRecordType[], targetType: EmRecordType): number {
        let cnt: number = 0;
        _.forEach(types, (type: EmRecordType) => {
            if (type == targetType) {
                cnt++;
            }
        });

        return cnt;
    }
}