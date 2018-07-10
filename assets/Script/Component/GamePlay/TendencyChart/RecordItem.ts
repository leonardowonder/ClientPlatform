const { ccclass, property } = cc._decorator;

import RecordUnit from './RecordUnit';
import { EmRecordType } from '../../../Define/GamePlayDefine';

@ccclass
export default class RecordItem extends cc.Component {

    @property(cc.Prefab)
    m_recordUnitPrefab: cc.Prefab = null;

    private m_recordUnit: RecordUnit = null;

    onLoad() {
        this._init();
    }

    isAvailable(): boolean {
        let ret: boolean = true;

        ret = this.m_recordUnit && this.m_recordUnit.isAvailable();

        return ret;
    }

    updateRecordUnit(type: EmRecordType): boolean {
        let ret = false;

        if (this.m_recordUnit) {
            if (type == EmRecordType.Type_None || this.m_recordUnit.isAvailable()) {
                this.m_recordUnit.updateViewByType(type);
            }

            ret = true;
        }

        return ret;
    }

    resetData() {
        this.m_recordUnit && this.m_recordUnit.resetData();
    }

    private _init() {
        this._initView();
    }

    private _initView() {
        let unitPrefab: cc.Node = cc.instantiate(this.m_recordUnitPrefab);
        unitPrefab.setPosition(0, 0);

        this.m_recordUnit = unitPrefab.getComponent(RecordUnit);

        this.node.addChild(unitPrefab);
    }
}
