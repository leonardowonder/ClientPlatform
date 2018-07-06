const { ccclass, property } = cc._decorator;

import { EmRecordType } from '../../Define/GamePlayDefine';

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

    addRed() {
        this.addRecord(EmRecordType.Type_Red);
    }

    addBlack() {
        this.addRecord(EmRecordType.Type_Black);
    }

    addRecord(type: EmRecordType) {
        this.m_recordRoot.addRecord(type);

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
}
