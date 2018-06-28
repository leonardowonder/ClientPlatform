import * as _ from 'lodash';

import Singleton from '../Utils/Singleton';

export enum ePrefabEnum {
    Prefab_key = 0,
    Prefab_Max
}

class PrefabManager extends Singleton {
    private static s_prefabConfig = [
        { path: 'path', componentName: 'componentName' }
    ];

    _loadingList: number[] = [];
    _unloadinglist: number[] = [];

    showPrefab(key: number, params: any[] = null, parentNode: cc.Node = null) {
        let component = this._getComponentByKey(key, parentNode);
        if (component) {
            component.node.active = true;
            this._initPrefab(component.node, key, params);
        } else {
            if (this._canLoad(key)) {
                this._pushLoadingList(key);
                cc.loader.loadRes(PrefabManager.s_prefabConfig[key].path, (err, res) => {
                    if (!this._hasBeenUnloaded(key)) {
                        if (err == null) {
                            let prefab: cc.Node = cc.instantiate(res);
                            this._initPrefab(prefab, key, params);

                            let rootNode: cc.Node = parentNode;
                            if (!rootNode) {
                                rootNode = this._getCanvasNode();
                            }
                            prefab.setPosition(0, 0);
                            rootNode.addChild(prefab);
                        }
                        else {
                            cc.warn('PrefabManager showPrefab load res fail, err =', err);
                        }
                    }
                    else {
                        this._removeFromUnloadingList(key);
                    }
                    this._removeFromLoadingList(key);
                })
            }
            else {
                cc.warn(`PrefabManger showPrefab already loading key: ${key}`);
            }
        }
    }

    hidePrefab(key: number, parentNode: cc.Node = null) {
        if (this._prefabLoading(key)) {
            this._pushUnloadingList(key);
        }
        let component = this._getComponentByKey(key, parentNode);
        if (component) {
            component.node.active = false;
        }
    }

    _getCanvasNode() {
        let sceneNode = cc.director.getScene();
        let ret = null;
        for (let i = 0; i < sceneNode.children.length; ++i) {
            if (sceneNode.children[i].getComponent(cc.Canvas)) {
                ret = sceneNode.children[i];
                break;
            }
        }

        return ret;
    }

    _getComponentByKey(key: number, parentNode: cc.Node) {
        let ret = null;
        if (parentNode == null) {
            parentNode = this._getCanvasNode();
        }
        if (parentNode && parentNode.children && parentNode.children.length > 0) {
            for (let i = 0; i < parentNode.children.length; i++) {
                let component = parentNode.children[i].getComponent(PrefabManager.s_prefabConfig[key].componentName);
                if (component) {
                    ret = component;
                    component.node.setSiblingIndex(parentNode.children.length - 1);
                    break;
                }
            }
        }

        return ret;
    }

    _initPrefab(node: cc.Node, key: number, params: any[]) {
        let component = node.getComponent(PrefabManager.s_prefabConfig[key].componentName);
        if (component && component.init) {
            if (params == null) {
                component.init();
            }
            else {
                component.init(...params);
            }
        }
    }

    _pushLoadingList(key: number) {
        this._loadingList.push(key);
    }

    _removeFromLoadingList(key: number) {
        _.remove(this._loadingList, (value: number) => {
            return value == key;
        })
    }

    _prefabLoading(key: number) {
        let idx = _.findIndex(this._loadingList, (value) => {
            return value == key;
        })

        return idx != -1;
    }

    _canLoad(key: number) {
        let idx = _.findIndex(this._loadingList, (value) => {
            return value == key;
        })

        return idx == -1;
    }

    _pushUnloadingList(key: number) {
        if (-1 == _.findIndex(this._unloadinglist, (value) => {
            return value == key;
        })) {
            this._unloadinglist.push(key);
        }
    }

    _removeFromUnloadingList(key: number) {
        _.remove(this._unloadinglist, (value: number) => {
            return value == key;
        })
    }

    _hasBeenUnloaded(key: number) {
        let idx = _.findIndex(this._unloadinglist, (value) => {
            return value == key;
        })

        return idx != -1;
    }
}

export default new PrefabManager();