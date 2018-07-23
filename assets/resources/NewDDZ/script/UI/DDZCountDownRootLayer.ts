const { ccclass, property } = cc._decorator;

import PrefabManager, { EmPrefabEnum } from '../../../../Script/Manager/CommonManager/PrefabManager';

@ccclass
export default class DDZCountDownRootLayer extends cc.Component {
    @property(cc.Vec2)
    m_positions: cc.Vec2[] = [];

    showCountDown(time: number, clientIdx: number) {
        if (clientIdx < 0 || clientIdx >= this.m_positions.length) {
            cc.warn('DDZCountDownRootLayer showCountDown invalid clientIdx =', clientIdx);
            return;
        }

        let targetPos = this.m_positions[clientIdx];
        PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_DDZCountDown, [time, targetPos], this.node);
    }

    hideCountDown() {
        PrefabManager.getInstance().hidePrefab(EmPrefabEnum.Prefab_DDZCountDown, [], this.node);
    }
}