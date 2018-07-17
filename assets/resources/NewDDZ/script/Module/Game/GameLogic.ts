import Singleton from '../../../../../Script/Utils/Singleton';

import { TagAnalyseResult, TagSearchCardResult, TagDistributing, SortType, EPokerType, DDZCardType, DDZ_Type } from '../../Module/DDZGameDefine';
import FVMASK from './FvMask';

var MAX_COUNT = 20;
var MASK_VALUE = 0xF8;
var MASK_COLOR = 0x07;
var IndexCount = 5;

class GameLogic extends Singleton {

    combine(numCount, minCount, numArray, minArray, M, resultArray) {
        for (let j = numCount; j >= minCount; j--) {
            minArray[minCount - 1] = j - 1;
            if (minCount > 1) {
                this.combine(j - 1, minCount - 1, numArray, minArray, M, resultArray);
            } else {
                let curRes = [];
                for (let i = M - 1; i >= 0; i--) {
                    curRes.push(numArray[minArray[i]]);
                }
                resultArray.push(curRes);
            }
        }
    }

    hasType(cardType, dstType) {
        return FVMASK.HasAny(cardType, FVMASK.MASK_(dstType));
    }

    makeCard(color, value) {
        var nCard = ((value << 3) | color);
        return nCard;
    }

    makeCards() {
        let dstCardsVec = [];
        for (let nValue = 3; nValue <= 14; nValue++)  // 14 => A 
        {
            for (let nType = EPokerType.ePoker_None; nType < EPokerType.ePoker_NoJoker; ++nType) {
                let cardData = this.makeCard(nType, nValue);
                dstCardsVec.push(cardData);
            }
        }

        for (let nType = EPokerType.ePoker_None; nType < EPokerType.ePoker_NoJoker; nType++) {
            let cardData = this.makeCard(nType, 16);
            dstCardsVec.push(cardData);  // 2 ;
        }

        // add wang ;
        let cardData = this.makeCard(EPokerType.ePoker_Joker, 18);
        dstCardsVec.push(cardData);

        cardData = this.makeCard(EPokerType.ePoker_Joker, 19);
        dstCardsVec.push(cardData);
    }

    getCardValue(cardData) {
        return (cardData & MASK_VALUE) >> 3;
    }

    getCardColor(cardData) {
        return cardData & MASK_COLOR;
    }

    getCardLogicValue(cardData) {
        let cardColor = this.getCardColor(cardData);
        let cardValue = this.getCardValue(cardData);
        if (cardColor == EPokerType.ePoker_Joker) {
            return cardValue;//18 19
        }
        return cardValue;// 3~14 16
    }

    analysebDistributing(cbCardData) {
        let distributing = new TagDistributing();
        var cbCardCount = cbCardData.length;
        for (let i = 0; i < cbCardCount; i++) {
            if (cbCardData[i] == 0) {
                continue;
            }
            let cbCardColor = this.getCardColor(cbCardData[i]);
            let cbCardValue = this.getCardValue(cbCardData[i]);
            distributing.cbCardCount++;
            distributing.cbDistributing[cbCardValue][IndexCount]++;
            distributing.cbDistributing[cbCardValue][cbCardColor]++;
        }
        return distributing;
    }

    analyseCard(cardDataVec) {
        let tagResult = new TagAnalyseResult();
        let cardCount = cardDataVec.length;
        for (let i = 0; i < cardCount; i++) {
            let cbSameCount = 1;
            let cbLogicValue = this.getCardLogicValue(cardDataVec[i]);
            for (let j = i + 1; j < cardCount; j++) {
                if (this.getCardLogicValue(cardDataVec[j]) != cbLogicValue) {
                    break;
                }
                cbSameCount++;
            }
            let cbIndex = tagResult.cbBlockCount[cbSameCount - 1];
            tagResult.cbBlockCount[cbSameCount - 1] = cbIndex + 1;
            let curCardDataMap = tagResult.cbCardData[cbSameCount - 1];
            for (let j = 0; j < cbSameCount; j++) {
                curCardDataMap[cbIndex * cbSameCount + j] = cardDataVec[i + j];
            }
            i += cbSameCount - 1;
        }
        return tagResult;
    }

    sortCardList(cardDataVec, sortType) {
        var cardCount = cardDataVec.length;
        if (cardCount == 0) {
            return cardDataVec;
        }
        var sortValue = [];
        for (let i = 0; i < cardCount; i++) {
            sortValue.push(this.getCardLogicValue(cardDataVec[i]));
        }

        var bSorted = true;
        var cbSwitchData = 0, cbLast = cardCount - 1;
        do {
            bSorted = true;
            for (let i = 0; i < cbLast; i++) {
                if ((sortValue[i] < sortValue[i + 1]) ||
                    ((sortValue[i] == sortValue[i + 1]) && (cardDataVec[i] < cardDataVec[i + 1]))) {
                    bSorted = false;
                    cbSwitchData = cardDataVec[i];
                    cardDataVec[i] = cardDataVec[i + 1];
                    cardDataVec[i + 1] = cbSwitchData;

                    cbSwitchData = sortValue[i];
                    sortValue[i] = sortValue[i + 1];
                    sortValue[i + 1] = cbSwitchData;
                }
            }
            cbLast--;
        } while (bSorted == false);

        if (sortType == SortType.ST_COUNT) {
            let cbCardIndex = 0;
            let tagResult = this.analyseCard(cardDataVec);
            var countMap = tagResult.cbBlockCount;
            let cnt1 = 0;
            for (let key in countMap) {
                let cbIndex = 4 - cnt1 - 1;
                let curCardDataMap = tagResult.cbCardData[cbIndex];

                let cnt2 = 0;
                for (let key in curCardDataMap) {
                    let item = curCardDataMap[key];
                    cardDataVec[cbCardIndex + cnt2] = item;
                    
                    cnt2++;
                }
                cbCardIndex += tagResult.cbBlockCount[cbIndex] * (cbIndex + 1);

                cnt1++;
            }
        }
        return cardDataVec;
    }

    sortOutCardList(cbCardData) {
        let cbCardCount = 0;
        let cbCardType = this.getCardType(cbCardData);
        if (this.checkCardTypeContain(DDZCardType.Type_SanZhang_1, cbCardType) ||
            this.checkCardTypeContain(DDZCardType.Type_SanZhang_2, cbCardType)) {
            let analyseResult = this.analyseCard(cbCardData);
            cbCardCount = analyseResult.cbBlockCount[2] * 3;
            for (let i = 0; i < cbCardCount; i++) {
                cbCardData[i] = analyseResult.cbCardData[2][i];
            }
            for (let i = 3; i >= 0; i--) {
                if (i == 2) {
                    continue;
                }
                if (analyseResult.cbBlockCount[i] > 0) {
                    for (let j = 0; j < (i + 1) * analyseResult.cbBlockCount[i]; j++) {
                        cbCardData[cbCardCount + j] = analyseResult.cbCardData[i][j];
                    }
                    cbCardCount += (i + 1) * analyseResult.cbBlockCount[i];
                }
            }
        } else if (this.checkCardTypeContain(DDZCardType.Type_ZhaDan_1, cbCardType) ||
            this.checkCardTypeContain(DDZCardType.Type_ZhaDan_2, cbCardType)) {
            let analyseResult = this.analyseCard(cbCardData);
            cbCardCount = analyseResult.cbBlockCount[3] * 4;
            for (let i = 0; i < cbCardCount; i++) {
                cbCardData[i] = analyseResult.cbCardData[3][i];
            }
            for (let i = 3; i >= 0; i--) {
                if (i == 3) {
                    continue;
                }
                if (analyseResult.cbBlockCount[i] > 0) {
                    for (let j = 0; j < (i + 1) * analyseResult.cbBlockCount[i]; j++) {
                        cbCardData[cbCardCount + j] = analyseResult.cbCardData[i][j];
                    }
                    cbCardCount += (i + 1) * analyseResult.cbBlockCount[i];
                }
            }
        }
        return cbCardData;
    }

    removeCardList(removeCardVec, cbRemoveCount, cardDataVec, cbCardCount) {
        let cbDeleteCount = 0;
        let cbTempCardData = [];
        for (let i = 0; i < cbCardCount; i++) {
            cbTempCardData.push(cardDataVec[i]);
        }
        for (let i = 0; i < cbRemoveCount; i++) {
            for (let j = 0; j < cbCardCount; j++) {
                if (removeCardVec[i] == cbTempCardData[j]) {
                    cbDeleteCount++;
                    cbTempCardData.splice(j, 1);
                    break;
                }
            }
        }
        if (cbDeleteCount != cbRemoveCount) {
            return;
        }
        return cbTempCardData;
    }

    //获得飞机头logicValue数组
    getPlaneHeadLogicValueVec(cardResultData, centerCardVec, wingsCardVec) {
        let cardLogicVec = [];
        let lineCount = centerCardVec.length / 3;
        let takeCount = wingsCardVec.length / lineCount;
        for (let i = 0; i < lineCount; i++) {
            cardLogicVec.push(this.getCardLogicValue(centerCardVec[i * 3]));
        }
        return cardLogicVec;
    }

    checkIsPlane(cardDataVec) {
        if (cardDataVec.length < 6) {
            return DDZCardType.Type_None;
        }
        let searchResult = this.searchExactPlane(cardDataVec);
        if (searchResult.cbSearchCount > 0) {
            for (let i = 0; i < searchResult.cbSearchCount; i++) {
                if (searchResult.cbCardCount[i] == cardDataVec.length) {
                    let tempCenterCard = searchResult.centerCardArray[i];
                    let tempWingCard = searchResult.wingsCardArray[i];
                    if (tempWingCard.length == tempCenterCard.length / 3) {
                        return DDZCardType.Type_FeiJi_1;
                    } else {
                        return DDZCardType.Type_FeiJi_2;
                    }
                } else {
                    continue;
                }
            }
        }
        return DDZCardType.Type_None;
    }

    checkCardTypeContain(cardType, typeArray) {
        for (let i = 0; i < typeArray.length; i++) {
            if (typeArray[i] == cardType) {
                return true;
            }
        }
        return false;
    }

    getCardType(cardDataVec) {
        let cardType = [];//dst cardType
        var cardCount = cardDataVec.length;
        switch (cardCount) {
            case 0:
                {
                    cardType.push(DDZCardType.Type_None);
                    return cardType;
                }
            case 1:
                {
                    cardType.push(DDZCardType.Type_Single);
                    return cardType;
                }
            case 2:
                {
                    let color0 = this.getCardColor(cardDataVec[0]);
                    let color1 = this.getCardColor(cardDataVec[1]);
                    if ((color0 == EPokerType.ePoker_Joker) && (color1 == EPokerType.ePoker_Joker)) {
                        cardType.push(DDZCardType.Type_JokerZhaDan);
                        return cardType;
                    }
                    if (this.getCardLogicValue(cardDataVec[0]) == this.getCardLogicValue(cardDataVec[1])) {
                        cardType.push(DDZCardType.Type_DuiZi);
                        return cardType;
                    }
                    cardType.push(DDZCardType.Type_None);
                    return cardType;
                }
        }

        //check plane
        let isPlane = this.checkIsPlane(cardDataVec);
        if (isPlane != DDZCardType.Type_None && !this.checkCardTypeContain(isPlane, cardType)) {
            cardType.push(isPlane);
        }

        let analyseResult = this.analyseCard(cardDataVec);
        if (analyseResult.cbBlockCount[3] > 0) {
            if ((analyseResult.cbBlockCount[3] == 1) && (cardCount == 4)) {
                cardType.push(DDZCardType.Type_ZhaDan_0);
            }
            if ((analyseResult.cbBlockCount[3] == 1) && (analyseResult.cbBlockCount[0] == 2) && (cardCount == 6)) {
                cardType.push(DDZCardType.Type_ZhaDan_1);
            }
            if ((analyseResult.cbBlockCount[3] == 2) && (cardCount == 8)) {
                let isFeiji = true;
                let cbCardData = analyseResult.cbCardData[3][0];
                let cbFirstLogicValue = this.getCardLogicValue(cbCardData);
                if (cbFirstLogicValue >= 15) {
                    isFeiji = false;
                } else {
                    for (let i = 1; i < analyseResult.cbBlockCount[3]; i++) {
                        cbCardData = analyseResult.cbCardData[3][i * 4];
                        if (cbFirstLogicValue != (this.getCardLogicValue(cbCardData) + i)) {
                            isFeiji = false;
                            break;
                        }
                    }
                }
                if (isFeiji) {
                    cardType.push(DDZCardType.Type_ZhaDan_2);
                    //cardType.push(DDZCardType.Type_FeiJi_1);
                } else {
                    cardType.push(DDZCardType.Type_ZhaDan_2);
                }
            }
            if ((analyseResult.cbBlockCount[3] == 1) && (analyseResult.cbBlockCount[1] == 2) && (cardCount == 8)) {
                cardType.push(DDZCardType.Type_ZhaDan_2);
            }
            if ((analyseResult.cbBlockCount[3] == 1) && (analyseResult.cbBlockCount[1] == 1) && (cardCount == 6)) {
                cardType.push(DDZCardType.Type_ZhaDan_1);
            }
            if (cardType.length == 0) {
                cardType.push(DDZCardType.Type_None);
            }
        }

        if (analyseResult.cbBlockCount[2] > 0) {
            if (analyseResult.cbBlockCount[2] > 1) {//
                let isThreePairSeq = true;
                let cbCardData = analyseResult.cbCardData[2][0];
                let cbFirstLogicValue = this.getCardLogicValue(cbCardData);
                if (cbFirstLogicValue >= 15) {
                    isThreePairSeq = false;
                }
                for (let i = 1; i < analyseResult.cbBlockCount[2]; i++) {
                    cbCardData = analyseResult.cbCardData[2][i * 3];
                    if (cbFirstLogicValue != (this.getCardLogicValue(cbCardData) + i)) {
                        isThreePairSeq = false;
                        break;
                    }
                }
                if (isThreePairSeq && analyseResult.cbBlockCount[2] * 3 == cardCount) {
                    cardType.push(DDZCardType.Type_FeiJi_0);
                }
            } else if (cardCount == 3) {
                cardType.push(DDZCardType.Type_SanZhang_0);
            } else if (cardCount == 4) {
                cardType.push(DDZCardType.Type_SanZhang_1);
            } else if (cardCount == 5 && analyseResult.cbBlockCount[1] == 1) {
                cardType.push(DDZCardType.Type_SanZhang_2);
            }
            if (cardType.length == 0) {
                cardType.push(DDZCardType.Type_None);
            }
        }

        if (analyseResult.cbBlockCount[1] >= 3) {
            let cbCardData = analyseResult.cbCardData[1][0];
            let cbFirstLogicValue = this.getCardLogicValue(cbCardData);
            let isLianDui = true;
            if (cbFirstLogicValue >= 15) {
                isLianDui = false;
            }
            for (let i = 1; i < analyseResult.cbBlockCount[1]; i++) {
                let cbCardData = analyseResult.cbCardData[1][i * 2];
                if (cbFirstLogicValue != (this.getCardLogicValue(cbCardData) + i)) {
                    isLianDui = false;
                    break;
                }
            }
            if (isLianDui && (analyseResult.cbBlockCount[1] * 2) == cardCount) {
                cardType.push(DDZCardType.Type_LianDui);
            }
            if (cardType.length == 0) {
                cardType.push(DDZCardType.Type_None);
            }
        }

        if ((analyseResult.cbBlockCount[0] >= 5) && (analyseResult.cbBlockCount[0] == cardCount)) {
            let isShunZi = true;
            let cbCardData = analyseResult.cbCardData[0][0];
            let cbFirstLogicValue = this.getCardLogicValue(cbCardData);

            if (cbFirstLogicValue >= 15) {
                isShunZi = false;
            }
            for (let i = 1; i < analyseResult.cbBlockCount[0]; i++) {
                let cbCardData = analyseResult.cbCardData[0][i];
                if (cbFirstLogicValue != (this.getCardLogicValue(cbCardData) + i)) {
                    isShunZi = false;
                    break;
                }
            }
            if (isShunZi) {
                cardType.push(DDZCardType.Type_ShunZi);
            }
        }
        if (cardType.length == 0) {
            cardType.push(DDZCardType.Type_None);
        }
        return cardType;
    }

    searchLineCardType(cardDataVec, cbReferCard, cbBlockCount, cbLineCount) {
        let pSearchCardResult = new TagSearchCardResult();
        let cbHandCardCount = cardDataVec.length;
        let cbResultCount = 0;
        let cbLessLineCount = 0;
        if (cbLineCount == 0) {
            if (cbBlockCount == 1) {
                cbLessLineCount = 5;
            } else if (cbBlockCount == 2) {
                cbLessLineCount = 3;
            } else {
                cbLessLineCount = 2;
            }
        } else {
            cbLessLineCount = cbLineCount;
        }

        let cbReferIndex = 3;
        if (cbReferCard != 0) {//min start value
            cbReferIndex = this.getCardLogicValue(cbReferCard) - cbLessLineCount + 2;
            if (cbReferIndex < 0) {
                cbReferIndex = 3;
            }
        }
        //超过A
        if (cbReferIndex + cbLessLineCount - 1 > 14) {
            return pSearchCardResult;
        }
        if (cbHandCardCount < cbLessLineCount * cbBlockCount) {
            return pSearchCardResult;
        }
        let cbCardData = [];
        for (let i = 0; i < cbHandCardCount; i++) {
            cbCardData.push(cardDataVec[i]);
        }
        let cbCardCount = cbHandCardCount;

        cbCardData = this.sortCardList(cbCardData, SortType.ST_NORMAL);
        let distributing = this.analysebDistributing(cbCardData);

        let cbTmpLinkCount = 0;
        let cbValueIndex = 0;
        for (cbValueIndex = cbReferIndex; cbValueIndex < 16; cbValueIndex++) {
            if (distributing.cbDistributing[cbValueIndex][IndexCount] < cbBlockCount) {
                if (cbTmpLinkCount < cbLessLineCount) {
                    cbTmpLinkCount = 0;
                    continue;
                } else {
                    cbValueIndex--;
                }
            } else {
                cbTmpLinkCount++;
                //寻找最长连
                if (cbLineCount == 0) {
                    continue;
                }
            }
            if (cbTmpLinkCount >= cbLessLineCount) {
                let cbCount = 0;
                for (let cbIndex = cbValueIndex + 1 - cbTmpLinkCount; cbIndex <= cbValueIndex; cbIndex++) {
                    let cbTmpCount = 0;
                    for (let cbColorIndex = 0; cbColorIndex < 4; cbColorIndex++) {
                        for (let cbColorCount = 0; cbColorCount < distributing.cbDistributing[cbIndex][3 - cbColorIndex];
                            cbColorCount++) {
                            pSearchCardResult.cbResultCard[cbResultCount][cbCount++] = this.makeCard(3 - cbColorIndex, cbIndex);
                            if (++cbTmpCount == cbBlockCount) {
                                break;
                            }
                        }
                        if (cbTmpCount == cbBlockCount) {
                            break;
                        }
                    }
                }
                pSearchCardResult.cbCardCount[cbResultCount] = cbCount;
                cbResultCount++;
                if (cbLineCount != 0) {
                    cbTmpLinkCount--;
                } else {
                    cbTmpLinkCount = 0;
                }
            }
        }
        pSearchCardResult.cbSearchCount = cbResultCount;
        return pSearchCardResult;
    }

    searchPlane(cardDataVec) {
        let cbHandCardCount = cardDataVec.length;
        let pSearchCardResult = new TagSearchCardResult();
        let tmpSearchResult = new TagSearchCardResult();
        let tmpSingleWing = new TagSearchCardResult();
        let tmpDoubleWing = new TagSearchCardResult();
        let cbTmpResultCount = 0;

        tmpSearchResult = this.searchLineCardType(cardDataVec, 0, 3, 0);
        cbTmpResultCount = tmpSearchResult.cbSearchCount;

        if (cbTmpResultCount > 0) {
            for (let i = 0; i < cbTmpResultCount; i++) {
                let cbTmpCardData = new Array(MAX_COUNT);
                let cbTmpCardCount = cbHandCardCount;
                if (cbHandCardCount - tmpSearchResult.cbCardCount[i] < tmpSearchResult.cbCardCount[i] / 3) {//not enough
                    let cbNeedDelCount = 3;
                    while (cbHandCardCount + cbNeedDelCount - tmpSearchResult.cbCardCount[i] <
                        (tmpSearchResult.cbCardCount[i] - cbNeedDelCount) / 3) {
                        cbNeedDelCount += 3;
                    }
                    //不够连牌
                    if ((tmpSearchResult.cbCardCount[i] - cbNeedDelCount) / 3 < 2) {
                        continue;
                    }
                    let curResultCardVec = [];
                    let removeCardVec = [];
                    let curRemoveCount = 0;
                    for (let j = 0; j < MAX_COUNT; j++) {
                        if (tmpSearchResult.cbResultCard[i][j] != 0) {
                            if (curRemoveCount < cbNeedDelCount) {
                                curRemoveCount++;
                                removeCardVec.push(tmpSearchResult.cbResultCard[i][j]);
                            }
                            curResultCardVec.push(tmpSearchResult.cbResultCard[i][j]);
                        }
                    }
                    curResultCardVec = this.removeCardList(removeCardVec, removeCardVec.length, curResultCardVec, curResultCardVec.length);
                    tmpSearchResult.cbResultCard[i] = curResultCardVec;
                    tmpSearchResult.cbCardCount[i] -= cbNeedDelCount;
                }
                cbTmpCardData = cardDataVec;

                cbTmpCardData = this.removeCardList(tmpSearchResult.cbResultCard[i], tmpSearchResult.cbCardCount[i],
                    cbTmpCardData, cbTmpCardCount);

                cbTmpCardCount -= tmpSearchResult.cbCardCount[i];
                let cbNeedCount = tmpSearchResult.cbCardCount[i] / 3;
                let cbResultCount = tmpSingleWing.cbSearchCount++;
                let centerCardArray = [];
                let wingsCardArray = [];
                for (let j = 0; j < tmpSearchResult.cbResultCard[i].length; j++) {
                    tmpSingleWing.cbResultCard[cbResultCount][j] = tmpSearchResult.cbResultCard[i][j];
                    if (tmpSearchResult.cbResultCard[i][j] != 0) {
                        centerCardArray.push(tmpSearchResult.cbResultCard[i][j]);
                    }
                }

                for (let j = 0; j < cbNeedCount; j++) {//不考虑带牌大小
                    tmpSingleWing.cbResultCard[cbResultCount][tmpSearchResult.cbCardCount[i] + j] =
                        cbTmpCardData[j];
                    wingsCardArray.push(cbTmpCardData[j]);
                }
                tmpSingleWing.cbCardCount[i] = tmpSearchResult.cbCardCount[i] + cbNeedCount;
                tmpSingleWing.centerCardArray[i] = centerCardArray;
                tmpSingleWing.wingsCardArray[i] = wingsCardArray;

                //不够带翅膀
                if (cbTmpCardCount < tmpSearchResult.cbCardCount[i] / 3 * 2) {
                    let cbNeedDelCount = 3;
                    while (cbTmpCardCount + cbNeedDelCount - tmpSearchResult.cbCardCount[i] <
                        (tmpSearchResult.cbCardCount[i] - cbNeedDelCount) / 3 * 2) {
                        cbNeedDelCount += 3;
                    }
                    if ((tmpSearchResult.cbCardCount[i] - cbNeedDelCount) / 3 < 2) {
                        continue;
                    }

                    //拆分连牌
                    let curResultCardVec = [];
                    let removeCardVec = [];
                    let curRemoveCount = 0;
                    for (let j = 0; j < tmpSearchResult.cbResultCard[i].length; j++) {
                        if (tmpSearchResult.cbResultCard[i][j] != 0) {
                            if (curRemoveCount < cbNeedDelCount) {
                                curRemoveCount++;
                                removeCardVec.push(tmpSearchResult.cbResultCard[i][j]);
                            }
                            curResultCardVec.push(tmpSearchResult.cbResultCard[i][j]);
                        }
                    }
                    curResultCardVec = this.removeCardList(removeCardVec, removeCardVec.length, curResultCardVec, curResultCardVec.length);
                    tmpSearchResult.cbCardCount[i] -= cbNeedDelCount;
                    cbTmpCardData = [];
                    for (let j = 0; j < cbHandCardCount; j++) {
                        cbTmpCardData.push(cardDataVec[j]);
                    }
                    cbTmpCardCount = cbHandCardCount - tmpSearchResult.cbCardCount[i];
                }
                let tmpResult = this.analyseCard(cbTmpCardData);
                //提取翅膀
                let cbDistillCard = [];
                let cbDistillCount = 0;
                let cbLineCount = tmpSearchResult.cbCardCount[i] / 3;
                for (let j = 1; j < 4; j++) {
                    if (tmpResult.cbBlockCount[j] > 0) {
                        if (j + 1 == 2 && tmpResult.cbBlockCount[j] >= cbLineCount) {
                            let cbTmpBlockCount = tmpResult.cbBlockCount[j];
                            for (let k = 0; k < (j + 1) * cbLineCount; k++) {
                                cbDistillCard.push(tmpResult.cbCardData[j][(cbTmpBlockCount - cbLineCount) * (j + 1) + k]);
                            }
                            cbDistillCount = (j + 1) * cbLineCount;
                            break;
                        } else {
                            for (let k = 0; k < tmpResult.cbBlockCount[j]; k++) {
                                let cbTmpBlockCount = tmpResult.cbBlockCount[j];
                                for (let t = 0; t < 2; t++) {
                                    cbDistillCard.push(tmpResult.cbCardData[j][(cbTmpBlockCount - k - 1) * (j + 1) + t]);
                                }
                                cbDistillCount += 2;
                                if (cbDistillCount == 2 * cbLineCount) {
                                    break;
                                }
                            }
                        }
                    }
                    if (cbDistillCount == 2 * cbLineCount) {
                        break;
                    }
                }
                if (cbDistillCount == 2 * cbLineCount) {
                    let centerCardArray = [];
                    let wingsCardArray = [];
                    cbResultCount = tmpDoubleWing.cbSearchCount++;
                    for (let j = 0; j < tmpSearchResult.cbResultCard[i].length; j++) {
                        tmpDoubleWing.cbResultCard[cbResultCount][j] = tmpSearchResult.cbResultCard[i][j];
                        centerCardArray.push(tmpSearchResult.cbResultCard[i][j]);
                    }
                    for (let j = 0; j < cbDistillCount; j++) {
                        tmpDoubleWing.cbResultCard[cbResultCount][tmpSearchResult.cbCardCount[i] + j] = cbDistillCard[j];
                        wingsCardArray.push(cbDistillCard[j]);
                    }
                    tmpDoubleWing.cbCardCount[i] = tmpSearchResult.cbCardCount[i] + cbDistillCount;
                    tmpDoubleWing.centerCardArray[i] = centerCardArray;
                    tmpDoubleWing.wingsCardArray[i] = wingsCardArray;
                }
            }

            for (let i = 0; i < tmpDoubleWing.cbSearchCount; i++) {
                let cbResultCount0 = pSearchCardResult.cbSearchCount++;
                pSearchCardResult.cbResultCard[cbResultCount0] = tmpDoubleWing.cbResultCard[i];
                pSearchCardResult.cbCardCount[cbResultCount0] = tmpDoubleWing.cbCardCount[i];
                pSearchCardResult.centerCardArray[cbResultCount0] = tmpDoubleWing.centerCardArray[i];
                pSearchCardResult.wingsCardArray[cbResultCount0] = tmpDoubleWing.wingsCardArray[i];
            }
            for (let i = 0; i < tmpSingleWing.cbSearchCount; i++) {
                let cbResultCount0 = pSearchCardResult.cbSearchCount++;
                pSearchCardResult.cbResultCard[cbResultCount0] = tmpSingleWing.cbResultCard[i];
                pSearchCardResult.cbCardCount[cbResultCount0] = tmpSingleWing.cbCardCount[i];
                pSearchCardResult.centerCardArray[cbResultCount0] = tmpSingleWing.centerCardArray[i];
                pSearchCardResult.wingsCardArray[cbResultCount0] = tmpSingleWing.wingsCardArray[i];
            }
        }
        return pSearchCardResult;
    }

    //find exactPlane 
    searchExactPlane(cardDataVec) {
        let cardLen = cardDataVec.length;
        let pSearchResultSingleWing = new TagSearchCardResult();
        let pSearchResultDoubleWing = new TagSearchCardResult();
        let pSearchCardResult = new TagSearchCardResult();
        let resultCount = 0;
        let needCheckWings1 = cardLen % 4 == 0;
        let needCheckWings2 = cardLen % 5 == 0;
        if (needCheckWings1) {
            pSearchResultSingleWing = this.searchPlaneW(cardDataVec, 24, 1, cardLen / 4);
            for (let i = 0; i < pSearchResultSingleWing.cbSearchCount; i++) {
                if (pSearchResultSingleWing.cbCardCount[i] == cardLen) {
                    pSearchCardResult.cbCardCount[resultCount] = cardLen;
                    pSearchCardResult.cbResultCard[resultCount] = pSearchResultSingleWing.cbResultCard[i];
                    pSearchCardResult.centerCardArray[resultCount] = pSearchResultSingleWing.centerCardArray[i];
                    pSearchCardResult.wingsCardArray[resultCount] = pSearchResultSingleWing.wingsCardArray[i];
                    pSearchCardResult.cbSearchCount++;
                } else {
                    continue;
                }
            }
        }
        if (needCheckWings2) {
            pSearchResultDoubleWing = this.searchPlaneW(cardDataVec, 24, 2, cardLen / 5);
            for (let i = 0; i < pSearchResultDoubleWing.cbSearchCount; i++) {
                if (pSearchResultDoubleWing.cbCardCount[i] == cardLen) {
                    pSearchCardResult.cbCardCount[resultCount] = cardLen;
                    pSearchCardResult.cbResultCard[resultCount] = pSearchResultDoubleWing.cbResultCard[i];
                    pSearchCardResult.centerCardArray[resultCount] = pSearchResultDoubleWing.centerCardArray[i];
                    pSearchCardResult.wingsCardArray[resultCount] = pSearchResultDoubleWing.wingsCardArray[i];
                    pSearchCardResult.cbSearchCount++;
                } else {
                    continue;
                }
            }
        }
        return pSearchCardResult;
    }

    //findAllPlanes
    searchPlaneW(cardDataVec, cbReferCard, cbTakeCardCount, cbLineCount) {
        let cbHandCardCount = cardDataVec.length;
        let pSearchCardResult = new TagSearchCardResult();
        let tmpSearchResult = new TagSearchCardResult();
        let cbTmpResultCount = 0;
        let planeCount = 0;
        //3 3 3 3 filter 3->1 1 1
        let allThreeAnalyseResult = this.analyseCard(cardDataVec);
        let allThreeLogicValueVec = [];
        let isSequence = true;
        if (allThreeAnalyseResult.cbBlockCount[2] * 3 == cardDataVec.length) {
            let firstLogicValue = this.getCardLogicValue(allThreeAnalyseResult.cbCardData[2][0]);
            for (let i = 1; i < allThreeAnalyseResult.cbBlockCount[2]; i++) {
                if (this.getCardLogicValue(allThreeAnalyseResult.cbCardData[2][3 * i]) != firstLogicValue - i) {
                    isSequence = false;
                    break;
                }
            }
            //find Max plane
            if (isSequence && cbTakeCardCount == 1 && (cbLineCount == cardDataVec.length / 4)) {
                let wingLineCount = allThreeAnalyseResult.cbBlockCount[2] - cbLineCount;
                pSearchCardResult.cbSearchCount = 1;
                pSearchCardResult.cbCardCount[0] = cardDataVec.length;
                let i = 0;
                let centerCardVec = [];
                let wingDataVec = [];
                for (i = 0; i < cbLineCount * 3; i++) {
                    pSearchCardResult.cbResultCard[0][i] = allThreeAnalyseResult.cbCardData[2][cbLineCount * 3 - i - 1];
                    centerCardVec.push(allThreeAnalyseResult.cbCardData[2][cbLineCount * 3 - i - 1]);
                }
                for (; i < cardDataVec.length; i++) {
                    pSearchCardResult.cbResultCard[0][i] = allThreeAnalyseResult.cbCardData[2][cardDataVec.length -
                        (i - cbLineCount * 3) - 1];
                    wingDataVec.push(allThreeAnalyseResult.cbCardData[2][cardDataVec.length -
                        (i - cbLineCount * 3) - 1]);
                }
                pSearchCardResult.centerCardArray[0] = centerCardVec;
                pSearchCardResult.wingsCardArray[0] = wingDataVec;
                return pSearchCardResult;
            }
        }

        tmpSearchResult = this.searchLineCardType(cardDataVec, cbReferCard, 3, cbLineCount);
        cbTmpResultCount = tmpSearchResult.cbSearchCount;
        if (cbTmpResultCount > 0) {
            if (cbReferCard == 0) {//find all planes

            } else {//search wings
                let needWings = cbLineCount * cbTakeCardCount;
                for (let i = 0; i < cbTmpResultCount; i++) {
                    var curLineCards = [];
                    var curWingCardsVec = [];//[][]
                    if (tmpSearchResult.cbCardCount[i] + needWings > cbHandCardCount) {
                        continue;
                    }
                    for (let j = 0; j < tmpSearchResult.cbCardCount[i]; j++) {
                        curLineCards.push(tmpSearchResult.cbResultCard[i][j]);
                    }
                    var remaindCards = this.removeCardList(curLineCards, curLineCards.length, cardDataVec, cbHandCardCount);
                    let analyseResult = this.analyseCard(remaindCards);
                    let curWingCard = [];//key value
                    let curWingCardMap = {};
                    let curSameDataMap = {};
                    for (let blockCount = cbTakeCardCount; blockCount < 4 + 1; blockCount++) {
                        let curSameDataArray = [];
                        let num = analyseResult.cbBlockCount[blockCount - 1];
                        for (let j = 0; j < num; j++) {
                            let curSameDataArray = [];
                            //curWingCard.push(analyseResult.cbCardData[blockCount - 1)[(blockCount) * j));
                            curWingCard.push(this.getCardLogicValue(analyseResult.cbCardData[blockCount - 1][(blockCount) * j]));
                            curWingCardMap[this.getCardLogicValue(analyseResult.cbCardData[blockCount - 1][blockCount * j])] = blockCount;
                            for (let k = 0; k < blockCount; k++) {
                                curSameDataArray.push(analyseResult.cbCardData[blockCount - 1][blockCount * j + k]);
                            }
                            curSameDataMap[this.getCardLogicValue(analyseResult.cbCardData[blockCount - 1][blockCount * j])] = curSameDataArray;
                        }
                    }
                    //filterSameCard
                    let singleCardVec = [];
                    let complexCardVec = [];
                    for (let j = 0; j < curWingCard.length; j++) {
                        let cardLogicValue = curWingCard[j];
                        if (curWingCardMap[cardLogicValue] >= cbTakeCardCount &&
                            curWingCardMap[cardLogicValue] < cbTakeCardCount * 2) {
                            singleCardVec.push(curWingCard[j]);
                        } else if (curWingCardMap[cardLogicValue] >= cbTakeCardCount * 2) {
                            complexCardVec.push(curWingCard[j]);
                        }
                    }
                    //start combine
                    let withCardArray = [];
                    let minArray = new Array(cbLineCount);
                    if (singleCardVec.length >= cbLineCount) {//单数牌够  双数忽略
                        this.combine(singleCardVec.length, minArray.length, singleCardVec, minArray, cbLineCount, withCardArray);
                    } else {//拆双数牌
                        for (let j = 0; j < complexCardVec.length; j++) {
                            let curCardCount = curWingCardMap[complexCardVec[j]];
                            singleCardVec.push(complexCardVec[j]);
                            singleCardVec.push(complexCardVec[j]);
                            if (curCardCount > cbTakeCardCount * 2) {
                                for (let k = 0; k < curCardCount - cbTakeCardCount * 2; k++) {
                                    singleCardVec.push(complexCardVec[j]);
                                }
                            }
                        }
                        this.combine(singleCardVec.length, minArray.length, singleCardVec, minArray, cbLineCount, withCardArray);
                        //filter same combine
                        withCardArray = this.filterSameVec(withCardArray);
                    }
                    //rebuild wings
                    for (let k = 0; k < withCardArray.length; k++) {
                        let wingCardDataVec = [];
                        let logicValueCountMap = {};
                        let curLogicDataArray = withCardArray[k];
                        for (let kk = 0; kk < curLogicDataArray.length; kk++) {
                            let tempCount = logicValueCountMap[curLogicDataArray[kk]];
                            if (tempCount) {
                                logicValueCountMap[curLogicDataArray[kk]] = tempCount + 1;
                            } else {
                                logicValueCountMap[curLogicDataArray[kk]] = 1;
                            }
                        }
                        //add to wingCardDataVec
                        //wd refactor
                        for (let key in logicValueCountMap) {
                            for (let xx = 0; xx < logicValueCountMap[key] * cbTakeCardCount; xx++) {
                                wingCardDataVec.push(curSameDataMap[key][xx]);
                            }
                        }
                        // logicValueCountMap.forEach(function (item, key) {
                        //     for (let xx = 0; xx < item * cbTakeCardCount; xx++) {
                        //         wingCardDataVec.push(curSameDataMap[key)[xx]);
                        //     }
                        // });
                        curWingCardsVec.push(wingCardDataVec);
                    }
                    //rebuild constructor planestruct
                    //to do
                    for (let k = 0; k < curWingCardsVec.length; k++) {
                        let curWingVec = curWingCardsVec[k];
                        if (planeCount > 19) {
                            pSearchCardResult.cbSearchCount++;
                            let resultCardVec = new Array(MAX_COUNT);
                            let centerCardArray = [];
                            let wingsCardArray = [];
                            let cardCount = 0;
                            for (; cardCount < curLineCards.length; cardCount++) {
                                resultCardVec[cardCount] = curLineCards[cardCount];
                                centerCardArray.push(curLineCards[cardCount]);
                            }
                            for (let kk = 0; kk < curWingVec.length; kk++) {
                                resultCardVec[cardCount + kk] = curWingVec[kk];
                                wingsCardArray.push(curWingVec[kk]);
                            }
                            pSearchCardResult.cbCardCount.push(curWingVec.length + curLineCards.length);
                            pSearchCardResult.cbResultCard.push(resultCardVec);
                            pSearchCardResult.centerCardArray.push(centerCardArray);
                            pSearchCardResult.wingsCardArray.push(wingsCardArray);
                        } else {
                            pSearchCardResult.cbSearchCount++;
                            pSearchCardResult.cbCardCount[planeCount] = curWingVec.length + curLineCards.length;
                            let cardCount = 0;
                            let centerCardArray = [];
                            let wingsCardArray = [];
                            for (; cardCount < curLineCards.length; cardCount++) {
                                pSearchCardResult.cbResultCard[planeCount][cardCount] = curLineCards[cardCount];
                                centerCardArray.push(curLineCards[cardCount]);
                            }
                            for (let kk = 0; kk < curWingVec.length; kk++) {
                                pSearchCardResult.cbResultCard[planeCount][cardCount + kk] = curWingVec[kk];
                                wingsCardArray.push(curWingVec[kk]);
                            }
                            pSearchCardResult.centerCardArray[planeCount] = centerCardArray;
                            pSearchCardResult.wingsCardArray[planeCount] = wingsCardArray;
                        }
                        planeCount++;
                    }
                }
            }
        }
        return pSearchCardResult;
    }

    filterSameVec(dstArray) {
        let tempArray = [];
        let rightMap = {};
        let len = dstArray.length;
        for (let i = 0; i < len; i++) {
            let temp = dstArray[i];
            temp.sort(function (a, b) {
                return a - b;
            });
            let curWeight = 0;
            for (let j = 0; j < temp.length; j++) {
                curWeight += Math.pow(10, temp.length - j) * temp[j];
            }
            if (rightMap[curWeight]) {
                continue;
            } else {
                rightMap[curWeight] = 1;
                tempArray.push(temp);
            }
        }
        return tempArray;
    }

    searchSameCard(cbHandCardData, cbReferCard, cbSameCardCount) {
        let cbHandCardCount = cbHandCardData.length;
        let pSearchCardResult = new TagSearchCardResult();
        let cbResultCount = 0;
        let cbCardData = cbHandCardData;
        let cbCardCount = cbHandCardCount;
        this.sortCardList(cbCardData, SortType.ST_NORMAL);
        let analyseResult = this.analyseCard(cbCardData);
        let cbReferLogicValue = cbReferCard == 0 ? 0 : this.getCardLogicValue(cbReferCard);
        let cbBlockIndex = cbSameCardCount - 1;
        do {
            for (let i = 0; i < analyseResult.cbBlockCount[cbBlockIndex]; i++) {
                let cbIndex = (analyseResult.cbBlockCount[cbBlockIndex] - i - 1) * (cbBlockIndex + 1);
                if (this.getCardLogicValue(analyseResult.cbCardData[cbBlockIndex][cbIndex]) > cbReferLogicValue) {
                    for (let j = 0; j < cbSameCardCount; j++) {
                        pSearchCardResult.cbResultCard[cbResultCount][j] = analyseResult.cbCardData[cbBlockIndex][cbIndex + j];
                    }
                    pSearchCardResult.cbCardCount[cbResultCount] = cbSameCardCount;
                    cbResultCount++;
                }
            }
            cbBlockIndex++;
        } while (cbBlockIndex < 4);
        pSearchCardResult.cbSearchCount = cbResultCount;
        return pSearchCardResult;
    }

    //搜索带牌//3 & 4
    searchTakeCardType(cbHandCardData, cbReferCard, cbSameCount, cbTakeCardCount) {
        let cbHandCardCount = cbHandCardData.length;
        let pSearchCardResult = new TagSearchCardResult();
        let cbResultCount = 0;
        if (cbSameCount != 3 && cbSameCount != 4)
            return pSearchCardResult;
        if (cbTakeCardCount != 1 && cbTakeCardCount != 2)
            return pSearchCardResult;

        if ((cbSameCount == 4 && cbHandCardCount < cbSameCount + cbTakeCardCount * 2) ||
            cbHandCardCount < cbSameCount + cbTakeCardCount)
            return pSearchCardResult;
        let cbCardData = cbHandCardData;
        let cbCardCount = cbHandCardCount;
        cbCardData = this.sortCardList(cbCardData, SortType.ST_NORMAL);

        let sameCardResult = this.searchSameCard(cbCardData, cbReferCard, cbSameCount);
        let cbSameCardResultCount = sameCardResult.cbSearchCount;

        if (cbSameCardResultCount > 0) {
            let analyseResult = this.analyseCard(cbCardData);
            let cbNeedCount = cbSameCount + cbTakeCardCount;
            if (cbSameCount == 4) {
                cbNeedCount += cbTakeCardCount;
            }
            for (let i = 0; i < cbSameCardResultCount; i++) {
                let bMerge = false;
                let sameTag = false;//带牌与同牌相同
                for (let j = cbTakeCardCount - 1; j < 4; j++) {
                    for (let k = 0; k < analyseResult.cbBlockCount[j]; k++) {
                        let cbIndex = (analyseResult.cbBlockCount[j] - k - 1) * (j + 1);
                        if (this.getCardValue(sameCardResult.cbResultCard[i][0]) ==
                            this.getCardValue(analyseResult.cbCardData[j][cbIndex])) {
                            continue;
                            // if (j + 1 >= cbSameCount + cbTakeCardCount) {
                            //     sameTag = true;
                            // } else {
                            //     continue;
                            // }
                        }
                        let cbCount = sameCardResult.cbCardCount[i];
                        if (sameTag) {
                            for (let k = 0; k < cbTakeCardCount; k++) {
                                sameCardResult.cbResultCard[i][cbCount + k] =
                                    analyseResult.cbCardData[j][cbIndex + k + cbSameCount];
                            }
                        } else {
                            for (let k = 0; k < cbTakeCardCount; k++) {
                                sameCardResult.cbResultCard[i][cbCount + k] = analyseResult.cbCardData[j][cbIndex + k];
                            }
                        }
                        sameCardResult.cbCardCount[i] += cbTakeCardCount;
                        if (sameCardResult.cbCardCount[i] < cbNeedCount) {
                            continue;
                        }
                        for (let k = 0; k < sameCardResult.cbCardCount[i]; k++) {
                            pSearchCardResult.cbResultCard[cbResultCount][k] = sameCardResult.cbResultCard[i][k];
                        }
                        pSearchCardResult.cbCardCount[cbResultCount] = sameCardResult.cbCardCount[i];
                        cbResultCount++;
                        bMerge = true;
                        break;
                    }
                    if (bMerge) {
                        break;
                    }
                }
            }
        }
        pSearchCardResult.cbSearchCount = cbResultCount;
        return pSearchCardResult;
    }

    //比较飞机
    comparePlane(cbFirstCard, cbNextCard) {
        if (cbFirstCard.length != cbNextCard.length) {
            return false;
        }
        let plane1 = this.checkIsPlane(cbFirstCard);
        let plane2 = this.checkIsPlane(cbNextCard);
        let logicValueVec1 = [];
        let logicValueVec2 = [];
        if (plane1 == plane2 && plane1 != DDZCardType.Type_None) {
            let searchResult = this.searchExactPlane(cbFirstCard);
            if (searchResult.cbSearchCount > 0) {
                for (let i = 0; i < searchResult.cbSearchCount; i++) {
                    if (searchResult.cbCardCount[i] == cbFirstCard.length) {
                        let tempCenterCard = searchResult.centerCardArray[i];
                        let tempWingCard = searchResult.wingsCardArray[i];
                        logicValueVec1 = this.getPlaneHeadLogicValueVec(searchResult.cbResultCard[i], tempCenterCard, tempWingCard);
                        break;
                    }
                }
            }

            searchResult = this.searchExactPlane(cbNextCard);
            if (searchResult.cbSearchCount > 0) {
                for (let i = 0; i < searchResult.cbSearchCount; i++) {
                    if (searchResult.cbCardCount[i] == cbNextCard.length) {
                        let tempCenterCard = searchResult.centerCardArray[i];
                        let tempWingCard = searchResult.wingsCardArray[i];
                        logicValueVec2 = this.getPlaneHeadLogicValueVec(searchResult.cbResultCard[i], tempCenterCard, tempWingCard);
                        break;
                    }
                }
            }
            return logicValueVec2[0] > logicValueVec1[0];
        }
        return false;
    }

    compareCard(cbFirstCard, cbNextCard, firstCardType) {
        let cbFirstCount = cbFirstCard.length;
        let cbNextCount = cbNextCard.length;
        let cbNextType = this.getCardType(cbNextCard);
        let cbFirstType = firstCardType;
        if (firstCardType == undefined) {
            cbFirstType = this.getCardType(cbFirstCard)[0];
        }
        if (cbFirstType == DDZCardType.Type_JokerZhaDan) {
            return false;
        }
        if (this.checkCardTypeContain(DDZCardType.Type_None, cbNextType)) {
            return false;
        }
        if (this.checkCardTypeContain(DDZCardType.Type_JokerZhaDan, cbNextType)) {
            return true;
        }
        if (this.checkCardTypeContain(DDZCardType.Type_ZhaDan_0, cbNextType) &&
            (cbFirstType < DDZCardType.Type_ZhaDan_0)) {
            return true;
        }
        if ((cbFirstType >= DDZCardType.Type_ZhaDan_0) &&
            (!this.checkCardTypeContain(DDZCardType.Type_ZhaDan_0, cbNextType)) &&
            (!this.checkCardTypeContain(DDZCardType.Type_JokerZhaDan, cbNextType))) {
            return false;
        }
        if ((!this.checkCardTypeContain(cbFirstType, cbNextType)) || (cbFirstCount != cbNextCount)) {
            return false;
        }
        switch (cbFirstType) {
            case DDZCardType.Type_Single:
            case DDZCardType.Type_DuiZi:
            case DDZCardType.Type_SanZhang_0:
            case DDZCardType.Type_ShunZi:
            case DDZCardType.Type_LianDui:
            case DDZCardType.Type_FeiJi_0:
            case DDZCardType.Type_ZhaDan_0:
                {
                    let cbNextLogicValue = this.getCardLogicValue(cbNextCard[0]);
                    let cbFirstLogicValue = this.getCardLogicValue(cbFirstCard[0]);
                    return cbNextLogicValue > cbFirstLogicValue;
                }
            case DDZCardType.Type_SanZhang_1:
            case DDZCardType.Type_SanZhang_2:
                {
                    let nextResult = this.analyseCard(cbNextCard);
                    let firstResult = this.analyseCard(cbFirstCard);
                    let cbNextLogicValue = this.getCardLogicValue(nextResult.cbCardData[2][0]);
                    let cbFirstLogicValue = this.getCardLogicValue(firstResult.cbCardData[2][0]);
                    return cbNextLogicValue > cbFirstLogicValue;
                }
            case DDZCardType.Type_ZhaDan_1:
            case DDZCardType.Type_ZhaDan_2:
                {
                    let nextResult = this.analyseCard(cbNextCard);
                    let firstResult = this.analyseCard(cbFirstCard);
                    let cbNextLogicValue = this.getCardLogicValue(nextResult.cbCardData[3][0]);
                    let cbFirstLogicValue = this.getCardLogicValue(firstResult.cbCardData[3][0]);
                    return cbNextLogicValue > cbFirstLogicValue;
                }
            default:
                {
                    //plane
                    return this.comparePlane(cbFirstCard, cbNextCard);
                }
        }
        return false;
    }

    searchOutCard(cbHandCardData, cbTurnCardData, turnOutType) {
        let pSearchCardResult = new TagSearchCardResult();
        let cbHandCardCount = cbHandCardData.length;
        let cbTurnCardCount = cbTurnCardData.length;
        let cbResultCount = 0;
        let cbTmpResultCount = 0;
        let cbCardData = cbHandCardData;
        let cbCardCount = cbHandCardCount;

        cbCardData = this.sortCardList(cbCardData, SortType.ST_NORMAL);
        let tmpSearchCardResult = new TagAnalyseResult();
        let cbTurnOutType = turnOutType;
        if (turnOutType == undefined) {
            cbTurnOutType = this.getCardType(cbTurnCardData)[0];
        }

        switch (cbTurnOutType) {
            case DDZCardType.Type_None:
                {
                    return cbResultCount;
                }
            case DDZCardType.Type_Single:
            case DDZCardType.Type_DuiZi:
            case DDZCardType.Type_SanZhang_0:
                {
                    let cbReferCard = cbTurnCardData[0];
                    let cbSameCount = 1;
                    if (cbTurnOutType == DDZCardType.Type_DuiZi) {
                        cbSameCount = 2;
                    } else if (cbTurnOutType == DDZCardType.Type_SanZhang_0) {
                        cbSameCount = 3;
                    }
                    pSearchCardResult = this.searchSameCard(cbCardData, cbReferCard, cbSameCount);
                    cbResultCount = pSearchCardResult.cbSearchCount;
                    break;
                }
            case DDZCardType.Type_ShunZi:
            case DDZCardType.Type_LianDui:
            case DDZCardType.Type_FeiJi_0:
                {
                    let cbBlockCount = 1;
                    if (cbTurnOutType == DDZCardType.Type_LianDui) {
                        cbBlockCount = 2;
                    } else if (cbTurnOutType == DDZCardType.Type_FeiJi_0) {
                        cbBlockCount = 3;
                    }
                    let cbLineCount = cbTurnCardCount / cbBlockCount;
                    pSearchCardResult = this.searchLineCardType(cbCardData, cbTurnCardData[0], cbBlockCount, cbLineCount);
                    cbResultCount = pSearchCardResult.cbSearchCount;
                    break;
                }
            case DDZCardType.Type_SanZhang_1:
            case DDZCardType.Type_SanZhang_2:
                {
                    if (cbCardCount < cbTurnCardCount) {
                        break;
                    }

                    if (cbTurnCardCount == 4 || cbTurnCardCount == 5) {
                        let cbTakeCardCount = cbTurnOutType == DDZCardType.Type_SanZhang_1 ? 1 : 2;
                        let cbTmpTurnCard = cbTurnCardData;
                        cbTmpTurnCard = this.sortOutCardList(cbTmpTurnCard);
                        pSearchCardResult = this.searchTakeCardType(cbCardData, cbTmpTurnCard[0], 3, cbTakeCardCount);
                        cbResultCount = pSearchCardResult.cbSearchCount;
                    } else {
                    }
                    break;
                }
            case DDZCardType.Type_ZhaDan_1:
            case DDZCardType.Type_ZhaDan_2:
                {
                    let cbTakeCount = cbTurnOutType == DDZCardType.Type_ZhaDan_1 ? 1 : 2;
                    let cbTmpTurnCard = cbTurnCardData;
                    cbTmpTurnCard = this.sortOutCardList(cbTmpTurnCard);
                    pSearchCardResult = this.searchTakeCardType(cbCardData, cbTmpTurnCard[0], 4, cbTakeCount);
                    cbResultCount = pSearchCardResult.cbSearchCount;
                    break;
                }
        }
        //plane
        if (cbTurnOutType == DDZCardType.Type_FeiJi_1 || cbTurnOutType == DDZCardType.Type_FeiJi_2) {
            let searchResult = this.searchExactPlane(cbTurnCardData);
            let takeCount = 0, lineCount = 0, referCardData = 0;
            for (let i = 0; i < searchResult.cbSearchCount; i++) {
                if (searchResult.cbCardCount[i] == cbTurnCardData.length) {
                    let tempCenterCard = searchResult.centerCardArray[i];
                    let tempWingCard = searchResult.wingsCardArray[i];
                    lineCount = tempCenterCard.length / 3;
                    takeCount = tempWingCard.length / lineCount;
                    referCardData = tempCenterCard[tempCenterCard.length - 1];
                    break;
                }
            }
            if (referCardData != 0) {
                pSearchCardResult = this.searchPlaneW(cbHandCardData, referCardData, takeCount, lineCount);
                cbResultCount = pSearchCardResult.cbSearchCount;
            }
        }

        if (cbCardCount >= 4 && cbTurnOutType <= DDZCardType.Type_ZhaDan_0) {
            let cbReferCard = 0;
            if (cbTurnOutType == DDZCardType.Type_ZhaDan_0) {
                cbReferCard = cbTurnCardData[0];
            }
            tmpSearchCardResult = this.searchSameCard(cbCardData, cbReferCard, 4);
            cbTmpResultCount = tmpSearchCardResult.cbSearchCount;
            let needAdd = false;
            for (let i = 0; i < cbTmpResultCount; i++) {
                needAdd = cbResultCount > 20;
                if (needAdd) {
                    pSearchCardResult.cbCardCount.push(tmpSearchCardResult.cbCardCount[i]);
                    let cardData = [];
                    for (let j = 0; j < tmpSearchCardResult.cbCardCount[i]; j++) {
                        cardData[j] = tmpSearchCardResult.cbResultCard[i][j];
                    }
                    pSearchCardResult.cbResultCard.push(cardData);
                } else {
                    pSearchCardResult.cbCardCount[cbResultCount] = tmpSearchCardResult.cbCardCount[i];
                    for (let j = 0; j < tmpSearchCardResult.cbCardCount[i]; j++) {
                        pSearchCardResult.cbResultCard[cbResultCount][j] = tmpSearchCardResult.cbResultCard[i][j];
                    }
                }

                cbResultCount++;
            }
        }
        //joker
        let color0 = this.getCardColor(cbCardData[0]);
        let color1 = this.getCardColor(cbCardData[1]);

        if ((cbTurnOutType != DDZCardType.Type_JokerZhaDan) && (cbCardCount >= 2) &&
            (color0 == EPokerType.ePoker_Joker) && (color1 == EPokerType.ePoker_Joker)) {
            pSearchCardResult.cbCardCount[cbResultCount] = 2;
            pSearchCardResult.cbResultCard[cbResultCount][0] = cbCardData[0];
            pSearchCardResult.cbResultCard[cbResultCount][1] = cbCardData[1];
            cbResultCount++;
        }
        pSearchCardResult.cbSearchCount = cbResultCount;
        return pSearchCardResult;
    }

    searchLineFromCardVec(cardDataVec) {
        let cardDataTemp = [];
        for (let i in cardDataVec) {
            cardDataTemp.push(cardDataVec[i]);
        }
        //first find 3Sequence
        let pSearchCardResult3 = this.searchLineCardType(cardDataTemp, 0, 3, 0);
        if (pSearchCardResult3.cbSearchCount > 0) {
            return {
                blockCount: 3,
                searchResult: pSearchCardResult3,
            };
        }
        //find  2Sequence
        let pSearchCardResult2 = this.searchLineCardType(cardDataTemp, 0, 2, 0);
        if (pSearchCardResult2.cbSearchCount > 0) {
            return {
                blockCount: 2,
                searchResult: pSearchCardResult2,
            };
        }
        //find  sequence
        let pSearchCardResult1 = this.searchLineCardType(cardDataTemp, 0, 1, 0);
        if (pSearchCardResult1.cbSearchCount > 0) {
            return {
                blockCount: 1,
                searchResult: pSearchCardResult1,
            };
        }
        return null;
    }

    debugShowCardType(cardType) {
        switch (cardType) {
            case DDZCardType.Type_None:
                return 'None|';
            case DDZCardType.Type_Single:
                return 'Single|';
            case DDZCardType.Type_DuiZi:
                return 'Double|';
            case DDZCardType.Type_SanZhang_0:
                return '3 + 0|';
            case DDZCardType.Type_SanZhang_1:
                return '3 + 1|';
            case DDZCardType.Type_SanZhang_2:
                return '3 + 2|';
            case DDZCardType.Type_ShunZi:
                return 'Single Sequence|';
            case DDZCardType.Type_LianDui:
                return 'Double Sequence|';
            case DDZCardType.Type_FeiJi_0:
                return 'Plane Without Wing|';
            case DDZCardType.Type_FeiJi_1:
                return 'Plane With Single Wing|';
            case DDZCardType.Type_FeiJi_2:
                return 'Plane With Double Wing|';
            case DDZCardType.Type_ZhaDan_2:
                return '4 + 2|';
            case DDZCardType.Type_ZhaDan_1:
                return '4 + 1 + 1|';
            case DDZCardType.Type_ZhaDan_0:
                return 'Bomb|';
            case DDZCardType.Type_JokerZhaDan:
                return 'Rocket|';
            default:
                return '';
        }
    }

    //type translation
    switchCardTypeToServerType(cardType) {
        switch (cardType) {
            case DDZCardType.Type_None:
                return -1;
            case DDZCardType.Type_Single:
                return DDZ_Type.DDZ_Single;
            case DDZCardType.Type_DuiZi:
                return DDZ_Type.DDZ_Pair;
            case DDZCardType.Type_SanZhang_0:
                return DDZ_Type.DDZ_3Pices;
            case DDZCardType.Type_SanZhang_1:
            case DDZCardType.Type_SanZhang_2:
                return DDZ_Type.DDZ_3Follow1;
            case DDZCardType.Type_ShunZi:
                return DDZ_Type.DDZ_SingleSequence;
            case DDZCardType.Type_LianDui:
                return DDZ_Type.DDZ_PairSequence;
            case DDZCardType.Type_FeiJi_0:
                return DDZ_Type.DDZ_3PicesSeqence;
            case DDZCardType.Type_FeiJi_1://飞机带2单张
            case DDZCardType.Type_FeiJi_2://飞机带2对
                return DDZ_Type.DDZ_AircraftWithWings;
            case DDZCardType.Type_ZhaDan_2://四带两对
            case DDZCardType.Type_ZhaDan_1://四带两张单
                return DDZ_Type.DDZ_4Follow2;
            case DDZCardType.Type_ZhaDan_0://炸弹
                return DDZ_Type.DDZ_Bomb;
            case DDZCardType.Type_JokerZhaDan://炸弹
                return DDZ_Type.DDZ_Rokect;
        }
    }

    switchServerTypeToCardType(serverType, cardDataVec) {
        switch (serverType) {
            case DDZ_Type.DDZ_Single:
                return DDZCardType.Type_Single;
            case DDZ_Type.DDZ_Pair:
                return DDZCardType.Type_DuiZi;
            case DDZ_Type.DDZ_3Pices:
                return DDZCardType.Type_SanZhang_0;
            case DDZ_Type.DDZ_SingleSequence:
                return DDZCardType.Type_ShunZi;
            case DDZ_Type.DDZ_PairSequence:
                return DDZCardType.Type_LianDui;
            case DDZ_Type.DDZ_3PicesSeqence:
                return DDZCardType.Type_FeiJi_0;
            case DDZ_Type.DDZ_Bomb://炸弹
                return DDZCardType.Type_ZhaDan_0;
            case DDZ_Type.DDZ_Rokect://炸弹
                return DDZCardType.Type_JokerZhaDan;
            case DDZ_Type.DDZ_3Follow1:
            case DDZ_Type.DDZ_AircraftWithWings:
            case DDZ_Type.DDZ_4Follow2:
                return this.anlyseServerCardTypeToMyType(serverType, cardDataVec);
            default:
                return DDZCardType.Type_None;
        }
    }

    anlyseServerCardTypeToMyType(serverType, cardDataVec) {
        let tempCardData = [];
        for (let i in cardDataVec) {
            tempCardData.push(cardDataVec[i]);
        }
        tempCardData = this.sortCardList(tempCardData, SortType.ST_NORMAL);
        let cardType = this.getCardType(tempCardData);
        if (serverType == DDZ_Type.DDZ_3Follow1) {
            for (let i = 0; i < cardType.length; i++) {
                if (cardType[i] == DDZCardType.Type_SanZhang_1) {
                    return DDZCardType.Type_SanZhang_1;
                } else if (cardType[i] == DDZCardType.Type_SanZhang_2) {
                    return DDZCardType.Type_SanZhang_2;
                }
            }
            console.log('Error cardType:' + serverType);

        } else if (serverType == DDZ_Type.DDZ_4Follow2) {
            for (let i = 0; i < cardType.length; i++) {
                if (cardType[i] == DDZCardType.Type_ZhaDan_2) {
                    return DDZCardType.Type_ZhaDan_2;
                } else if (cardType[i] == DDZCardType.Type_ZhaDan_1) {
                    return DDZCardType.Type_ZhaDan_1;
                }
            }
            console.log('Error cardType:' + serverType);

        } else if (serverType == DDZ_Type.DDZ_AircraftWithWings) {
            for (let i = 0; i < cardType.length; i++) {
                if (cardType[i] == DDZCardType.Type_FeiJi_1) {
                    return DDZCardType.Type_FeiJi_1;
                } else if (cardType[i] == DDZCardType.Type_FeiJi_2) {
                    return DDZCardType.Type_FeiJi_2;
                }
            }
            console.log('Error cardType:' + serverType);
        } else {
            console.log('Error cardType:' + serverType);
            return DDZCardType.Type_None;
        }

    }

    parseToCardType(cardResVec, cardType) {
        let dstCardsVec = [];
        switch (cardType) {
            case DDZCardType.Type_None:
            case DDZCardType.Type_Single:
            case DDZCardType.Type_DuiZi:
            case DDZCardType.Type_SanZhang_0:
            case DDZCardType.Type_ZhaDan_0:
            case DDZCardType.Type_JokerZhaDan:
                {
                    for (let i in cardResVec) {
                        dstCardsVec.push(cardResVec[i]);
                    }
                    return dstCardsVec;
                }
            case DDZCardType.Type_SanZhang_1:
            case DDZCardType.Type_SanZhang_2:
                {
                    let analyseResult = this.analyseCard(cardResVec);
                    for (let i = 0; i < analyseResult.cbBlockCount[2] * 3; i++) {
                        dstCardsVec.push(analyseResult.cbCardData[2][i]);
                    }
                    for (let i = 0; i < analyseResult.cbBlockCount[1] * 2; i++) {
                        dstCardsVec.push(analyseResult.cbCardData[1][i]);
                    }
                    for (let i = 0; i < analyseResult.cbBlockCount[0] * 1; i++) {
                        dstCardsVec.push(analyseResult.cbCardData[0][i]);
                    }

                    return dstCardsVec;
                }
            case DDZCardType.Type_ShunZi:
                {
                    let analyseResult = this.analyseCard(cardResVec);
                    for (let i = analyseResult.cbBlockCount[0] * 1 - 1; i >= 0; i--) {
                        dstCardsVec.push(analyseResult.cbCardData[0][i]);
                    }
                    return dstCardsVec;
                }
            case DDZCardType.Type_LianDui:
                {
                    let analyseResult = this.analyseCard(cardResVec);
                    for (let i = analyseResult.cbBlockCount[1] * 2 - 1; i >= 0; i--) {
                        dstCardsVec.push(analyseResult.cbCardData[1][i]);
                    }
                    return dstCardsVec;
                }
            case DDZCardType.Type_FeiJi_0:
                {
                    let analyseResult = this.analyseCard(cardResVec);
                    for (let i = analyseResult.cbBlockCount[2] * 3 - 1; i >= 0; i--) {
                        dstCardsVec.push(analyseResult.cbCardData[2][i]);
                    }
                    return dstCardsVec;
                }
            case DDZCardType.Type_FeiJi_1:
            case DDZCardType.Type_FeiJi_2:
                {
                    if (this.checkIsPlane(cardResVec) == cardType) {
                        var searchResult = this.searchExactPlane(cardResVec);
                        let tempCenterCard = searchResult.centerCardArray[0];
                        let tempWingCard = searchResult.wingsCardArray[0];
                        for (let i = 0; i < tempCenterCard.length; i++) {
                            if (tempCenterCard[i] == 0) {
                                break;
                            }
                            dstCardsVec.push(tempCenterCard[i]);
                        }
                        for (let i = 0; i < tempWingCard.length; i++) {
                            if (tempWingCard[i] == 0) {
                                break;
                            }
                            dstCardsVec.push(tempWingCard[i]);
                        }
                        return dstCardsVec;
                    }
                }
            case DDZCardType.Type_ZhaDan_2:
                {
                    let analyseResult = this.analyseCard(cardResVec);
                    if (analyseResult.cbBlockCount[3] == 1) {
                        for (let i = analyseResult.cbBlockCount[3] * 4 - 1; i >= 0; i--) {
                            dstCardsVec.push(analyseResult.cbCardData[3][i]);
                        }
                        for (let i = analyseResult.cbBlockCount[1] * 2 - 1; i >= 0; i--) {
                            dstCardsVec.push(analyseResult.cbCardData[1][i]);
                        }
                        return dstCardsVec;
                    } else {
                        for (let i = 0; i < analyseResult.cbBlockCount[3] * 4; i++) {
                            dstCardsVec.push(analyseResult.cbCardData[3][i]);
                        }
                        return dstCardsVec;
                    }
                }
            case DDZCardType.Type_ZhaDan_1:
                {
                    let analyseResult = this.analyseCard(cardResVec);
                    for (let i = analyseResult.cbBlockCount[3] * 4 - 1; i >= 0; i--) {
                        dstCardsVec.push(analyseResult.cbCardData[3][i]);
                    }
                    if (analyseResult.cbBlockCount[1] == 1) {
                        for (let i = analyseResult.cbBlockCount[1] * 2 - 1; i >= 0; i--) {
                            dstCardsVec.push(analyseResult.cbCardData[1][i]);
                        }
                    } else {
                        for (let i = analyseResult.cbBlockCount[0] * 1 - 1; i >= 0; i--) {
                            dstCardsVec.push(analyseResult.cbCardData[0][i]);
                        }
                    }
                    return dstCardsVec;
                }
        }

    }
};

export default new GameLogic();
