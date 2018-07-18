const { ccclass, property } = cc._decorator;

import UserData from '../../../../Script/Data/UserData';
import GameLogic from '../Data/../Module/Game/GameLogic';
import ResManager from '../Module/Custom/ResManager';
import DDZGameDataLogic from '../Data/DDZGameDataLogic';
import { DDZCardType, SortType } from '../Module/DDZGameDefine';
import NetSink from '../Module/Game/TableSink';
import DDZPlayerData from '../Data/DDZPlayerData';
import CardConsole from '../Module/Game/CardConsole';
import CardHelper from '../Control/CardHelper';
import PlayerRootLayer from './PlayerRootLayer';
import DDZLanguage from '../Data/DDZLanguage';
import PrefabManager, { EmPrefabEnum } from '../../../../Script/Manager/CommonManager/PrefabManager';
import SceneManager, { EmSceneID } from '../../../../Script/Manager/CommonManager/SceneManager';
import DDZButtonGroupController from '../Controller/DDZButtonGroupController';

let userData = UserData.getInstance();
let ResMgrIns = ResManager.getInstance();
let DDZDataMgrIns = DDZGameDataLogic.getInstance();
let GameLogicIns = GameLogic.getInstance();
let DDZPlayerDataLogic = DDZPlayerData.getInstance();

let TopNodeZOrder = 1000;
let MAXPLAYER = 3;

@ccclass
export default class TableMainUI extends cc.Component {
    @property(DDZButtonGroupController)
    m_btnGroupController: DDZButtonGroupController = null;

    @property(cc.Node)
    m_chairNodes: cc.Node[] = [];

    @property(CardConsole)
    m_consoleNode: CardConsole = null;
    @property(CardHelper)
    m_cardHelper: CardHelper = null;
    @property(NetSink)
    m_netSink: NetSink = null;

    @property(PlayerRootLayer)
    m_playerRootLayer: PlayerRootLayer = null;

    @property
    m_curActIdx: number = -1;

    @property(cc.Node)
    m_topNode: cc.Node = null;
    @property(cc.Label)
    m_roomIDLabel: cc.Label = null;

    @property(cc.Label)
    m_testLabel: cc.Label = null;

    init() {
        DDZDataMgrIns.init();
        this.m_consoleNode.init(this);
        this.m_cardHelper.init(this);
        this.m_netSink.init(this);

        this.m_playerRootLayer.init();

        this.m_btnGroupController.hideAll();
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
        // for (let idx = 0; idx < DDZDataMgrIns._seatCnt; idx++) {
        //     let playerData = DDZPlayerDataLogic._players[idx];
        //     if (playerData && playerData.uid > 0) {
        //         if (this.getLocalIDByChairID(idx) > -1) {
        //             this.m_headUINodeComp[this.getLocalIDByChairID(idx)].sitDown(playerData);
        //         }
        //         if (DDZPlayerDataLogic._players[idx].uid == userData.uid) {
        //             if (DDZDataMgrIns._roomState != eRoomState.eRoomSate_WaitReady &&
        //                 DDZPlayerDataLogic._players[idx].cards) {
        //                 // for (let i = 0; i < DDZGameData.players[idx].cards.length; i++) {
        //                 //     this.m_pMyCardManager.node.getComponent('DDZMyHoldCardManager').showCardByArray(DDZGameData.players[idx].cards);
        //                 // }
        //             }
        //             if (DDZDataMgrIns._roomState == eRoomState.eRoomSate_WaitReady &&
        //                 DDZPlayerDataLogic._players[idx].state != eRoomPeerState.eRoomPeer_Ready) {
        //                 //auto ready
        //             } else {
        //             }
        //         }
        //     }
        // }
        this.updateShowNotStartButton();
        if (!DDZPlayerDataLogic.getPlayerDataByUID(userData.uid)) {
            this.m_netSink.sendEnterRoom();
        }
    }

    activeBtn(btn, active) {
        btn.node.active = active;
    }

    onQuitClick() {
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
    }

    onDiscardClick() {
        this.sendMyCards();
    }

    onTipClick() {
        this.showTip();
    }

    onClearClick() {
        this.clearAllProcess();
    }

    onReadyClick() {
        this.m_netSink.sendReady();
    }

    updateShowNotStartButton() {
        var playerCnt = 0;
        for (let idx = 0; idx < DDZDataMgrIns._seatCnt; idx++) {
            let playerData = DDZPlayerDataLogic._players[idx];
            if (playerData && playerData.uid > 0) {
                playerCnt++;
            }
        }
        
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
            // this.m_actBtnPanel.active = true;
            this.analyeMyCard();
        } else {
            // this.m_actBtnPanel.active = false;
        }
    }

    setHandCard(localChairID: number, cardDataVec) {
        this.m_playerRootLayer.setHandCard(localChairID, cardDataVec);
    }

    showHandCard(localChairID: number) {
        let cardData = this.m_playerRootLayer.getHandCard(localChairID);
        this.m_consoleNode.showHandCard(localChairID, cardData);
    }

    showDispatchCards(localChairID: number) {
        let cardData = this.m_playerRootLayer.getHandCard(localChairID);
        this.m_consoleNode.showDisPatchCards(localChairID, cardData);
    }

    removeHandCard(localChairID: number, removeVec) {
        this.m_playerRootLayer.removeHandCard(localChairID, removeVec);
    }

    addHandCard(localChairID: number, addVec) {
        this.m_playerRootLayer.addHandCard(localChairID, addVec);
        let cardData = this.m_playerRootLayer.getHandCard(localChairID);
        this.m_consoleNode.showHandCard(localChairID, cardData);
    }

    sendOutCard(localChairID, sendCardVec, serverCardType) {
        if (localChairID == 0) {
            this.removeHandCard(localChairID, sendCardVec);
            let cardData = this.m_playerRootLayer.getHandCard(localChairID);
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
        let result = this.m_cardHelper.searchOutCard(this.m_playerRootLayer.getHandCard(0));

        this.m_btnGroupController.hideAll();

        let canDiscard: boolean = result == null || result.cbSearchCount != 0;
        this.m_btnGroupController.updateMyTurnNode(canDiscard);

        if (result.cbSearchCount != 0) {
            this.m_cardHelper.setCurTipResult(result);
            this.checkSelectedCardCanOffer(this.m_consoleNode.getSelectedCardsVec(), true);
        }
    }

    showTip() {
        let curTipStruct: any = this.m_cardHelper.getTip();
        if (curTipStruct == -1) {
            // this.activeBtn(this.m_btnTip, false);
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
            this.m_btnGroupController.updateDiscardButton(true);
            return true;
        } else {
            return this.m_cardHelper.compareCard(selectedCardVec);
        }
    }

    checkSelectedCardCanOffer(selectedCardVec, needCompare) {
        let canOffer = this.compareMyCards(selectedCardVec, needCompare);
        this.m_btnGroupController.updateDiscardButton(canOffer);
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

    exitGame(messageText: string = '') {
        let confimCallback = () => {
            setTimeout(() => {
                SceneManager.getInstance().changeScene(EmSceneID.SceneID_MainScene);
            }, 200);
        }

        PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_MessageBox, [messageText, confimCallback]);
    }

    updatePlayerData(playerData, serverChairID) {
        let clientIdx = this.getLocalIDByChairID(serverChairID);
        if (clientIdx == -1) {
            return;
        }
        
        this.m_playerRootLayer.setPlayerData(clientIdx, playerData);
    }

    standUp(serverChairID) {
        let clientIdx = this.getLocalIDByChairID(serverChairID);

        this.m_playerRootLayer.clearPlayerData(clientIdx);
        this.m_playerRootLayer.hide(clientIdx);
    }

    setStateTag(serverID, stateTag) {
        let clientIdx = this.getLocalIDByChairID(serverID);

        this.m_playerRootLayer.updateState(clientIdx, stateTag);
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
