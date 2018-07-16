var GameLogicIns = require('GameLogic').GameLogic.instance;
var DDZGameDefine = require('DDZGameDefine');
var ResMgrIns = require('ResManager').ResManager.instance;
var PockerType = DDZGameDefine.EPokerType;
var StandOffset = 20.0;

cc.Class({
    extends: cc.Component,

    properties: {
        m_jokerSprite: cc.Sprite,
        m_jokerSpriteFrames: [cc.SpriteFrame],
        m_cardNumSprite: cc.Sprite,
        m_cardColorSprite: cc.Sprite,
        m_cardBgNode: cc.Node,

        _cardData: -1,
        _selectedState: false,
        _isGray: false,
    },

    start () {

    },

    initWithCardData: function(cardData) {
        this.setCardGray(false);
        this._cardData = cardData;

        let spriteAtlas = ResMgrIns.getRes('large_pai');
        let spriteFrameStruct = this.getCardSpriteFrameName(cardData);
        if (spriteFrameStruct.cardNumSp == null) {
            this.m_jokerSprite.node.active = true,
            this.m_jokerSprite.spriteFrame = spriteAtlas.getSpriteFrame(spriteFrameStruct.JokerNum);
            this.m_cardNumSprite.node.active = false;
            this.m_cardColorSprite.node.active = false;
        } else {
            this.m_jokerSprite.node.active = false,
            this.m_cardNumSprite.node.active = true;
            this.m_cardColorSprite.node.active = true;
            this.m_cardNumSprite.spriteFrame = spriteAtlas.getSpriteFrame(spriteFrameStruct.cardNumSp);
            this.m_cardColorSprite.spriteFrame = spriteAtlas.getSpriteFrame(spriteFrameStruct.cardColorSp);

        }
    },

    getCardSpriteFrameName: function(cardData) {//{cardNum, cardColor, JokerNum}
        let cardValue = GameLogicIns.getCardValue(cardData);
        let cardColor = GameLogicIns.getCardColor(cardData);
        var imageName = "LargeCard_commom_shuzi";
        let typeName = '';
        switch (cardColor) {
            case PockerType.ePoker_Heart:
            case PockerType.ePoker_Diamond:
                imageName += "_hong";
                break;
            case PockerType.ePoker_Sword:
            case PockerType.ePoker_Club:
                imageName += "_hei";
                break;
            case PockerType.ePoker_Joker:
                if (cardValue == 18) {
                    imageName = "LargeCard_king_14";
                } else {
                    imageName = "LargeCard_king_15";
                }
                return {
                    cardNumSp: null,
                    cardColorSp: null,
                    JokerNum: imageName,
                };
        }
        if (cardValue == 16) {
            imageName += "_2";
        } else if (cardValue == 14) {
            imageName += "_1";
        } else {
            imageName += "_" + cardValue.toString();
        }

        switch (cardColor) {
            case PockerType.ePoker_Heart:
                typeName = "LargeCard_huase_2";
                break;
            case PockerType.ePoker_Diamond:
                typeName = "LargeCard_huase_4";
                break;
            case PockerType.ePoker_Sword:
                typeName = "LargeCard_huase_1";
                break;
            case PockerType.ePoker_Club:
                typeName = "LargeCard_huase_3";
                break;
        }
    
        return {
            cardNumSp: imageName,
            cardColorSp: typeName,
            JokerNum: null,
        };
    },

    setCardGray: function(grayTag) {
        if (this._isGray == grayTag) {
            return;
        }
        this._isGray = grayTag;
        let color = grayTag ? cc.Color.GRAY : cc.Color.WHITE;
        this.m_cardBgNode.color = color;
        this.m_cardNumSprite.node.color = color;
        this.m_cardColorSprite.node.color = color;
        this.m_jokerSprite.node.color = color;

    },

    standCard: function() {
        if (this._selectedState) {
            return;
        }
        var pos = this.node.getPosition();
        this.node.setPosition(cc.p(pos.x, pos.y + StandOffset));
        this._selectedState = true;
    },

    sitCard: function() {
        if (!this._selectedState) {
            return;
        }
        var pos = this.node.getPosition();
        this.node.setPosition(cc.p(pos.x, pos.y - StandOffset));
        this._selectedState = false;
    },
});
