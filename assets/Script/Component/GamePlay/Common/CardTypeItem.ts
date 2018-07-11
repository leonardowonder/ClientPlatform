const { ccclass, property } = cc._decorator;

import { EmGroupType } from '../../../Define/GamePlayDefine';
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

    updateView(type: EmGroupType) {
        this.m_cardTypeLabel.string = getGroupTypeStrFunc(type);

        let idx = this._getFrameIdx(type != EmGroupType.GroupType_None);
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
