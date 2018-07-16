import Singleton from '../Utils/Singleton';

import { eMsgPort, eMsgType } from '../Define/MessageIdentifer';
import ClientDefine from '../Define/ClientDefine';

import Network from '../Utils/Network';
import { NetMsg, praseMsg } from './LogicBasic';

import UserData from '../Data/UserData';
import SceneManager, { EmSceneID } from '../Manager/CommonManager/SceneManager';
import MyUtils from '../Utils/MyUtils';

import MainUiScene from '../View/Scene/MainUiScene';

import DDZPlayerData from '../../resources/NewDDZ/script/Data/DDZPlayerData';
import DDZGameDataLogic from '../../resources/NewDDZ/script/Data/DDZGameDataLogic';

let userData = UserData.getInstance();

class MainUiSceneLogic extends Singleton {

    private m_curView: MainUiScene = null;

    setCurView(scene: MainUiScene) {
        this.m_curView = scene;
    }

    unsetCurView() {
        this.m_curView = null;
    }

    init() {
        super.init();
        this._registEvent();
    }

    //net work
    requestCreateDDZRoom() {
        Network.getInstance().sendMsg(
            {
                msgID: eMsgType.MSG_CREATE_ROOM,
                gameType: 4,
                uid: userData.uid,
                isFree: 0,
                seatCnt: 3,
                payType: 0,
                level: 0,
                forbidJoin: 0,
                isChaoZhuang: 0,
                maxBet: 16,
                starGame: 3,
            },
            eMsgType.MSG_CREATE_ROOM,
            eMsgPort.ID_MSG_PORT_DOU_DI_ZHU,
            userData.uid);
    }

    requestEnterRoom(roomID: number) {
        Network.getInstance().sendMsg(
            {
                msgID: eMsgType.MSG_ENTER_ROOM,
                roomID: roomID,
                uid: userData.uid,
            }, 
            eMsgType.MSG_PLAYER_LOGIN, 
            MyUtils.getInstance().parePortTypte(roomID),
            roomID)
    }

    onNetClose() {
        
    }

    onNetReconnected() {

    }

    onMsg(event: cc.Event.EventCustom): void {
        let msg: NetMsg = praseMsg(event);

        switch (msg.nMsgID) {
            case eMsgType.MSG_CREATE_ROOM: {
                this._onMsgCreateRoomRsp(msg.jsMsg);
                break;
            }
            case eMsgType.MSG_ROOM_INFO: {
                this._onMsgRoomInfoRsp(msg.jsMsg);
                break;
            }
            default: {
                break;
            }
        }
    }

    //net msg rsp
    private _onMsgCreateRoomRsp(jsMsg) {
        if (jsMsg.ret == 0) {
            let roomID: number = jsMsg.roomID;

            this.requestEnterRoom(roomID);
        }
    }
    
    private _onMsgRoomInfoRsp(jsMsg) {
        if (jsMsg.ret == 0) {var gameType = MyUtils.parePortTypte(jsMsg.roomID);
            if (gameType == eMsgPort.ID_MSG_PORT_DOU_DI_ZHU) {
            //if (false) {
                let ddzPlayerDataLogic = DDZPlayerData.getInstance();
                ddzPlayerDataLogic.init();

                let ddzDataLogic = DDZGameDataLogic.getInstance();
                ddzDataLogic.onMessage(JSON.stringify(jsMsg));
                cc.loader.loadRes("com/prefab/CommonLoading", cc.Prefab, function (err, prefab) {
                    if (err) {
                        console.log("load[com/prefab/CommonLoading] failed");
                    }
                    let loadNode = cc.instantiate(prefab);
                    loadNode.parent = cc.director.getScene();
                    loadNode.parent = this.node;
                    let loadComp = loadNode.getComponent('CommonLoading');
                    loadComp.initWithResPathList(gameType, ()=>{
                        if(this._playerInfo){
                            ddzPlayerDataLogic.onMessage(JSON.stringify(this._playerInfo));
                        }
                        cc.view.adjustViewPort(true);
                        cc.view.resizeWithBrowserSize(true);
                        cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
                        cc.director.loadScene("NewDDZGameScene");
                    });
                }.bind(this));
            } else {
                cc.loader.loadRes("com/prefab/LoadGameScene", cc.Prefab, function (err, prefab) {
                    if (err) {
                        console.log("加载[com/prefab/LoadGameScene]资源失败");
                    }
                    var layer = cc.instantiate(prefab);
                    layer.parent = cc.director.getScene();
                    layer.setPosition(cc.p(0, 0));
                    layer.getComponent('LoadGameScene').openGameScene(jsMsg, this._playerInfo);
                }.bind(this));
            }
        }
    }

    //private
    private _registEvent() {
        cc.systemEvent.on(ClientDefine.netEventClose, this.onNetClose, this);
        cc.systemEvent.on(ClientDefine.netEventReconnectd, this.onNetReconnected, this);
        cc.systemEvent.on(ClientDefine.netEventMsg, this.onMsg, this);
    }
};

export default new MainUiSceneLogic();