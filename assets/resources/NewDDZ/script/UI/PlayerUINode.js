var PlayerData = require('PlayerData');
var CClientApp = require("CClientApp");
var ResMgrIns = require('ResManager').ResManager.instance;
var DDZDataMgrIns = require('DDZGameDataLogic').DDZGameLogic.instance;
let DDZPlayerDataLogic = require('DDZPlayerData').DDZPlayerData.instance;
var MyUtils = require('MyUtils');
cc.Class({
    extends: cc.Component,

    properties: {
        m_headSprite: cc.Sprite,
        m_LandlordTag: cc.Node,
        m_shareTag: cc.Node,
        m_stateSprite: cc.Sprite,
        m_nickName: cc.Label,
        m_localChairID: -1,
        m_serverChairID: -1,
        
    },

    init: function() {
        this.m_LandlordTag.active = false;
        this.m_shareTag.active = false;
        this.m_stateSprite.node.active = false;
    },

    standUp: function() {
        this.node.active = false;
    },

    sitDown: function (data) {
        this.node.active = true;
        this._data = data;
        this.m_nickName.string = data.name;
        this.setHead(data.head);
        //this.setCoinLabel(data.chips);
        // if (data.uid != PlayerData.uid && data.cards && data.cards.length) {
        //     if (this.m_pOtherCardBG) {
        //         this.m_pOtherCardBG.node.active = true;
        //         this.m_pOtherCardNumLabel.string = data.cards.length;
        //     }
        // } else {
        //     if (this.m_pOtherCardBG) {
        //         this.m_pOtherCardBG.node.active = false;
        //     }
        // }
        this.m_shareTag.active = false;
        this.setState(0);
        if (data.state == MyUtils.eRoomPeerState.eRoomPeer_Ready && DDZDataMgrIns._roomState == MyUtils.eRoomState.eRoomSate_WaitReady) {
            this.setState(1);
        } 
        //else if (DDZGameData.roomState == MyUtils.eRoomState.eRoomState_RobotBanker && DDZGameData.readyPlayers && DDZGameData.readyPlayers.length) {
        //     for (let i = 0; i < DDZGameData.readyPlayers.length; i++) {
        //         if (DDZGameData.players[DDZGameData.readyPlayers[i].idx].uid == data.uid) {
        //             if (DDZGameData.readyPlayers[i].times == 0) {
        //                 this.showStateInfo(5);
        //             } else {
        //                 this.showStateInfo(DDZGameData.readyPlayers[i].times + 1);
        //             }
        //             break;
        //         }
        //     }
        // } else if (DDZGameData.roomState == MyUtils.eRoomState.eRoomState_DDZ_Chu && DDZGameData.lastChu && DDZGameData.curActIdex != data.idx) {
        //     if (!DDZGameData.lastChu[data.idx] || DDZGameData.lastChu[data.idx].length == 0) {
        //         var isShow = false;
        //         for (let i = 0; i < DDZGameData.lastChu.length; i++) {
        //             if (i != DDZGameData.curActIdex && DDZGameData.lastChu[i] && DDZGameData.lastChu[i].length && ((data.idx + 1) % 3) == DDZGameData.curActIdex) {
        //                 isShow = true;
        //                 break;
        //             }
        //         }
        //         if (isShow) {
        //             this.showStateInfo(8);
        //         }
        //     }
        // }
        // this.showTiLaChuai(data.isTiLaChuai);
        // this.showChaoZhuang(data.nJiaBei > 0 && DDZGameData.roomState <= MyUtils.eRoomState.eRoomState_JJ_DDZ_Chao_Zhuang
        //     && DDZGameData.roomState >= MyUtils.eRoomState.eRoomState_DDZ_Chu);
        // this.setShowDiZhuIcon(data.idx == DDZGameData.dzIdx && DDZGameData.roomState == MyUtils.eRoomState.eRoomState_DDZ_Chu);
        // this.m_pCountDownSprite.node.active = false;
        var message = {
            msgID: CClientApp.usMsgType.MSG_REQUEST_PLAYER_DATA,
            nReqID: data.uid,
            isDetail: false,
        };
        CClientApp.sendMsg(JSON.stringify(message), CClientApp.usMsgType.MSG_REQUEST_PLAYER_DATA, CClientApp.eMsgPort.ID_MSG_PORT_DATA, PlayerData.uid);
    },

    setLocalChairID: function(localID) {
        this.m_localChairID = localID;
    },

    setServerChairID: function(serverID) {
        this.m_serverChairID = serverID;
    },

    setShareTagActive: function(active) {
        this.m_shareTag.active = active;
    },

    setShareTagActive: function(active) {
        this.m_shareTag.active = active;
    },

    setHead: function (headUrl) {
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
                        this.m_headSprite.node.setContentSize(cc.size(96,96));
                    } else {
                        this.m_headSprite.spriteFrame = null;
                    }
                });
            }
        } else {
            var realUrl = cc.url.raw("resources/NewDDZ/image/room_default_none.png");
            var texture = cc.textureCache.addImage(realUrl);
            this.m_headSprite.spriteFrame = new cc.SpriteFrame(texture);
            this.m_headSprite.node.setContentSize(cc.size(96,96));
        }
    },

    setName: function(name) {
        this.m_nickName.string = name;
    },

    setState: function(stateTag) {
        //0:隐藏,1:准备,2:1分,3:2分,4:3分,5:不叫,6:不抢,7:明牌,8:不出,9:加倍
        console.log("setState : " + stateTag);
        let spriteAtlas = ResMgrIns.getRes('CaoZuo');
        this.m_stateSprite.node.active = stateTag > 0;
        switch (stateTag) {
            case 1:
                this.m_stateSprite.spriteFrame = spriteAtlas.getSpriteFrame("zhunbei2");
                break;
            case 2:
                this.m_stateSprite.node.active = false;
                break;
            case 3:
                this.m_stateSprite.spriteFrame = spriteAtlas.getSpriteFrame("playing-jichu-erfen_zhuomian_jinbiaosai");
                break;
            case 4:
                this.m_stateSprite.spriteFrame = spriteAtlas.getSpriteFrame("playing-jichu-sanfen_zhuomian_jinbiaosai");
                break;
            case 5:
                this.m_stateSprite.spriteFrame = spriteAtlas.getSpriteFrame("playing-jichu-bujiao_playing");
                break;
            case 6:
                this.m_stateSprite.spriteFrame = spriteAtlas.getSpriteFrame("playing-jichu-buqiang_playing");
                break;
            case 7:
                this.m_stateSprite.spriteFrame = spriteAtlas.getSpriteFrame("playing-jichu-mingpai_playing");
                break;
            case 8:
                this.m_stateSprite.spriteFrame = spriteAtlas.getSpriteFrame("playing-jichu-buchu_playing");
                break;
            case 9:
                this.m_stateSprite.spriteFrame = spriteAtlas.getSpriteFrame("playing-jichu-jiabei_playing");
                break;
        }

    },


});
