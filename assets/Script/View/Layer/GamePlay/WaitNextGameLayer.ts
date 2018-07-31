const { ccclass, property } = cc._decorator;

@ccclass
export default class WaitNextGameLayer extends cc.Component {

    init() {
        this.node.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.fadeIn(0.5),
                    cc.fadeOut(0.5)
                )
            )
        );
    }
}
