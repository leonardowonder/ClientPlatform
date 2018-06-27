const { ccclass, property } = cc._decorator;

@ccclass
export default class ToggleChangeColor extends cc.Component {

    @property(cc.Toggle)
    m_toggles: cc.Toggle[] = [];

    @property(cc.Node)
    m_colorNodes: cc.Node[] = [];

    @property(cc.Color)
    m_checkedColor: cc.Color = new cc.Color();

    @property(cc.Color)
    m_uncheckedColor: cc.Color = new cc.Color();

    onLoad() {

    }

    updateColor() {
        if (this.m_toggles) {
            this.m_toggles.forEach((toggle, idx) => {
                let color = toggle.isChecked ? this.m_checkedColor : this.m_uncheckedColor;
                this.m_colorNodes[idx] && (this.m_colorNodes[idx].color = color);
            })
        }
    }
}
