const { ccclass, property } = cc._decorator;

import GamePlayerData from '../../../Data/GamePlay/GamePlayerData';

import GameRoomLogic from '../../../Logic/GamePlay/GameRoomLogic';

import GamePlayerDataManager from '../../../Manager/DataManager/GamePlayDataManger/GamePlayerDataManager';
import PlayerDataManager from '../../../Manager/DataManager/PlayerDataManager';
import RoomDataManger from '../../../Manager/DataManager/GamePlayDataManger/RoomDataManger';

import UserData from '../../../Data/UserData';
import RoomData from '../../../Data/GamePlay/RoomData';

@ccclass
export default class PlayerItem extends cc.Component {

    @property(cc.Layout)
    m_rootLayout: cc.Layout = null;

    @property(cc.Node)
    m_coinBgNode: cc.Node = null;

    @property(cc.Node)
    m_resultRootNode: cc.Node = null;

    @property(cc.Node)
    m_seatNode: cc.Node = null;
    @property(cc.Node)
    m_headRootNode: cc.Node = null;

    @property(cc.Sprite)
    m_headIcon: cc.Sprite = null;
    @property(cc.Label)
    m_coinLabel: cc.Label = null;

    @property(cc.Label)
    m_resultLabel: cc.Label = null;

    @property
    m_isLeft: boolean = true;

    m_localChairID: number = -1;
    m_serverChairID: number = -1;

    onLoad() {

    }

    onSitClick() {
        GameRoomLogic.getInstance().requestSitDown(this.m_serverChairID);
    }

    showSeat() {
        this.m_seatNode.active = true;
    }

    hideSeat() {
        this.m_seatNode.active = false;
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

    setResult(num: number) {
        this.m_resultRootNode.active = true;
        let str: string = '+';
        if (num < 0) {
            str = '-';
        }

        str += num.toString();
        this.m_resultLabel.string = str;
    }

    hideResult() {
        this.m_resultRootNode.active = false;
    }

    refreshViewByServerIdx() {
        this._resetView();

        if (this.m_serverChairID == -1) {
            return;
        }

        let playerData: GamePlayerData = GamePlayerDataManager.getInstance().getPlayerDataByServerIdx(this.m_serverChairID);

        if (!playerData.isValid()) {
            this.showSeat();
            return;
        }
        else {
            this.hideSeat();
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
        this.hideSeat();
        let player = UserData.getInstance().getUserData();

        if (player) {
            this.node.active = player.uid != 0;

            this.setHead(player.headIcon);
            this.setCoin(player.coin);
        }
    }

    refreshViewByMaxCoinInfo() {
        this._resetView();

        if (this.m_serverChairID != -1) {
            cc.warn(`PlayerItem refreshViewByMaxCoinInfo invalid chairID = ${this.m_serverChairID}`);
            return;
        }

        let roomInfo: RoomData = RoomDataManger.getInstance().getRoomData();

        let playerData = PlayerDataManager.getInstance().getPlayerData(roomInfo.richestUID);
        if (playerData) {
            this.setHead(playerData.headIcon);
        }

        this.setCoin(roomInfo.richestCoin);
    }

    refreshViewByMaxWinRateInfo() {
        this._resetView();

        if (this.m_serverChairID != -1) {
            cc.warn(`PlayerItem refreshViewByMaxWinRateInfo invalid chairID = ${this.m_serverChairID}`);
            return;
        }

        let roomInfo: RoomData = RoomDataManger.getInstance().getRoomData();

        let playerData = PlayerDataManager.getInstance().getPlayerData(roomInfo.bestBetUID);
        if (playerData) {
            this.setHead(playerData.headIcon);
        }

        this.setCoin(roomInfo.bestBetCoin);
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

    getHeadWorldPos(): cc.Vec2 {
        let worldPos: cc.Vec2 = this.node.convertToWorldSpaceAR(this.m_headRootNode.getPosition());

        return worldPos;
    }

    private _resetView() {
        this.hideResult();

        if (this.m_serverChairID == -1) {
            this.hideSeat();
        }
        else {
            this.showSeat();
        }

        this._updateLeftRight(this.m_isLeft);
    }

    private _updateLeftRight(isLeft: boolean) {
        this.m_rootLayout.horizontalDirection = isLeft ? cc.Layout.HorizontalDirection.LEFT_TO_RIGHT : cc.Layout.HorizontalDirection.RIGHT_TO_LEFT;

        this.scheduleOnce(() => {
            this.m_rootLayout.updateLayout();
        });

        this.m_coinBgNode.scaleX = isLeft ? 1 : -1;
    }
}