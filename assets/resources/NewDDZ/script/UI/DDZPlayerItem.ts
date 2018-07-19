const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import DDZGameDataLogic from '../Data/DDZGameDataLogic';
import { eRoomPeerState, eRoomState } from '../Define/DDZDefine';
import { EmDDZPlayerState } from '../Module/DDZGameDefine';

import { DDZPlayerData } from '../Data/DDZPlayerDataManager';

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

    @property
    m_localChairID: number = -1;
    @property
    m_serverChairID: number = -1;

    _data: DDZPlayerData = null;

    init() {
        this.reset();
    }

    hide() {
        this.node.active = false;
    }

    clear() {
        this.reset();
        this.hide();
    }

    reset() {
        this.m_landlordTag.active = false;
        this.m_stateSprite.spriteFrame = null;
        this.m_restCardNumLabel.string = '';

        this.setName('');
        this.setHead('');
        this.setCoin(0);
    }

    setPlayerData(data) {
        this.node.active = true;
        
        this._data.setPlayerData(data);

        this.setName(data.name);
        this.setHead(data.head);
        this.setCoin(data.chips);
        this.setState(EmDDZPlayerState.State_None);
        if (data.state == eRoomPeerState.eRoomPeer_Ready && DDZGameDataLogic.getInstance()._roomState == eRoomState.eRoomSate_WaitReady) {
            this.setState(EmDDZPlayerState.State_None);
        }
    }

    clearPlayerData() {
        this.reset();
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
                // NativeWXHeadDonload.donloadHead(headUrl, this._data.uid.toString() + ".png", (event) => {
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

};
