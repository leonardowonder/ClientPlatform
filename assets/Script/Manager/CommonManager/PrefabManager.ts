import * as _ from 'lodash';

import Singleton from '../../Utils/Singleton';

export enum EmPrefabEnum {
    Prefab_Loading = 0,
    Prefab_TendencyChart,
    Prefab_MessageBox,
    Prefab_PromptDialogLayer,
    Prefab_DDZCountDown,
    Prefab_Max
}

class PrefabHistory {
    public prefabKey: EmPrefabEnum = EmPrefabEnum.Prefab_Max;
    public initParams: any[] = [];

    constructor(key: EmPrefabEnum, params: any[]) {
        this.prefabKey = key;
        this.initParams = params;
    }
}

class PrefabManager extends Singleton {
    private static s_prefabConfig = [
        { path: 'prefab/common/Loading', componentName: 'Loading' },
        { path: 'prefab/gamePlay/tendencyChart/TendencyChart', componentName: 'TendencyChart' },
        { path: 'prefab/common/MessageBoxLayer', componentName: 'MessageBoxLayer' },
        { path: 'prefab/common/PromptDialogLayer', componentName: 'PromptDialogLayer' },
        { path: 'NewDDZ/prefab/DDZCountDown', componentName: 'DDZCountDown' },
    ];

    private _loadingList: EmPrefabEnum[] = [];
    private _unloadinglist: EmPrefabEnum[] = [];

    private _historyInfo: PrefabHistory[][] = [];
    private _parentNodeStack: cc.Node[] = [];

    //load, hide, refresh
    showPrefab(key: EmPrefabEnum, params: any[] = [], node: cc.Node = null, needAutoHide: boolean = false) {
        if (!this._checkPrefabKeyValid(key)) {
            cc.warn(`PrefabManger showPrefab invalid key = ${key}`);
            return;
        }

        let component = this._getComponentByKey(key, node);
        let parentNode = this._getParentNode(node);

        if (component) {
            //place to top
            component.node.setSiblingIndex(parentNode.children.length - 1);

            component.node.active = true;
            this._initPrefab(component.node, key, params);

            this._processAutoHide(parentNode, needAutoHide);

            this._pushPrefabHistoryStack(key, params, node);
        } else {
            if (this._isNotLoading(key)) {
                this._pushLoadingList(key);
                cc.loader.loadRes(PrefabManager.s_prefabConfig[key].path, (err, res) => {
                    if (!this._hasBeenUnloaded(key)) {
                        if (err == null) {
                            let prefab: cc.Node = cc.instantiate(res);
                            prefab.setPosition(0, 0);
                            
                            this._initPrefab(prefab, key, params);

                            this._processAutoHide(parentNode, needAutoHide);

                            this._pushPrefabHistoryStack(key, params, node);

                            parentNode.addChild(prefab);
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
                cc.warn(`PrefabManger showPrefab already loading key: ${key}, componentInfo = ${PrefabManager.s_prefabConfig[key]}`);
            }
        }
    }

    hidePrefab(key: EmPrefabEnum, params: any[] = [], parentNode: cc.Node = null) {
        if (!this._checkPrefabKeyValid(key)) {
            cc.warn(`PrefabManger hidePrefab invalid key = ${key}`);
            return;
        }

        this._updateUnloadingList(key);

        let component = this._getComponentByKey(key, parentNode);

        this._hideComponent(component, params, false);
    }

    hideLastPrefabAndShowPrevious(node: cc.Node = null) {
        this._hideLastPrefab(node);

        this._popPrefabHistoryStack(node);

        let prefabHistory: PrefabHistory = this._getLastPrefabHistory(node);

        if (prefabHistory != null) {
            this.showPrefab(prefabHistory.prefabKey, prefabHistory.initParams, node);
        }
    }

    refreshPrefab(key: EmPrefabEnum, params: any[] = [], parentNode: cc.Node = null) {
        if (!this._checkPrefabKeyValid(key)) {
            cc.warn(`PrefabManger refreshPrefab invalid key = ${key}`);
            return;
        }

        let component = this._getComponentByKey(key, parentNode);
        if (component) {
            if (component.node.active == false) {
                cc.warn(`PrefabManger refreshPrefab component active false key = ${key}, componentInfo = ${PrefabManager.s_prefabConfig[key]}`);
            }
            else if (component.refresh) {
                component.refresh(...params);
            }
        }
        else {
            cc.warn(`PrefabManger refreshPrefab no component loaded key = ${key}, componentInfo = ${PrefabManager.s_prefabConfig[key]}`);
        }
    }

    //history
    getPrefabHistoryStack(node: cc.Node = null): PrefabHistory[] {
        let parentNode = this._getParentNode(node);

        let parentNodeKey: number = this._parseParentNodeToKey(parentNode);

        let stack = null;
        if (this._checkParentKeyValid(parentNodeKey)) {
            stack = this._historyInfo[parentNodeKey];
        }

        return stack;
    }

    clearPrefabHistoryStackByNode(node: cc.Node = null) {
        let parentNode = this._getParentNode(node);

        let parentNodeKey: number = this._parseParentNodeToKey(parentNode);

        if (this._checkParentKeyValid(parentNodeKey)) {
            this._historyInfo[parentNodeKey].length = 0;
        }
    }

    clearAllPrefabHistorys() {
        this._historyInfo.length = 0;
        this._parentNodeStack.length = 0;
    }

    //other
    getTopPrefabComponent() {
        let rootNode = this._getCanvasNode();

        let component = this._getLastPrefabComponent(rootNode);

        return component;
    }

    //private interface
    private _checkPrefabKeyValid(key: EmPrefabEnum): boolean {
        let valid = key != null && key < EmPrefabEnum.Prefab_Max;

        return valid;
    }

    private _getCanvasNode() {
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

    private _getParentNode(node: cc.Node): cc.Node {
        let parentNode: cc.Node = node;
        if (parentNode == null) {
            parentNode = this._getCanvasNode();
        }

        return parentNode;
    }

    private _getComponentByKey(key: EmPrefabEnum, node: cc.Node) {
        let parentNode = this._getParentNode(node);

        let ret = null;
        if (parentNode && parentNode.children && parentNode.children.length > 0) {
            for (let i = 0; i < parentNode.children.length; i++) {
                let component = parentNode.children[i].getComponent(PrefabManager.s_prefabConfig[key].componentName);
                if (component) {
                    ret = component;
                    break;
                }
            }
        }

        return ret;
    }

    private _initPrefab(node: cc.Node, key: EmPrefabEnum, params: any[] = []) {
        let component = node.getComponent(PrefabManager.s_prefabConfig[key].componentName);
        if (component && component.init) {
            component.init(...params);
        }
    }

    private _hideComponent(component, params: any[] = [], isAutoHide: boolean = false) {
        if (component) {
            if (component.hide && !isAutoHide) {
                component.hide(...params);
            }
            component.node.active = false;
        }
    }

    private _pushLoadingList(key: EmPrefabEnum) {
        this._loadingList.push(key);
    }

    private _removeFromLoadingList(key: EmPrefabEnum) {
        _.remove(this._loadingList, (value: EmPrefabEnum) => {
            return value == key;
        })
    }

    private _prefabLoading(key: EmPrefabEnum) {
        let idx = _.findIndex(this._loadingList, (value) => {
            return value == key;
        })

        return idx != -1;
    }

    private _isNotLoading(key: EmPrefabEnum) {
        let idx = _.findIndex(this._loadingList, (value) => {
            return value == key;
        })

        return idx == -1;
    }

    private _pushUnloadingList(key: EmPrefabEnum) {
        if (-1 == _.findIndex(this._unloadinglist, (value) => {
            return value == key;
        })) {
            this._unloadinglist.push(key);
        }
    }

    private _updateUnloadingList(key: EmPrefabEnum) {
        if (this._prefabLoading(key)) {
            this._pushUnloadingList(key);
        }
    }

    private _removeFromUnloadingList(key: EmPrefabEnum) {
        _.remove(this._unloadinglist, (value: EmPrefabEnum) => {
            return value == key;
        })
    }

    private _hasBeenUnloaded(key: EmPrefabEnum) {
        let idx = _.findIndex(this._unloadinglist, (value) => {
            return value == key;
        })

        return idx != -1;
    }

    private _parseParentNodeToKey(node: cc.Node): number {
        let idx = _.findIndex(this._parentNodeStack, (parentNode: cc.Node) => {
            return node.uuid == parentNode.uuid;
        })

        if (idx == -1) {
            idx = this._parentNodeStack.length;
            this._parentNodeStack.push(node);
        }
        return idx;
    }

    private _getPrefabHistoryStackByKey(key: number): PrefabHistory[] {
        let stack: PrefabHistory[] = null;
        if (key == this._historyInfo.length) {
            this._historyInfo.push([]);
        }

        stack = this._historyInfo[key];

        return stack;
    }

    private _checkParentKeyValid(key: number): boolean {
        let ret = key != null && !(key > this._historyInfo.length);

        if (!ret) {
            cc.warn(`PrefabManger _checkParamsValid invalid parentKey = ${key}, historyLength = ${this._historyInfo.length}`);
        }

        return ret;
    }

    private _processAutoHide(node: cc.Node = null, needAutoHide: boolean = false) {
        if (needAutoHide) {
            this._hideLastPrefab(node);
        }
    }

    private _pushPrefabHistoryStack(key: EmPrefabEnum, params: any[], node: cc.Node = null) {
        let parentNode = this._getParentNode(node);

        let parentNodeKey: number = this._parseParentNodeToKey(parentNode);

        if (this._checkParentKeyValid(parentNodeKey)) {
            let historyStack: PrefabHistory[] = this._getPrefabHistoryStackByKey(parentNodeKey);

            //one kind of prefab can only occupy one place
            _.remove(historyStack, (prefabHistory: PrefabHistory) => {
                return prefabHistory.prefabKey == key;
            });

            let prefabHistory = new PrefabHistory(key, params);
            historyStack.push(prefabHistory);
        }
    }

    private _popPrefabHistoryStack(node: cc.Node = null): EmPrefabEnum {
        let parentNode = this._getParentNode(node);

        let parentNodeKey: number = this._parseParentNodeToKey(parentNode);

        let prefabKey = null;
        if (this._checkParentKeyValid(parentNodeKey)) {
            let historyStack: PrefabHistory[] = this._getPrefabHistoryStackByKey(parentNodeKey);

            let history: PrefabHistory = historyStack.pop();

            if (history != null) {
                prefabKey = history.prefabKey;
            }
        }

        return prefabKey;
    }

    private _hideLastPrefab(node: cc.Node = null) {
        let component = this._getLastPrefabComponent(node);

        this._hideComponent(component, [], true);
    }

    private _getLastPrefabKey(node: cc.Node): EmPrefabEnum {
        let parentNode = this._getParentNode(node);

        let parentNodeKey: number = this._parseParentNodeToKey(parentNode);

        let lastKey = null;
        if (this._checkParentKeyValid(parentNodeKey)) {
            let historyStack: PrefabHistory[] = this._getPrefabHistoryStackByKey(parentNodeKey);

            let prefabHistory: PrefabHistory = _.last(historyStack);
            if (prefabHistory != null) {
                lastKey = prefabHistory.prefabKey;
            }
        }

        return lastKey;
    }

    private _getLastPrefabHistory(node: cc.Node): PrefabHistory {
        let parentNode = this._getParentNode(node);

        let parentNodeKey: number = this._parseParentNodeToKey(parentNode);

        let prefabHistory: PrefabHistory = null;
        if (this._checkParentKeyValid(parentNodeKey)) {
            let historyStack: PrefabHistory[] = this._getPrefabHistoryStackByKey(parentNodeKey);

            prefabHistory = _.last(historyStack);
        }

        return prefabHistory;
    }

    private _getLastPrefabComponent(node: cc.Node = null) {
        let lastKey = this._getLastPrefabKey(node);

        let component = null;
        if (!this._checkPrefabKeyValid(lastKey)) {
            cc.warn(`PrefabManger _getLastPrefabComponent invalid lastKey = ${lastKey}`);
        }
        else {
            component = this._getComponentByKey(lastKey, node);
        }

        return component;
    }
}

export default new PrefabManager();