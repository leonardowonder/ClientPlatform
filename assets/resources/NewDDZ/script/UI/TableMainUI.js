var ResMgrIns = require('ResManager').ResManager.instance;
var GameLogicIns = require('GameLogic').GameLogic.instance;
var Language = require('Language');
var MyUtils = require('MyUtils');
var PlayerData = require('PlayerData');
var HeadDefine = require('HeadDefine');
var DDZDataMgrIns = require('DDZGameDataLogic').DDZGameLogic.instance;
let DDZPlayerDataLogic = require('DDZPlayerData').DDZPlayerData.instance;
var CardConsole = require('CardConsole');
var CardHelper = require('CardHelper');
var NetSink = require('TableSink');
var DDZGameDefine = require('DDZGameDefine');
var CClientApp = require("CClientApp");
var DDZCardType = DDZGameDefine.DDZCardType;
var SortType = DDZGameDefine.SortType;
var DDZLanguage = require('DDZLanguage').DDZLanguage;

var TopNodeZOrder = 1000;
var MAXPLAYER = 3;

cc.Class({
    extends: cc.Component,

    properties: {
        m_btnQuit: cc.Button,
        m_btnTip: cc.Button,
        m_btnSend: cc.Button,
        m_btnCantOffer: cc.Button,
        m_btnClear: cc.Button,
        m_readyBtn: cc.Button,
        m_btnDismiss: cc.Button,
        m_btnStart: cc.Button,
        m_actBtnPanel: cc.Node,
        m_chairNodes: [cc.Node],
        m_consoleNode: CardConsole,
        m_cardHelper: CardHelper,
        m_netSink: NetSink,
        m_handLogicComp: [cc.Component],
        m_headUINodeComp: [cc.Component],
        m_curActIdx: -1,
        m_topNode: cc.Node,
        m_roomIDLabel: cc.Label,

        m_testLabel: cc.Label,
    },

    init () {
        this.m_actBtnPanel.active = false;
        DDZDataMgrIns.init();
        this.m_consoleNode.init(this);
        this.m_cardHelper.init(this);
        this.m_netSink.init(this);
        this.m_handLogicComp = [];
        for (let i = 0; i < this.m_chairNodes.length; i++) {
            let comp = this.m_chairNodes[i].getComponent('HandCardLogic');
            comp.init();
            this.m_handLogicComp.push(comp);
            comp.setLocalChairID(i);

            comp = this.m_chairNodes[i].getComponent('PlayerUINode');
            comp.init();
            this.m_headUINodeComp.push(comp);
            comp.setLocalChairID(i);
            comp.standUp();
        }
        this.activeBtn(this.m_btnCantOffer, false);
        this.activeBtn(this.m_btnSend, false);
    },

    onLoad () {
        //cc.view.setDesignResolutionSize(1280, 720, cc.ResolutionPolicy.EXACT_FIT);
        this.init();
        this.m_topNode.setLocalZOrder(TopNodeZOrder);
        this.m_roomIDLabel.string = DDZDataMgrIns._roomID;
    },

    start () {
        //let mm = [128, 148,156, 64,65,66,67,72,73,74,75,80,81,82,83,88,89,90,96,97,98,105,104,112,113,114];//129, 148, 156
        //let mm = [72, 73, 74, 75, 80, 81, 82, 83, 96]
        let mm = [25,26,32,33,34,35,41,42,43,48,50,49,51,56,57,58,64,65,66,72,73,74,80,81,88,96,82,83];
        //let mm = [25,26,24,32,33,34,35,40,41,42,43,48,49,50,51];
        //let mm = [24, 25, 32, 41, 64, 65, 80, 96, 115, 131, 148, 156];
        this.setHandCard(0, mm);
        this.setCurLocalChairID(0);
        this.showDispatchCards(0);
        this.showLayer();
    },

    showLayer: function () {
        for (let idx = 0; idx < DDZDataMgrIns._seatCnt; idx++) {
            let playerData = DDZPlayerDataLogic._players.get(idx);
            if (playerData && playerData.uid > 0) {
                if (this.getLocalIDByChairID(idx) > -1) {
                    this.m_headUINodeComp[this.getLocalIDByChairID(idx)].sitDown(playerData);
                }
                if (DDZPlayerDataLogic._players.get(idx).uid == PlayerData.uid) {
                    if (DDZDataMgrIns._roomState != MyUtils.eRoomState.eRoomSate_WaitReady && 
                        DDZPlayerDataLogic._players.get(idx).cards) {
                        // for (let i = 0; i < DDZGameData.players[idx].cards.length; i++) {
                        //     this.m_pMyCardManager.node.getComponent('DDZMyHoldCardManager').showCardByArray(DDZGameData.players[idx].cards);
                        // }
                    }
                    if (DDZDataMgrIns._roomState == MyUtils.eRoomState.eRoomSate_WaitReady && 
                        DDZPlayerDataLogic._players.get(idx).state != MyUtils.eRoomPeerState.eRoomPeer_Ready) {
                        //auto ready
                        this.m_readyBtn.node.active = true;
                    } else {
                        this.m_readyBtn.node.active = false;
                    }
                }
            }
        }
        this.updateShowNotStartButton();
        if (!DDZPlayerDataLogic.getPlayerDataByUID(PlayerData.uid)) {
            this.m_netSink.sendEnterRoom();
        }

        // this.showTiLaChuai(false)
        // this.m_pChaoZhuangButton.node.active = false;
        // this.m_pNoChaoZhuangButton.node.active = false;
        // for (let idx = 0; idx < DDZGameData.seatCnt; idx++) {
        //     this._users[idx].getComponent("DDZGameUser").waitCountDown(false, 15);
        // }

        // if (DDZGameData.roomState >= MyUtils.eRoomState.eRoomState_StartGame) {
        //     this.checkQiangDiZhuButton(DDZGameData.roomState == MyUtils.eRoomState.eRoomState_RobotBanker && DDZGameData.players[DDZGameData.curActIdex].uid == PlayerData.uid);
        //     this.checkChuPaiButton(DDZGameData.roomState == MyUtils.eRoomState.eRoomState_DDZ_Chu && DDZGameData.players[DDZGameData.curActIdex].uid == PlayerData.uid);
        //     if (DDZGameData.roomState == MyUtils.eRoomState.eRoomState_DDZ_Chu) {
        //         for (let idx = 0; idx < DDZGameData.seatCnt; idx++) {
        //             if (DDZGameData.curActIdex != idx) {
        //                 this._users[this.getLocalIdxByServerIdx(idx)].getComponent('DDZGameUser').showOutCard(DDZGameData.lastChu[idx], 0, false, false);
        //             } else {
        //                 this._users[this.getLocalIdxByServerIdx(idx)].getComponent('DDZGameUser').showOutCard([], 0, false, false);
        //             }
        //         }
        //     }
        //     this.waitUserAct();
        // }
        // if (DDZGameData.roomState == MyUtils.eRoomState.eRoomState_JJ_DDZ_Ti_La_Chuai) {
        //     if (DDZGameData.waitTiLaChuaiPlayers && DDZGameData.waitTiLaChuaiPlayers.length) {
        //         for (let i = 0; i < DDZGameData.waitTiLaChuaiPlayers.length; i++) {
        //             if (DDZGameData.players[DDZGameData.waitTiLaChuaiPlayers[i]].uid == PlayerData.uid) {
        //                 this.showTiLaChuai(true);
        //             } else {
        //                 this._users[this.getLocalIdxByServerIdx(DDZGameData.players[DDZGameData.waitTiLaChuaiPlayers[i]].idx)].getComponent("DDZGameUser").waitCountDown(true, 15);
        //             }
        //         }
        //     }
        // } else if (DDZGameData.roomState == MyUtils.eRoomState.eRoomState_JJ_DDZ_Chao_Zhuang) {
        //     var isShow = true;
        //     if (DDZGameData.chosed && DDZGameData.chosed.length) {
        //         for (let idx = 0; idx < DDZGameData.chosed.length; idx++) {
        //             if (DDZGameData.players[DDZGameData.chosed[idx]].uid == PlayerData.uid) {
        //                 isShow = false;
        //                 break;
        //             }
        //         }
        //     }
        //     this.m_pChaoZhuangButton.node.active = isShow;
        //     this.m_pNoChaoZhuangButton.node.active = isShow;
        // }
        // for (let idx = 0; idx < 3; idx++) {
        //     var card = this.m_pTitleBG.node.getChildByName("DZCard_" + (idx + 1)).getComponent('DDZCard');
        //     if (DDZGameData.diPai && DDZGameData.diPai.length && DDZGameData.roomState < MyUtils.eRoomState.eRoomState_JJ_DDZ_Chao_Zhuang
        //         && DDZGameData.roomState >= MyUtils.eRoomState.eRoomState_DDZ_Chu) {
        //         card.setCardNum(DDZGameData.diPai[idx]);
        //         card.fanPai(0, 0);
        //         //card.showDiZhuIcon(true);
        //     } else {
        //         card.restore();
        //     }
        // }
        // if (DDZGameData.isWaitingDismiss == 1) {
        //     if (!this._DissolveLayer) {
        //         this._DissolveLayer = cc.instantiate(this.m_pDDZDissolveLayer);
        //         this._DissolveLayer.parent = this.node;
        //         this._DissolveLayer.setPosition(cc.p(0, 0));
        //         this._DissolveLayer.setLocalZOrder(59);
        //     }
        //     for (let idx = 0; idx < DDZGameData.seatCnt; idx++) {
        //         if (DDZGameData.players[idx].uid == DDZGameData.applyDismissUID) {
        //             this._DissolveLayer.getComponent('DDZDissolveLayer').show(DDZGameData.players[idx].idx, DDZGameData.DismissLeftWaitTime);
        //             break;
        //         }
        //     }
        //     if (DDZGameData.agreeIdxs && DDZGameData.agreeIdxs.length) {
        //         for (let idx = 0; idx < DDZGameData.agreeIdxs.length; idx++) {
        //             if (DDZGameData.players[idx].uid != DDZGameData.applyDismissUID) {
        //                 this._DissolveLayer.getComponent('DDZDissolveLayer').playerIsAgree(DDZGameData.agreeIdxs[idx], true);
        //             }
        //         }
        //     }
        // } else if (this._DissolveLayer) {
        //     this._DissolveLayer.removeFromParent(true);
        //     this._DissolveLayer = null;
        // }
        //this.updateRoomInfo();

    },

    activeBtn: function(btn, active) {
        btn.node.active = active;
    },

    btnCall: function(event, customData) {
        var btn = event.target.getComponent(cc.Button);
        if (btn == this.m_btnQuit) {
            //cc.director.loadScene("MainUIScene");
            //test
            //this.addHandCard(0, [40, 41, 66, 129, 148, 156]);
            // let outCardVec = [72,81,74,80,82,73,98,88,89,97,90,96];
            // //this.sendOutCard(0, outCardVec, 6);
            // this.sendOutCard(1, outCardVec, 7);
            // //this.sendOutCard(2, outCardVec, 7);
            // this.setCurOutCard(outCardVec, 7);
            // this.setCurLocalChairID(0);
            var isOK = false;
            if (DDZDataMgrIns._clubID || DDZDataMgrIns._createUID != PlayerData.uid) {
                for (let idx = 0; idx < MAXPLAYER; idx++) {
                    let playerData = DDZPlayerDataLogic._players.get(idx);
                    if (!playerData.uid) {
                        isOK = true;
                        break;
                    }
                }
            }
            if (isOK) {
                this.m_netSink.sendLeaveRoom();
            } else {
                var info = Language.InfoType.MainGame.DELETE_ROOM;
                MyUtils.cloneMyMessageBoxLayer(info, function (type) {
                    if (HeadDefine.MessageBoxButtonType.AGREE == type) {
                        this.m_netSink.sendApplyDismissRoom();
                    }
                }.bind(this));
            }
        } else if (btn == this.m_btnSend) {
            this.sendMyCards();
        } else if (btn == this.m_btnTip) {
            this.showTip();
        } else if (btn == this.m_btnCantOffer) {

        } else if (btn == this.m_btnClear) {
            //cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
            this.clearAllProcess();
        } else if (btn == this.m_readyBtn) {
            //cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
            this.m_netSink.sendReady();
        } else if (btn == this.m_btnDismiss) {
            var info = Language.InfoType.MainGame.DELETE_ROOM;
            MyUtils.cloneMyMessageBoxLayer(info, function (type) {
                if (HeadDefine.MessageBoxButtonType.AGREE == type) {
                    this.m_netSink.sendApplyDismissRoom();
                }
            }.bind(this));
        } else if (btn == this.m_btnStart) {
            this.m_netSink.sendOpenRoom();
        }
    },

    updateShowNotStartButton: function () {
        var playerCnt = 0;
        for (let idx = 0; idx < DDZDataMgrIns._seatCnt; idx++) {
            let playerData = DDZPlayerDataLogic._players.get(idx);
            if (playerData && playerData.uid > 0) {
                playerCnt++;
            }
        }
        //this.m_pShareButton.node.active = playerCnt < DDZGameData.seatCnt && !CClientApp.isCheck();
        this.m_btnStart.node.active = (!DDZDataMgrIns._isOpen) && (DDZDataMgrIns._createUID == PlayerData.uid);
        this.m_btnDismiss.node.active = (playerCnt < DDZDataMgrIns._seatCnt || !DDZDataMgrIns._isOpen) && 
            DDZDataMgrIns._createUID == PlayerData.uid;
    },

    onDestroy: function() {
        ResMgrIns.releaseRes();
    },





    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Game process
    getLocalIDByChairID(chairID) {
        let meServerID = DDZPlayerDataLogic._meServerID;
        if (meServerID >= 0) {
            let iIdex = (chairID - meServerID + MAXPLAYER) % MAXPLAYER;
	        return iIdex;
        } else {
            console.log('Error chairID');
            return -1;
        }
    },

    setCurLocalChairID: function(localChairID) {
        this.m_consoleNode.setConsoleEnable(localChairID == 0);
        this.m_curActIdx = localChairID;
        if (localChairID == 0) {
            this.m_actBtnPanel.active = true;
            this.analyeMyCard();
        } else {
            this.m_actBtnPanel.active = false;
        }
    },

    setHandCard: function(localChairID, cardDataVec) {
        let comp = this.m_handLogicComp[localChairID];
        comp.setHandCard(cardDataVec);
    },

    showHandCard: function(localChairID) {
        let cardData = this.m_handLogicComp[localChairID].m_handCardData;
        this.m_consoleNode.showHandCard(localChairID, cardData);
    },

    showDispatchCards: function(localChairID) {
        let cardData = this.m_handLogicComp[localChairID].m_handCardData;
        this.m_consoleNode.showDisPatchCards(localChairID, cardData);
    },

    removeHandCard: function(localChairID, removeVec){
        this.m_handLogicComp[localChairID].removeHandCard(removeVec);
    },

    addHandCard: function(localChairID, addVec) {
        this.m_handLogicComp[localChairID].addHandCard(addVec);
        let cardData = this.m_handLogicComp[localChairID].m_handCardData;
        this.m_consoleNode.showHandCard(localChairID, cardData);
    },

    sendOutCard: function(localChairID, sendCardVec, serverCardType) {
        if (localChairID == 0) {
            this.removeHandCard(localChairID, sendCardVec);
            let cardData = this.m_handLogicComp[localChairID].m_handCardData;
            this.m_consoleNode.showHandCard(localChairID, cardData);
        } else {

        }
        this.m_consoleNode.showOutCard(localChairID, sendCardVec, serverCardType);
    },

    setCurOutCard: function(sendCardVec, serverCardType) {
        this.m_cardHelper.clearSendCardType();
        this.m_cardHelper.setCurSendCard(sendCardVec, serverCardType);
    },

    checkSelectedCard: function(selectedCard) {
        selectedCard = GameLogicIns.sortCardList(selectedCard, SortType.ST_NORMAL);
        let cardType = this.m_cardHelper.analyseSelectedCard(selectedCard);
        let str = '';
        for (let i = 0; i < cardType.length; i++) {
            str += GameLogicIns.debugShowCardType(cardType[i]);
        }
        this.m_testLabel.string = str;
        return cardType;
    },

    analyeMyCard: function () {//can offer card
        let result = this.m_cardHelper.searchOutCard(this.m_handLogicComp[0].m_handCardData);
        if (result == null) {//can send any card
            this.activeBtn(this.m_btnCantOffer, false);
            this.activeBtn(this.m_btnTip, false);
        } else if (result.cbSearchCount == 0) {// can not send any card
            this.activeBtn(this.m_btnCantOffer, true);
            this.activeBtn(this.m_btnTip, false);
            this.activeBtn(this.m_btnSend, false);
        } else {
            this.activeBtn(this.m_btnCantOffer, false);
            this.m_cardHelper.setCurTipResult(result);
            this.activeBtn(this.m_btnTip, true);
            this.checkSelectedCardCanOffer(this.m_consoleNode.getSelectedCardsVec(), true);
        }
    },

    showTip: function() {
        let curTipStruct = this.m_cardHelper.getTip();
        if (curTipStruct == -1) {
            this.activeBtn(this.m_btnTip, false);
            return;
        }
        let curTipID = curTipStruct.curID;
        let result = curTipStruct.result;
        let cardsCount = result.cbCardCount[curTipID];
        let cardsData = result.cbResultCard[curTipID];
        let dstCardData = [];
        for (let i = 0; i < cardsCount; i++) {
            dstCardData.push(cardsData[i]);
        }
        this.standTipCards(dstCardData);
        this.checkSelectedCardCanOffer(dstCardData, false);
    },

    standTipCards: function(tipCards) {
        let tempCards = [];
        for (let i in tipCards) {
            tempCards.push(tipCards[i]);
        }
        this.m_consoleNode.setSelectedCard(tempCards);
    },

    compareMyCards: function(selectedCardVec, needCompare) {//tip->needCompare = false
        let cardType = this.checkSelectedCard(selectedCardVec);
        if (cardType.length == 0 || (cardType.length == 1 && cardType[0] == DDZCardType.Type_None)) {
            return false;
        }
        if (!needCompare) {
            this.activeBtn(this.m_btnSend, true);
            return true;
        } else {
            return this.m_cardHelper.compareCard(selectedCardVec);
        }
    },

    checkSelectedCardCanOffer: function(selectedCardVec, needCompare) {
        let canOffer = this.compareMyCards(selectedCardVec, needCompare);
        this.activeBtn(this.m_btnSend, canOffer);
    },

    clearAllProcess: function() {
        this.m_cardHelper.clearSendCardType();
        this.m_consoleNode.clear();
        for (let i = 0; i < this.m_chairNodes.length; i++) {
            let comp = this.m_chairNodes[i].getComponent('HandCardLogic');
            comp.clear();
        }
    },

    sendMyCards: function() {
        let selectedCard = this.m_consoleNode.getSelectedCardsVec();
        selectedCard = GameLogicIns.sortCardList(selectedCard, SortType.ST_NORMAL);
        let curCardType = this.m_cardHelper._sendCardType;
        let cardType = GameLogicIns.getCardType(selectedCard);
        if (curCardType == DDZCardType.Type_None) {
            if (cardType.length == 0) {
                return false;
            } else if (cardType.length == 1 && cardType[0] == DDZCardType.Type_None) {
                return false;
            } else if (cardType.length > 1) {
                //selected out type
                let chooseNode = cc.instantiate(ResMgrIns.getRes('SelectedCardTypePanel'));
                let comp = chooseNode.getComponent('SelectedCardPanel');
                comp.init(selectedCard, function(localType){
                    this.reqOutCard(0, selectedCard, localType);
                }.bind(this));
                this.m_topNode.addChild(chooseNode);
                chooseNode.setPosition(cc.Vec2.ZERO);
                return true;
            } else {
                this.reqOutCard(0, selectedCard, cardType[0]);
                return true;
            }
        } else {
            for (let i = 0; i < cardType.length; i++) {
                let curType = cardType[i];
                if (curType == DDZCardType.Type_ZhaDan_0 || curType == DDZCardType.Type_JokerZhaDan) {
                    this.reqOutCard(0, selectedCard, curType);
                    return true;
                } else if (curType == curCardType) {
                    this.reqOutCard(0, selectedCard, curCardType);
                    return true;
                }
            }
        }
    },

    exitGame: function (messageText) {
        MyUtils.cloneMyMessageBoxLayer(messageText, function (type) {
            if (cc.sys.isNative) {
                setDeviceOrientation(1);
            } else {
                cc.view.setOrientation(cc.macro.SCREEN_ORIENTATION_PORTRAIT);
            }
            var callback = cc.callFunc(() => {
                cc.director.loadScene("MainUIScene");
            });
            this.node.runAction(cc.sequence(cc.delayTime(0.2), callback));
        }.bind(this), 1);
    },

    sitDown: function(playerData, serverChairID) {
        if (this.getLocalIDByChairID(serverChairID) == -1) {
            return;
        }
        this.m_headUINodeComp[this.getLocalIDByChairID(serverChairID)].sitDown(playerData);
    },

    standUp: function(serverChairID) {
        this.m_headUINodeComp[this.getLocalIDByChairID(serverChairID)].standUp();
    },

    setName: function(serverID, name) {
        this.m_headUINodeComp[this.getLocalIDByChairID(serverID)].setName(name);
    },

    setHead: function(serverID, headIcon){
        this.m_headUINodeComp[this.getLocalIDByChairID(serverID)].setHead(headIcon);
    },

    setStateTag: function(serverID, stateTag) {
        this.m_headUINodeComp[this.getLocalIDByChairID(serverID)].setState(stateTag);
        if (this.getLocalIDByChairID(serverID) == 0 && stateTag == 1) {
            this.m_readyBtn.node.active = false;
        }
    },

    openRoom: function() {
        MyUtils.clonePromptDialogLayer(DDZLanguage.startGame, true);
        this.updateShowNotStartButton();
    },


    ////////////////////////////////////////////network  post///////////////////////////////////////////////
    reqOutCard: function(localChairID, sendCardData, cardType) {
        this.m_netSink.reqOutCard(localChairID, sendCardData, cardType);
    },








    ///////////////////////////////////////////network recieve//////////////////////////////////////////////
    onSendCard: function(pbuff) {

    },
});
