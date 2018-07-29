const { ccclass, property } = cc._decorator;

import DDZGameDataLogic from '../Data/DDZGameDataLogic';
import { eRoomPeerState, eRoomState } from '../Define/DDZDefine';
import { EmDDZPlayerState } from '../Module/DDZGameDefine';
import HandCardLogic from '../Control/HandCardLogic';
import DDZPlayerDataManager from '../Data/DDZPlayerDataManager';
import PlayerDataManager from '../../../../Script/Manager/DataManager/PlayerDataManager';

import { DDZPlayerData } from '../Data/DDZPlayerDataManager';
import UserData from '../../../../Script/Data/UserData';

@ccclass
export default class DDZPlayerItem extends cc.Component {
    @property(cc.Sprite)
    m_headSprite: cc.Sprite = null;

    @property(cc.Node)
    m_landlordTag: cc.Node = null;
    @property(cc.Label)
    m_restCardNumLabel: cc.Label = null;

    @property(cc.Sprite)
    m_stateSprite: cc.Sprite = null;
    @property(cc.Label)
    m_nickName: cc.Label = null;
    @property(cc.Label)
    m_coinLabel: cc.Label = null;

    @property(cc.SpriteFrame)
    m_stateFrames: cc.SpriteFrame[] = [];

    @property(cc.Font)
    m_resultFonts: cc.Font[] = [];

    @property(cc.Label)
    m_resultLabel: cc.Label = null;

    @property
    m_localChairID: number = -1;
    @property
    m_serverChairID: number = -1;

    _ddzCardData: HandCardLogic = null;

    init() {
        this._ddzCardData = new HandCardLogic();
        this.reset();
        this.hide();
    }

    hide() {
        this.node.active = false;
    }

    clear() {
        this.reset();
        this.hide();
    }

    reset() {
        this._ddzCardData.clear();
        this.m_localChairID = -1;
        this.m_serverChairID = -1;
        this.m_landlordTag.active = false;
        this.m_stateSprite.spriteFrame = null;
        this.m_restCardNumLabel.string = '';

        this.setName('');
        this.setHead('');
        this.setCoin(0);
        this.clearResult();
    }

    refreshView() {
        if (this.m_serverChairID == -1) {
            cc.warn('DDZPlayerItem refreshView this.m_serverChairID = -1');
            return;
        }

        let ddzPlayerData: DDZPlayerData = DDZPlayerDataManager.getInstance().getPlayerDataByServerIdx(this.m_serverChairID);

        if (ddzPlayerData == null) {
            cc.warn('DDZPlayerItem refreshView ddzPlayerData = null');
            this.node.active = false;
            return;
        }

        this.node.active = ddzPlayerData.uid != 0;

        if (ddzPlayerData.uid != 0) {
            let player = PlayerDataManager.getInstance().getPlayerData(ddzPlayerData.uid);
            if (player) {
                this.setName(player.name);
                this.setHead(player.headIcon);
            }

            this.setCoin(ddzPlayerData.chips);

            this.setState(EmDDZPlayerState.State_None);
        }
    }

    refreshViewBySelfData() {
        let player = UserData.getInstance().getUserData();
        
        if (player) {
            this.node.active = player.uid != 0;

            this.setName(player.name);
            this.setHead(player.headIcon);
        }

        this.setIsBanker(false);
        this.clearResult();
        this.setState(EmDDZPlayerState.State_None);
    }

    clearCards() {
        this._ddzCardData.clear();
    }

    setName(name) {
        this.m_nickName.string = name;
    }

    setCoin(num: number) {
        this.m_coinLabel.string = num.toString();
    }

    setIsBanker(isBanker: boolean) {
        this.m_landlordTag.active = isBanker;
    }

    setLocalChairID(localID) {
        this.m_localChairID = localID;
    }

    setServerChairID(serverID) {
        this.m_serverChairID = serverID;
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
                        this.m_headSprite.spriteFrame = new cc.SpriteFrame(texture);
                        this.m_headSprite.node.setContentSize(cc.size(96, 96));
                    } else {
                        this.m_headSprite.spriteFrame = null;
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

    setState(state: EmDDZPlayerState) {
        //0:隐藏,1:准备,2:1分,3:2分,4:3分,5:不叫,6:不抢,7:明牌,8:不出,9:加倍
        console.log("setState : " + state);

        let idx: number = this._getIdxByState(state);
        this.m_stateSprite.spriteFrame = this.m_stateFrames[idx];
    }

    setResult(offset: number) {
        if (offset < 0) {
            this.m_resultLabel.font = this.m_resultFonts[1];
        }
        else {
            this.m_resultLabel.font = this.m_resultFonts[0];
            this.m_resultLabel.string = '+';
        }

        this.m_resultLabel.string += offset.toString();

        this._updateCoin(offset);
    }

    clearResult() {
        this.m_resultLabel.string = '';
    }

    getHandCard(): HandCardLogic {
        return this._ddzCardData;
    }

    setHandCard(cardDataVec: number[]) {
        this._ddzCardData.setHandCard(cardDataVec);
    }

    addHandCard(addVec: number[]) {
        this._ddzCardData.addHandCard(addVec);
    }

    removeHandCard(removeVec: number[]) {
        this._ddzCardData.removeHandCard(removeVec);
    }

    private _getIdxByState(state: EmDDZPlayerState): number {
        let idx = 0;
        switch (state) {
            case EmDDZPlayerState.State_Score1: {
                idx = 0;
                break;
            }
            case EmDDZPlayerState.State_Score2: {
                idx = 1;
                break;
            }
            case EmDDZPlayerState.State_Score3: {
                idx = 2;
                break;
            }
            case EmDDZPlayerState.State_NoCall: {
                idx = 3;
                break;
            }
            case EmDDZPlayerState.State_NoDiscard: {
                idx = 4;
                break;
            }
            default: {
                idx = 5;
                break;
            }
        }

        return idx;
    }

    private _updateCoin(offset: number) {
        let ddzPlayerData: DDZPlayerData = DDZPlayerDataManager.getInstance().getPlayerDataByServerIdx(this.m_serverChairID);

        if (ddzPlayerData) {
            this.setCoin(ddzPlayerData.chips + offset);
        }
    }
};
