import * as async from 'async';
import * as _ from 'lodash';

import Network from '../../Utils/Network';
import PlayerData from '../../Data/PlayerData';
import { eMsgPort, eMsgType } from '../../Define/MessageIdentifer';
import clientDefine, { clientEventDefine, eClubMemberLevel } from '../../Define/clientDefine';

class ClubDataManager {
    private m_beenInit: boolean = false;

    private m_clubDataMap: any = {};
    private m_joinClubIDList: number[] = [];
    private m_manageClubIDList: number[] = [];

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
        this.m_clubDataMap = {};
        this.m_joinClubIDList.length = 0;
        this.m_manageClubIDList.length = 0;
    }
    
    getJoinClubIDList() {
        return this.m_joinClubIDList;
    }

    setJoinClubIDList(list: number[]) {
        this.m_joinClubIDList = list;
    }
    
    getMangeClubIdList() {
        return this.m_manageClubIDList;
    }

    setManageClubIDList(list: number[]) {
        this.m_manageClubIDList = list;
    }

    removeClubFromManageList(clubID: number) {
        _.remove(this.m_manageClubIDList, (manageClubID) => {
            return manageClubID == clubID;
        });
    }

    getClubData(clubID: number) {
        return this.m_clubDataMap[clubID];
    }

    setClubData(data: any) {
        this.m_clubDataMap[data.clubID] = data;
    }

    updateClubDataInfo(data: any) {
        _.merge(this.m_clubDataMap[data.clubID], data);
    }

    reqClubData(clubIdList: number[], forceReq: boolean = false) {
        this.m_reqQueue.push(clubIdList);

        if (!this.m_isProcessReq) {
            this._processReq(forceReq);
        }
    }

    _processReq(forceReq: boolean = false) {
        if (this.m_reqQueue.length > 0) {
            let curReqList = _.uniq(this.m_reqQueue[0]);

            if (!forceReq) {
                curReqList = this._filterReqList(curReqList);
            }

            this._startReq(curReqList, this._processReq.bind(this, forceReq));
        }
        else {
            //all req finished

            let dispEvent = new cc.Event.EventCustom(clientEventDefine.CUSTOM_EVENT_CLUB_DATA_REQ_FINISHED, true);
            cc.systemEvent.dispatchEvent(dispEvent);
        }
    }

    _startReq(list: number[], callback: Function) {
        this.m_isProcessReq = true;

        if (list.length > 0) {
            async.eachSeries(
                list,
                (clubID: number, next: Function) => {
                    this.m_curNextFunc = next;
    
                    Network.getInstance().sendMsg(
                        {
                            msgID: eMsgType.MSG_CLUB_APPLY_CLUB_INFO,
                            uid: PlayerData.getInstance().getPlaterData().uid
                        },
                        eMsgType.MSG_CLUB_APPLY_CLUB_INFO,
                        eMsgPort.ID_MSG_PORT_DATA,
                        clubID,
                        (jsMsg) => {
                            if (jsMsg.ret == 0) {
                                this._onGetClubData(jsMsg);
                            }
    
                            if (this.m_curNextFunc != null) {
                                next();
                            }
                        });
                },
                (err: any) => {
                    this.m_isProcessReq = false;
    
                    if (err == null) {
                        this.m_curNextFunc = null;
                        this.m_reqQueue && this.m_reqQueue.shift();
                        callback && callback();
                    }
                }
            )
        }
        else {
            this.m_isProcessReq = false;
            
            this.m_reqQueue && this.m_reqQueue.shift();
            callback && callback();
        }
    }

    _onGetClubData(clubData: any) {
        if (clubData && clubData.clubID) {
            if (this.m_clubDataMap[clubData.clubID] == null) {
                this.m_clubDataMap[clubData.clubID] = clubData;
            }
            else {
                _.merge(this.m_clubDataMap[clubData.clubID], clubData);
            }
            if (clubData.state >= eClubMemberLevel.eClubMemberLevel_Admin) {
                this.m_manageClubIDList = _.union(this.m_manageClubIDList, [clubData.clubID]);
            }
        }
        else {
            cc.warn('PlayerDataManger _onGetClubData clubData data err, clubData =', clubData);
        }
    }

    _filterReqList(list): number[] {
        let retList: number[] = [];
        retList = _.filter(list, (clubID: number) => {
            let ret = false;
            ret = this.m_clubDataMap[clubID] == null ? true : false;
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
            cc.warn('ClubDataManager _onNetReconnected _isProcessReq = true');
            this.m_isProcessReq = false;
        }
        
        this._processReq();
    }

    _registEvent() {
        cc.systemEvent.on(clientDefine.netEventClose, this._onNetClose, this);
        cc.systemEvent.on(clientDefine.netEventReconnectd, this._onNetReconnected, this);
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

export default new ClubDataManager();