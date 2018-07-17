const { ccclass, property } = cc._decorator;

@ccclass
export default class PromptDialogLayer extends cc.Component {

    @property(cc.Label)
    private m_pInfoLabel: cc.Label = null;

    init(string: string) {
        this.node.active = true;
        this.m_pInfoLabel.string = string;
        this.node.stopAllActions();
        this.node.opacity = 255;

        this.node.runAction(cc.sequence(
            cc.delayTime(1.2),
            cc.fadeOut(0.3),
            cc.callFunc(
                () => {
                    this.node.active = false;
                })
            )
        );
    }
}