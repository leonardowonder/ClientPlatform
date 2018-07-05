const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import BaseMapColUnit from './BaseMapColUnit';

@ccclass
export default class BaseMapColUnitParent extends cc.Component {
    @property(BaseMapColUnit)
    m_mapColUnits: BaseMapColUnit[] = [];

    getColUnits(): BaseMapColUnit[] {
        return this.m_mapColUnits;
    }

    isEmpty(): boolean {
        let ret: boolean = _.every(this.m_mapColUnits, (unit: BaseMapColUnit) => {
            return unit && unit.isEmpty();
        })

        return ret;
    }
}
