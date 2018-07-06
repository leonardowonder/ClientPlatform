const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import { EmRecordType, Max_Record_Count } from '../../Define/GamePlayDefine';
import RecordUnitInfo from '../../Data/GamePlay/RecordUnitInfo';

import MapRoot from './MapRoot';
import RecordRoot from './RecordRoot';

@ccclass
export default class RecordMapController extends cc.Component {
    @property(MapRoot)
    m_mapRoot: MapRoot = null;

    @property(RecordRoot)
    m_recordRoot: RecordRoot = null;

    @property
    recordGroupCountInOneMapItem: number = 1;

    private m_recordUnitInfos: RecordUnitInfo[] = [];

    addRed() {
        this.addRecord(EmRecordType.Type_Red);
    }

    addBlack() {
        this.addRecord(EmRecordType.Type_Black);
    }

    addRecord(type: EmRecordType) {
        this.m_recordRoot.addRecord(type);

        let info: RecordUnitInfo = _.cloneDeep(this.m_recordRoot.getLatestRecordUnitInfo());
        this.m_recordUnitInfos.push(info);

        if (this._checkNeedRemoveFirstRecord()) {
            this._doRemoveFirstRecord();
        }

        if (this._needAddMap()) {
            this.m_mapRoot.addNewItem();
        }
    }

    private _needAddMap(): boolean {
        let recordItemGroupCount: number = this.m_recordRoot.getRecordItemGroupCount();
        let mapItemCount: number = this.m_mapRoot.getMapItemCount();

        let needAdd: boolean = recordItemGroupCount > mapItemCount * this.recordGroupCountInOneMapItem;

        return needAdd;
    }

    private _checkNeedRemoveFirstRecord(): boolean {
        return this.m_recordUnitInfos.length > Max_Record_Count;
    }

    private _doRemoveFirstRecord() {
        let firstInfo: RecordUnitInfo = this.m_recordUnitInfos.shift();

        this.m_recordRoot.resetTargetItem(firstInfo.m_recordItemGroupIdx, firstInfo.m_recordUnitIdx);

        let firstGroup = this.m_recordRoot.getFirstRecordItemGroup();
        if (firstGroup && firstGroup.isEmpty()) {
            let result = this.m_recordRoot.removeFirstRecordItemGroup();
            if (result) {
                this.m_recordUnitInfos.forEach((unitInfo: RecordUnitInfo) => {
                    unitInfo && unitInfo.decreaseGroupIdx();
                })

                let latestInfo: RecordUnitInfo = this.m_recordRoot.getLatestRecordUnitInfo();
                if (!latestInfo) {
                    cc.warn('RecordMapController _doRemoveFirstRecord latestInfo null');
                }
                else {
                    latestInfo.decreaseGroupIdx();
                }

                this.m_recordRoot.decreaseRedBlackIdx();
            }
        }
    }
}
