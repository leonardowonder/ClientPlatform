let clientDefine = {
    time_heat_bet: 3,
    netEventOpen: "open",
    netEventFialed: "failed",
    netEventMsg: "msg",
    netEventClose: "close",
    netEventReconnectd: "reconnect",
    netEventReconnectdFailed: "reconnectFailed",
    msgKey: "msgID",
    msg: "msg",
};

export default clientDefine;

export enum eClubMemberLevel {
    eClubMemberLevel_None = 1, //普通玩家
    eClubMemberLevel_Admin = 50, //管理员
    eClubMemberLevel_Creator = 100, //创建者
};

export let clientEventDefine = {
    //custom event define
    CUSTOM_EVENT_PLAYER_DATA_GET: 'CUSTOM_EVENT_PLAYER_DATA_GET',
    CUSTOM_EVENT_CLUB_DATA_REQ_FINISHED: 'CUSTOM_EVENT_CLUB_DATA_REQ_FINISHED',
    CUSTOM_EVENT_CLUB_MEMBER_REQ_FINISHED: 'CUSTOM_EVENT_CLUB_MEMBER_REQ_FINISHED',
    CUSTOM_EVENT_CLUB_MEMBER_GET: 'CUSTOM_EVENT_CLUB_MEMBER_GET',
    CUSTOM_EVENT_PLAYER_DATA_REQ_FINISHED: 'CUSTOM_EVENT_PLAYER_DATA_REQ_FINISHED'
};