import Singleton from '../../Utils/Singleton';

class SceneManager extends Singleton {
    
    changeScene(key, callback = null) {
        cc.director.loadScene(key, callback);
    }
};

export default new SceneManager();