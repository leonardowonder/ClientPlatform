import * as _ from 'lodash';

import { NetMsg, praseMsg } from '../../Logic/LogicBasic';
import Network from '../../Utils/Network';
import PlayerData from '../../Data/PlayerData';
import { eMsgPort, eMsgType } from '../../Define/MessageIdentifer';
import ClientDefine, { clientEventDefine } from '../../Define/ClientDefine';

class ClubMemberDataManager {
    private m_beenInit: boolean = false;

    private m_vUserList: any = {};
    private m_vClubMembersDoneFlag: any = {};

    getInstance() {
        if (!this.m_beenInit) {
            this._init();
        }

        return this;
    }

    clearClubMembersByClubId(clubID) {
        let clubMemberDoneFlag = this.m_vClubMembersDoneFlag[clubID];
        if (clubMemberDoneFlag != null) {
            clubMemberDoneFlag = null;
        }
    }

    clearMembersByClubId(clubID) {
        let clubMemberList = this.m_vUserList[clubID];
        if (clubMemberList != null) {
            clubMemberList.length = 0;
        }
    }

    clearAllClubMembersDoneFlag() {
        for (let key in this.m_vClubMembersDoneFlag) {
            this.clearClubMembersByClubId(key);
        }
    }

    clearAllClubMembers() {
        for (let key in this.m_vUserList) {
            this.clearMembersByClubId(key);
        }
    }

    setMembersByClubID(members: any[], clubID: number) {
        this.m_vUserList[clubID] = members;
    }

    getMembersByClubId(clubID) {
        return this.m_vUserList[clubID];
    }

    getClubMembersDoneFlagByClubId(clubID) {
        return this.m_vClubMembersDoneFlag[clubID];
    }

    setClubMembersDoneFlagByClubId(flag: boolean, clubID) {
        this.m_vClubMembersDoneFlag[clubID] = flag;
    }

    addMembersToClub(newMembers: any[], clubID: number) {
        let clubMemberList = this._getClubMemberList(clubID);
        clubMemberList = _.unionWith(newMembers, clubMemberList, (object, other) => {
            return object.uid == other.uid;
        })

        this.setMembersByClubID(clubMemberList, clubID);
    }

    removeMemberFromClub(uid, clubID) {
        let clubMemberList: any[] = this._getClubMemberList(clubID);

        _.remove(clubMemberList, (object: any) => {
            return object.uid == uid;
        })

        this.setMembersByClubID(clubMemberList, clubID);
    }

    updateMemberInfoData(message, clubID) {
        let data = this.getMemberData(message.uid, clubID);
        if (data == null) {
            this.m_vUserList[clubID].push(message);
        }
        else {
            _.merge(data, message);
        }
    }

    getMemberData(uid, clubID) {
        let clubMemberList = this._getClubMemberList(clubID);
        let data = _.find(clubMemberList, (user: any) => {
            return user.uid == uid;
        })

        return data;
    }

    //net 
    requestClubMemberList(clubID: number) {
        Network.getInstance().sendMsg(
            {
                msgID: eMsgType.MSG_CLUB_MEMBER_INFO,
                uid: PlayerData.getInstance().getPlaterData().uid
            },
            eMsgType.MSG_CLUB_MEMBER_INFO,
            eMsgPort.ID_MSG_PORT_DATA,
            clubID);
    }

    _onNetClose() {

    }

    _onNetReconnected() {

    }

    _onMsg(event: cc.Event.EventCustom): void {
        let msg: NetMsg = praseMsg(event);

        switch (msg.nMsgID) {
            case eMsgType.MSG_CLUB_MEMBER_INFO: {
                this._onMsgClubMemberInfoRsp(msg.jsMsg);
                break;
            }
            default: {
                break;
            }
        }
    }

    _onMsgClubMemberInfoRsp(jsMsg: any) {
        var pError = null;
        if (jsMsg.ret == 0) {
            this.addMembersToClub(jsMsg.members, jsMsg.clubID);

            //last page
            if (jsMsg.idx == jsMsg.page - 1) {
                this.setClubMembersDoneFlagByClubId(true, jsMsg.clubID);

                let dispEvent = new cc.Event.EventCustom(clientEventDefine.CUSTOM_EVENT_CLUB_MEMBER_REQ_FINISHED, true);
                cc.systemEvent.dispatchEvent(dispEvent);
            }
            
            let dispEvent = new cc.Event.EventCustom(clientEventDefine.CUSTOM_EVENT_CLUB_MEMBER_GET, true);
            cc.systemEvent.dispatchEvent(dispEvent);
        } else if (jsMsg.ret == 1) {
            pError = "权限不足";
        } else if (jsMsg.ret == 2) {
            pError = "未找到成员";
        }
        if (pError) {
            cc.find("persistRootNode").getComponent('persistRootNode').showPromptDialog(pError);
        }
    }

    _init() {
        this._registEvent();

        this.m_beenInit = true;
    }

    _registEvent() {
        cc.systemEvent.on(ClientDefine.netEventClose, this._onNetClose, this);
        cc.systemEvent.on(ClientDefine.netEventReconnectd, this._onNetReconnected, this);
        cc.systemEvent.on(ClientDefine.netEventMsg, this._onMsg, this);
    }

    _getClubMemberList(clubID) {
        let clubMemberList = this.m_vUserList[clubID];
        if (clubMemberList == null) {
            this.m_vUserList[clubID] = [];
        }

        return this.m_vUserList[clubID];
    }
}

export default new ClubMemberDataManager();
