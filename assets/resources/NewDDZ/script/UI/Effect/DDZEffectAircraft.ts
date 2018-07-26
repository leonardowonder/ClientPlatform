const { ccclass, property } = cc._decorator;

@ccclass
export default class DDZEffectAircraft extends cc.Component {
    @property(cc.Node)
    m_pFeiJiNode: cc.Node = null;
    
    @property(cc.Sprite)
    m_pFeiJiZiSprite: cc.Sprite = null;

    onLoad() {
        
    }

    onDestroy() {
        
    }

    init() {
        this.runFeiJiAct();
    }
    
    runFeiJiAct () {
        this.m_pFeiJiNode.runAction(cc.moveTo(0.8, cc.p(900, 0)).easing(cc.easeSineIn()));
        
        this.m_pFeiJiZiSprite.node.opacity = 0;
        this.m_pFeiJiZiSprite.node.runAction(cc.spawn(cc.moveTo(0.6, cc.p(0, -113)).easing(cc.easeSineIn()), cc.fadeIn(1)));
        this.node.runAction(cc.sequence(cc.delayTime(2), cc.removeSelf()));
    }
}
