import Singleton from '../../../../../Script/Utils/Singleton';

export enum ResType {
    ResType_NONE = 0,
    ResType_Prefab,
    ResType_SpriteAtlas,
    ResType_Audio,
    ResType_Font,
    ResType_Max,
};

class ResManager extends Singleton {
    m_ResDataArray = [];
    m_ResDataMap = null;

    _callback = null;
    m_loadArray = [];
    m_loadIdx: number = 0;

    addRes (name, resData, type) {
        let obj: any = new Object();
        obj.name = name;
        obj.resData = resData;
        obj.type = type;
        this.m_ResDataArray[this.m_ResDataArray.length] = obj;
        this.m_ResDataMap[name] = obj;
    }

    getObjByTypeAndDir (type, dir, name) {
        return {
            dir: dir,
            type: type,
            name: name
        };
    }

    loadRes (resDataVec, callback) {
        this.m_ResDataArray = [];
        this.m_ResDataMap = {};
        this._callback = callback;
        var loadArray = [];
        for (let i = 0; i < resDataVec.length; i++) {
            let resData = resDataVec[i];
            loadArray[i] = this.getObjByTypeAndDir(resData.type, resData.path, resData.name);
        }

        this.m_loadArray = loadArray;
        this.m_loadIdx = 0;
        this.loadOnceRes();
    }

    loadOnceRes () {
        if (this.m_loadIdx < this.m_loadArray.length) {
            if (this.m_loadArray[this.m_loadIdx].type == ResType.ResType_Prefab) {
                cc.loader.loadRes(this.m_loadArray[this.m_loadIdx].dir, cc.Prefab, function (err, prefab) {
                    if (err) {
                        console.log("load[" + this.m_loadArray[this.m_loadIdx].name + "] failed");
                    }
                    this.addRes(this.m_loadArray[this.m_loadIdx].name, prefab, ResType.ResType_Prefab);
                    if (this._callback) {
                        this._callback(this.m_loadIdx / this.m_loadArray.length);
                    }
                    this.m_loadIdx++
                    this.loadOnceRes();
                }.bind(this));
            } else if (this.m_loadArray[this.m_loadIdx].type == ResType.ResType_SpriteAtlas) {
                // cc.loader.loadRes(this.m_loadArray[this.m_loadIdx].dir, cc.SpriteAtlas, function (err, spriteFrames) {
                cc.loader.loadRes(this.m_loadArray[this.m_loadIdx].dir, function (err, spriteFrames) {
                    if (err) {
                        console.log("load[" + this.m_loadArray[this.m_loadIdx].name + "] failed");
                    }
                    this.addRes(this.m_loadArray[this.m_loadIdx].name, spriteFrames, ResType.ResType_SpriteAtlas);
                    if (this._callback) {
                        this._callback(this.m_loadIdx / this.m_loadArray.length);
                    }
                    this.m_loadIdx++;
                    this.loadOnceRes();
                }.bind(this));
            }
        } else {
            if (this._callback) {
                this._callback(1);
            }
        }
    }

    getRes (name) {
        var data = null;
        let resData = this.m_ResDataMap[name];
        if (resData == undefined) {
            console.log('do not find res:' + name);
            return null;
        }
        return resData.resData;
    }

    releaseRes () {
        this.m_loadIdx = 0;
        if (!this.m_loadArray) {
            this.m_loadArray = [];
        }
        this.releaseOnceRes();
    }

    releaseOnceRes () {
        if (this.m_loadIdx < this.m_loadArray.length) {
            if (this.m_loadArray[this.m_loadIdx].type == ResType.ResType_Prefab) {
                cc.loader.releaseRes(this.m_loadArray[this.m_loadIdx].dir, cc.Prefab);
                this.m_loadIdx++;
                this.releaseOnceRes();
            } else if (this.m_loadArray[this.m_loadIdx].type == ResType.ResType_SpriteAtlas) {
                cc.loader.releaseRes(this.m_loadArray[this.m_loadIdx].dir, cc.SpriteAtlas);
                this.m_loadIdx++;
                this.releaseOnceRes();
            }
        } else {
            this.m_ResDataArray = [];
            this.m_ResDataMap = {};
            this.m_loadArray = [];
            cc.sys.garbageCollect();
        }
    }
};

export default new ResManager();