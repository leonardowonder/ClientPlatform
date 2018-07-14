const { ccclass, property } = cc._decorator;

import { EmChipType } from '../../../Define/GamePlayDefine';

@ccclass
export default class Chip extends cc.Component {

    @property(cc.Sprite)
    m_bg: cc.Sprite = null;

    @property(cc.Label)
    m_numLabel: cc.Label = null;

    @property(cc.SpriteFrame)
    m_bgFrames: cc.SpriteFrame[] = [];

    private _type: EmChipType = EmChipType.Type_Ten;

    onLoad() {
        this._updateView();
    }

    unuse() {
        this.setType(EmChipType.Type_Ten);
    }

    setType(type: EmChipType) {
        this._type = type;

        this._updateView();
    }

    private _updateView() {
        let idx: number = this._getFrameIdx(this._type);
        this.m_bg.spriteFrame = this.m_bgFrames[idx];

        let str: string = this._getStr(this._type);
        this.m_numLabel.string = str;
    }

    private _getFrameIdx(type: EmChipType): number {
        let idx: number = 0;

        switch(type) {
            case EmChipType.Type_Ten: {
                idx = 0;
                break;
            }
            case EmChipType.Type_Hundred: {
                idx = 1;
                break;
            }
            case EmChipType.Type_Thousand: {
                idx = 2;
                break;
            }
            case EmChipType.Type_TenTh: {
                idx = 3;
                break;
            }
            default: {
                cc.warn(`Chip _getFrameIdx invalid type = ${type}`);
                break;
            }
        }

        return idx;
    }

    private _getStr(type: EmChipType): string {
        let str: string = '10';

        switch(type) {
            case EmChipType.Type_Ten: {
                break;
            }
            case EmChipType.Type_Hundred: {
                str = '100';
                break;
            }
            case EmChipType.Type_Thousand: {
                str = '1千';
                break;
            }
            case EmChipType.Type_TenTh: {
                str = '1万';
                break;
            }
            default: {
                cc.warn(`Chip _getFrameIdx invalid type = ${type}`);
                break;
            }
        }

        return str;
    }
}
