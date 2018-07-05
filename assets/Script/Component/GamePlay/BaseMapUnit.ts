const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import RecordUnit from './RecordUnit';
import { EmRecordType } from '../../Define/GamePlayDefine';

@ccclass
export default class BaseMapUnit extends cc.Component {

    @property(cc.Prefab)
    m_unitPrefab: cc.Prefab = null;

    @property(cc.Node)
    m_parentNode: cc.Node = null;

    private m_recordUnitNodes: cc.Node[] = [];

    private _rowCount: number = 0;

    onLoad() {
        this._initView();
    }

    isFull(): boolean {
        let ret: boolean = true;

        ret = _.every(this.m_recordUnitNodes, (node: cc.Node) => {
            let ret = false;

            if (node != null) {
                let comp: RecordUnit = node.getComponent(RecordUnit);
                ret = comp && !comp.isAvailable();
            }

            return ret;
        });

        return ret;
    }

    pushRecord(type: EmRecordType): boolean {
        let ret = false;

        for (let row = 0; row < this._rowCount; row++) {
            let node: cc.Node = this._getRecordUnitNode(row);
            let comp: RecordUnit = node.getComponent(RecordUnit);

            if (comp && comp.isAvailable()) {
                comp.updateSprite(type);

                ret = true;
                break;
            }
        }

        return ret;
    }

    updateRecordUnit(type: EmRecordType, row: number) {
        if (!this._checkParaValid(row)) {
            cc.warn(`BaseMapUnit addRecordUnit para invalid row = ${row}, maxRow = ${this._rowCount}`);
            return;
        }

        let node: cc.Node = this._getRecordUnitNode(row);
        let comp: RecordUnit = node.getComponent(RecordUnit);

        comp && comp.updateSprite(type);
    }

    private _initView() {
        this._updateCounts();
        this._initData();
    }

    private _updateCounts() {
        if (this.m_unitPrefab && this.m_unitPrefab.data) {
            this._rowCount = Math.floor(this.node.height / this.m_unitPrefab.data.height);
        }
    }

    private _initData() {
        for (let row = 0; row < this._rowCount; row++) {
            let unitPrefab: cc.Node = cc.instantiate(this.m_unitPrefab);
            this.m_recordUnitNodes.push(unitPrefab);
        }
    }

    private _checkParaValid(row: number) {
        return row < this._rowCount;
    }

    // private _isAvalable(row: number): boolean {
    //     let ret: boolean = false;

    //     if (this.m_recordUnitNodes[row] == null) {
    //         ret = true;
    //     }
    //     else {
    //         let comp: RecordUnit = this.m_recordUnitNodes[row].getComponent(RecordUnit);
    //         ret = comp && comp.isAvailable();
    //     }

    //     return ret;
    // }

    private _getRecordUnitNode(row: number): cc.Node {
        return this.m_recordUnitNodes[row];
    }
}
