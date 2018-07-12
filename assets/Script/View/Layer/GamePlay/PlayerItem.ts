const { ccclass, property } = cc._decorator;

import StringUtils from '../../../Utils/StringUtils';

@ccclass
export default class PlayerItem extends cc.Component {

    @property(cc.Layout)
    m_rootLayout: cc.Layout = null;
    @property(cc.Layout)
    m_captainRootLayout: cc.Layout = null;
    @property(cc.Widget)
    m_captainWidget: cc.Widget = null;
    @property(cc.Node)
    m_coinBgNode: cc.Node = null;

    @property(cc.Node)
    m_captainRootNode: cc.Node = null;
    @property(cc.Node)
    m_resultRootNode: cc.Node = null;

    @property(cc.Sprite)
    m_headIcon: cc.Sprite = null;
    @property(cc.Label)
    m_coinLabel: cc.Label = null;

    @property(cc.Sprite)
    m_captainSp: cc.Sprite = null;
    @property(cc.Label)
    m_captainLabel: cc.Label = null;

    @property(cc.Label)
    m_resultLabel: cc.Label = null;

    @property(cc.SpriteFrame)
    m_captainSprFramms: cc.SpriteFrame[] = [];

    @property
    m_isLeft: boolean = true;

    @property 
    m_initCptWgtHrztCtr: number = 88;
    @property 
    m_initCptLayoutPstX: number = -10;

    onLoad() {

    }

    updateLeftRight(isLeft: boolean) {
        this.m_isLeft = isLeft;
        
        this._updateLeftRight(isLeft);
    }

    updateHeadIcon(frame: cc.SpriteFrame) {
        this.m_headIcon.spriteFrame = frame;
    }

    setCoin(num: number) {
        this.m_coinLabel.string = num.toString();
    }

    setCaptain(isRed: boolean) {
        this.m_captainRootNode.active = true;

        let strKey: string = isRed ? 'game_play_red_cap' : 'game_play_black_cap';
        this.m_captainLabel.string = StringUtils.getInstance().formatByKey(strKey);

        let frameIdx: number = isRed ? 0 : 1;
        this.m_captainSp.spriteFrame = this.m_captainSprFramms[frameIdx];
    }

    hideCaptain() {
        this.m_captainRootNode.active = false;
    }

    setResult(num: number) {
        this.m_resultRootNode.active = true;
        this.m_resultLabel.string = num.toString();
    }

    hideResult() {
        this.m_resultRootNode.active = false;
    }

    resetView() {
        this.hideCaptain();
        this.hideResult();
        this._updateLeftRight(this.m_isLeft);
    }

    private _updateLeftRight(isLeft: boolean) {
        this.m_rootLayout.horizontalDirection = isLeft ? cc.Layout.HorizontalDirection.LEFT_TO_RIGHT : cc.Layout.HorizontalDirection.RIGHT_TO_LEFT;
        this.m_captainRootLayout.horizontalDirection = isLeft ? cc.Layout.HorizontalDirection.LEFT_TO_RIGHT : cc.Layout.HorizontalDirection.RIGHT_TO_LEFT;

        this.m_captainRootLayout.node.x = isLeft ? this.m_initCptLayoutPstX : -1 * this.m_initCptLayoutPstX;

        this.scheduleOnce(() => {
            this.m_rootLayout.updateLayout();
            this.m_captainRootLayout.updateLayout();
        });

        this.m_coinBgNode.scaleX = isLeft ? 1 : -1;

        this.m_captainWidget.horizontalCenter = isLeft ? this.m_initCptWgtHrztCtr : -1 * this.m_initCptWgtHrztCtr;
    }
}