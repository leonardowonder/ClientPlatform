// Learn TypeScript:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/typescript/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

import Network from '../Network'
import PlayerData from '../PlayerData'
import { eMsgPort, eMsgType } from '../MessageIdentifer'
import clientDefine, { clientEventDefine } from '../clientDefine'

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerDataManager extends cc.Component {
    private static s_pInstance: PlayerDataManager = null;

    private _playerDatalMap: any = {};
    private m_nReqIdx: number = 0;
    private m_vReqQueue: any = [];
    private _reqFunc: any = null;

    _registEvent() {
        cc.systemEvent.on(clientDefine.netEventMsg, this.onMsg.bind(this), this);
    }

    getInstance() {
        if (PlayerDataManager.s_pInstance == null) {
            PlayerDataManager.s_pInstance = new PlayerDataManager();

            this._registEvent();
        }
        return PlayerDataManager.s_pInstance;
    }

    _getPlayerDataMap() { return this._playerDatalMap; }

    onMsg(event: cc.Event.EventCustom) {
        let nMsgID = event.detail[clientDefine.msgKey];
        let jsMsg = event.detail[clientDefine.msg];
        if (nMsgID == eMsgType.MSG_REQUEST_PLAYER_DATA) {
            this.setPlayerData(jsMsg, jsMsg.uid);

            let dispEvent = new cc.Event.EventCustom(clientEventDefine.CUSTOM_EVENT_PLAYER_DATA_GET, true);

            dispEvent.detail = jsMsg;
            cc.systemEvent.dispatchEvent(dispEvent);
        }
    }

    requestPlayerData(uid) {
        var msg = {
            msgID: eMsgType.MSG_REQUEST_PLAYER_DATA,
            nReqID: uid,
            isDetail: false,
        };

        Network.s_pNetwork.sendMsg(msg, eMsgType.MSG_REQUEST_PLAYER_DATA, eMsgPort.ID_MSG_PORT_DATA, uid);
    }

    _reqPlayerDatas() {
        if (this.m_nReqIdx < this.m_vReqQueue.length) {
            // let uidList = this.m_vReqQueue[this.m_nReqIdx++];

            // uidList.forEach(function (uid) {
            //     // let url = this.getPlayerData(uid);
            //     // if (url == null || url.length == 0) {
            //         this.requestPlayerData(uid)
            //     // }
            // }.bind(this))
            let uid = this.m_vReqQueue[this.m_nReqIdx++];

            this.requestPlayerData(uid);
        }
        else {
            if (this._reqFunc) {
                clearInterval(this._reqFunc);
            }
        }
    }
    requestMutilPlayerDatas(uidList) {
        this.m_nReqIdx = 0;
        this.m_vReqQueue.length = 0;

        // let startIdx = 0;
        // let reqNum = 2;
        let reqInterval = 500;
        // while (startIdx < uidList.length) {
        //     let endIdx = startIdx + reqNum;
        //     if (endIdx < uidList.length) {
        //         this.m_vReqQueue.push(uidList.slice(startIdx, endIdx));
        //     }
        //     else {
        //         this.m_vReqQueue.push(uidList.slice(startIdx));
        //     }
        //     startIdx += reqNum;
        // }
        this.m_vReqQueue = uidList;

        if (this._reqFunc) {
            clearInterval(this._reqFunc);
        }
        this._reqFunc = setInterval(this._reqPlayerDatas.bind(this), reqInterval);
    }

    clearPlayerDataById(uid) {
        let playerDataMap = PlayerDataManager.prototype.getInstance()._getPlayerDataMap();
        let data = playerDataMap[uid];
        if (data != null) {
            data = null;
        }
    }

    clearAllDatas() {
        let playerDataMap = PlayerDataManager.prototype.getInstance()._getPlayerDataMap();
        for (let key in playerDataMap) {
            this.clearPlayerDataById(key);
        }
        //this.this._playerDatalMap = {};
    }

    setPlayerData(data, uid) {
        let playerDataMap = PlayerDataManager.prototype.getInstance()._getPlayerDataMap();
        playerDataMap[uid] = data;
    }

    getPlayerData(uid) {
        let playerDataMap = PlayerDataManager.prototype.getInstance()._getPlayerDataMap();
        return playerDataMap[uid];
    }
}
