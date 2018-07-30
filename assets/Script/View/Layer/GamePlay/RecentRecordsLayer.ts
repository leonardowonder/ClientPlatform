const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import { EmRecordType, eBetPool } from '../../../Define/GamePlayDefine';
import ClientEventDefine from '../../../Define/ClientEventDefine';

import { addNewNodeFunc } from '../../../Utils/NodePoolUtils';
import { betPoolToRecordType } from '../../../Utils/GamePlay/GameUtils';

import RoomData from '../../../Data/GamePlay/RoomData';

import RoomDataManger from '../../../Manager/DataManager/GamePlayDataManger/RoomDataManger';

import RecordUnit from '../../../Component/GamePlay/TendencyChart/RecordUnit';

@ccclass
export default class RecentRecordsLayer extends cc.Component {
    @property(cc.Prefab)
    m_recordUnitPrefab: cc.Prefab = null;

    @property(RecordUnit)
    m_recordUnitList: RecordUnit[] = [];

    @property
    m_maxRecordCount: number = 20;

    private _nodePool: cc.NodePool = null;

    _recordLoaded: boolean = false;

    private _registEvents() {
        this._unregistEvents();
        cc.systemEvent.on(ClientEventDefine.CUSTOM_EVENT_NEW_RECORD_ADDED, this.onNewRecordAdded, this);
    }

    private _unregistEvents() {
        cc.systemEvent.targetOff(this);
    }

    onLoad() {
        this._registEvents();

        this._nodePool = new cc.NodePool(RecordUnit);

        this.scheduleOnce(() => {
            this.updateRecords();
        });
    }

    onDestroy() {
        this._unregistEvents();
    }

    updateRecords() {
        if (this._recordLoaded) {
            return;
        }

        let roomData: RoomData = RoomDataManger.getInstance().getRoomData();

        let records: eBetPool[] = roomData.vWinRecord;
        let typeInfos: EmRecordType[] = [];
        _.forEach(records, (record: eBetPool) => {
            let recordType: EmRecordType = betPoolToRecordType(record);

            typeInfos.push(recordType);
        });

        _.forEach(typeInfos, (type: EmRecordType) => {
            this.addRecord(type);
        });

        this._recordLoaded = true;
    }

    addRecord(type: EmRecordType) {
        if (!this._checkTypeValid(type)) {
            cc.warn(`RecentRecordsLayer addRecord invalid type = ${type}`);
            return;
        }

        this._addNewNode();

        this._updateRecordUnitType(type);

        if (this._needRemoveFirstRecord()) {
            this._doRemoveFirstRecord();
        }
    }

    onNewRecordAdded(event: cc.Event.EventCustom) {
        let record: EmRecordType = event.detail;

        this.addRecord(record);
    }

    private _checkTypeValid(type: EmRecordType) {
        return type > EmRecordType.Type_None && type < EmRecordType.Type_Max;
    }

    private _addNewNode() {
        let node: cc.Node = addNewNodeFunc(this.node, this.m_recordUnitPrefab, this._nodePool);

        let comp: RecordUnit = node.getComponent(RecordUnit);

        this.m_recordUnitList.push(comp);
    }

    private _updateRecordUnitType(type: EmRecordType) {
        let unit: RecordUnit = _.last(this.m_recordUnitList);
        if (!unit) {
            cc.warn('RecentRecordsLayer _updateRecordUnitType last unit null');
            return;
        }

        unit.updateViewByType(type);
    }

    private _needRemoveFirstRecord(): boolean {
        return this.m_recordUnitList.length > this.m_maxRecordCount;
    }

    private _doRemoveFirstRecord() {
        let unit: RecordUnit = this.m_recordUnitList.shift();

        this._nodePool.put(unit.node);
    }
}