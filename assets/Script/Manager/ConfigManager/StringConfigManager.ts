import Singleton from '../../Utils/Singleton';

import ConfigData, { EmConfigKey } from '../../Data/ConfigData';

class StringConfigManager extends Singleton {

    getStrByKey(key: string, lan = 'cn') {
        let ret = '';

        let cfg = ConfigData.getInstance().getConfig(EmConfigKey.Config_String);

        if (cfg && cfg[key] && cfg[key][lan]) {
            ret = cfg[key][lan];
        }
        else {
            ret = key;
        }

        return ret;
    }
}

export default new StringConfigManager();