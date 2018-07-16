var ResMgrIns = require('ResManager').ResManager.instance;
var GameLogicIns = require('GameLogic').GameLogic.instance;
var DDZGameDefine = require('DDZGameDefine');
var DDZCardType = DDZGameDefine.DDZCardType;
var SortType = DDZGameDefine.SortType;

cc.Class({
    extends: cc.Component,

    properties: {
        m_tagNode0: cc.Node,
        m_tagNode1: cc.Node,
    },

    init: function(cardDataVec, selectResp) {
        this._selectResp = selectResp;
        this._cardDataVec = [];
        for (let i in cardDataVec) {
            this._cardDataVec[i] = cardDataVec[i];
        }   
        this._cardDataVec = GameLogicIns.sortCardList(this._cardDataVec, SortType.ST_NORMAL);
        let cardType = GameLogicIns.getCardType(this._cardDataVec);
        if (cardType.length == 0) {
            console.log('TypeError');
        } else {
           this.initCells(cardType);
        }
    },

    initCells: function(cardTypeVec) {
        let typeCount = cardTypeVec.length;
        let startPos = this.m_tagNode0.getPosition();
        let deltaPos = this.m_tagNode1.getPosition();
        let deltaDis = startPos.y - deltaPos.y;
        var cellPrefab = ResMgrIns.getRes('SelectedCardTypeCell');
        for (let i = 0; i < typeCount; i++) {
            let demoNode = cc.instantiate(cellPrefab);
            let comp = demoNode.getComponent('SelectCardTypeCell');
            comp.init(this._cardDataVec, cardTypeVec[i], this.onCellSelected.bind(this));
            this.node.addChild(demoNode);
            demoNode.setPosition(cc.p(0, startPos.y + deltaDis * i));
        }
    },

    onLayoutCall: function(event, customData) {
        this.close();
    },

    close: function() {
        this.node.destroy();
    },

    onCellSelected: function(localType) {
        if (this._selectResp) {
            this._selectResp(localType);
        }
        this.close();
    },
});
