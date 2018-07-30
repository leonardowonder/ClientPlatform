const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import { EmGroupType, GroupTypeInfo } from '../../../Define/GamePlayDefine';
import ClientEventDefine from '../../../Define/ClientEventDefine';

import { addNewNodeFunc } from '../../../Utils/NodePoolUtils';
import { goldenTypeToGroupType } from '../../../Utils/GamePlay/GameUtils';

import CardTypeItem from './CardTypeItem';

import GameRecordData from '../../../Data/GamePlay/GameRecordData';
import RoomData, { TypeRecordInfo } from '../../../Data/GamePlay/RoomData';

import { EmRecordType } from '../../../Define/GamePlayDefine';

import GameRecordDataManager from '../../../Manager/DataManager/GamePlayDataManger/GameRecordDataManager';
import RoomDataManger from '../../../Manager/DataManager/GamePlayDataManger/RoomDataManger';

@ccclass
export default class CardTypeItemList extends cc.Component {

    @property(cc.Prefab)
    m_itemPrefab: cc.Prefab = null;

    @property(cc.Node)
    m_parentNode: cc.Node = null;

    @property
    m_maxItemCount: number = 0;

    _nodePool: cc.NodePool = null;

    m_cardTypeItemList: CardTypeItem[] = [];

    _recordLoaded: boolean = false;

    private _registEvents() {
        this._unregistEvents();
        cc.systemEvent.on(ClientEventDefine.CUSTOM_EVENT_NEW_WIN_TYPE_ADDED, this.onNewRecordAdded, this);
    }

    private _unregistEvents() {
        cc.systemEvent.targetOff(this);
    }

    onLoad() {
        this._registEvents();

        this._nodePool = new cc.NodePool(CardTypeItem);

        this.scheduleOnce(() => {
            this.updateRecords();
        })
    }

    onDestroy() {
        this._unregistEvents();
    }

    updateRecords() {
        if (this._recordLoaded) {
            return;
        }

        let roomData: RoomData = RoomDataManger.getInstance().getRoomData();

        let records: TypeRecordInfo[] = roomData.vTypeRecord;
        let typeInfos: GroupTypeInfo[] = [];
        _.forEach(records, (record: TypeRecordInfo) => {
            let groupType: EmGroupType = goldenTypeToGroupType(record.T);
            let groupTypeInfo: GroupTypeInfo = new GroupTypeInfo(groupType, record.V);

            typeInfos.push(groupTypeInfo);
        });

        _.forEach(typeInfos, (type: GroupTypeInfo) => {
            this.addGroupType(type);
        });

        this._recordLoaded = true;
    }

    onNewRecordAdded(event: cc.Event.EventCustom) {
        let groupType: GroupTypeInfo = event.detail;

        this.addGroupType(groupType);
    }

    addGroupType(typeInfo: GroupTypeInfo) {
        let node: cc.Node = addNewNodeFunc(this.m_parentNode, this.m_itemPrefab, this._nodePool);
        let comp: CardTypeItem = node.getComponent(CardTypeItem);

        if (!comp) {
            cc.warn(`CardTypeItemList addGroupType CardTypeItem comp null`);
            return;
        }

        comp.updateView(typeInfo);

        this.m_cardTypeItemList.push(comp);

        if (this.m_cardTypeItemList.length > this.m_maxItemCount) {
            let comp: CardTypeItem = this.m_cardTypeItemList.shift();

            this._nodePool.put(comp.node);
        }
    }
}
