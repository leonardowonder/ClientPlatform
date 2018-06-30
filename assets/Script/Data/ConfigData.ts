import * as async from 'async';

import ResLoader from '../Utils/ResLoader';
import Singleton from '../Utils/Singleton';

export enum EmConfigKey {
    Config_String = 0,
    Config_SceneID,
    Key_Max
}

class ConfigInfo {
    public m_key: EmConfigKey;
    public m_path: string;

    constructor(key: EmConfigKey, path: string) {
        this.m_key = key;
        this.m_path = path;
    }
}

class ConfigData extends Singleton {
    private static _configInfoList: ConfigInfo[] = [
        new ConfigInfo(EmConfigKey.Config_String, 'config/StringCfg'),
        new ConfigInfo(EmConfigKey.Config_SceneID, 'config/SceneIdCfg')
    ];

    private _configList: any[] = [];

    loadAllConfigs(callback: Function) {
        async.eachSeries(
            ConfigData._configInfoList,
            (info: ConfigInfo, next) => {
                ResLoader.loadRes(info.m_path, this._addConfig.bind(this), this._addConfig.bind(this), next);
            },
            () => {
                callback && callback();
            }
        )
    }

    clearAllConfigs() {
        this._configList.length = 0;
    }

    clearConfigByKey(key: EmConfigKey) {
        if (this._checkConfigKeyValid(key)) {
            this._configList[key] = null;
        }
    }

    reloadConfig(key: EmConfigKey, callback: Function = null) {
        if (!this._checkConfigKeyValid(key)) {
            cc.warn(`ConfigData reloadConfig invalid key = ${key}`);
        }
        else {
            let configInfo = ConfigData._configInfoList[key];

            ResLoader.loadRes(configInfo.m_path, this._updateConfig.bind(this, configInfo.m_key), this._updateConfig.bind(this, configInfo.m_key), callback);
        }
    }

    getConfig(key: EmConfigKey) {
        let cfg = null;

        if (!this._checkConfigKeyValid(key)) {
            cc.warn(`ConfigData getConfig invalid key = ${key}`);
        }
        else {
            cfg = this._configList[key];
        }

        return cfg;
    }

    private _checkConfigKeyValid(key: EmConfigKey) {
        return key < EmConfigKey.Key_Max && key < ConfigData._configInfoList.length;
    }

    private _addConfig(config: any = null) {
        this._configList.push(config);
    }

    private _updateConfig(key: EmConfigKey, config: any = null) {
        if (!this._checkConfigKeyValid(key)) {
            cc.warn(`ConfigData _updateConfig invalid key = ${key}`);
        }
        else {
            this._configList[key] = config;
        }
    }
}

export default new ConfigData();