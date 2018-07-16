var GameLogicIns = require('GameLogic').GameLogic.instance;

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    start () {

    },

    onLoad: function() {
        GameLogicIns.makeCards();
        //let handCardVec = [40, 51, 88, 96, 104, 32, 25, 57, 98, 41, 97, 42, 49, 56, 67];
        //let handCardVec = [48, 49, 50, 56, 57, 58, 96, 106, 65, 66, 67, 42, 43, 104, 105, 107, 112, 113, 115, 128, 129, 130, 148];
        //let handCardVec = [24, 33, 40, 41, 42, 48, 56, 72, 80, 88, 96, 97, 104, 112, 131];
        //let handCardVec = [24, 25, 32, 48, 49, 50, 41, 42, 43, 58, 56, 59, 72, 88, 99, 107, 115, 128, 131, 114, 129];
        //let handCardVec = [25, 26, 32, 33, 48, 49, 50, 41, 42, 43, 58, 56, 59];
        
        //let handCardVec = [24, 25, 26, 32, 33, 34, 40, 41, 42, 48, 49, 50, 57, 58, 112];
        //let handCardVec = [32, 33, 34, 35, 40, 41, 42, 43, 56, 57, 64, 65, 73, 74, 75, 72];
        //let handCardVec = [32, 33, 34, 35, 40, 41, 42, 43];//4 + 4 -> 3 + 3 + 1 + 1
        let handCardVec = [32, 33, 34, 35, 40,41,42,43, 48,49,50,51];
        ///let handCardVec = [32,33,34,40,41,42,48,49,50,56,57,58,64,65,66,72,73,74,80,81,82,88,89,90];
        let h = GameLogicIns.sortCardList(handCardVec, 0);
        let hh = GameLogicIns.removeCardList([131, 114, 129], 3, h, h.length);
        let result = GameLogicIns.searchLineCardType(h, 32, 3, 2);//check
        result = GameLogicIns.searchLineCardType(h, 104, 1, 5);
        result = GameLogicIns.searchPlane(h);
        result = GameLogicIns.searchSameCard(h, 0, 2);//check
        result = GameLogicIns.searchTakeCardType(h, 0, 3, 1);//
        GameLogicIns.searchPlaneW(h, 24, 2, 3);
        GameLogicIns.searchPlaneW(h, 24, 1, 3);

        let otherCard = [42, 25, 41, 24, 43, 40, 26, 27];
        otherCard = GameLogicIns.sortCardList(otherCard, 0);
       // otherCard = GameLogicIns.sortOutCardList(otherCard);

        //let ss = [24, 25, 26, 27, 32, 33, 34, 35, 40, 41, 42, 48];
        let ss = [56, 57, 58, 64, 65, 66, 72, 73, 74, 80, 81, 82, 83, 96, 99];
        ss = GameLogicIns.sortCardList(ss, 0);
        let xx = GameLogicIns.searchExactPlane(ss);
        let cardType = GameLogicIns.getCardType(ss);
        GameLogicIns.searchPlaneW(ss, 24, 2, 3);

        ss = [56, 57, 58, 64, 65, 66, 72, 73, 74, 80, 81, 82, 83, 96, 99, 112];
        ss = GameLogicIns.sortCardList(ss, 0);
        cardType = GameLogicIns.getCardType(ss);

        ss = [32,33,34,40,41,42,48,49,50,56,57,58,64,65,66,72,73,74,80,81,82,88,89,90];
        ss = GameLogicIns.sortCardList(ss, 0);
        cardType = GameLogicIns.getCardType(ss);

        ss = [64,66, 67, 73, 74, 75, 80, 82, 83,  88, 90, 91, 89, 40, 41];//3 + 2
        ss = GameLogicIns.sortCardList(ss, 0);
        cardType = GameLogicIns.getCardType(ss);

        result = GameLogicIns.searchPlane(ss);
        result = GameLogicIns.searchTakeCardType(ss, 0, 3, 1);//

        let mm = [88, 89, 90, 91, 73, 74, 75, 72, 80, 82, 83, 96, 97, 98, 24, 25, 32, 33, 56, 59, 128, 131, 129];
        mm = GameLogicIns.sortCardList(mm, 0);
        let cp = GameLogicIns.compareCard(ss, mm);
        let outRes = GameLogicIns.searchOutCard(mm, ss);
    },
});
