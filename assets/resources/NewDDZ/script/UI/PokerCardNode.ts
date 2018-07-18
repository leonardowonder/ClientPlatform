const { ccclass, property } = cc._decorator;

import ResManager from '../Module/Custom/ResManager';
import GameLogic from '../Data/../Module/Game/GameLogic';
import { EPokerType } from '../Module/DDZGameDefine';

let ResMgrIns = ResManager.getInstance();
let GameLogicIns = GameLogic.getInstance();
var StandOffset = 20.0;

@ccclass
export default class PokerCardNode extends cc.Component {
    @property(cc.Sprite)
    m_jokerSprite: cc.Sprite = null;
    @property(cc.SpriteFrame)
    m_jokerSpriteFrames: cc.SpriteFrame[] = [];
    @property(cc.Sprite)
    m_cardNumSprite: cc.Sprite = null;
    @property(cc.Sprite)
    m_cardColorSprite: cc.Sprite = null;
    @property(cc.Node)
    m_cardBgNode: cc.Node = null;

    _cardData: number = -1;
    _selectedState: boolean = false;
    _isGray: boolean = false;


    initWithCardData (cardData) {
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
    }

    getCardSpriteFrameName (cardData) {//{cardNum, cardColor, JokerNum}
        let cardValue = GameLogicIns.getCardValue(cardData);
        let cardColor = GameLogicIns.getCardColor(cardData);
        var imageName = "LargeCard_commom_shuzi";
        let typeName = '';
        switch (cardColor) {
            case EPokerType.ePoker_Heart:
            case EPokerType.ePoker_Diamond:
                imageName += "_hong";
                break;
            case EPokerType.ePoker_Sword:
            case EPokerType.ePoker_Club:
                imageName += "_hei";
                break;
            case EPokerType.ePoker_Joker:
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
            case EPokerType.ePoker_Heart:
                typeName = "LargeCard_huase_2";
                break;
            case EPokerType.ePoker_Diamond:
                typeName = "LargeCard_huase_4";
                break;
            case EPokerType.ePoker_Sword:
                typeName = "LargeCard_huase_1";
                break;
            case EPokerType.ePoker_Club:
                typeName = "LargeCard_huase_3";
                break;
        }
    
        return {
            cardNumSp: imageName,
            cardColorSp: typeName,
            JokerNum: null,
        };
    }

    setCardGray (grayTag) {
        if (this._isGray == grayTag) {
            return;
        }
        this._isGray = grayTag;
        let color = grayTag ? cc.Color.GRAY : cc.Color.WHITE;
        this.m_cardBgNode.color = color;
        this.m_cardNumSprite.node.color = color;
        this.m_cardColorSprite.node.color = color;
        this.m_jokerSprite.node.color = color;

    }

    standCard () {
        if (this._selectedState) {
            return;
        }
        var pos = this.node.getPosition();
        this.node.setPosition(cc.p(pos.x, pos.y + StandOffset));
        this._selectedState = true;
    }

    sitCard () {
        if (!this._selectedState) {
            return;
        }
        var pos = this.node.getPosition();
        this.node.setPosition(cc.p(pos.x, pos.y - StandOffset));
        this._selectedState = false;
    }
};
