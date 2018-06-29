const { ccclass } = cc._decorator;

@ccclass
class Singleton {
    private m_beenInit: boolean = false;

    getInstance() {
        if (!this.beenInit()) {
            this._init();
        }

        return this;
    }

    beenInit() {
        return this.m_beenInit;
    }

    private _init() {
        this.m_beenInit = true;
    }
}

export default Singleton;