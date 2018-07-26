const { ccclass, property } = cc._decorator;

@ccclass
export default class DDZEffectSingleSequence extends cc.Component {
    @property(dragonBones.ArmatureDisplay)
    m_anim: dragonBones.ArmatureDisplay = null;

    onLoad() {
        this.m_anim.addEventListener(dragonBones.EventObject.COMPLETE, this.onAnimComplete, this);
    }

    onDestroy() {
        this.m_anim.removeEventListener(dragonBones.EventObject.COMPLETE, this.onAnimComplete, this);
    }

    init(pos: cc.Vec2) {
        this.node.setPosition(pos);

        this.m_anim.playAnimation(this.m_anim.animationName, 1);
    }

    onAnimComplete() {
        this.node.active = false;
    }
}