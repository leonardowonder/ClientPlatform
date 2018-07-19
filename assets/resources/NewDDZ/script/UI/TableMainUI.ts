const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';
import UserData from '../../../../Script/Data/UserData';
import GameLogic from '../Module/Game/GameLogic';
import ResManager from '../Module/Custom/ResManager';
import DDZGameDataLogic from '../Data/DDZGameDataLogic';
import { DDZCardType, SortType, EmDDZPlayerState, DDZ_Type } from '../Module/DDZGameDefine';
import NetSink from '../Module/Game/TableSink';
import DDZPlayerDataManager from '../Data/DDZPlayerDataManager';
import CardConsole from '../Module/Game/CardConsole';
import CardHelper from '../Control/CardHelper';
import DDZPlayerRootLayer from './DDZPlayerRootLayer';
import DDZLanguage from '../Data/DDZLanguage';
import PrefabManager, { EmPrefabEnum } from '../../../../Script/Manager/CommonManager/PrefabManager';
import SceneManager, { EmSceneID } from '../../../../Script/Manager/CommonManager/SceneManager';
import DDZButtonGroupController from '../Controller/DDZButtonGroupController';
import DDZPlayerItem from './DDZPlayerItem';
import HandCardLogic from '../Control/HandCardLogic';

let userData = UserData.getInstance();
let ResMgrIns = ResManager.getInstance();
let GameLogicIns = GameLogic.getInstance();

let TopNodeZOrder = 1000;
let MAXPLAYER = 3;

@ccclass
export default class TableMainUI extends cc.Component {
    @property(DDZButtonGroupController)
    m_btnGroupController: DDZButtonGroupController = null;

    @property(CardConsole)
    m_consoleNode: CardConsole = null;
    @property(CardHelper)
    m_cardHelper: CardHelper = null;

    @property(DDZPlayerRootLayer)
    m_playerRootLayer: DDZPlayerRootLayer = null;

    @property
    m_curActIdx: number = -1;

    @property(cc.Node)
    m_topNode: cc.Node = null;
    @property(cc.Label)
    m_roomIDLabel: cc.Label = null;

    @property(cc.Label)
    m_testLabel: cc.Label = null;

    reset() {
        NetSink.getInstance().setCurView(this);
        DDZGameDataLogic.getInstance().init();
        this.m_consoleNode.init(this);
        this.m_cardHelper.init(this);

        this.m_playerRootLayer.init();

        this.m_btnGroupController.hideAll();
    }

    onLoad() {
        this.reset();
        this.m_topNode.setLocalZOrder(TopNodeZOrder);
        this.m_roomIDLabel.string = DDZGameDataLogic.getInstance()._roomID.toString();
    }

    start() {
        //let mm = [128, 148,156, 64,65,66,67,72,73,74,75,80,81,82,83,88,89,90,96,97,98,105,104,112,113,114];//129, 148, 156
        //let mm = [72, 73, 74, 75, 80, 81, 82, 83, 96]
        // let mm = [25, 26, 32, 33, 34, 35, 41, 42, 43, 48, 50, 49, 51, 56, 57, 58, 64, 65, 66, 72, 73, 74, 80, 81, 88, 96, 82, 83];
        //let mm = [25,26,24,32,33,34,35,40,41,42,43,48,49,50,51];
        //let mm = [24, 25, 32, 41, 64, 65, 80, 96, 115, 131, 148, 156];
        // this.setHandCard(0, []);
        this.refreshDatas();
    }

    onDestroy() {
        NetSink.getInstance().unsetCurView();
        ResMgrIns.releaseRes();
    }

    onQuitClick() {
        NetSink.getInstance().sendLeaveRoom();
    }

    clearTable() {
        this._clearPlayers();
        this._clearCards();
    }

    showLayer() {
        if (!DDZPlayerDataManager.getInstance().getPlayerDataByUID(userData.uid)) {
            NetSink.getInstance().sendEnterRoom();
        }
    }

    onWaitPlayerRob(serverIdx: number) {
        let clientIdx: number = this.getLocalIDByChairID(serverIdx);
        if (clientIdx == -1) {
            cc.warn('TableMainUI onWaitPlayerRob invalid serverIdx =', serverIdx);
            return;
        }

        this.m_btnGroupController.hideAll();
        if (clientIdx == 0) {
            this.m_btnGroupController.showRobNode();
        }
    }

    onPlayerRob() {
        this.m_btnGroupController.hideAll();
    }

    onRoomPlayerRob(serverIdx: number, times: number) {
        let clientIdx: number = this.getLocalIDByChairID(serverIdx);
        if (clientIdx == -1) {
            cc.warn('TableMainUI onRoomPlayerRob invalid serverIdx =', serverIdx);
            return;
        }

        let state = this._getStateByTimes(times);
        let player: DDZPlayerItem = this.m_playerRootLayer.getPlayerByClientIdx(clientIdx);

        player && player.setState(state);
    }

    onBankerProduced(serverIdx: number) {
        let clientIdx: number = this.getLocalIDByChairID(serverIdx);
        if (clientIdx == -1) {
            cc.warn('TableMainUI onBankerProduced invalid serverIdx =', serverIdx);
            return;
        }

        let player: DDZPlayerItem = this.m_playerRootLayer.getPlayerByClientIdx(clientIdx);
        player && player.setIsBanker(true);
    }

    updateBaseScore(baseScore: number, cards: number[]) {
        cc.log('wd debug to do updateBaseScore', arguments);
    }

    onWaitPlayerDiscard(serverIdx: number) {
        let clientIdx: number = this.getLocalIDByChairID(serverIdx);
        if (clientIdx == -1) {
            cc.warn('TableMainUI onBankerProduced invalid serverIdx =', serverIdx);
            return;
        }

        // if (clientIdx == 0) {
        //     this.m_btnGroupController.updateMyTurnNode();
        //     this.m_btnGroupController.updateDiscardButton();
        // }
        // let player: DDZPlayerItem = this.m_playerRootLayer.getPlayerByClientIdx(clientIdx);
        // player && player.setIsBanker(true);
    }

    onPlayerDiscard() {
        this.m_btnGroupController.hideAll();
    }

    onRoomPlayerDiscard(cards: number[], type: DDZCardType, serverIdx: number) {
        let playerCards: HandCardLogic = this.m_playerRootLayer.getHandCard(0);

        playerCards && playerCards.removeHandCard(cards);

        let serverCardType: DDZ_Type = GameLogicIns.switchCardTypeToServerType(type);
        this.m_cardHelper.setCurSendCard(cards, serverCardType);
        this.m_consoleNode.showOutCard(0, cards, serverCardType);
    }

    onDistrbuteCards(cards: number[]) {
        this.m_consoleNode.showDisPatchCards(0, cards);
    }

    refreshDatas() {
        this.updateAllPlayerDatas();
    }



    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Game process
    getLocalIDByChairID(chairID) {
        let meServerID = DDZPlayerDataManager.getInstance()._meServerID;
        if (meServerID >= 0) {
            let iIdex = (chairID - meServerID + MAXPLAYER) % MAXPLAYER;
            return iIdex;
        } else {
            console.log('Error chairID');
            return -1;
        }
    }

    setCurLocalChairID(serverIdx: number) {
        let localChairID = this.getLocalIDByChairID(serverIdx);

        this.m_consoleNode.setConsoleEnable(localChairID == 0);
        this.m_curActIdx = localChairID;
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

        if (result && result.cbSearchCount != 0) {
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
        this.m_playerRootLayer.clearAllCards();
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
        // let confimCallback = () => {
        //     SceneManager.getInstance().changeScene(EmSceneID.SceneID_MainScene);
        // }

        // PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_MessageBox, [messageText, confimCallback]);
        SceneManager.getInstance().changeScene(EmSceneID.SceneID_MainScene);
    }

    updateAllPlayerDatas() {
        let playerDatas = DDZPlayerDataManager.getInstance()._players;

        _.forEach(playerDatas, (playerData) => {
            let serverIdx = playerData.idx;

            this.updatePlayerData(playerData, serverIdx);

            let localChairID = this.getLocalIDByChairID(serverIdx);
            this.m_playerRootLayer.setHandCard(localChairID, playerData.cards);

            if (localChairID == 0) {
                this.m_consoleNode.showDisPatchCards(0, playerData.cards);
            }
        });
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
    }


    ////////////////////////////////////////////network  post///////////////////////////////////////////////
    reqOutCard(localChairID, sendCardData, cardType) {
        NetSink.getInstance().reqOutCard(localChairID, sendCardData, cardType);
    }








    ///////////////////////////////////////////network recieve//////////////////////////////////////////////
    onSendCard(pbuff) {

    }

    private _clearPlayers() {
        this.m_playerRootLayer.clearAllPlayers();
    }

    private _clearCards() {
        this.m_playerRootLayer.clearAllCards();
    }

    private _getStateByTimes(times): EmDDZPlayerState {
        let state = EmDDZPlayerState.State_None;
        switch (times) {
            case 0: {
                state = EmDDZPlayerState.State_NoCall;
                break;
            }
            case 1: {
                state = EmDDZPlayerState.State_Score1;
                break;
            }
            case 2: {
                state = EmDDZPlayerState.State_Score2;
                break;
            }
            case 3: {
                state = EmDDZPlayerState.State_Score3;
                break;
            }
        }

        return state;
    }
};
