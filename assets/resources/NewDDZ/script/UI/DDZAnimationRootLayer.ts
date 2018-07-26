const { ccclass, property } = cc._decorator;

import { DDZAnimType } from '../Module/DDZGameDefine';

import PrefabManager, { EmPrefabEnum } from '../../../../Script/Manager/CommonManager/PrefabManager';

@ccclass
export default class DDZAnimationRootLayer extends cc.Component {
    @property(cc.Vec2)
    m_positions: cc.Vec2[] = [];

    @property(cc.Vec2)
    m_bombPositions: cc.Vec2[] = [];

    playSpecialEffect(effectType: DDZAnimType, clientIdx: number) {
        let prefabEnum: EmPrefabEnum = this._getPrefabEnum(effectType);

        let pos = this._isBomb(effectType) ? this.m_bombPositions[clientIdx] : this.m_positions[clientIdx];

        PrefabManager.showPrefab(prefabEnum, [pos], this.node);
    }

    private _isBomb(effectType: DDZAnimType): boolean {
        return effectType == DDZAnimType.Type_Bomb || effectType == DDZAnimType.Type_Rokect;
    }

    private _getPrefabEnum(effectType: DDZAnimType): EmPrefabEnum {
        let ret: EmPrefabEnum = EmPrefabEnum.Prefab_Max;
        switch (effectType) {
            case DDZAnimType.Type_Spring: {
                ret = EmPrefabEnum.Prefab_DDZEffectSpring;
                break;
            }
            case DDZAnimType.Type_PairSequence: {
                ret = EmPrefabEnum.Prefab_DDZEffectPairSequence;
                break;
            }
            case DDZAnimType.Type_SingleSequence: {
                ret = EmPrefabEnum.Prefab_DDZEffectSingleSequence;
                break;
            }
            case DDZAnimType.Type_Aircraft: {
                ret = EmPrefabEnum.Prefab_DDZEffectAircraft;
                break;
            }
            case DDZAnimType.Type_Bomb: {
                ret = EmPrefabEnum.Prefab_DDZEffectBomb;
                break;
            }
            case DDZAnimType.Type_Rokect: {
                ret = EmPrefabEnum.Prefab_DDZEffectRocket;
                break;
            }
        }

        return ret;
    }
}