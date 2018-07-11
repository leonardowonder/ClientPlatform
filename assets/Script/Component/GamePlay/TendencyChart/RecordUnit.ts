const { ccclass, property } = cc._decorator;

import { EmRecordType } from '../../../Define/GamePlayDefine';

@ccclass
export default class RecordUnit extends cc.Component {
    @property(cc.Sprite)
    m_sprite: cc.Sprite = null;

    @property(cc.SpriteFrame)
    m_frames: cc.SpriteFrame[] = [];

    private _type: EmRecordType = EmRecordType.Type_None;

    unuse() {
        this.resetData();
    }

    onLoad() {
        this.resetData();
    }

    getType(): EmRecordType {
        return this._type;
    }

    isAvailable() {
        return this._type == EmRecordType.Type_None;
    }

    resetData() {
        this._type = EmRecordType.Type_None;
        this.m_sprite.spriteFrame = null;
    }

    updateViewByType(type: EmRecordType) {
        this._type = type;

        //update at next frame, item will not move from center to top
        this.scheduleOnce(() => {
            if (this._type == EmRecordType.Type_None) {
                this.m_sprite.spriteFrame = null;
            }
            else {
                let framIdx = this._type == EmRecordType.Type_Red ? 0 : 1;
                this.m_sprite.spriteFrame = this.m_frames[framIdx];
            }
        })
    }
}