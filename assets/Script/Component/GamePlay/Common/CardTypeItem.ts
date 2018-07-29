const { ccclass, property } = cc._decorator;

import { EmGroupType, GroupTypeInfo, Normal_Type_Max_Value } from '../../../Define/GamePlayDefine';
import { getGroupTypeStrFunc } from '../../../Utils/GamePlay/CardUtils';

@ccclass
export default class CardTypeItem extends cc.Component {

    @property(cc.Sprite)
    m_bgSprite: cc.Sprite = null;

    @property(cc.Label)
    m_cardTypeLabel: cc.Label = null;

    @property(cc.SpriteFrame)
    m_bgs: cc.SpriteFrame[] = [];

    unuse() {
        this._resetView();
    }

    updateView(typeInfo: GroupTypeInfo) {
        this.m_cardTypeLabel.string = getGroupTypeStrFunc(typeInfo);

        let idx = this._getFrameIdx(this._judgeSpecialType(typeInfo));
        this.m_bgSprite.spriteFrame = this.m_bgs[idx];
    }

    private _judgeSpecialType(typeInfo: GroupTypeInfo) {
        let isSpecial: boolean = false;
        if (typeInfo.type > EmGroupType.GroupType_None && typeInfo.type < EmGroupType.GroupType_Max) {
            if (typeInfo.type == EmGroupType.GroupType_Pair) {
                if (typeInfo.value > Normal_Type_Max_Value) {
                    isSpecial = true;
                }
            }
            else {
                isSpecial = true;
            }
        }

        return isSpecial;
    }

    private _getFrameIdx(isSpecialType: boolean): number {
        return isSpecialType ? 1 : 0;
    }

    private _resetView() {
        this.m_cardTypeLabel.string = '';
        this.m_bgSprite.spriteFrame = null;
    }
}
