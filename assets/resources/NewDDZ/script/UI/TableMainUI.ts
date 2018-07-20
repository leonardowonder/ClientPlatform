const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';
import UserData from '../../../../Script/Data/UserData';
import GameLogic from '../Module/Game/GameLogic';
import ResManager from '../Module/Custom/ResManager';
import DDZGameDataLogic, { DDZRoomInfo, DDZRoomOptsInfo, DDZLastDiscardInfo, DDZRoomStateInfo } from '../Data/DDZGameDataLogic';
import { DDZCardType, SortType, EmDDZPlayerState, DDZ_Type } from '../Module/DDZGameDefine';
import NetSink from '../Module/Game/TableSink';
import DDZPlayerDataManager, { DDZPlayerData } from '../Data/DDZPlayerDataManager';
import CardConsole from '../Module/Game/CardConsole';
import CardHelper from '../Control/CardHelper';
import DDZPlayerRootLayer from './DDZPlayerRootLayer';
import DDZLanguage from '../Data/DDZLanguage';
import PrefabManager, { EmPrefabEnum } from '../../../../Script/Manager/CommonManager/PrefabManager';
import SceneManager, { EmSceneID } from '../../../../Script/Manager/CommonManager/SceneManager';
import DDZButtonGroupController from '../Controller/DDZButtonGroupController';
import DDZPlayerItem from './DDZPlayerItem';
import { eRoomState } from '../Define/DDZDefine';

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
        this.m_consoleNode.init(this);
        this.m_cardHelper.init(this);

        this.m_playerRootLayer.init();

        this.m_btnGroupController.hideAll();
    }

    onLoad() {
        this.reset();
        NetSink.getInstance().setCurView(this);
        this.m_topNode.setLocalZOrder(TopNodeZOrder);
    }

    start() {
        this.refreshView();
    }

    onDestroy() {
        NetSink.getInstance().unsetCurView();
        ResMgrIns.releaseRes();
    }

    onReadyClick() {
        NetSink.getInstance().requestReady();
    }

    onQuitClick() {
        NetSink.getInstance().sendLeaveRoom();
    }

    clearTable() {
        this._clearPlayers();
        this._clearCards();
        this._clearAllProcess();
        this.m_btnGroupController.hideAll();
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

        this.updateOptions(false);
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

    updateBaseScore(serverIdx: number, baseScore: number, cards: number[]) {
        let clientIdx: number = this.getLocalIDByChairID(serverIdx);
        if (clientIdx == -1) {
            cc.warn('TableMainUI updateBaseScore invalid serverIdx =', serverIdx);
            return;
        }

        if (clientIdx == 0) {
            this.addHandCard(0, cards);
        }
    }

    onWaitPlayerDiscard(serverIdx: number) {
        // let clientIdx: number = this.getLocalIDByChairID(serverIdx);
        // if (clientIdx == -1) {
        //     cc.warn('TableMainUI onBankerProduced invalid serverIdx =', serverIdx);
        //     return;
        // }
        this.updateOptions(true);
        // let player: DDZPlayerItem = this.m_playerRootLayer.getPlayerByClientIdx(clientIdx);
        // player && player.setIsBanker(true);
    }

    updateOptions(isDiscard: boolean) {
        let isMyTurn: boolean = this.m_curActIdx == 0;
        this.m_consoleNode.setConsoleEnable(isMyTurn);

        if (!isMyTurn) {
            this.m_btnGroupController.hideAll();
        }
        else {
            if (isDiscard) {
                this.m_btnGroupController.updateMyTurnNode(true, false);
            }
            else {                
                this.m_btnGroupController.showRobNode();
            }
        }
    }

    onPlayerDiscard() {
        this.m_btnGroupController.hideAll();
    }

    onRoomPlayerDiscard(cards: number[], type: DDZCardType, serverIdx: number) {
        if (cards == null) {
            cc.log('wd debug cards null');
        }
        else {
            let serverCardType: DDZ_Type = GameLogicIns.switchCardTypeToServerType(type);

            let clientIdx: number = this.getLocalIDByChairID(serverIdx);

            this.setCurOutCard(cards, serverCardType, clientIdx);

            this.sendOutCard(clientIdx, cards, serverCardType);
        }
    }

    onDistrbuteCards(cards: number[]) {
        this.setHandCard(0, cards);

        this.showDispatchCards(0);
    }

    refreshView() {
        this.updateAllPlayerDatas();
        this.updateRoomView();
    }

    onGetRoomInfo() {
        this.refreshView();
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
        this.m_curActIdx = localChairID;
    }

    setHandCard(localChairID: number, cardDataVec: number[]) {
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

    sendOutCard(localChairID: number, sendCardVec: number[], serverCardType: DDZ_Type) {
        if (localChairID == 0) {
            this.removeHandCard(localChairID, sendCardVec);
            let cardData = this.m_playerRootLayer.getHandCard(localChairID);
            this.m_consoleNode.showHandCard(localChairID, cardData);
        } else {

        }
        this.m_consoleNode.showOutCard(localChairID, sendCardVec, serverCardType);
    }

    setCurOutCard(sendCardVec: number[], serverCardType: DDZ_Type, clientIdx: number) {
        this.m_cardHelper.clearSendCardType();
        this.m_cardHelper.setCurSendCard(sendCardVec, serverCardType, clientIdx);
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

    analyeMyCard() {
        let result = this.m_cardHelper.searchOutCard(this.m_playerRootLayer.getHandCard(0));

        this.m_btnGroupController.hideAll();

        let canDiscard: boolean = result == null || result.cbSearchCount != 0;
        let mustOffer: boolean = result == null;
        this.m_btnGroupController.updateMyTurnNode(canDiscard, mustOffer);

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

    updateRoomView() {
        let roomInfo: DDZRoomInfo = DDZGameDataLogic.getInstance().getRoomInfo();
        this.m_roomIDLabel.string = DDZGameDataLogic.getInstance().getRoomInfo().roomID.toString();

        if (roomInfo) {
            let state: eRoomState = roomInfo.state;
            let stateInfo: DDZRoomStateInfo = roomInfo.stateInfo;
            if (stateInfo) {
                this.setCurLocalChairID(stateInfo.curActIdx);
                if (state == eRoomState.eRoomState_DecideBanker) {
                    this.updateOptions(false);
                }
                else {
                    this.updateOptions(true);
                }
            }
        }

    }

    updateAllPlayerDatas() {
        let playerDatas = DDZPlayerDataManager.getInstance()._players;

        _.forEach(playerDatas, (playerData: DDZPlayerData) => {
            let serverIdx = playerData.idx;

            this.updatePlayerData(playerData, serverIdx);

            let localChairID = this.getLocalIDByChairID(serverIdx);
            if (localChairID != -1) {
                this.m_playerRootLayer.setHandCard(localChairID, playerData.holdCards);

                if (localChairID == 0) {
                    this.m_consoleNode.showDisPatchCards(0, playerData.holdCards);
                }
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

    private _clearAllProcess() {
        this.m_cardHelper.clearSendCardType();
        this.m_consoleNode.clear();
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
