var GameLogicIns = require('GameLogic').GameLogic.instance;
var ResMgrIns = require('ResManager').ResManager.instance;
var DDZGameDefine = require('DDZGameDefine');
var DDZCardType = DDZGameDefine.DDZCardType;
var SortType = DDZGameDefine.SortType;
var CardNodeScale = 0.5;

cc.Class({
    extends: cc.Component,

    properties: {
        m_btn: cc.Button,
        m_startNode: cc.Node,
        m_cardLabel: cc.Label,
        _cardType: 0,
    },

    init: function(cardDataVec, localCardType, selectedResp) {
        this.m_cardLabel.node.setLocalZOrder(10);
        this._cardType = localCardType;
        this._cardArray = [];
        for (let i in cardDataVec) {
            this._cardArray[i] = cardDataVec[i];
        }
        this._cardArray = GameLogicIns.sortCardList(this._cardArray, SortType.ST_NORMAL);
        let parseCardVec = GameLogicIns.parseToCardType(this._cardArray, localCardType);
        this.showCardArray(parseCardVec);
        this._resp = selectedResp;
    },

    showCardArray: function(cardDataVec) {
        this.m_cardLabel.string = GameLogicIns.debugShowCardType(this._cardType);
        var cardPrefab = ResMgrIns.getRes('PokerCardNode');
        let demoNode = cc.instantiate(cardPrefab);
        let cardNum = cardDataVec.length;
        let cardNodesLength = demoNode.width / 3.5 * CardNodeScale * (cardNum - 1) + demoNode.width * CardNodeScale;
        let startPos = this.m_startNode.getPosition();
        this.m_btn.node.width = cardNodesLength + 100.0;
        this.m_btn.node.height = demoNode.height * CardNodeScale;
        startPos.x -= cardNodesLength / 2.0 - demoNode.width / 2.0 * CardNodeScale;
        for (let i = 0; i < cardDataVec.length; i++) {
            let n = cc.instantiate(cardPrefab);
            n.getComponent('PokerCardNode').initWithCardData(cardDataVec[i]);
            this.node.addChild(n);
            n.setScale(CardNodeScale);
            n.setPosition(cc.p(startPos.x + n.width / 3.5 * CardNodeScale * i, startPos.y));
        }
    },

    onSelected: function (event, customData) {
        let btn = event.target.getComponent(cc.Button);
        if (btn == this.m_btn) {
            this._resp(this._cardType);
        }
    },

});
