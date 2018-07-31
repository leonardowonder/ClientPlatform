const { ccclass, property } = cc._decorator;

import { GroupTypeInfo } from '../../../Define/GamePlayDefine';
import { getGroupTypeStrFunc } from '../../../Utils/GamePlay/CardUtils';
import { judgeSpecialType } from '../../../Utils/GamePlay/GameUtils';

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

        let idx = this._getFrameIdx(judgeSpecialType(typeInfo));
        this.m_bgSprite.spriteFrame = this.m_bgs[idx];
    }

    private _getFrameIdx(isSpecialType: boolean): number {
        return isSpecialType ? 1 : 0;
    }

    private _resetView() {
        this.m_cardTypeLabel.string = '';
        this.m_bgSprite.spriteFrame = null;
    }
}
