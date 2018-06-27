const { ccclass, property } = cc._decorator;

@ccclass
export default class VersionConfigManager extends cc.Component {
    private static s_pInstance: VersionConfigManager = null;

    private m_config = null;

    getInstance() {
        if (VersionConfigManager.s_pInstance == null) {
            VersionConfigManager.s_pInstance = new VersionConfigManager();

            VersionConfigManager.s_pInstance._init();
        }
        return VersionConfigManager.s_pInstance;
    }
    
    _getConfig() {
        return this.m_config;
    }

    _init() {
        // let realUrl = cc.url.raw('assets/version.manifest')
        // cc.loader.load(realUrl, function (err, res) {
        //     if (err == null) {
        //         if (res) {
        //             this.m_config = res;
        //         }
        //     }
        //     else {
        //         cc.error(err);
        //     }
        // }.bind(this))
    }

    getCfg() {
        // let config = VersionConfigManager.prototype.getInstance()._getConfig();
        // let ret = '';

        // if (config == null) {
        //     return null;
        // }

        // return config;
    }
}
