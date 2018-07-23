const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';
import UserData from '../../../../Script/Data/UserData';
import GameLogic from '../Module/Game/GameLogic';
import ResManager from '../Module/Custom/ResManager';
import DDZGameDataLogic, { DDZRoomInfo, DDZRoomOptsInfo, DDZLastDiscardInfo, DDZRoomStateInfo } from '../Data/DDZGameDataLogic';
import { DDZCardType, SortType, EmDDZPlayerState, DDZ_Type, DDZ_WaitPlayerActTime, DDZ_WaitRobBankerTime } from '../Module/DDZGameDefine';
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
import PlayerDataManager from '../../../../Script/Manager/DataManager/PlayerDataManager';
import DDZCountDownRootLayer from './DDZCountDownRootLayer';
import DDZBottomCardRootLayer from './DDZBottomCardRootLayer';

import ClientEventDefine from '../../../../Script/Define/ClientEventDefine';

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

    @property(DDZCountDownRootLayer)
    m_countDownRootLayer: DDZCountDownRootLayer = null;
    
    @property(DDZBottomCardRootLayer)
    m_bottomCardRootLayer: DDZBottomCardRootLayer = null;

    @property(cc.Node)
    m_tuoGuanNode: cc.Node = null;

    @property
    m_curActIdx: number = -1;

    @property(cc.Node)
    m_topNode: cc.Node = null;

    regisEvent() {
        cc.systemEvent.on(ClientEventDefine.CUSTOM_EVENT_PLAYER_DATA_REQ_FINISHED, this.onPlayerReqFinished, this);
    }

    reset() {
        this.m_consoleNode.init(this);
        this.m_cardHelper.init(this);

        this.m_playerRootLayer.init();

        this.m_btnGroupController.hideAll();
    }

    onLoad() {
        this.regisEvent();
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

    onTuoGuanClick() {
        NetSink.getInstance().requestTuoGuan(1);
    }

    onCancelTuoGuanClick() {
        NetSink.getInstance().requestTuoGuan(0);
    }

    clearTable() {
        this._clearPlayers();
        this._clearCards();
        this._clearAllProcess();
        this.m_btnGroupController.hideAll();
        this.m_countDownRootLayer.hideCountDown();
        this.m_bottomCardRootLayer.reset();
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

        this.m_countDownRootLayer.showCountDown(DDZ_WaitRobBankerTime, clientIdx);
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

    onRoomProducedDZ(serverIdx: number, baseScore: number, cards: number[]) {
        let clientIdx: number = this.getLocalIDByChairID(serverIdx);
        if (clientIdx == -1) {
            cc.warn('TableMainUI onRoomProducedDZ invalid serverIdx =', serverIdx);
            return;
        }

        this.updateBottomRootLayer(cards, baseScore);

        if (clientIdx == 0) {
            this.addHandCard(0, cards);
        }
    }

    onWaitPlayerDiscard(serverIdx: number) {
        let clientIdx: number = this.getLocalIDByChairID(serverIdx);
        if (clientIdx == -1) {
            cc.warn('TableMainUI onBankerProduced invalid serverIdx =', serverIdx);
            return;
        }

        this.m_countDownRootLayer.showCountDown(DDZ_WaitPlayerActTime, clientIdx);
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
                this.analyeMyCard();
            }
            else {
                this.m_btnGroupController.showRobNode();
            }
        }
    }

    updateBottomRootLayer(cards: number[], baseScore: number) {
        this.m_bottomCardRootLayer.setBottomCards(cards);
        this.m_bottomCardRootLayer.setBaseScroe(baseScore);
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

    onPlayerTuoGuan(serverIdx: number, isTuoGuan: boolean) {
        let clientIdx: number = this.getLocalIDByChairID(serverIdx);

        if (clientIdx == 0) {
            this.m_tuoGuanNode.active = isTuoGuan;
        }
    }

    onDistrbuteCards(cards: number[]) {
        this.setHandCard(0, cards);

        this.showDispatchCards(0);
    }

    updateAllPlayerDatas() {
        let playerDatas = DDZPlayerDataManager.getInstance()._players;

        _.forEach(playerDatas, (playerData: DDZPlayerData) => {
            let serverIdx = playerData.idx;

            let targetPlayerData = PlayerDataManager.getInstance().getPlayerData(playerData.uid);
            if (targetPlayerData) {
                _.merge(playerData, targetPlayerData);
            }
            this.updatePlayerData(playerData, serverIdx);

            let localChairID = this.getLocalIDByChairID(serverIdx);
            if (localChairID != -1) {
                this.m_playerRootLayer.setHandCard(localChairID, playerData.holdCards);

                if (localChairID == 0) {
                    this.m_tuoGuanNode.active = playerData.isTuoGuan();
                    this.showDispatchCards(0);
                }
            }
        });
    }

    refreshView() {
        this._updateHelperAndConsole();

        this.updateAllPlayerDatas();

        this.updateRoomView();
    }

    onGetRoomInfo() {
        this.refreshView();
    }

    onPlayerReqFinished() {
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
        // this.m_testLabel.string = str;
        return cardType;
    }

    analyeMyCard() {
        this.m_btnGroupController.hideAll();

        if (this.m_curActIdx != 0) {
            return;
        }

        let result = this.m_cardHelper.searchOutCard(this.m_playerRootLayer.getHandCard(0));

        let canDiscard: boolean = result == null || result.cbSearchCount != 0;
        let mustOffer: boolean = this.m_curActIdx == this.m_cardHelper._curIdx || this.m_cardHelper._curIdx == -1;

        this.m_btnGroupController.updateMyTurnNode(canDiscard, mustOffer);

        if (this.m_consoleNode.getSelectedCardsVec().length < 1) {
            this.m_btnGroupController.updateDiscardButton(false);
        }

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
        if (this.m_cardHelper._curIdx == 0) {
            this.reqOutCard(0, selectedCard, cardType[0]);
            return true;
        }

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

        if (roomInfo) {
            let state: eRoomState = roomInfo.state;
            let stateInfo: DDZRoomStateInfo = roomInfo.stateInfo;
            if (roomInfo.diPai && roomInfo.diPai.length > 0) {
                this.m_bottomCardRootLayer.setBottomCards(roomInfo.diPai);
                this.m_bottomCardRootLayer.setBaseScroe(roomInfo.bottom);
                this.m_bottomCardRootLayer.setTimesLabel(roomInfo.bombCnt);
            }
            else {
                this.m_bottomCardRootLayer.resetBottomCards();
            }

            if (stateInfo) {
                this.setCurLocalChairID(stateInfo.curActIdx);

                this.m_countDownRootLayer.showCountDown(roomInfo.stateTime, this.m_curActIdx);

                if (state == eRoomState.eRoomSate_WaitReady || state == eRoomState.eRoomState_GameEnd) {
                    this.m_btnGroupController.hideAll();
                }
                else if (state == eRoomState.eRoomState_DecideBanker) {
                    this.updateOptions(false);
                }
                else {
                    this.updateOptions(true);
                }
            }
        }

    }

    updatePlayerData(playerData, serverChairID) {
        let clientIdx = this.getLocalIDByChairID(serverChairID);
        if (clientIdx == -1) {
            cc.warn('updatePlayerData invalid clientIdx, serverChairID =', serverChairID);
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

    private _updateHelperAndConsole() {
        let roomInfo: DDZRoomInfo = DDZGameDataLogic.getInstance().getRoomInfo();

        if (roomInfo && roomInfo.stateInfo && roomInfo.stateInfo.lastChu) {
            this._updateCardHelperData(roomInfo.stateInfo.lastChu);

            this._updateCardConsole(roomInfo.stateInfo.lastChu)
        }
    }

    private _getPreActIdx(idx: number): number {
        return (idx + MAXPLAYER - 1) % MAXPLAYER;
    }

    private _updateCardHelperData(lastDiscardInfos: DDZLastDiscardInfo[]) {
        let tmpActIdx: number = this.m_curActIdx;

        for (let i = 0; i < MAXPLAYER; ++i) {
            let lastActIdx: number = this._getPreActIdx(tmpActIdx);

            let targetDiscardInfo: DDZLastDiscardInfo =
                _.find(lastDiscardInfos, (info: DDZLastDiscardInfo) => {
                    return info.idx == lastActIdx;
                });

            if (targetDiscardInfo && targetDiscardInfo.chu != null && targetDiscardInfo.chu.length > 0) {
                let myType: DDZCardType[] = GameLogic.getInstance().getCardType(targetDiscardInfo.chu);
                let clientIdx: number = this.getLocalIDByChairID(targetDiscardInfo.idx);

                if (myType.length > 0) {
                    let serverType: DDZ_Type = GameLogic.getInstance().switchCardTypeToServerType(myType[0]);

                    this.setCurOutCard(targetDiscardInfo.chu, serverType, clientIdx);
                }

                break;
            }

            tmpActIdx = this._getPreActIdx(tmpActIdx);
        }
    }

    private _updateCardConsole(lastDiscardInfos: DDZLastDiscardInfo[]) {
        _.forEach(lastDiscardInfos, (info: DDZLastDiscardInfo) => {
            if (info.chu != null && info.chu.length > 0) {
                let myType: DDZCardType[] = GameLogic.getInstance().getCardType(info.chu);
                let clientIdx: number = this.getLocalIDByChairID(info.idx);

                if (myType.length > 0) {
                    let serverType: DDZ_Type = GameLogic.getInstance().switchCardTypeToServerType(myType[0]);

                    this.m_consoleNode.showOutCard(clientIdx, info.chu, serverType);
                }
            }
        });
    }
};
