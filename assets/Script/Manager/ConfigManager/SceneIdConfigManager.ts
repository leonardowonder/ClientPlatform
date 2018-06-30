import Singleton from '../../Utils/Singleton';

import ConfigData, { EmConfigKey } from '../../Data/ConfigData';

export enum EmSceneID {
    SceneID_LoadScene = 0,
    SceneID_MainScene,
    SceneID_Max
}

class SceneIdConfigManager extends Singleton {

    getSceneIdByKey(key: EmSceneID) {
        if (!this._checkConfigKeyValid(key)) {
            cc.warn(`SceneIdConfigManager getSceneIdByKey invalid key = ${key}`)
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