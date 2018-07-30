const { ccclass, property } = cc._decorator;

import StringUtils from '../../../Utils/StringUtils';
import GamePlayerData from '../../../Data/GamePlay/GamePlayerData';
import GamePlayerDataManager from '../../../Manager/DataManager/GamePlayDataManger/GamePlayerDataManager';
import PlayerDataManager from '../../../Manager/DataManager/PlayerDataManager';

import UserData from '../../../Data/UserData';

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
    @property(cc.Node)
    m_headRootNode: cc.Node = null;

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

    m_localChairID: number = -1;
    m_serverChairID: number = -1;

    onLoad() {

    }

    hide() {
        this.node.active = false;
    }

    setLocalChairID(localID: number) {
        this.m_localChairID = localID;
    }

    setServerChairID(serverID: number) {
        this.m_serverChairID = serverID;
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

    refreshView() {
        this.resetView();
        
        if (this.m_serverChairID == -1) {
            return;
        }

        let playerData: GamePlayerData = GamePlayerDataManager.getInstance().getPlayerDataByServerIdx(this.m_serverChairID);

        if (playerData == null) {
            cc.warn('PlayerItem refreshView playerData = null');
            this.node.active = false;
            return;
        }

        this.node.active = playerData.uid != 0;

        if (playerData.uid != 0) {
            let player = PlayerDataManager.getInstance().getPlayerData(playerData.uid);
            if (player) {
                this.setHead(player.headIcon);
            }

            this.setCoin(playerData.chips);
        }
    }

    refreshViewBySelfData() {
        let player = UserData.getInstance().getUserData();
        
        if (player) {
            this.node.active = player.uid != 0;

            this.setHead(player.headIcon);
            this.setCoin(player.coin);
        }
    }

    setHead(headUrl) {
        if (headUrl && headUrl.length && headUrl != 'undefine') {
            if (cc.sys.isNative) {
                // NativeWXHeadDonload.donloadHead(headUrl, this._ddzPlayerData.uid.toString() + ".png", (event) => {
                //     cc.loader.load(event, function (err, texture) {
                //         if (!err) {
                //             this.m_pHeadSprite.spriteFrame = new cc.SpriteFrame(texture);
                //             this.m_pHeadSprite.node.setContentSize(cc.size(96,96));
                //         } else {
                //             this.m_pHeadSprite.spriteFrame = null;
                //         }
                //     }.bind(this));
                // });
            } else {
                cc.loader.load({ url: headUrl, type: 'png' }, (err, texture) => {
                    if (!err) {
                        this.m_headIcon.spriteFrame = new cc.SpriteFrame(texture);
                        this.m_headIcon.node.setContentSize(cc.size(96, 96));
                    } else {
                        this.m_headIcon.spriteFrame = null;
                    }
                });
            }
        } else {
            // var realUrl = cc.url.raw("resources/NewDDZ/image/room_default_none.png");
            // var texture = cc.textureCache.addImage(realUrl, null, null);
            // this.m_headSprite.spriteFrame = new cc.SpriteFrame(texture);
            // this.m_headSprite.node.setContentSize(cc.size(96, 96));
        }
    }

    resetView() {
        this.hideCaptain();
        this.hideResult();
        this._updateLeftRight(this.m_isLeft);
    }

    getHeadWorldPos(): cc.Vec2 {
        let worldPos: cc.Vec2 = this.node.convertToWorldSpaceAR(this.m_headRootNode.getPosition());

        return worldPos;
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