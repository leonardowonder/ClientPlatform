import Singleton from '../../Utils/Singleton';

import SceneIdConfigManager from '../ConfigManager/SceneIdConfigManager';

export enum EmSceneID {
    SceneID_LoadScene = 0,
    SceneID_MainScene,
    SceneID_GameRoomScene,
    SceneID_Test,
    SceneID_Max
}

class SceneManager extends Singleton {
    
    changeScene(sceneID: EmSceneID, callback = null) {
        let key: string = SceneIdConfigManager.getInstance().getSceneKeyBySceneID(sceneID);
        if (!key) {
            cc.warn(`SceneManager changeScene invalid sceneID = ${sceneID}`);
            return;
        }
        
        cc.director.loadScene(key, callback);
    }
};

export default new SceneManager();