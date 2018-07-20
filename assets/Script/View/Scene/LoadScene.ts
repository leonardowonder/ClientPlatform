const { ccclass, property } = cc._decorator;

import * as async from 'async';

import ClientDefine from '../../Define/ClientDefine';

import Network from '../../Utils/Network';
import LoadSceneLogic from '../../Logic/LoadSceneLogic';

import ConfigData from '../../Data/ConfigData';
import SceneManager, { EmSceneID } from '../../Manager/CommonManager/SceneManager';
import PrefabManager, { EmPrefabEnum } from '../../Manager/CommonManager/PrefabManager';

@ccclass
export default class LoginScene extends cc.Component {

    @property(cc.Node)
    m_persistRootNode: cc.Node = null;

    test() {
        //test
    }

    onLoad() {
        // this.test();
        this._registEvent();
        this._doLoadings();
    }

    onDestroy() {
        this._unregistEvent();
    }

    onMsg() {

    }

    onLoginSuccess() {
        SceneManager.changeScene(EmSceneID.SceneID_MainScene);
    }

    onLoginFail() {
        SceneManager.changeScene(EmSceneID.SceneID_LoginScene);
    }

    onNetWorkOpen() {
        this._autoLogin();
    }

    private _registEvent() {
        // cc.game.addPersistRootNode(this.m_persistRootNode);

        cc.systemEvent.on(ClientDefine.netEventOpen, this.onNetWorkOpen, this);
        LoadSceneLogic.getInstance().setCurView(this);
    }

    private _unregistEvent() {
        cc.systemEvent.targetOff(this);
        LoadSceneLogic.getInstance().unsetCurView();
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
                    this._beforeEnterGame();
                    next();
                }
            ],
            () => {
                PrefabManager.getInstance().hidePrefab(EmPrefabEnum.Prefab_Loading);
            }
        )
    }

    private _loadConfigs(callback: Function) {
        ConfigData.loadAllConfigs(callback);
    }

    private _beforeEnterGame() {
        this._connectNetwork();
    }

    private _connectNetwork() {
        // Network.getInstance().connect("ws://192.168.1.8:40008");//内网
        Network.getInstance().connect("ws://139.196.183.107:40008");//内网
        // Network.getInstance().connect("ws://139.196.56.147:40010");//外网
    }

    private _autoLogin() {
        var account: string = cc.sys.localStorage.getItem("userAccount");
        var password: string = cc.sys.localStorage.getItem("userPassWord");
        if (account && account.length && password && password.length) {
            LoadSceneLogic.getInstance().requestLogin(account, password);
        } else {
            SceneManager.changeScene(EmSceneID.SceneID_LoginScene);
        }
    }
};