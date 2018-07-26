const { ccclass } = cc._decorator;

@ccclass
export default class DDZEffectBomb extends cc.Component {
    onLoad() {

    }

    onDestroy() {

    }

    init(pos: cc.Vec2) {
        this.node.setPosition(pos);
        this.runBombAct(pos);
    }

    runBombAct(pos: cc.Vec2) {
        var x3 = cc.p(0, 0);
        var x2 = cc.p(pos.x/3, 0);

        if (pos.y > 0) {
            x2 = cc.p(0, pos.y);
        }
        
        var bezier1 = cc.bezierTo(0.5, [pos, x2, x3]);
        this.node.runAction(cc.sequence(bezier1, cc.delayTime(2), cc.removeSelf()));
    }
}
