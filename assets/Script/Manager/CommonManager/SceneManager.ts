import Singleton from '../../Utils/Singleton';

import SceneIdConfigManager from '../ConfigManager/SceneIdConfigManager';

export enum EmSceneID {
    SceneID_Test = 0,
    SceneID_LoadScene,
    SceneID_LoginScene,
    SceneID_MainScene,
    SceneID_GameRoomScene,
    SceneID_DDZScene,
    SceneID_Max
}

class SceneManager extends Singleton {
    private _curScenID: EmSceneID = EmSceneID.SceneID_Max;
    
    changeScene(sceneID: EmSceneID, callback = null) {
        let key: string = SceneIdConfigManager.getInstance().getSceneKeyBySceneID(sceneID);
        if (!key) {
            cc.warn(`SceneManager changeScene invalid sceneID = ${sceneID}`);
            return;
        }

        if (this._curScenID != sceneID) {
            this._curScenID = sceneID;
            cc.director.loadScene(key, callback);
        }
    }
};

export default new SceneManager();