import CardUtils from '../../../Utils/GamePlay/CardUtils';
import { Card } from '../../../Utils/GamePlay/Cards';
import { EmCardTpye } from '../../../Define/GamePlayDefine';

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardDisplay extends cc.Component {

    @property(cc.Sprite)
    cardImg: cc.Sprite = null;

    @property(cc.Sprite)
    cardNum: cc.Sprite = null;

    @property(cc.Sprite)
    cardType: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    m_spriteAtlas: cc.SpriteAtlas = null;

    @property(cc.Size)
    m_numberSize: cc.Size = new cc.Size(50, 50);
    @property(cc.Size)
    m_peopleSize: cc.Size = new cc.Size(60, 70);

    private _card: Card = null;

    setNum(num: number) {
        this._card = new Card(num);
        
        if (!this._card.isCardValid()) {
            cc.warn('CardDisplay setNum invalid number =' + num);
            return;
        }

        this._updateView();
    }

    getCard(): Card {
        return this._card;
    }

    setGray(isGray: boolean) {
        let val = isGray ? 128 : 255;
        let clr = new cc.Color(val, val, val);
        this.cardNum.node.color = clr;
        this.cardType.node.color = clr;
        this.cardImg.node.color = clr;
        this.node.color = clr;
    }

    private _updateView() {
        if (!this._card) {
            cc.warn(`CardDisplay _updateView this._card null`);
            return;
        }
        let type: EmCardTpye = this._card.type;
        let value: number = this._card.value;

        let isBlack: boolean = (type == EmCardTpye.CardType_club || type == EmCardTpye.CardType_Spade);
        let vCardType: string[] = ['D', 'C', 'B', 'A'];

        let strNum: string;
        let strMiniType: string;
        let strCardImg: string;

        // num
        strNum = 'card_num_' + (isBlack ? 'b' : 'r') + '_' + value;
        strMiniType = 'card_miniTag_' + vCardType[type] + '_1';

        // card img
        if (value < 11 || value == 14) {
            strCardImg = 'card_tag_' + vCardType[type] + '_1';
            this.cardImg.node.setContentSize(this.m_numberSize);
        }
        else  // j q k 
        {
            strCardImg = 'card_people_' + (isBlack ? 'b' : 'r') + '_' + value;
            this.cardImg.node.setContentSize(this.m_peopleSize);
        }

        let numFrame = this.m_spriteAtlas.getSpriteFrame(strNum);
        let miniTypeFrame = this.m_spriteAtlas.getSpriteFrame(strMiniType);
        let cardImgFrame = this.m_spriteAtlas.getSpriteFrame(strCardImg);
        if (null != numFrame) {
            this.cardNum.spriteFrame = numFrame;
        }

        if (null != miniTypeFrame) {
            this.cardType.spriteFrame = miniTypeFrame;
        }

        if (null != cardImgFrame) {
            this.cardImg.spriteFrame = cardImgFrame;
        }
        this.cardNum.node.active = null != numFrame;
        this.cardType.node.active = null != miniTypeFrame;
        this.cardImg.node.active = null != cardImgFrame;
    }
}
