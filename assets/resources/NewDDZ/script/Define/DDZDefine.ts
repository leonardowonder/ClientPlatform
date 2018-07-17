export let eRoomState = {
    // new state 
    eRoomSate_WaitReady: 0,
    eRoomState_StartGame: 1,
    eRoomState_Common_Max: 20,

    // niu niu special ;
    eRoomState_DecideBanker: 21,
    eRoomState_RobotBanker: 21,
    eRoomState_DistributeFirstCard: 22,
    eRoomState_DoBet: 23,
    eRoomState_DistributeCard: 24,
    eRoomState_DistributeFinalCard: 24,
    eRoomState_CaculateNiu: 25,
    eRoomState_GameEnd: 26,
    eRoomState_NN_Max: 50,

    // mj specail ;
    eRoomState_WaitPlayerAct: 51,  // 等待玩家操作 { idx : 0 , huaCard : 23 }
    eRoomState_DoPlayerAct: 52,  // 玩家操作 // { idx : 0 ,huIdxs : [1,3,2,], act : eMJAct_Chi , card : 23, invokeIdx : 23, eatWithA : 23 , eatWithB : 22 }
    eRoomState_AskForRobotGang: 53, // 询问玩家抢杠胡， { invokeIdx : 2 , card : 23 }
    eRoomState_WaitPlayerChu: 54, // 等待玩家出牌 { idx : 2 }
    eRoomState_MJ_Common_Max: 80,

    // bj specail 
    eRoomState_BJ_Make_Group: 81,
    eRoomState_BJ_Max: 100,
    // dou di zhu specail 
    eRoomState_DDZ_Chu: 101,
    eRoomState_JJ_DDZ_Ti_La_Chuai: 102,
    eRoomState_JJ_DDZ_Chao_Zhuang: 103,
};

export let eRoomPeerState = {
    eRoomPeer_None: 0,
    // peer state for taxas poker peer
    eRoomPeer_SitDown: 1,
    eRoomPeer_StandUp: 2,
    eRoomPeer_Ready: 4097,
    eRoomPeer_StayThisRound: 5,
    eRoomPeer_WaitCaculate: 133,
    eRoomPeer_AllIn: 141,
    eRoomPeer_GiveUp: 21,
    eRoomPeer_CanAct: 165,
    eRoomPeer_WaitNextGame: 65,
    eRoomPeer_WithdrawingCoin: 256,  // when invoke drawing coin , must be sitdown , but when staup up , maybe in drawingCoin state 
    eRoomPeer_DoMakedCardGroup: 421,
    eRoomPeer_LackOfCoin: 513,
    eRoomPeer_WillLeave: 1026,
    eRoomPeer_Looked: 8357,
    eRoomPeer_PK_Failed: 16389,

    eRoomPeer_SysAutoAct: (1 << 18),//托管
    eRoomPeer_AlreadyHu: 32933,  //  已经胡牌的状态
    eRoomPeer_DelayLeave: 131072,  //  牌局结束后才离开

    eRoomPeer_Max: 131072 + 1,
};