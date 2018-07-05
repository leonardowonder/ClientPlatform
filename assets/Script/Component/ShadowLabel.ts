const { ccclass, property } = cc._decorator;

@ccclass
export default class ShadowLabel extends cc.Component {
    @property(cc.Label)
    private m_frontLabel: cc.Label = null;

    @property(cc.Label)
    private m_backLabel: cc.Label = null;

    @property
    private m_frontStr: string = '';

    @property
    private m_backStr: string = '';

    onLoad() {
        this._refreshLabel();
    }

    setStr(frtStr: string, bkStr: string = null) {
        this.m_frontStr = frtStr;
        this.m_backStr = bkStr == null ? frtStr : bkStr;

        this._refreshLabel();
    }

    private _refreshLabel() {
        this.m_frontLabel.string = this.m_frontStr;
        this.m_backLabel.string = this.m_backStr;
    }
}
