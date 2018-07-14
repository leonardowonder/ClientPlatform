const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import { EmChipType } from '../../../Define/GamePlayDefine';

@ccclass
export default class ChipSelectLayer extends cc.Component {
    @property(cc.Toggle)
    m_chipToggles: cc.Toggle[] = [];

    private _curChipType: EmChipType = EmChipType.Type_None;

    onLoad() {
        this.reset();
    }

    getCurChipType(): EmChipType {
        return this._curChipType;
    }

    reset() {
        let toggle: cc.Toggle = _.first(this.m_chipToggles);

        toggle.check();
    }

    unselectAll() {
        _.forEach(this.m_chipToggles, (toggle: cc.Toggle) => {
            toggle.uncheck();
        })
    }

    onChipSelect(toggle: cc.Toggle, customEvent: string) {
        let type: EmChipType = parseInt(customEvent, 10);

        this._curChipType = type;
    }
}
