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

export enum eGameType
{
	eGame_None,
	eGame_NiuNiu,
	eGame_BiJi,
	eGame_CYDouDiZhu,
	eGame_JJDouDiZhu,
	eGame_TestMJ,
	eGame_Golden,
	eGame_SCMJ,
	eGame_Max,
};