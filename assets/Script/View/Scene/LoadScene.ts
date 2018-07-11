const { ccclass, property } = cc._decorator;

import * as async from 'async';

import SceneManager from '../../Manager/CommonManager/SceneManager';
import ConfigData from '../../Data/ConfigData';
import SceneIdConfigManager, { EmSceneID } from '../../Manager/ConfigManager/SceneIdConfigManager';
import PrefabManager, { EmPrefabEnum } from '../../Manager/CommonManager/PrefabManager';

@ccclass
class LoginScene extends cc.Component {

    test() {
        cc.log('test start');

        //test
    }

    onLoad() {
        // this.test();
        this._doLoadings();
    }

    private _jumpToMainScene() {
        SceneManager.changeScene(SceneIdConfigManager.getSceneIdByKey(EmSceneID.SceneID_MainScene));
    }

    private _jumpToTestScene() {
        SceneManager.changeScene('test');
    }

    private _loadConfigs(callback: Function) {
        ConfigData.loadAllConfigs(callback);
    }

    private _doLoadings() {
        async.waterfall(
            [
                (next) => {
                    PrefabManager.getInstance().showPrefab(EmPrefabEnum.Loading);
                    next();
                },
                (next) => {
                    this._loadConfigs(next);
                },
                (next) => {
                    setTimeout(() => {
                        next();
                    }, 2000);
                }
            ],
            () => {
                PrefabManager.getInstance().hidePrefab(EmPrefabEnum.Loading);
                this._jumpToTestScene();
            }
        )
    }
};