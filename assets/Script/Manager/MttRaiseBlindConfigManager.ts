const { ccclass, property } = cc._decorator;

@ccclass
export default class MttRaiseBlindConfigManager extends cc.Component {
    private static s_pInstance: MttRaiseBlindConfigManager = null;

    private m_config = null;

    getInstance() {
        if (MttRaiseBlindConfigManager.s_pInstance == null) {
            MttRaiseBlindConfigManager.s_pInstance = new MttRaiseBlindConfigManager();

            MttRaiseBlindConfigManager.s_pInstance._init();
        }
        return MttRaiseBlindConfigManager.s_pInstance;
    }
    
    _getConfig() {
        return this.m_config;
    }

    _init() {
        cc.loader.loadRes('config/raise_blind_config', function (err, res) {
            if (err == null) {
                if (res.cfg) {
                    this.m_config = res.cfg;
                }
            }
            else {
                cc.error(err);
            }
        }.bind(this))
    }

    getCfgByKey(key = 'normal') {
        let config = MttRaiseBlindConfigManager.prototype.getInstance()._getConfig();
        let ret = '';

        if (config == null) {
            return null;
        }

        return config[key];
    }
}
