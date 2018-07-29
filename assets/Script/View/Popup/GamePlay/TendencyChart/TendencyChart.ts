const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import StringUtils from '../../../../Utils/StringUtils';

import GameRecordData from '../../../../Data/GamePlay/GameRecordData';
import RoomData from '../../../../Data/GamePlay/RoomData';

import { EmRecordType, eBetPool } from '../../../../Define/GamePlayDefine';

import GameRecordDataManager from '../../../../Manager/DataManager/GamePlayDataManger/GameRecordDataManager';
import RoomDataManger from '../../../../Manager/DataManager/GamePlayDataManger/RoomDataManger';

import RecordMapController from '../../../../Component/GamePlay/TendencyChart/RecordMapController';
import NextGameMarkerRoot from '../../../../Component/GamePlay/TendencyChart/NextGameMarkerRoot';
import RecentRecordsLayer from '../../../Layer/GamePlay/RecentRecordsLayer';
import WinRateLayer from '../../../Layer/GamePlay/TendencyChart/WinRateLayer';

@ccclass
export default class TendencyChart extends cc.Component {

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

    _recordLoaded: boolean = false;

    onLoad() {
        this.scheduleOnce(() => {
            this.updateRecords();
        })
    }

    updateRecords() {
        if (this._recordLoaded) {
            return;
        }

        let roomData: RoomData = RoomDataManger.getInstance().getRoomData();

        let records: eBetPool[] = roomData.vWinRecord;
        let types: EmRecordType[] = [];
        _.forEach(records, (record: eBetPool) => {
            if (record == eBetPool.eBet_Red ) {
                types.push(EmRecordType.Type_Red);
            }
            else if (record == eBetPool.eBet_Black) {
                types.push(EmRecordType.Type_Black);
            }
            else {
                cc.warn(`TendencyChart updateRecords invalid record = ${record}`);
            }
        });

        _.forEach(types, (type: EmRecordType) => {
            this.addRecord(type);
        });

        this._recordLoaded = true;
    }

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

        let recordData: GameRecordData = GameRecordDataManager.getInstance().getGameRecordData();
        let types: EmRecordType[] = recordData.getRecords();

        this.m_markerRoot.updateNextGameMarker(types);

        this._updateLabels(types);
    }
    
    hide() {
        this.node.active = false;
    }

    private _addRecordToChartData(type: EmRecordType) {
        let recordData: GameRecordData = GameRecordDataManager.getInstance().getGameRecordData();
        recordData.addRecord(type);
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