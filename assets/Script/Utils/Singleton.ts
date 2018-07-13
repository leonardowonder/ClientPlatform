class Singleton {
    private m_beenInit: boolean = false;

    getInstance() {
        if (!this.beenInit()) {
            this.init();
        }

        return this;
    }

    beenInit() {
        return this.m_beenInit;
    }

    init() {
        this.m_beenInit = true;
    }
}

export default Singleton;