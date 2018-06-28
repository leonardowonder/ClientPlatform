const { ccclass } = cc._decorator;

import StringConfigManager from './StringConfigManager';

@ccclass
class ConfigManager {
    private m_beenInit: boolean = false;

    getInstance() {
        if (!this.m_beenInit) {
            this._init();
        }

        return this;
    }

    _init() {
        StringConfigManager.getInstance();
    }
}

export default new ConfigManager();