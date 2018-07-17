const { ccclass, property } = cc._decorator;

import UserData from '../../../../Script/Data/UserData';
import GameLogic from '../Data/../Module/Game/GameLogic';
import ResManager from '../Module/Custom/ResManager';
import DDZGameDataLogic from '../Data/DDZGameDataLogic';
import { eRoomPeerState, eRoomState } from '../Define/DDZDefine';
import { DDZCardType, SortType } from '../Module/DDZGameDefine';
import NetSink from '../Module/Game/TableSink';
import DDZPlayerData from '../Data/DDZPlayerData';
import CardConsole from '../Module/Game/CardConsole';
import CardHelper from '../Control/CardHelper';
import PlayerUINode from './PlayerUINode';
import HandCardLogic from '../Control/HandCardLogic';
import DDZLanguage from '../Data/DDZLanguage';
import PrefabManager, { EmPrefabEnum } from '../../../../Script/Manager/CommonManager/PrefabManager';
import SceneManager, { EmSceneID } from '../../../../Script/Manager/CommonManager/SceneManager';

let userData = UserData.getInstance();
let ResMgrIns = ResManager.getInstance();
let DDZDataMgrIns = DDZGameDataLogic.getInstance();
let GameLogicIns = GameLogic.getInstance();
let DDZPlayerDataLogic = DDZPlayerData.getInstance();

let TopNodeZOrder = 1000;
let MAXPLAYER = 3;

@ccclass
export default class TableMainUI extends cc.Component {
    @property(cc.Button)
    m_btnQuit: cc.Button = null;
    @property(cc.Button)
    m_btnTip: cc.Button = null;
    @property(cc.Button)
    m_btnSend: cc.Button = null;
    @property(cc.Button)
    m_btnCantOffer: cc.Button = null;
    @property(cc.Button)
    m_btnClear: cc.Button = null;
    @property(cc.Button)
    m_readyBtn: cc.Button = null;
    @property(cc.Button)
    m_btnDismiss: cc.Button = null;
    @property(cc.Button)
    m_btnStart: cc.Button = null;
    @property(cc.Node)
    m_actBtnPanel: cc.Node = null;
    @property(cc.Node)
    m_chairNodes: cc.Node[] = [];

    @property(CardConsole)
    m_consoleNode: CardConsole = null;
    @property(CardHelper)
    m_cardHelper: CardHelper = null;
    @property(NetSink)
    m_netSink: NetSink = null;

    @property(HandCardLogic)
    m_handLogicComp: HandCardLogic[] = [];
    @property(PlayerUINode)
    m_headUINodeComp: PlayerUINode[] = [];

    @property
    m_curActIdx: number = -1;

    @property(cc.Node)
    m_topNode: cc.Node = null;
    @property(cc.Label)
    m_roomIDLabel: cc.Label = null;

    @property(cc.Label)
    m_testLabel: cc.Label = null;


    init() {
        this.m_actBtnPanel.active = false;
        DDZDataMgrIns.init();
        this.m_consoleNode.init(this);
        this.m_cardHelper.init(this);
        this.m_netSink.init(this);
        this.m_handLogicComp = [];
        for (let i = 0; i < this.m_chairNodes.length; i++) {
            let comp1: HandCardLogic = this.m_chairNodes[i].getComponent(HandCardLogic);
            comp1.init();
            this.m_handLogicComp.push(comp1);
            comp1.setLocalChairID(i);

            let comp2: PlayerUINode = this.m_chairNodes[i].getComponent(PlayerUINode);
            comp2.init();
            this.m_headUINodeComp.push(comp2);
            comp2.setLocalChairID(i);
            comp2.standUp();
        }

        this.activeBtn(this.m_btnCantOffer, false);
        this.activeBtn(this.m_btnSend, false);
    }

    onLoad() {
        //cc.view.setDesignResolutionSize(1280, 720, cc.ResolutionPolicy.EXACT_FIT);
        this.init();
        this.m_topNode.setLocalZOrder(TopNodeZOrder);
        this.m_roomIDLabel.string = DDZDataMgrIns._roomID.toString();
    }

    start() {
        //let mm = [128, 148,156, 64,65,66,67,72,73,74,75,80,81,82,83,88,89,90,96,97,98,105,104,112,113,114];//129, 148, 156
        //let mm = [72, 73, 74, 75, 80, 81, 82, 83, 96]
        let mm = [25, 26, 32, 33, 34, 35, 41, 42, 43, 48, 50, 49, 51, 56, 57, 58, 64, 65, 66, 72, 73, 74, 80, 81, 88, 96, 82, 83];
        //let mm = [25,26,24,32,33,34,35,40,41,42,43,48,49,50,51];
        //let mm = [24, 25, 32, 41, 64, 65, 80, 96, 115, 131, 148, 156];
        this.setHandCard(0, mm);
        this.setCurLocalChairID(0);
        this.showDispatchCards(0);
        this.showLayer();
    }

    showLayer() {
        for (let idx = 0; idx < DDZDataMgrIns._seatCnt; idx++) {
            let playerData = DDZPlayerDataLogic._players[idx];
            if (playerData && playerData.uid > 0) {
                if (this.getLocalIDByChairID(idx) > -1) {
                    this.m_headUINodeComp[this.getLocalIDByChairID(idx)].sitDown(playerData);
                }
                if (DDZPlayerDataLogic._players[idx].uid == userData.uid) {
                    if (DDZDataMgrIns._roomState != eRoomState.eRoomSate_WaitReady &&
                        DDZPlayerDataLogic._players[idx].cards) {
                        // for (let i = 0; i < DDZGameData.players[idx].cards.length; i++) {
                        //     this.m_pMyCardManager.node.getComponent('DDZMyHoldCardManager').showCardByArray(DDZGameData.players[idx].cards);
                        // }
                    }
                    if (DDZDataMgrIns._roomState == eRoomState.eRoomSate_WaitReady &&
                        DDZPlayerDataLogic._players[idx].state != eRoomPeerState.eRoomPeer_Ready) {
                        //auto ready
                        this.m_readyBtn.node.active = true;
                    } else {
                        this.m_readyBtn.node.active = false;
                    }
                }
            }
        }
        this.updateShowNotStartButton();
        if (!DDZPlayerDataLogic.getPlayerDataByUID(userData.uid)) {
            this.m_netSink.sendEnterRoom();
        }

        // this.showTiLaChuai(false)
        // this.m_pChaoZhuangButton.node.active = false;
        // this.m_pNoChaoZhuangButton.node.active = false;
        // for (let idx = 0; idx < DDZGameData.seatCnt; idx++) {
        //     this._users[idx].getComponent("DDZGameUser").waitCountDown(false, 15);
        // }

        // if (DDZGameData.roomState >= eRoomState.eRoomState_StartGame) {
        //     this.checkQiangDiZhuButton(DDZGameData.roomState == eRoomState.eRoomState_RobotBanker && DDZGameData.players[DDZGameData.curActIdex].uid == userData.uid);
        //     this.checkChuPaiButton(DDZGameData.roomState == eRoomState.eRoomState_DDZ_Chu && DDZGameData.players[DDZGameData.curActIdex].uid == userData.uid);
        //     if (DDZGameData.roomState == eRoomState.eRoomState_DDZ_Chu) {
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
        // if (DDZGameData.roomState == eRoomState.eRoomState_JJ_DDZ_Ti_La_Chuai) {
        //     if (DDZGameData.waitTiLaChuaiPlayers && DDZGameData.waitTiLaChuaiPlayers.length) {
        //         for (let i = 0; i < DDZGameData.waitTiLaChuaiPlayers.length; i++) {
        //             if (DDZGameData.players[DDZGameData.waitTiLaChuaiPlayers[i]].uid == userData.uid) {
        //                 this.showTiLaChuai(true);
        //             } else {
        //                 this._users[this.getLocalIdxByServerIdx(DDZGameData.players[DDZGameData.waitTiLaChuaiPlayers[i]].idx)].getComponent("DDZGameUser").waitCountDown(true, 15);
        //             }
        //         }
        //     }
        // } else if (DDZGameData.roomState == eRoomState.eRoomState_JJ_DDZ_Chao_Zhuang) {
        //     var isShow = true;
        //     if (DDZGameData.chosed && DDZGameData.chosed.length) {
        //         for (let idx = 0; idx < DDZGameData.chosed.length; idx++) {
        //             if (DDZGameData.players[DDZGameData.chosed[idx]].uid == userData.uid) {
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
        //     if (DDZGameData.diPai && DDZGameData.diPai.length && DDZGameData.roomState < eRoomState.eRoomState_JJ_DDZ_Chao_Zhuang
        //         && DDZGameData.roomState >= eRoomState.eRoomState_DDZ_Chu) {
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

    }

    activeBtn(btn, active) {
        btn.node.active = active;
    }

    btnCall(event, customData) {
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
            if (DDZDataMgrIns._clubID || DDZDataMgrIns._createUID != userData.uid) {
                for (let idx = 0; idx < MAXPLAYER; idx++) {
                    let playerData = DDZPlayerDataLogic._players[idx];
                    if (!playerData.uid) {
                        isOK = true;
                        break;
                    }
                }
            }
            if (isOK) {
                this.m_netSink.sendLeaveRoom();
            } else {
                var info = DDZLanguage.InfoType.MainGame.DELETE_ROOM;
                let confimCallback = () => {
                    this.m_netSink.sendApplyDismissRoom();
                };

                PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_MessageBox, [info, confimCallback, () => {}]);
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
            var info = DDZLanguage.InfoType.MainGame.DELETE_ROOM;
            let confimCallback = () => {
                this.m_netSink.sendApplyDismissRoom();
            };

            PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_MessageBox, [info, confimCallback, () => {}]);
        } else if (btn == this.m_btnStart) {
            this.m_netSink.sendOpenRoom();
        }
    }

    updateShowNotStartButton() {
        var playerCnt = 0;
        for (let idx = 0; idx < DDZDataMgrIns._seatCnt; idx++) {
            let playerData = DDZPlayerDataLogic._players[idx];
            if (playerData && playerData.uid > 0) {
                playerCnt++;
            }
        }
        //this.m_pShareButton.node.active = playerCnt < DDZGameData.seatCnt && !CClientApp.isCheck();
        this.m_btnStart.node.active = (!DDZDataMgrIns._isOpen) && (DDZDataMgrIns._createUID == userData.uid);
        this.m_btnDismiss.node.active = (playerCnt < DDZDataMgrIns._seatCnt || !DDZDataMgrIns._isOpen) &&
            DDZDataMgrIns._createUID == userData.uid;
    }

    onDestroy() {
        ResMgrIns.releaseRes();
    }





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
    }

    setCurLocalChairID(localChairID) {
        this.m_consoleNode.setConsoleEnable(localChairID == 0);
        this.m_curActIdx = localChairID;
        if (localChairID == 0) {
            this.m_actBtnPanel.active = true;
            this.analyeMyCard();
        } else {
            this.m_actBtnPanel.active = false;
        }
    }

    setHandCard(localChairID, cardDataVec) {
        let comp = this.m_handLogicComp[localChairID];
        comp.setHandCard(cardDataVec);
    }

    showHandCard(localChairID) {
        let cardData = this.m_handLogicComp[localChairID].m_handCardData;
        this.m_consoleNode.showHandCard(localChairID, cardData);
    }

    showDispatchCards(localChairID) {
        let cardData = this.m_handLogicComp[localChairID].m_handCardData;
        this.m_consoleNode.showDisPatchCards(localChairID, cardData);
    }

    removeHandCard(localChairID, removeVec) {
        this.m_handLogicComp[localChairID].removeHandCard(removeVec);
    }

    addHandCard(localChairID, addVec) {
        this.m_handLogicComp[localChairID].addHandCard(addVec);
        let cardData = this.m_handLogicComp[localChairID].m_handCardData;
        this.m_consoleNode.showHandCard(localChairID, cardData);
    }

    sendOutCard(localChairID, sendCardVec, serverCardType) {
        if (localChairID == 0) {
            this.removeHandCard(localChairID, sendCardVec);
            let cardData = this.m_handLogicComp[localChairID].m_handCardData;
            this.m_consoleNode.showHandCard(localChairID, cardData);
        } else {

        }
        this.m_consoleNode.showOutCard(localChairID, sendCardVec, serverCardType);
    }

    setCurOutCard(sendCardVec, serverCardType) {
        this.m_cardHelper.clearSendCardType();
        this.m_cardHelper.setCurSendCard(sendCardVec, serverCardType);
    }

    checkSelectedCard(selectedCard) {
        selectedCard = GameLogicIns.sortCardList(selectedCard, SortType.ST_NORMAL);
        let cardType = this.m_cardHelper.analyseSelectedCard(selectedCard);
        let str = '';
        for (let i = 0; i < cardType.length; i++) {
            str += GameLogicIns.debugShowCardType(cardType[i]);
        }
        this.m_testLabel.string = str;
        return cardType;
    }

    analyeMyCard() {//can offer card
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
    }

    showTip() {
        let curTipStruct: any = this.m_cardHelper.getTip();
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
    }

    standTipCards(tipCards) {
        let tempCards = [];
        for (let i in tipCards) {
            tempCards.push(tipCards[i]);
        }
        this.m_consoleNode.setSelectedCard(tempCards);
    }

    compareMyCards(selectedCardVec, needCompare) {//tip->needCompare = false
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
    }

    checkSelectedCardCanOffer(selectedCardVec, needCompare) {
        let canOffer = this.compareMyCards(selectedCardVec, needCompare);
        this.activeBtn(this.m_btnSend, canOffer);
    }

    clearAllProcess() {
        this.m_cardHelper.clearSendCardType();
        this.m_consoleNode.clear();
        for (let i = 0; i < this.m_chairNodes.length; i++) {
            let comp = this.m_chairNodes[i].getComponent('HandCardLogic');
            comp.clear();
        }
    }

    sendMyCards() {
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
                comp.init(selectedCard, function (localType) {
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
    }

    exitGame(messageText) {
        let confimCallback = () => {
            setTimeout(() => {
                SceneManager.getInstance().changeScene(EmSceneID.SceneID_MainScene);
            }, 200);
        }

        PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_MessageBox, [messageText, confimCallback]);
    }

    sitDown(playerData, serverChairID) {
        if (this.getLocalIDByChairID(serverChairID) == -1) {
            return;
        }
        this.m_headUINodeComp[this.getLocalIDByChairID(serverChairID)].sitDown(playerData);
    }

    standUp(serverChairID) {
        this.m_headUINodeComp[this.getLocalIDByChairID(serverChairID)].standUp();
    }

    setName(serverID, name) {
        this.m_headUINodeComp[this.getLocalIDByChairID(serverID)].setName(name);
    }

    setHead(serverID, headIcon) {
        this.m_headUINodeComp[this.getLocalIDByChairID(serverID)].setHead(headIcon);
    }

    setStateTag(serverID, stateTag) {
        this.m_headUINodeComp[this.getLocalIDByChairID(serverID)].setState(stateTag);
        if (this.getLocalIDByChairID(serverID) == 0 && stateTag == 1) {
            this.m_readyBtn.node.active = false;
        }
    }

    openRoom() {
        PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_PromptDialogLayer, [DDZLanguage.startGame]);
        this.updateShowNotStartButton();
    }


    ////////////////////////////////////////////network  post///////////////////////////////////////////////
    reqOutCard(localChairID, sendCardData, cardType) {
        this.m_netSink.reqOutCard(localChairID, sendCardData, cardType);
    }








    ///////////////////////////////////////////network recieve//////////////////////////////////////////////
    onSendCard(pbuff) {

    }
};
