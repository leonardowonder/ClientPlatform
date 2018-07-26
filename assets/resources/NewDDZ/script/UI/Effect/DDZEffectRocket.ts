const { ccclass, property } = cc._decorator;

@ccclass
export default class DDZEffectRocket extends cc.Component {
    @property(cc.Prefab)
    m_pDDZHuoJian1: cc.Prefab = null;

    @property(cc.Prefab)
    m_pDDZHuoJian2: cc.Prefab = null;


    onLoad() {

    }

    onDestroy() {

    }

    init(pos: cc.Vec2) {
        var node = cc.instantiate(this.m_pDDZHuoJian1);
        node.setPosition(pos);
        this.node.addChild(node)
        
        var action = cc.callFunc(() => {
            node.removeFromParent(true);
            var node1 = cc.instantiate(this.m_pDDZHuoJian2);
            this.node.addChild(node1);
            node1.setPosition(cc.p(0, 0));
            var action1 = cc.callFunc(() => {
                node1.removeFromParent(true);
            });
            node1.runAction(cc.sequence(cc.delayTime(4), action1));
        });

        node.runAction(cc.sequence(cc.delayTime(1), action));
    }
}
