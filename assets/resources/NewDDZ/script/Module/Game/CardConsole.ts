const { ccclass, property } = cc._decorator;

import * as _ from 'lodash';

import GameLogic from './GameLogic';
import { DDZCardType, SortType, DDZ_Type } from '../DDZGameDefine';
import TableMainUI from '../../UI/TableMainUI';
import CardHelper from '../../Control/CardHelper';

let GameLogicIns = GameLogic.getInstance();

var PlayerCount = 3;
var MaxOutCardLineNode = 10;
var DispatchCardActTime = 0.10;
var DropCardActTime = 0.3;
var SequenceActTime = 0.15;
var AddCardNodeOffset = 40.0;
var SequenceCardOffset = 80.0;
var OutCardScale = 0.5;

@ccclass
export default class CardConsole extends cc.Component {

    @property(cc.Node)
    m_startCardPosNode: cc.Node[] = [];
    @property(cc.Node)
    m_outCardPosNode: cc.Node[] = [];

    @property(CardHelper)
    m_helper: CardHelper = null;

    @property(cc.Prefab)
    m_cardPrefab: cc.Prefab = null;

    @property
    m_consoleActive: boolean = false;

    @property
    m_touchBegan: boolean = false;

    @property
    m_startGrayIDX: number = -1;

    @property
    m_endGrayIDX: number = -1;

    @property
    m_moveCards: boolean = false;

    _grayCardVec = [];
    _selectedCardVec = [];
    m_handCardNodeMap = null;
    m_tableMainView: TableMainUI = null;

    setConsoleEnable(enable) {
        this.m_consoleActive = enable;
    }

    init(view: TableMainUI) {
        this.m_tableMainView = view;
        this.node.on('touchstart', this.onTouchBegan.bind(this));
        this.node.on('touchmove', this.onTouchMoved.bind(this));
        this.node.on('touchend', this.onTouchEnded.bind(this));
        this.node.on('touchcancel', this.onTouchEnded.bind(this));

        this._selectedCardVec = [];//stand cards
        this._grayCardVec = [];//gray cards
        this.m_handCardNodeMap = {};//id->vec[node]
        for (let i = 0; i < PlayerCount; i++) {
            this.m_handCardNodeMap[i] = [];
        }
    }

    showDisPatchCards(localChairID, handCardData) {
        var cardNodePrefab = this.m_cardPrefab;
        let demoNode = cc.instantiate(cardNodePrefab);
        let cardNum = handCardData.length;
        let cardNodesLength = demoNode.width / 3.5 * (cardNum - 1) + demoNode.width;
        let curHandCardNodeVec = this.m_handCardNodeMap[localChairID];
        let startPosNode = this.m_startCardPosNode[localChairID];
        let startPos = startPosNode.getPosition();
        for (let i = 0; i < cardNum; i++) {
            let n = cc.instantiate(cardNodePrefab);
            n.getComponent('PokerCardNode').initWithCardData(handCardData[i]);
            this.node.addChild(n);
            curHandCardNodeVec.push(n);
            this.m_handCardNodeMap[localChairID] = curHandCardNodeVec;
            n.setPosition(cc.p(startPos.x, startPos.y));
        }
        this.sortZOrder(localChairID);
        this.moveDispatchCards(localChairID, handCardData);
    }

    moveDispatchCards(localChairID, handCardData) {
        if (handCardData.length == 0) {
            return;
        }
        this.m_moveCards = true;

        let startPosNode = this.m_startCardPosNode[localChairID];
        let startPos = startPosNode.getPosition();
        let cardNum = handCardData.length;
        let curHandCardNodeVec = this.m_handCardNodeMap[localChairID];
        let demoNode = curHandCardNodeVec[0];
        let act = [];
        let step = cardNum - 1;
        let demoW = demoNode.width;
        while (step >= 0) {
            let spawnAct = [];
            let cardNodesLength = demoNode.width / 3.5 * (cardNum - step - 1) + demoW;
            let startPosTemp = startPosNode.getPosition().x - (cardNodesLength / 2.0 - demoW / 2.0);
            let i = 0;
            let finalPosX = 0.0;
            for (; i < cardNum - step; i++) {
                let tempNode = curHandCardNodeVec[i];
                let tempPos = tempNode.getPosition();
                let dstPosX = startPosTemp + demoW / 3.5 * i;
                finalPosX = dstPosX;
                let curAct = cc.callFunc(() => {
                    tempNode.runAction(cc.moveTo(DispatchCardActTime, cc.p(dstPosX, tempPos.y)));
                });
                spawnAct.push(curAct);
            }
            if (step > 0) {
                for (; i < cardNum; i++) {
                    let tempNode = curHandCardNodeVec[i];
                    let tempPos = tempNode.getPosition();
                    let curAct = cc.callFunc(() => {
                        tempNode.runAction(cc.moveTo(DispatchCardActTime, cc.p(finalPosX, tempPos.y)));
                    });
                    spawnAct.push(curAct);
                }
            }
            if (spawnAct.length == 1) {
                act.push(spawnAct[0]);
            } else {
                act.push(cc.spawn(spawnAct));
            }
            act.push(cc.delayTime(DispatchCardActTime));
            step--;
        }
        act.push(cc.callFunc(() => {
            this.dispathCardsCompelete(handCardData);
        }));
        this.node.runAction(cc.sequence(act));
    }

    moveCards(localChairID, handCardData) {
        if (handCardData.length == 0) {
            return;
        }
        this.m_moveCards = true;
        let curHandCardNodeVec = this.m_handCardNodeMap[localChairID];
        let demoNode = curHandCardNodeVec[0];
        let cardNodesLength = demoNode.width / 3.5 * (handCardData.length - 1) + demoNode.width;
        let startPosNode = this.m_startCardPosNode[localChairID];
        let startPos = startPosNode.getPosition();
        startPos.x -= cardNodesLength / 2.0 - demoNode.width / 2.0;
        let act = [];
        let spawnAct = [];
        for (let i = 0; i < handCardData.length; i++) {
            let tempNode = curHandCardNodeVec[i];
            let tempPos = tempNode.getPosition();
            let dstPosX = startPos.x + demoNode.width / 3.5 * i;
            let curAct = cc.callFunc(() => {
                tempNode.stopAllActions();
                tempNode.runAction(cc.moveTo(DispatchCardActTime, cc.p(dstPosX, tempPos.y)));
            });
            spawnAct.push(curAct);
        }
        if (spawnAct.length == 1) {
            act.push(spawnAct[0]);
        } else {
            act.push(cc.spawn(spawnAct));
        }
        act.push(cc.delayTime(DispatchCardActTime));
        act.push(cc.callFunc(() => {
            this.dispathCardsCompelete(handCardData);
        }));
        this.node.runAction(cc.sequence(act));
    }

    addMoveCards(localChairID, handCardData, addCardDataVec, addCardNodeVec) {
        if (handCardData.length == 0) {
            return;
        }
        this.m_moveCards = true;
        let curHandCardNodeVec = this.m_handCardNodeMap[localChairID];
        let demoNode = curHandCardNodeVec[0];
        let cardNodesLength = demoNode.width / 3.5 * (handCardData.length - 1) + demoNode.width;
        let startPosNode = this.m_startCardPosNode[localChairID];
        let startPos = startPosNode.getPosition();
        startPos.x -= cardNodesLength / 2.0 - demoNode.width / 2.0;
        let act = [];
        let spawnAct = [];
        let needDrop = false;
        let dropSpawnAct = [];
        for (let i = 0; i < handCardData.length; i++) {
            let needDrop = this.checkContain(addCardDataVec, handCardData[i]);
            let tempNode = curHandCardNodeVec[i];
            let tempPos = tempNode.getPosition();
            let dstPosX = startPos.x + demoNode.width / 3.5 * i;
            let curAct = null;
            if (needDrop) {
                curAct = cc.callFunc(() => {
                    tempNode.stopAllActions();
                    tempNode.runAction(cc.moveTo(DropCardActTime, cc.p(dstPosX, startPosNode.y)));
                });
                dropSpawnAct.push(curAct);
            } else {
                curAct = cc.callFunc(() => {
                    tempNode.stopAllActions();
                    tempNode.runAction(cc.moveTo(DispatchCardActTime, cc.p(dstPosX, startPosNode.y)));
                });
                spawnAct.push(curAct);
            }
        }
        if (spawnAct.length == 1) {
            act.push(spawnAct[0]);
        } else {
            act.push(cc.spawn(spawnAct));
        }
        act.push(cc.delayTime(DispatchCardActTime));
        act.push(cc.spawn(dropSpawnAct));
        act.push(cc.delayTime(DropCardActTime));
        act.push(cc.callFunc(() => {
            this.dispathCardsCompelete(handCardData);
        }));
        this.node.runAction(cc.sequence(act));

    }

    showHandCard(localChairID, handCardData) {
        var cardNodePrefab = this.m_cardPrefab;
        let demoNode = cc.instantiate(cardNodePrefab);
        let cardNodesLength = demoNode.width / 3.5 * (handCardData.length - 1) + demoNode.width;
        let curHandCardNodeVec = this.m_handCardNodeMap[localChairID];
        let startPosNode = this.m_startCardPosNode[localChairID];
        let startPos = startPosNode.getPosition();
        startPos.x -= cardNodesLength / 2.0 - demoNode.width / 2.0;
        if (curHandCardNodeVec.length == 0) {
            for (let i = 0; i < handCardData.length; i++) {
                let n = cc.instantiate(cardNodePrefab);
                n.getComponent('PokerCardNode').initWithCardData(handCardData[i]);
                this.node.addChild(n);
                curHandCardNodeVec.push(n);
                n.setPosition(cc.p(startPos.x + n.width / 3.5 * i, startPos.y));
            }
            this.m_handCardNodeMap[localChairID] = curHandCardNodeVec;
        } else {
            //need move act
            //same card checkPos
            let curHandCardNodeVec = this.m_handCardNodeMap[localChairID];
            if (curHandCardNodeVec.length == handCardData.length) {
                for (let i = 0; i < handCardData.length; i++) {
                    let n = curHandCardNodeVec[i];
                    n.stopAllActions();
                    n.setPosition(cc.p(startPos.x + n.width / 3.5 * i, startPos.y));
                }
            } else if (curHandCardNodeVec.length > handCardData.length) {
                this.showHandCardNeedRomoveNew(localChairID, handCardData);
            } else {
                this.showHandCardNeedAdd(localChairID, handCardData);
            }
        }
        this.sortZOrder(localChairID);
    }

    sortZOrder(localChairID) {
        let curHandCardNodeVec = this.m_handCardNodeMap[localChairID];
        for (let i = 0; i < curHandCardNodeVec.length; i++) {
            curHandCardNodeVec[i].setLocalZOrder(i);
        }
    }

    onTouchBegan(event) {
        if (this.m_moveCards) {
            return;
        }
        this.checkTouchPosContainCardNode(event.getLocation());
        this.m_touchBegan = this.m_startGrayIDX > -1;
        if (this.m_touchBegan) {
            this.checkGrayCard();
        }
    }

    onTouchMoved(event) {
        if (!this.m_touchBegan) {
            return;
        }
        this.checkTouchMove(event.getLocation());
        this.checkGrayCard();
    }

    onTouchEnded(event) {
        if (!this.m_touchBegan) {
            return;
        }
        //this.normalStandCard();
        this.checkStandCardContainAutoStand();
        this.m_touchBegan = false;

        this.m_tableMainView && this.m_tableMainView.analyeMyCard();
    }

    checkTouchPosContainCardNode(touchPos) {
        this.m_startGrayIDX = -1;
        this.m_endGrayIDX = -1;
        let curCardNodeVec = this.m_handCardNodeMap[0];
        for (let i = curCardNodeVec.length - 1; i >= 0; i--) {
            let n = curCardNodeVec[i];
            let p = n.convertToWorldSpace(cc.v2(0, 0));
            let rect = new cc.Rect(p.x, p.y, n.width, n.height);
            if (rect.contains(touchPos)) {
                this.m_startGrayIDX = i;
                this.m_endGrayIDX = i;
                break;
            }
        }
    }

    checkTouchMove(touchPos) {
        let curCardNodeVec = this.m_handCardNodeMap[0];
        for (let i = curCardNodeVec.length - 1; i >= 0; i--) {
            let n = curCardNodeVec[i];
            let p = n.convertToWorldSpace(cc.v2(0, 0));
            let rect = new cc.Rect(p.x, p.y, n.width, n.height);
            touchPos.y = p.y + n.height / 2.0;
            if (rect.contains(touchPos)) {
                this.m_endGrayIDX = i;
                break;
            }
        }
    }

    checkGrayCard() {
        let curCardNodeVec = this.m_handCardNodeMap[0];
        let maxID = this.m_startGrayIDX > this.m_endGrayIDX ? this.m_startGrayIDX : this.m_endGrayIDX;
        let minID = this.m_startGrayIDX < this.m_endGrayIDX ? this.m_startGrayIDX : this.m_endGrayIDX;
        let cardNode = null;
        this._grayCardVec = [];
        for (let i = 0; i < minID; i++) {
            cardNode = curCardNodeVec[i];
            let comp = cardNode.getComponent('PokerCardNode');
            comp.setCardGray(false);
        }

        for (let i = minID; i <= maxID; i++) {
            cardNode = curCardNodeVec[i];
            let comp = cardNode.getComponent('PokerCardNode');
            comp.setCardGray(true);
            this._grayCardVec.push(cardNode);
        }

        for (let i = maxID + 1; i < curCardNodeVec.length; i++) {
            cardNode = curCardNodeVec[i];
            let comp = cardNode.getComponent('PokerCardNode');
            comp.setCardGray(false);
        }
        // console.log('GrayCards:' + this._grayCardVec.length);
    }

    checkStandCardContainAutoStand() {//include auto stand process
        if (this._grayCardVec.length == 0) {
            return;
        }
        let needCheckLine = this._grayCardVec.length > 1;
        // console.log("selectedCard0: " + this._selectedCardVec.length);
        let preSelectedCardData = this.getSelectedCardsVec();
        let lineSelectedCardDataVecPre = this.checkCanBeLine(preSelectedCardData);//pre selectedCards
        let grayCardData = this.getGrayCardsVec();
        let allPreSeleGray = true;
        for (let i = 0; i < preSelectedCardData.length; i++) {
            if (!this.checkContain(grayCardData, preSelectedCardData[i])) {
                allPreSeleGray = false;
                break;
            }
        }
        let standGrayCardNodeVec = [];
        let needAddSelectedCardNodeVec = [];
        let needAddSelectedCardDataVec = [];
        let grayLineCardDataVec = [];
        if (needCheckLine) {
            grayLineCardDataVec = this.checkCanBeLine(grayCardData);//cur GrayCards
        }
        for (let i = 0; i < this._grayCardVec.length; i++) {
            let cardNodeTemp = this._grayCardVec[i];
            let comp = cardNodeTemp.getComponent('PokerCardNode');
            let cardDataTmp = comp._cardData;
            if (this.checkContain(preSelectedCardData, cardDataTmp)) {
                standGrayCardNodeVec.push(cardNodeTemp);
            } else {
                needAddSelectedCardNodeVec.push(cardNodeTemp);
                needAddSelectedCardDataVec.push(cardDataTmp);
            }
        }
        if (needAddSelectedCardDataVec.length == 0) {
            this.normalStandCard();
            return;
        }
        preSelectedCardData = preSelectedCardData.concat(needAddSelectedCardDataVec);
        let lineFusionCardDataVecCur = this.checkCanBeLine(preSelectedCardData);//fusion selectedCards
        let fusionLineCardLen = lineFusionCardDataVecCur.length;
        let preSelectLineCardLen = lineSelectedCardDataVecPre.length;
        let grayLineCardLen = grayLineCardDataVec.length;
        let dstStandCards = [];
        if (needCheckLine) {
            if (fusionLineCardLen == 0) {
                this.normalStandCard();
                return;
            } else if (fusionLineCardLen > preSelectLineCardLen) {
                //stand lineFusionCardDataVecCur
                dstStandCards = lineFusionCardDataVecCur;
            } else {//fusionLineCardLen <= preSelectLineCardLen
                if (grayLineCardLen == 0) {
                    this.normalStandCard();
                    return;
                } else {
                    if (allPreSeleGray) {//preSelectedCard all gray
                        this.normalStandCard();
                        return;
                    } else {
                        dstStandCards = grayLineCardDataVec;
                    }
                }
            }
        } else {
            this.normalStandCard();
            return;
        }

        for (let i = 0; i < this._grayCardVec.length; i++) {
            let tempNode = this._grayCardVec[i];
            let comp = tempNode.getComponent('PokerCardNode');
            comp.setCardGray(false);
            if (comp._selectedState) {//need to sit
                comp.sitCard();
                this.popSelectedCardNode(tempNode);
            } else {//need to stand
                comp.standCard();
                this._selectedCardVec.push(tempNode);
            }
        }
        this._grayCardVec = [];
        this.standCardByLineCardData(dstStandCards);

        if (this.m_tableMainView && this.m_consoleActive) {
            let selectedCardDataVec = this.getSelectedCardsVec();
            this.m_tableMainView.checkSelectedCardCanOffer(selectedCardDataVec, true);
        }
    }

    normalStandCard() {
        if (this._grayCardVec.length == 0) {
            return;
        }
        for (let i = 0; i < this._grayCardVec.length; i++) {
            let tempNode = this._grayCardVec[i];
            let comp = tempNode.getComponent('PokerCardNode');
            comp.setCardGray(false);
            if (comp._selectedState) {//need to sit
                comp.sitCard();
                this.popSelectedCardNode(tempNode);
            } else {//need to stand
                comp.standCard();
                this._selectedCardVec.push(tempNode);
            }
        }
        this._grayCardVec = [];
        // console.log("selectedCard0: " + this._selectedCardVec.length);
        if (this.m_tableMainView && this.m_consoleActive) {
            let selectedCardDataVec = this.getSelectedCardsVec();
            let needCompare = this.m_helper._curIdx != 0;
            this.m_tableMainView.checkSelectedCardCanOffer(selectedCardDataVec, needCompare);
        }

    }

    checkCanBeLine(cardDataVec) {
        let curSelectedCardVec = cardDataVec;
        if (curSelectedCardVec.length > 5) {
            let lineResult = GameLogicIns.searchLineFromCardVec(curSelectedCardVec);
            if (lineResult == null) {
                return [];
            }
            let pSearchResult = lineResult.searchResult;
            let maxLineID = 0;
            let maxLineCount = pSearchResult.cbCardCount[0];
            //find maxLine
            for (let i = 1; i < pSearchResult.cbSearchCount.length; i++) {
                if (pSearchResult.cbCardCount[i] > maxLineCount) {
                    maxLineCount = pSearchResult.cbCardCount[i];
                    maxLineID = i;
                }
            }
            let lineDataVec = [];
            for (let i = 0; i < pSearchResult.cbCardCount[maxLineID]; i++) {
                lineDataVec.push(pSearchResult.cbResultCard[maxLineID][i]);
            }
            return lineDataVec;
        }
        return [];
    }

    standCardByLineCardData(lineDataVec) {
        let curSelectedCardVec = this.getSelectedCardsVec();
        for (let i = 0; i < curSelectedCardVec.length; i++) {
            let curCardData = curSelectedCardVec[i];
            if (!this.checkContain(lineDataVec, curCardData)) {
                let tempNode = this.findSelectedNodeByCardData(curCardData);
                if (tempNode) {
                    let comp = tempNode.getComponent('PokerCardNode');
                    if (comp._selectedState) {//need to sit
                        comp.sitCard();
                        this.popSelectedCardNode(tempNode);
                    }
                }
            }
        }
        //stand some unselectedCards
        let curHandCardNodeVec = this.m_handCardNodeMap[0];
        for (let i = 0; i < curHandCardNodeVec.length; i++) {
            let tempNode = curHandCardNodeVec[i];
            let comp = tempNode.getComponent('PokerCardNode');
            let curCardData = comp._cardData;
            if (!this.checkContain(curSelectedCardVec, curCardData) && this.checkContain(lineDataVec, curCardData)) {
                if (!comp._selectedState) {//need to sit
                    comp.standCard();
                    this._selectedCardVec.push(tempNode);
                }
            }
        }
    }

    popSelectedCardNode(node) {
        for (let i = 0; i < this._selectedCardVec.length; i++) {
            if (this._selectedCardVec[i] == node) {
                this._selectedCardVec.splice(i, 1);
            }
        }
    }

    onDestroy() {
        this.node.off('touchstart', this.onTouchBegan.bind(this));
        this.node.off('touchmove', this.onTouchMoved.bind(this));
        this.node.off('touchend', this.onTouchEnded.bind(this));
    }

    dispathCardsCompelete(handCardData) {
        this.m_moveCards = false;
        this.showHandCard(0, handCardData);
    }

    findSelectedNodeByCardData(cardData) {
        for (let i = 0; i < this._selectedCardVec.length; i++) {
            if (this._selectedCardVec[i].getComponent('PokerCardNode')._cardData == cardData) {
                return this._selectedCardVec[i];
            }
        }
        return null;
    }

    checkContain(cardDataVec, cardData) {
        for (let i = 0; i < cardDataVec.length; i++) {
            if (cardDataVec[i] == cardData) {
                return true;
            }
        }
        return false;
    }

    showHandCardNeedRomoveNew(localChairID, handCardData) {
        let curCardNodeVec = this.m_handCardNodeMap[localChairID];
        let curCardNum = handCardData.length;
        if (curCardNum == curCardNodeVec.length) {
            return;
        }

        let restIdxList: number[] = [];
        for (let i = 0; i < handCardData.length; i++) {
            let curCard = handCardData[i];
            for (let j = 0; j < curCardNodeVec.length; j++) {
                let curNode = curCardNodeVec[j];
                let cardNum = curNode.getComponent('PokerCardNode')._cardData;
                if (curCard == cardNum) {
                    restIdxList.push(j);
                    break;
                }
            }
        }
        cc.log('wd debug restIdxList =', restIdxList);

        let newVec: cc.Node[] = [];
        for (let i = 0; i < curCardNodeVec.length; i++) {
            if (-1 != _.findIndex(restIdxList, (number) => {
                return number == i;
            })) {
                newVec.push(curCardNodeVec[i]);
            }
            else {
                curCardNodeVec[i].destroy();
            }
        }
        cc.log('wd debug newVec.length =', newVec.length);

        this.m_handCardNodeMap[localChairID] = newVec;
        if (newVec.length == 0) {
            return;
        }
        this.moveCards(localChairID, handCardData);
    }

    // showHandCardNeedRomove(localChairID, handCardData) {
    //     let curCardNodeVec = this.m_handCardNodeMap[localChairID];
    //     let curCardNum = handCardData.length;
    //     if (curCardNum == curCardNodeVec.length) {
    //         return;
    //     }
    //     for (let i = 0; i < curCardNodeVec.length; i++) {
    //         let curNode = curCardNodeVec[i];
    //         let cardNum = curNode.getComponent('PokerCardNode')._cardData;
    //         if (!this.checkContain(handCardData, cardNum)) {
    //             curNode.destroy();
    //             curCardNodeVec.splice(i, 1);
    //             i--;
    //         }
    //     }
    //     this.m_handCardNodeMap[localChairID] = curCardNodeVec;
    //     if (curCardNodeVec.length == 0) {
    //         return;
    //     }
    //     this.moveCards(localChairID, handCardData);
    // }

    showHandCardNeedAdd(localChairID, handCardData) {
        let curCardNodeVec = this.m_handCardNodeMap[localChairID];
        let curCardNum = handCardData.length;
        if (curCardNum == curCardNodeVec.length) {
            return;
        }
        let needMoveCardNodeVec = curCardNodeVec;
        let addCardDataVec = [];
        let addCardNodeVec = [];
        let curHandCardDataVec = [];
        let cardDataPosMap = {};
        let nodeCardMap = {};
        for (let i = 0; i < curCardNodeVec.length; i++) {
            let curNode = curCardNodeVec[i];
            let cardNum = curNode.getComponent('PokerCardNode')._cardData;
            curHandCardDataVec.push(cardNum);
            nodeCardMap[cardNum] = curCardNodeVec[i];
        }
        for (let i = 0; i < handCardData.length; i++) {
            if (!this.checkContain(curHandCardDataVec, handCardData[i])) {
                addCardDataVec.push(handCardData[i]);
                cardDataPosMap[handCardData[i]] = i;
            }
        }

        var cardNodePrefab = this.m_cardPrefab;
        let demoNode = cc.instantiate(cardNodePrefab);
        let cardNodesLength = demoNode.width / 3.5 * (curCardNodeVec.length - 1 + addCardDataVec.length) + demoNode.width;
        let startPosNode = this.m_startCardPosNode[localChairID];
        let startPos = startPosNode.getPosition();
        startPos.x -= cardNodesLength / 2.0 - demoNode.width / 2.0;
        for (let i = 0; i < addCardDataVec.length; i++) {
            let n = cc.instantiate(cardNodePrefab);
            n.getComponent('PokerCardNode').initWithCardData(addCardDataVec[i]);
            this.node.addChild(n);
            curCardNodeVec.push(n);
            let dstPosID = cardDataPosMap[addCardDataVec[i]];
            n.setPosition(cc.p(startPos.x + n.width / 3.5 * dstPosID, startPos.y + AddCardNodeOffset));
            addCardNodeVec.push(n);
            nodeCardMap[addCardDataVec[i]] = n;
        }
        curCardNodeVec = [];
        //sort curCardNodeVec
        for (let i = 0; i < handCardData.length; i++) {
            curCardNodeVec.push(nodeCardMap[handCardData[i]]);
        }
        this.m_handCardNodeMap[localChairID] = curCardNodeVec;
        this.sortZOrder(localChairID);
        this.addMoveCards(localChairID, handCardData, addCardDataVec, addCardNodeVec);
    }

    showOutCard(localChairID: number, outCardVec: number[], serverCardType: DDZ_Type) {
        this._clearOutCard(localChairID);
        this._clearSelectedCards();
        outCardVec = GameLogicIns.sortCardList(outCardVec, SortType.ST_NORMAL);
        let localCardType = GameLogicIns.switchServerTypeToCardType(serverCardType, outCardVec);
        let outCardPosNode = this.m_outCardPosNode[localChairID];
        //parse to type cardDataVec
        let parseCardVec = GameLogicIns.parseToCardType(outCardVec, localCardType);
        let node = this.showMoveOutCardEffect(localChairID != 1, localChairID != 0, parseCardVec, localCardType);
        let nodeWidth = node.width;
        let nodeHeight = node.height;
        outCardPosNode.addChild(node);
        switch (localChairID) {
            case 0:
                node.setPosition(cc.Vec2.ZERO);
                break;
            case 1:
                node.setPosition(cc.p(-nodeWidth / 2.0, 0.0));
                break;
            case 2:
                node.setPosition(cc.p(nodeWidth / 2.0, 0.0));
                break;
            default:
                break;
        }
    }

    showMoveOutCardEffect(isFromLeft, needSecondLine, outCardVec, cardType) {
        var node = new cc.Node('OutCardNode');
        if (cardType > DDZCardType.Type_DuiZi && cardType < DDZCardType.Type_ZhaDan_1) {//ShunZI
            var cardNodePrefab = this.m_cardPrefab;
            let demoNode = cc.instantiate(cardNodePrefab);
            let startPos = cc.p(0, 0);
            let actStartPos = cc.p(0, 0);
            let lineCount = Math.floor(outCardVec.length / MaxOutCardLineNode);
            let cardNodesLength = 0;
            let cardNodesHeight = 0;
            if (needSecondLine) {
                if (lineCount == 0) {
                    cardNodesLength = demoNode.width / 2.0 * OutCardScale * (outCardVec.length - 1) +
                        demoNode.width * OutCardScale;
                    cardNodesHeight = demoNode.height * OutCardScale;
                } else {
                    cardNodesLength = demoNode.width / 2.0 * OutCardScale * (MaxOutCardLineNode - 1) +
                        demoNode.width * OutCardScale;
                    cardNodesHeight = demoNode.height * 0.6 * OutCardScale * lineCount +
                        demoNode.height * OutCardScale;
                }
            } else {
                cardNodesLength = demoNode.width / 2.0 * OutCardScale * (outCardVec.length - 1) +
                    demoNode.width * OutCardScale;
                cardNodesHeight = demoNode.height * OutCardScale;
            }

            node.width = cardNodesLength;
            node.height = cardNodesHeight;
            if (isFromLeft) {
                startPos.x -= cardNodesLength / 2.0 - demoNode.width / 2.0 * OutCardScale;
                actStartPos.x = startPos.x - SequenceCardOffset;
            } else {
                startPos.x += cardNodesLength / 2.0 - demoNode.width / 2.0 * OutCardScale;
                actStartPos.x = startPos.x + SequenceCardOffset;
            }
            startPos.y += cardNodesHeight / 2.0 - demoNode.height / 2.0 * OutCardScale;
            var spawnAct = [];
            for (let i = 0; i < outCardVec.length; i++) {
                let n = cc.instantiate(cardNodePrefab);
                n.getComponent('PokerCardNode').initWithCardData(outCardVec[i]);
                n.setScale(OutCardScale);
                node.addChild(n);
                if (needSecondLine) {
                    n.setLocalZOrder(isFromLeft ? i : Math.floor(i / MaxOutCardLineNode) *
                        MaxOutCardLineNode + MaxOutCardLineNode - (i % MaxOutCardLineNode));
                } else {
                    n.setLocalZOrder(i);
                }

                if (needSecondLine) {
                    if (i >= MaxOutCardLineNode) {
                        if (isFromLeft) {
                            n.setPosition(cc.p(actStartPos.x, startPos.y - n.height * 0.6 * OutCardScale - n.height / 2.0 *
                                OutCardScale));
                            let curAct = cc.callFunc(() => {
                                n.stopAllActions();
                                n.runAction(cc.moveTo(SequenceActTime, cc.p(startPos.x + n.width / 2.0 *
                                    OutCardScale * (i - MaxOutCardLineNode), startPos.y - n.height * 0.6 * OutCardScale -
                                    n.height / 2.0 * OutCardScale)).easing(cc.easeOut(0.8)));
                            });
                            spawnAct.push(curAct);
                        } else {
                            n.setPosition(cc.p(actStartPos.x, startPos.y - n.height * 0.6 * OutCardScale - n.height / 2.0 *
                                OutCardScale));
                            let curAct = cc.callFunc(() => {
                                n.stopAllActions();
                                n.runAction(cc.moveTo(SequenceActTime, cc.p(startPos.x - n.width / 2.0 *
                                    OutCardScale * (i - MaxOutCardLineNode), startPos.y - n.height * 0.6 * OutCardScale -
                                    n.height / 2.0 * OutCardScale)).easing(cc.easeOut(0.8)));
                            });
                            spawnAct.push(curAct);
                        }
                    } else {
                        n.setPosition(cc.p(actStartPos.x, startPos.y - n.height * 0.6 * OutCardScale));
                        if (isFromLeft) {
                            let curAct = cc.callFunc(() => {
                                n.stopAllActions();
                                n.runAction(cc.moveTo(SequenceActTime, cc.p(startPos.x + n.width / 2.0 *
                                    OutCardScale * i, startPos.y - n.height * 0.6 * OutCardScale)).easing(cc.easeOut(0.8)));
                            });
                            spawnAct.push(curAct);
                        } else {
                            let curAct = cc.callFunc(() => {
                                n.stopAllActions();
                                n.runAction(cc.moveTo(SequenceActTime, cc.p(startPos.x - n.width / 2.0 *
                                    OutCardScale * i, startPos.y - n.height * 0.6 * OutCardScale)).easing(cc.easeOut(0.8)));
                            });
                            spawnAct.push(curAct);
                        }
                    }
                } else {
                    n.setPosition(cc.p(actStartPos.x, startPos.y));
                    let curAct = cc.callFunc(() => {
                        n.stopAllActions();
                        n.runAction(cc.moveTo(SequenceActTime, cc.p(startPos.x + n.width / 2.0 *
                            OutCardScale * i, startPos.y)).easing(cc.easeOut(1.0)));
                    });
                    spawnAct.push(curAct);
                }
            }
            node.runAction(cc.spawn(spawnAct));
        } else {//BOUNCE EFFECT
            var cardNodePrefab = this.m_cardPrefab;
            let demoNode = cc.instantiate(cardNodePrefab);
            let startPos = cc.p(0, 0);
            let lineCount = Math.floor(outCardVec.length / MaxOutCardLineNode);
            let cardNodesLength = 0;
            let cardNodesHeight = 0;
            if (lineCount == 0) {
                cardNodesLength = demoNode.width / 2.0 * OutCardScale * (outCardVec.length - 1) +
                    demoNode.width * OutCardScale;
                cardNodesHeight = demoNode.height * OutCardScale;
            } else {
                cardNodesLength = demoNode.width / 2.0 * OutCardScale * (MaxOutCardLineNode - 1) +
                    demoNode.width * OutCardScale;
                cardNodesHeight = demoNode.height * 0.6 * OutCardScale * (lineCount - 1) +
                    demoNode.height * OutCardScale;
            }
            node.width = cardNodesLength;
            node.height = cardNodesHeight;
            if (isFromLeft) {
                startPos.x -= cardNodesLength / 2.0 - demoNode.width / 2.0 * OutCardScale;
            } else {
                startPos.x += cardNodesLength / 2.0 - demoNode.width / 2.0 * OutCardScale;
            }
            startPos.y += cardNodesHeight / 2.0 - demoNode.height / 2.0 * OutCardScale;
            for (let i = 0; i < outCardVec.length; i++) {
                let n = cc.instantiate(cardNodePrefab);
                n.getComponent('PokerCardNode').initWithCardData(outCardVec[i]);
                n.setScale(OutCardScale);
                node.addChild(n);
                n.setLocalZOrder(isFromLeft ? i : Math.floor(i / MaxOutCardLineNode) *
                    MaxOutCardLineNode + MaxOutCardLineNode - (i % MaxOutCardLineNode));
                let zorder = n.getLocalZOrder();
                if (needSecondLine) {
                    if (i >= MaxOutCardLineNode) {
                        if (isFromLeft) {
                            n.setPosition(cc.p(startPos.x + n.width / 2.0 * OutCardScale * (i - MaxOutCardLineNode),
                                startPos.y - n.height * 0.6 * OutCardScale));
                        } else {
                            n.setPosition(cc.p(startPos.x - n.width / 2.0 * OutCardScale * (i - MaxOutCardLineNode),
                                startPos.y - n.height * 0.6 * OutCardScale));
                        }
                    } else {
                        if (isFromLeft) {
                            n.setPosition(cc.p(startPos.x + n.width / 2.0 * OutCardScale * i, startPos.y));
                        } else {
                            n.setPosition(cc.p(startPos.x - n.width / 2.0 * OutCardScale * i, startPos.y));
                        }
                    }
                } else {
                    if (isFromLeft) {
                        n.setPosition(cc.p(startPos.x + n.width / 2.0 * OutCardScale * i, startPos.y));
                    } else {
                        n.setPosition(cc.p(startPos.x - n.width / 2.0 * OutCardScale * i, startPos.y));
                    }
                }
            }
            node.setScale(0.8);
            var pScaleTo1 = cc.scaleTo(0.15, 1.0);
            var pScaleTo2 = cc.scaleTo(0.1, 0.95);
            var pScaleTo3 = cc.scaleTo(0.1, 1.0);
            node.runAction(cc.sequence(pScaleTo1, pScaleTo2, pScaleTo3));
        }
        return node;
    }

    sitAllCards() {
        for (let i = 0; i < this._selectedCardVec.length; i++) {
            let tempNode = this._selectedCardVec[i];
            let comp = tempNode.getComponent('PokerCardNode');
            comp.setCardGray(false);
            if (comp._selectedState) {
                comp.sitCard();
            }
        }
        this._selectedCardVec = [];
    }

    setSelectedCard(selectedCards) {
        this.sitAllCards();
        let curCardNodeVec = this.m_handCardNodeMap[0];
        for (let i = curCardNodeVec.length - 1; i >= 0; i--) {
            let n = curCardNodeVec[i];
            let comp = n.getComponent('PokerCardNode');
            let cardData = comp._cardData;
            for (let j = 0; j < selectedCards.length; j++) {
                if (comp._cardData == selectedCards[j]) {
                    selectedCards.splice(j, 1);
                    comp.standCard();
                    this._selectedCardVec.push(n);
                    break;
                }
            }
        }
    }

    getSelectedCardsVec() {
        let selectedCardVec = [];
        for (let i = 0; i < this._selectedCardVec.length; i++) {
            let tempNode = this._selectedCardVec[i];
            let comp = tempNode.getComponent('PokerCardNode');
            selectedCardVec.push(comp._cardData);
        }
        selectedCardVec = GameLogicIns.sortCardList(selectedCardVec, SortType.ST_NORMAL);
        return selectedCardVec;
    }

    getGrayCardsVec() {
        let grayCardVec = [];
        for (let i = 0; i < this._grayCardVec.length; i++) {
            let tempNode = this._grayCardVec[i];
            let comp = tempNode.getComponent('PokerCardNode');
            grayCardVec.push(comp._cardData);
        }
        grayCardVec = GameLogicIns.sortCardList(grayCardVec, SortType.ST_NORMAL);
        return grayCardVec;
    }

    clear() {
        for (let i = 0; i < PlayerCount; i++) {
            this._clearOutCard(i);
        }

        for (let key in this.m_handCardNodeMap) {
            let item = this.m_handCardNodeMap[key];
            if (item && item.length) {
                for (let i = 0; i < item.length; i++) {
                    item[i].destroy();
                }
            }
        }

        this._selectedCardVec = [];
        this._grayCardVec = [];
        for (let i = 0; i < PlayerCount; i++) {
            this.m_handCardNodeMap[i] = [];
        }
    }
    

    private _clearOutCard(localChairID) {
        let outCardPosNode = this.m_outCardPosNode[localChairID];
        let children = outCardPosNode.children;
        for (let i = 0; i < children.length; i++) {
            children[i].destroy();
        }
    }

    private _clearSelectedCards() {
        this._selectedCardVec.length = 0;
    }
};