import * as async from 'async';
import * as _ from 'lodash';

import { eMsgPort, eMsgType } from '../../Define/MessageIdentifer';
import ClientDefine from '../../Define/ClientDefine';
import ClientEventDefine from '../../Define/ClientEventDefine';

import Network from '../../Utils/Network';
import UserData from '../../Data/UserData';

class PlayerDataManager {
    private m_beenInit: boolean = false;

    private m_playerDataMap: any = {};

    private m_reqQueue: number[][] = [];

    private m_isProcessReq: boolean = false;
    private m_curNextFunc: Function = null;

    getInstance() {
        if (!this.m_beenInit) {
            this._init();
        }

        return this;
    }

    clearAll() {
        this.m_playerDataMap = {};
    }

    getPlayerData(uid: number) {
        return this.m_playerDataMap[uid];
    }

    setPlayerData(data: any, uid: number) {
        this.m_playerDataMap[uid] = data;
    }

    reqPlayerData(uidList: number[]) {
        this.m_reqQueue.push(uidList);

        if (!this.m_isProcessReq) {
            this._processReq();
        }
    }

    _processReq() {
        if (this.m_reqQueue.length > 0) {
            let curReqList = _.uniq(this.m_reqQueue[0]);

            curReqList = this._filterReqList(curReqList);

            this._startReq(curReqList, this._processReq.bind(this));
        }
        else {
            //all req finished

            let dispEvent = new cc.Event.EventCustom(ClientEventDefine.CUSTOM_EVENT_PLAYER_DATA_REQ_FINISHED, true);
            cc.systemEvent.dispatchEvent(dispEvent);
        }
    }

    _startReq(list: number[], callback: Function) {
        this.m_isProcessReq = true;

        async.forEachOfSeries(
            list,
            function (uid: number, key: number, next: Function) {
                this.m_curNextFunc = next;

                Network.getInstance().sendMsg(
                    {
                        msgID: eMsgType.MSG_REQUEST_PLAYER_DATA,
                        nReqID: uid,
                        isDetail: false,
                    },
                    eMsgType.MSG_REQUEST_PLAYER_DATA,
                    eMsgPort.ID_MSG_PORT_DATA,
                    UserData.getInstance().getUserData().uid,
                    function (jsMsg) {
                        this._onGetPlayerData(jsMsg);

                        if (this.m_curNextFunc != null) {
                            next();
                        }
                    }.bind(this));
            }.bind(this),
            function (err: any) {
                this.m_isProcessReq = false;

                if (err == null) {
                    this.m_curNextFunc = null;
                    this.m_reqQueue && this.m_reqQueue.shift();
                    callback && callback();
                }
            }.bind(this)
        )
    }

    _onGetPlayerData(player: any) {
        if (player && player.uid) {
            this.m_playerDataMap[player.uid] = player;
        }
        else {
            cc.warn('PlayerDataManger _onGetPlayerData player data err, player =', player);
        }
    }

    _filterReqList(list): number[] {
        let retList: number[] = [];
        retList = _.filter(list, (uid: number) => {
            let ret = false;
            ret = this.m_playerDataMap[uid] == null ? true : false;
            return ret;
        })

        return retList;
    }

    _onNetClose() {
        this.m_isProcessReq = false;

        this.m_curNextFunc && this.m_curNextFunc('net close');

        this.m_curNextFunc = null;
    }

    _onNetReconnected() {
        if (this.m_isProcessReq) {
            cc.warn('PlayerDatamanger _onNetReconnected _isProcessReq = true');
            this.m_isProcessReq = false;
        }
        this._processReq();
    }

    _registEvent() {
        cc.systemEvent.on(ClientDefine.netEventClose, this._onNetClose, this);
        cc.systemEvent.on(ClientDefine.netEventReconnectd, this._onNetReconnected, this);
    }

    _init() {
        this._registEvent();
        this._loadFile();

        this.m_beenInit = true;
    }

    _loadFile() {

    }

    _saveToFile() {

    }
};

export default new PlayerDataManager();