let ClientDefine = {
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

export default ClientDefine;

export enum eClubMemberLevel {
    eClubMemberLevel_None = 1, //普通玩家
    eClubMemberLevel_Admin = 50, //管理员
    eClubMemberLevel_Creator = 100, //创建者
};