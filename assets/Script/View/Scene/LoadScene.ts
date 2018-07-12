const { ccclass, property } = cc._decorator;

import * as async from 'async';

import SceneManager, { EmSceneID } from '../../Manager/CommonManager/SceneManager';
import ConfigData from '../../Data/ConfigData';
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

    private _loadConfigs(callback: Function) {
        ConfigData.loadAllConfigs(callback);
    }

    private _doLoadings() {
        async.waterfall(
            [
                (next) => {
                    PrefabManager.getInstance().showPrefab(EmPrefabEnum.Prefab_Loading);
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
                PrefabManager.getInstance().hidePrefab(EmPrefabEnum.Prefab_Loading);
                SceneManager.changeScene(EmSceneID.SceneID_MainScene);
            }
        )
    }
};