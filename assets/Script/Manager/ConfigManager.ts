const { ccclass, property } = cc._decorator;

import CreateRoomDataConfigManager from './CreateRoomDataConfigManager';
import MutiLanConfigManager from './MutiLanConfigManager';
import StringConfigManager from './StringConfigManager';
import MttRaiseBlindConfigManager from './MttRaiseBlindConfigManager';
import VersionConfigManager from './VersionConfigManager';

@ccclass
export default class ConfigManager extends cc.Component {
    private static s_pInstance: ConfigManager = null;

    private m_config = null;

    getInstance() {
        if (ConfigManager.s_pInstance == null) {
            ConfigManager.s_pInstance = new ConfigManager();

            ConfigManager.s_pInstance._init();
        }
        return ConfigManager.s_pInstance;
    }

    _init() {
        CreateRoomDataConfigManager.prototype.getInstance();
        MutiLanConfigManager.prototype.getInstance();
        StringConfigManager.prototype.getInstance();
        MttRaiseBlindConfigManager.prototype.getInstance();
        VersionConfigManager.prototype.getInstance();
    }
}
