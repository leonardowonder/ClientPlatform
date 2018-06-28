import Singleton from '../Utils/Singleton';

import StringConfigManager from './StringConfigManager';

class ConfigManager extends Singleton {
    _init() {
        super._init();

        StringConfigManager.getInstance();
    }
}

export default new ConfigManager();