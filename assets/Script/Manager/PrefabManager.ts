import * as _ from 'lodash';

export enum ePrefabEnum {
    Mtt_Set_Time = 0,
    ClubLayer,
    CreateRoomLayer,
    InputRoomIDLayer,
    ClubDetailsLayer,
    MttInfo,
    MttInfo_Detail,
    MttInfo_Reward,
    MttInfo_Player,
    MttInfo_Raise,
    GameRoom_MttInfo,
    GameRoom_MttInfo_Detail,
    GameRoom_MttInfo_Player,
    GameRoom_MttInfo_Reward,
    GameRoom_MttInfo_Raise,
    MttApplyEnroll,
    Loading,
    GameRoomMttApplyEnroll,
    GameEndRecordDetail,
    MttRecordDetail,
    MainRooms,
    MainClub,
    MainCreate,
    MainRecord,
    MainMe,
    CreateClubLayer,
    JoinClubLayer,
    SetClubNameLayer,
    UserDetailsLayer,
    ClubUserListLayer,
    LianMengListLayer,
    JiJinLayer,
    SetClubJianJieLayer,
    GetHeadLayer,
    ClubAddMaxPeopleLayer,
    UpdateRemarkLayer,
    JiJinFaFangDetailsLayer,
    JiJinBuyLayer,
    JiJinFaFangLayer,
    JoinClubDetailsLayer,
    LianMengDetailsLayer,
    JoinLianMengLayer,
    CreateLianMengLayer,
    ClubVerifyLayer,
    UpdateUserNameLayer,
    ShopLayer,
    DisclaimerLayer,
    CertificationLayer,
    RecordDetails,
    ActivityDetailsLayer,
    PaiPuListLayer,
    KeFuLayer,
    SettingLayer,
    NewsLayer,
    MttWatchRoomListLayer
}

class PrefabManager {
    private m_beenInit: boolean = false;

    private static s_prefabConfig = [
        { path: 'prefab/MttSetTime', componentName: 'MttSetTime' },
        { path: 'prefab/ClubLayer', componentName: 'ClubLayer' },
        { path: 'prefab/CreateRoomLayer', componentName: 'CreateRoomLayer' },
        { path: 'prefab/InputRoomIDLayer', componentName: 'InputRoomIDLayer' },
        { path: 'prefab/ClubDetailsLayer', componentName: 'ClubDetailsLayer' },
        { path: 'prefab/MttInfo', componentName: 'MttInfo' },
        { path: 'prefab/MttInfo_Detail', componentName: 'MttInfo_Detail' },
        { path: 'prefab/MttInfo_Reward', componentName: 'MttInfo_Reward' },
        { path: 'prefab/MttInfo_Player', componentName: 'MttInfo_Player' },
        { path: 'prefab/MttInfo_Raise', componentName: 'MttInfo_Raise' },
        { path: 'prefab/GameRoom_MttInfo', componentName: 'GameRoom_MttInfo' },
        { path: 'prefab/GameRoom_MttInfo_Detail', componentName: 'GameRoom_MttInfo_Detail' },
        { path: 'prefab/GameRoom_MttInfo_Player', componentName: 'GameRoom_MttInfo_Player' },
        { path: 'prefab/GameRoom_MttInfo_Reward', componentName: 'GameRoom_MttInfo_Reward' },
        { path: 'prefab/GameRoom_MttInfo_Raise', componentName: 'GameRoom_MttInfo_Raise' },
        { path: 'prefab/MttApplyEnroll', componentName: 'MttApplyEnroll' },
        { path: 'prefab/Loading', componentName: 'Loading' },
        { path: 'prefab/GameRoomMttApplyEnroll', componentName: 'GameRoomMttApplyEnroll' },
        { path: 'prefab/GameEndRecordDetail', componentName: 'GameEndRecordDetail' },
        { path: 'prefab/MttRecordDetail', componentName: 'MttRecordDetail' },
        { path: 'prefab/MainScene/MainRooms', componentName: 'MainRooms' },
        { path: 'prefab/MainScene/MainClub', componentName: 'MainClub' },
        { path: 'prefab/MainScene/MainCreate', componentName: 'MainCreate' },
        { path: 'prefab/MainScene/MainRecord', componentName: 'MainRecord' },
        { path: 'prefab/MainScene/MainMe', componentName: 'MainMe' },
        { path: 'prefab/CreateGlubLayer', componentName: 'CreateGlubLayer' },
        { path: 'prefab/JoinClubLayer', componentName: 'JoinClubLayer' },
        { path: 'prefab/SetClubNameLayer', componentName: 'SetClubNameLayer' },
        { path: 'prefab/UserDetailsLayer', componentName: 'UserDetailsLayer' },
        { path: 'prefab/ClubUserListLayer', componentName: 'ClubUserListLayer' },
        { path: 'prefab/LianMengListLayer', componentName: 'LianMengListLayer' },
        { path: 'prefab/JiJinLayer', componentName: 'JiJinLayer' },
        { path: 'prefab/SetClubJianJieLayer', componentName: 'SetClubJianJieLayer' },
        { path: 'prefab/GetHeadLayer', componentName: 'GetHeadLayer' },
        { path: 'prefab/ClubAddMaxPeopleLayer', componentName: 'ClubAddMaxPeopleLayer' },
        { path: 'prefab/UpdateRemarkLayer', componentName: 'UpdateRemarkLayer' },
        { path: 'prefab/JiJinFaFangDetailsLayer', componentName: 'JiJinFaFangDetailsLayer' },
        { path: 'prefab/JiJinBuyLayer', componentName: 'JiJinBuyLayer' },
        { path: 'prefab/JiJinFaFangLayer', componentName: 'JiJinFaFangLayer' },
        { path: 'prefab/JoinClubDetailsLayer', componentName: 'JoinClubDetailsLayer' },
        { path: 'prefab/LianMengDetailsLayer', componentName: 'LianMengDetailsLayer' },
        { path: 'prefab/JoinLianMengLayer', componentName: 'JoinLianMengLayer' },
        { path: 'prefab/CreateLianMengLayer', componentName: 'CreateLianMengLayer' },
        { path: 'prefab/ClubVerifyLayer', componentName: 'ClubVerifyLayer' },
        { path: 'prefab/UpdateUserNameLayer', componentName: 'UpdateUserNameLayer' },
        { path: 'prefab/ShopLayer', componentName: 'ShopLayer' },
        { path: 'prefab/DisclaimerLayer', componentName: 'DisclaimerLayer' },
        { path: 'prefab/CertificationLayer', componentName: 'CertificationLayer' },
        { path: 'prefab/RecordDetails', componentName: 'RecordDetails' },
        { path: 'prefab/ActivityDetailsLayer', componentName: 'ActivityDetailsLayer' },
        { path: 'prefab/PaiPuListLayer', componentName: 'PaiPuListLayer' },
        { path: 'prefab/KeFuLayer', componentName: 'KeFuLayer' },
        { path: 'prefab/SettingLayer', componentName: 'SettingLayer' },
        { path: 'prefab/NewsLayer', componentName: 'NewsLayer' },
        { path: 'prefab/MTT/MttWatchRoomListLayer', componentName: 'MttWatchRoomListLayer' },
    ];

    _loadingList: number[] = [];
    _unloadinglist: number[] = [];

    getInstance() {
        if (!this.m_beenInit) {
            this._init();
        }

        return this;
    }

    _init() {
        //do something
    }

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