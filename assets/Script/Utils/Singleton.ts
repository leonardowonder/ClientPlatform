const { ccclass } = cc._decorator;

@ccclass
class Singleton {
    private m_beenInit: boolean = false;

    getInstance() {
        if (!this.m_beenInit) {
            this._init();
        }

        return this;
    }

    beenInit() {
        return this.m_beenInit;
    }

    _init() {
        this.m_beenInit = true;
    }
}

export default Singleton;