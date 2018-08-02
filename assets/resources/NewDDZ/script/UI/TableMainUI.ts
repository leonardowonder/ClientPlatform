const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';
import UserData from '../../../../Script/Data/UserData';
import GameLogic from '../Module/Game/GameLogic';
import ResManager from '../Module/Custom/ResManager';
import DDZGameDataLogic, { DDZRoomInfo, DDZLastDiscardInfo, DDZRoomStateInfo, DDZRobInfo } from '../Data/DDZGameDataLogic';
import { DDZCardType, SortType, EmDDZPlayerState, DDZ_Type, DDZ_WaitPlayerActTime, DDZ_WaitRobBankerTime, DDZAnimType } from '../Module/DDZGameDefine';
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
import DDZCountDownRootLayer from './DDZCountDownRootLayer';
import DDZBottomCardRootLayer from './DDZBottomCardRootLayer';
import DDZCurrencyRootLayer from './DDZCurrencyRootLayer';
import DDZAnimationRootLayer from './DDZAnimationRootLayer';
import MainUiSceneLogic from '../../../../Script/Logic/MainUiSceneLogic';

import ClientEventDefine from '../../../../Script/Define/ClientEventDefine';

let userData = UserData.getInstance().getUserData();
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

    @property(DDZCurrencyRootLayer)
    m_currencyRootLayer: DDZCurrencyRootLayer = null;

    @property(DDZAnimationRootLayer)
    m_animationRootLayer: DDZAnimationRootLayer = null;

    @property(cc.Node)
    m_tuoGuanNode: cc.Node = null;

    @property
    m_curServerActIdx: number = -1;

    @property(cc.Label)
    m_testLabel: cc.Label = null;

    @property(cc.Node)
    m_topNode: cc.Node = null;

    _bankerProduced: boolean = false;

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
        let roomInfo: DDZRoomInfo = DDZGameDataLogic.getInstance().getRoomInfo();

        if (roomInfo.state == eRoomState.eRoomState_GameEnd) {
            SceneManager.getInstance().changeScene(EmSceneID.SceneID_MainScene);
        }
        else if (roomInfo.state == eRoomState.eRoomSate_WaitReady) {
            PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_PromptDialogLayer, ['匹配中无法退出']);
        }
        else {
            NetSink.getInstance().sendLeaveRoom();
        }
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
        this.m_tuoGuanNode.active = false;
        this._bankerProduced = false;
        this.m_btnGroupController.reset();
        this.m_countDownRootLayer.hideCountDown();
        this.m_bottomCardRootLayer.reset();
        this._updateSelfPlayer();
    }

    showLayer() {
        if (!DDZPlayerDataManager.getInstance().getPlayerDataByUID(userData.uid)) {
            NetSink.getInstance().sendEnterRoom();
        }
    }

    onWaitPlayerRob(serverIdx: number) {
        this.setStateTag(serverIdx, EmDDZPlayerState.State_None);

        let clientIdx: number = this.getLocalIDByChairID(serverIdx);
        if (clientIdx == -1) {
            cc.warn('TableMainUI onWaitPlayerRob invalid serverIdx =', serverIdx);
            return;
        }

        this.m_countDownRootLayer.showCountDown(DDZ_WaitRobBankerTime, clientIdx);

        this.sendOutCard(clientIdx, [], DDZ_Type.DDZ_Max);

        let playerItem: DDZPlayerItem = this.m_playerRootLayer.getPlayerByClientIdx(clientIdx);
        if (playerItem) {
            playerItem.setState(EmDDZPlayerState.State_None);
        }

        this.updateOptions(false);
    }

    onPlayerRob() {
        this.m_btnGroupController.hideAll();
    }

    onRoomPlayerRob(serverIdx: number, times: number) {
        // let clientIdx: number = this.getLocalIDByChairID(serverIdx);
        // if (clientIdx == -1) {
        //     cc.warn('TableMainUI onRoomPlayerRob invalid serverIdx =', serverIdx);
        //     return;
        // }

        let state = this._getStateByTimes(times);

        if (times > 0) {
            this.m_bottomCardRootLayer.setBaseScroe(times);
        }

        let maxBaseScroe: number = this.m_bottomCardRootLayer.getBaseScore();
        this.m_btnGroupController.updateRobEnable(maxBaseScroe);
        this.setStateTag(serverIdx, state);
        // let player: DDZPlayerItem = this.m_playerRootLayer.getPlayerByClientIdx(clientIdx);

        // player && player.setState(state);
    }

    onRoomProducedDZ(serverIdx: number, baseScore: number, cards: number[]) {
        this._bankerProduced = true;

        let clientIdx: number = this.getLocalIDByChairID(serverIdx);
        if (clientIdx == -1) {
            cc.warn('TableMainUI onRoomProducedDZ invalid serverIdx =', serverIdx);
            return;
        }

        let player: DDZPlayerItem = this.m_playerRootLayer.getPlayerByClientIdx(clientIdx);
        player && player.setIsBanker(true);

        this._clearAllPlayerState();

        this.updateBottomRootLayer(cards, baseScore);

        if (clientIdx == 0) {
            this.addHandCard(0, cards);
        }
    }

    onWaitPlayerDiscard(serverIdx: number) {
        this.setStateTag(serverIdx, EmDDZPlayerState.State_None);

        let clientIdx: number = this.getLocalIDByChairID(serverIdx);
        if (clientIdx == -1) {
            cc.warn('TableMainUI onBankerProduced invalid serverIdx =', serverIdx);
            return;
        }

        this.m_countDownRootLayer.showCountDown(DDZ_WaitPlayerActTime, clientIdx);
        
        this.sendOutCard(clientIdx, [], DDZ_Type.DDZ_Max);

        let playerItem: DDZPlayerItem = this.m_playerRootLayer.getPlayerByClientIdx(clientIdx);
        if (playerItem) {
            playerItem.setState(EmDDZPlayerState.State_None);
        }

        this.updateOptions(true);
        // let player: DDZPlayerItem = this.m_playerRootLayer.getPlayerByClientIdx(clientIdx);
        // player && player.setIsBanker(true);
    }

    updateOptions(isDiscard: boolean) {
        let isMyTurn: boolean = this.getLocalIDByChairID(this.m_curServerActIdx) == 0;
        this.m_consoleNode.setConsoleEnable(isMyTurn);

        cc.log('wd debug updateOptions isMyTurn =', isMyTurn);
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

    updateBottomRootLayer(cards: number[], baseScore: number, times: number = 1) {
        this.m_bottomCardRootLayer.setBottomCards(cards);
        this.m_bottomCardRootLayer.setBaseScroe(baseScore);
        this.m_bottomCardRootLayer.setTimesLabel(times);
    }

    onPlayerDiscard() {
        this.m_btnGroupController.hideAll();
    }

    onRoomPlayerDiscard(cards: number[], type: DDZCardType, serverIdx: number) {
        let clientIdx: number = this.getLocalIDByChairID(serverIdx);

        if (cards == null) {
            this.setStateTag(serverIdx, EmDDZPlayerState.State_NoDiscard);

            this.sendOutCard(clientIdx, [], DDZ_Type.DDZ_Max);
        }
        else {
            let serverCardType: DDZ_Type = GameLogicIns.switchCardTypeToServerType(type);

            this.playSpecialCardEffect(serverCardType, clientIdx);

            if (serverCardType == DDZ_Type.DDZ_Bomb || serverCardType == DDZ_Type.DDZ_Rokect) {
                let times: number = this.m_bottomCardRootLayer.getTimes();

                times = times * 2;

                this.m_bottomCardRootLayer.setTimesLabel(times);
            }

            this.setCurOutCard(cards, serverCardType, clientIdx);

            this.sendOutCard(clientIdx, cards, serverCardType);
        }
    }

    onPlayerTuoGuan(serverIdx: number, isTuoGuan: boolean) {
        let clientIdx: number = this.getLocalIDByChairID(serverIdx);

        if (clientIdx == 0) {
            this.m_tuoGuanNode.active = isTuoGuan;
        }
        else {
            let player: DDZPlayerItem = this.m_playerRootLayer.getPlayerByClientIdx(clientIdx);

            player && player.setTuoGuan(isTuoGuan);
        }
    }

    onDistrbuteCards(cards: number[]) {
        this.setHandCard(0, cards);

        this.showDispatchCards(0);
    }

    updateAllPlayerDatas() {
        let playerDatas = DDZPlayerDataManager.getInstance()._players;

        this._updateSelfPlayer();

        _.forEach(playerDatas, (playerData: DDZPlayerData) => {
            let serverIdx = playerData.idx;

            this.updatePlayerData(serverIdx);

            let localChairID = this.getLocalIDByChairID(serverIdx);
            if (localChairID != -1) {
                this.setHandCard(localChairID, playerData.holdCards);

                if (localChairID == 0) {
                    this.m_tuoGuanNode.active = playerData.isTuoGuan();
                    this.showDispatchCards(0);
                }
            }
        });
    }

    onRoomResult(jsonMessage) {
        let players = jsonMessage.players;

        this.m_btnGroupController.hideAll();
        this.m_countDownRootLayer.hideCountDown();
        this.m_tuoGuanNode.active = false;

        _.forEach(players, (player) => {
            let clientIdx = this.getLocalIDByChairID(player.idx);

            if (clientIdx == 0) {
                this.m_currencyRootLayer.refreshInfo(player.offset);
            }

            let playerItem: DDZPlayerItem = this.m_playerRootLayer.getPlayerByClientIdx(clientIdx);

            playerItem.setResult(player.offset);

            // if (clientIdx != 0 && player.cards && player.cards.length > 0) {
            //     this.sendOutCard()
            // }
        });

        this.scheduleOnce(() => {
            this.clearTable();

            this.m_btnGroupController.showContinueNode();
        }, 1.5);
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
    continuePlay() {
        let roomInfo = DDZGameDataLogic.getInstance().getRoomInfo();
        roomInfo.state = eRoomState.eRoomSate_WaitReady;

        MainUiSceneLogic.getInstance().requestEnterDDZRoom();
    }

    getLocalIDByChairID(chairID) {
        let meServerID = DDZPlayerDataManager.getInstance()._meServerID;
        if (meServerID >= 0) {
            let iIdex = (chairID - meServerID + MAXPLAYER) % MAXPLAYER;
            return iIdex;
        } else {
            return -1;
        }
    }

    setCurLocalChairID(serverIdx: number) {
        this.m_curServerActIdx = serverIdx;
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

    playSpecialCardEffect(type: DDZ_Type, clientIdx: number) {
        let effectType: DDZAnimType = this._getEffectType(type);

        if (effectType != DDZAnimType.Type_None) {
            this._doPlaySpecialEffect(effectType, clientIdx);
        }
    }

    playSpringEffect() {
        this._doPlaySpecialEffect(DDZAnimType.Type_Spring, 0);
    }

    analyeMyCard() {
        if (!this._needShowMyTurnNode()) {
            return;
        }

        this.m_btnGroupController.hideAll();

        let result = this.m_cardHelper.searchOutCard(this.m_playerRootLayer.getHandCard(0));

        let canDiscard: boolean = result == null || result.cbSearchCount != 0;
        let mustOffer: boolean = this.getLocalIDByChairID(this.m_curServerActIdx) == this.m_cardHelper._curLocalIdx || this.m_cardHelper._curLocalIdx == -1;

        this.m_btnGroupController.updateMyTurnNode(canDiscard, mustOffer);

        if (this.m_consoleNode.getSelectedCardsVec().length < 1) {
            this.m_btnGroupController.updateDiscardButton(false);
        }

        if (result && result.cbSearchCount != 0) {
            this.m_cardHelper.setCurTipResult(result);
            this.checkSelectedCardCanOffer(this.m_consoleNode.getSelectedCardsVec(), !mustOffer);
        }

        this.m_btnGroupController.updateTipButton(-1 != this.m_cardHelper.getTip());
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
        if (this.m_cardHelper._curLocalIdx == 0) {
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
            if (state > eRoomState.eRoomState_DecideBanker && roomInfo.diPai && roomInfo.diPai.length > 0) {
                let times: number = Math.pow(2, roomInfo.bombCnt);
                this.updateBottomRootLayer(roomInfo.diPai, roomInfo.bottom, times);
            }
            else {
                this.m_bottomCardRootLayer.resetBottomCards();
            }

            if (state == eRoomState.eRoomState_DDZ_Chu) {
                this._bankerProduced = true;
                let bankerIdx = roomInfo.dzIdx;

                let clientIdx = this.getLocalIDByChairID(bankerIdx);
                let player: DDZPlayerItem = this.m_playerRootLayer.getPlayerByClientIdx(clientIdx);

                cc.log('wd debug updateRoomView setIsBanker true');
                player && player.setIsBanker(true);
            }
            else {
                this._bankerProduced = false;
            }

            if (stateInfo) {
                this.setCurLocalChairID(stateInfo.curActIdx);

                if (state == eRoomState.eRoomSate_WaitReady || state == eRoomState.eRoomState_GameEnd) {
                    this.m_btnGroupController.hideAll();
                }
                else {
                    let clientIdx: number = this.getLocalIDByChairID(this.m_curServerActIdx);
                    this.m_countDownRootLayer.showCountDown(roomInfo.stateTime, clientIdx);

                    this.sendOutCard(clientIdx, [], DDZ_Type.DDZ_Max);

                    let playerItem: DDZPlayerItem = this.m_playerRootLayer.getPlayerByClientIdx(clientIdx);
                    if (playerItem) {
                        playerItem.setState(EmDDZPlayerState.State_None);
                    }

                    if (state == eRoomState.eRoomState_DecideBanker) {
                        this.updateOptions(false);
                        let robInfos: DDZRobInfo[] = stateInfo.readyPlayers;
                        this._updateRobState(stateInfo.curActIdx, robInfos);
                    }
                    else {
                        this.updateOptions(true);
                    }
                }
            }
        }
    }

    updatePlayerData(serverChairID) {
        let clientIdx = this.getLocalIDByChairID(serverChairID);
        if (clientIdx == -1) {
            cc.warn('updatePlayerData invalid clientIdx, serverChairID =', serverChairID);
            return;
        }

        this.m_playerRootLayer.refreshPlayerItem(clientIdx, serverChairID);
    }

    standUp(serverChairID) {
        // let clientIdx = this.getLocalIDByChairID(serverChairID);

        // if (clientIdx == 0) {
        //     this.clearTable();
        // }
        // else {
        //     this.m_playerRootLayer.hide(clientIdx);
        // }
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
            this.setCurLocalChairID(roomInfo.stateInfo.curActIdx);

            this._updateCardHelperData(roomInfo.stateInfo.lastChu);

            this._updateCardConsole(roomInfo.stateInfo.lastChu)
        }
    }

    private _getPreActIdx(idx: number): number {
        return (idx + MAXPLAYER - 1) % MAXPLAYER;
    }

    private _updateCardHelperData(lastDiscardInfos: DDZLastDiscardInfo[]) {
        let tmpServerActIdx: number = this.m_curServerActIdx;

        for (let i = 0; i < MAXPLAYER; ++i) {
            let lastServerIdx: number = this._getPreActIdx(tmpServerActIdx);

            let targetDiscardInfo: DDZLastDiscardInfo =
                _.find(lastDiscardInfos, (info: DDZLastDiscardInfo) => {
                    return info.idx == lastServerIdx;
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

            tmpServerActIdx = this._getPreActIdx(tmpServerActIdx);
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

    private _clearAllPlayerState() {
        for (let i = 0; i < MAXPLAYER; ++i) {
            this.setStateTag(i, EmDDZPlayerState.State_None);
        }
    }

    private _updateRobState(curIdx: number, robInfos: DDZRobInfo[]) {
        if (robInfos && robInfos.length > 0) {
            _.forEach(robInfos, (robInfo: DDZRobInfo) => {
                if (this.getLocalIDByChairID(curIdx) == 0) {
                    this.m_btnGroupController.updateRobEnable(robInfo.times);
                }
                else {
                    this.setStateTag(robInfo.idx, this._getStateByTimes(robInfo.times));
                }
            });
        }
    }

    private _updateSelfPlayer() {
        let playerItem: DDZPlayerItem = this.m_playerRootLayer.getPlayerByClientIdx(0);

        playerItem.refreshViewBySelfData();
        this.m_currencyRootLayer.refreshInfo();
    }

    private _getEffectType(type: DDZ_Type): DDZAnimType {
        let ret: DDZAnimType = DDZAnimType.Type_None;
        switch (type) {
            case DDZ_Type.DDZ_SingleSequence: {
                ret = DDZAnimType.Type_SingleSequence;
                break;
            }
            case DDZ_Type.DDZ_PairSequence: {
                ret = DDZAnimType.Type_PairSequence;
                break;
            }
            case DDZ_Type.DDZ_3PicesSeqence:
            case DDZ_Type.DDZ_AircraftWithWings: {
                ret = DDZAnimType.Type_Aircraft;
                break;
            }
            case DDZ_Type.DDZ_Bomb: {
                ret = DDZAnimType.Type_Bomb;
                break;
            }
            case DDZ_Type.DDZ_Rokect: {
                ret = DDZAnimType.Type_Rokect;
                break;
            }
            default: {
                break;
            }
        }

        return ret;
    }

    private _doPlaySpecialEffect(effectType: DDZAnimType, clientIdx: number) {
        this.m_animationRootLayer.playSpecialEffect(effectType, clientIdx);
    }

    private _needShowMyTurnNode(): boolean {
        if (this.getLocalIDByChairID(this.m_curServerActIdx) != 0) {
            return false;
        }

        let roomInfo: DDZRoomInfo = DDZGameDataLogic.getInstance().getRoomInfo();
        if (roomInfo.state == eRoomState.eRoomState_DecideBanker && this._bankerProduced) {
            return true;
        }

        if (roomInfo.state != eRoomState.eRoomState_DDZ_Chu) {
            return false;
        }

        return true;
    }
};
