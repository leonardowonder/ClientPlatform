import Singleton from '../../Utils/Singleton';

import ConfigData, { EmConfigKey } from '../../Data/ConfigData';
import { EmSceneID } from '../CommonManager/SceneManager';

class SceneIdConfigManager extends Singleton {

    getSceneKeyBySceneID(key: EmSceneID): string {
        if (!this._checkConfigKeyValid(key)) {
            cc.warn(`SceneIdConfigManager getSceneKeyBySceneID invalid key = ${key}`)
        }
        
        let ret = null;

        let cfg = ConfigData.getInstance().getConfig(EmConfigKey.Config_SceneID);
        if (cfg) {
            ret = cfg[key];
        }

        return ret;
    }

    private _checkConfigKeyValid(key: EmSceneID) {
        return key < EmSceneID.SceneID_Max;
    }
}
export default new SceneIdConfigManager();