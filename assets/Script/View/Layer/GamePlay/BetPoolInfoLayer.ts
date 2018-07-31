const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import { EmBetAreaType } from '../../../Define/GamePlayDefine';

@ccclass
export default class BetPoolInfoLayer extends cc.Component {

    @property(cc.Label)
    m_poolChipLabels: cc.Label[] = [];

    private m_poolChips: number[] = [0, 0, 0];

    reset() {
        this.setPoolInfos([0, 0, 0]);
    }

    setPoolInfos(chips: number[]) {
        this.m_poolChips = chips;

        this._refreshAllLabels();
    }

    addPoolChip(chip: number, type: EmBetAreaType) {
        if (!this._checkTypeValid(type)) {
            cc.warn(`BetPoolInfoLayer addPoolChip invalid type =${type}`);
            return;
        }

        let idx: number = this._getIdx(type);

        this.m_poolChips[idx] += chip;
        this.m_poolChipLabels[idx].string = this.m_poolChips[idx].toString();
    }

    private _refreshAllLabels() {
        _.forEach(this.m_poolChipLabels, (label: cc.Label, idx: number) => {
            label.string = this.m_poolChips[idx].toString();
        })
    }

    private _checkTypeValid(type: EmBetAreaType): boolean {
        return type > EmBetAreaType.Type_None && type < EmBetAreaType.Type_Max;
    }

    private _getIdx(type: EmBetAreaType): number {
        let ret: number = 0;
        switch (type) {
            case EmBetAreaType.Type_Red: {
                ret = 0;
                break;
            }
            case EmBetAreaType.Type_Black: {
                ret = 1;
                break;
            }
            case EmBetAreaType.Type_Special: {
                ret = 2;
                break;
            }
            default: {
                break;
            }
        }

        return ret;
    }
}