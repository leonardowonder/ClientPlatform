const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import { EmRecordType, Max_Record_Count } from '../../../Define/GamePlayDefine';
import RecordUnitInfo from '../../../Data/GamePlay/RecordUnitInfo';

import MapRoot from './MapRoot';
import RecordRoot from './RecordRoot';
import RecordItemGroup from './RecordItemGroup';
import NextGameMarkerRoot from './NextGameMarkerRoot';

@ccclass
export default class RecordMapController extends cc.Component {
    @property(MapRoot)
    m_mapRoot: MapRoot = null;

    @property(RecordRoot)
    m_recordRoot: RecordRoot = null;
    
    @property(NextGameMarkerRoot)
    m_markerRoot: NextGameMarkerRoot = null;

    @property
    recordGroupCountInOneMapItem: number = 1;

    @property
    mapItemCountMin: number = 12;

    private m_recordUnitInfos: RecordUnitInfo[] = [];

    addRedMustSame() {
        this.addRecord(EmRecordType.Type_Red);
    }

    addBlackMustSame() {
        this.addRecord(EmRecordType.Type_Black);
    }

    addRedNeedNotSame() {
        this.addRecord(EmRecordType.Type_Red, false);
    }

    addBlackNeedNotSame() {
        this.addRecord(EmRecordType.Type_Black, false);
    }

    addRecord(type: EmRecordType, mustSameType: boolean = true) {
        this.m_recordRoot.addRecord(type, mustSameType);

        let info: RecordUnitInfo = _.cloneDeep(this.m_recordRoot.getLatestRecordUnitInfo());
        this.m_recordUnitInfos.push(info);

        if (this._checkNeedRemoveFirstRecord()) {
            let groupIdx: number = this._doRemoveFirstRecord();

            if (this._hasGroupToRemove(groupIdx)) {
                this._doRemoveGroups(groupIdx);
            }
        }

        while (this._needRemoveMap()) {
            this.m_mapRoot.removeLastItem();
        }

        if (this._needAddMap()) {
            this.m_mapRoot.addNewItem();
        }

        // this.m_markerRoot.updateNextGameMarker(this.m_recordUnitInfos);
    }

    private _needRemoveMap(): boolean {
        let recordItemGroupCount: number = this.m_recordRoot.getRecordItemGroupCount();
        let mapItemCount: number = this.m_mapRoot.getMapItemCount();

        let needRemove: boolean = recordItemGroupCount < mapItemCount * this.recordGroupCountInOneMapItem;

        needRemove = needRemove && mapItemCount > this.mapItemCountMin;

        return needRemove;
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

    private _doRemoveFirstRecord(): number {
        let targetInfo: RecordUnitInfo = this.m_recordUnitInfos.shift();

        let targetGroupIdx: number = targetInfo.getRecordItemGroupIdx();
        this.m_recordRoot.resetTargetItem(targetInfo.getRecordItemGroupIdx(), targetInfo.getRecordUnitRowIdx());

        return targetGroupIdx;
    }

    private _hasGroupToRemove(idx: number): boolean {
        let ret = false;

        let targetGroup = this.m_recordRoot.getRecordItemGroup(idx);
        //only if group is empty, remove it by in some conditions
        if (targetGroup && targetGroup.isEmpty()) {
            //if targetGroup is first group, remove first empty group; if targetGroup is last group, remove last empty groups;
            if (idx == 0 || idx >= this.m_recordRoot.getRecordItemGroupCount() - 1) {
                ret = true;
            }
        }

        return ret;
    }

    private _doRemoveGroups(idx: number) {
        let itemGroups: RecordItemGroup[] = this.m_recordRoot.getAllRecordItemGroups();
        if (itemGroups && itemGroups.length > 0) {
            if (idx == 0) {
                let result = this.m_recordRoot.removeFirstRecordItemGroup();
                if (result) {
                    this.m_recordUnitInfos.forEach((unitInfo: RecordUnitInfo) => {
                        unitInfo && unitInfo.decreaseGroupIdx();
                    })

                    let latestInfo: RecordUnitInfo = this.m_recordRoot.getLatestRecordUnitInfo();
                    if (!latestInfo) {
                        cc.warn('RecordMapController _doRemoveGroups latestInfo null');
                    }
                    else {
                        latestInfo.decreaseGroupIdx();
                    }

                    this.m_recordRoot.decreaseRedBlackIdx();
                }
            }
            else {
                let lastGroup = _.last(itemGroups);

                while (lastGroup && lastGroup.isEmpty()) {
                    this.m_recordRoot.removeLastRecordItemGroup();
                    lastGroup = _.last(itemGroups);
                }
            }
        }
        else {
            cc.warn('RecordMapController _doRemoveGroups pre judge _hasGroupToRemove error');
        }
    }
}
