const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import { EmRecordType } from '../../Define/GamePlayDefine';
import RecordUnitInfo from '../../Data/GamePlay/RecordUnitInfo';

import RecordMapController from '../../Component/GamePlay/TendencyChart/RecordMapController';
import NextGameMarkerRoot from '../../Component/GamePlay/TendencyChart/NextGameMarkerRoot';

@ccclass
export default class RoadsRootLayer extends cc.Component {

    @property(RecordMapController)
    m_mainRoad1Controller: RecordMapController = null;
    
    @property(RecordMapController)
    m_mainRoad2Controller: RecordMapController = null;

    @property(RecordMapController)
    m_viceRoadControllers: RecordMapController[] = [];

    @property(NextGameMarkerRoot)
    m_markerRoot: NextGameMarkerRoot = null;

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

        let records: RecordUnitInfo[] = this.m_mainRoad1Controller.getRecordUnitInfos();

        this.m_markerRoot.updateNextGameMarker(records);
    }

    addRed() {
        this.addRecord(EmRecordType.Type_Red);
    }

    addBlack() {
        this.addRecord(EmRecordType.Type_Black);
    }

}