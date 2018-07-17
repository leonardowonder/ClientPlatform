let DDZLanguage = {
    startGame: "房间开始",
    alreadyDismissRoom: "房间已解散",
    reEnterRoom: "正在重新进入房间...",
    donotFindRoom: "未找到房间",

    InfoType: {
        //login
        LoginMessage: {
            LOGIN_MESSAGE: "正在登陆...",
            LOGIN_GETTAKIN: "正在获取授权...",
            LOGIN_SUCCESS: "登陆成功",
            LOGIN_ACCOUNT_ERROR: "账号错误",
            LOGIN_PASSWORD_ERROR: "密码错误",
            LOGIN_STATE_ERROR: "状态错误",
            LOGIN_OTHER_ERROR: "登陆失败,code = ",
        },
        //enter room
        EnterRoomMessage: {
            MAINUI_ENTERROOM_SUCCESS: "进入房间成功",
            MAINUI_ENTERROOM_ALREADY_IN_THIS_ROOM: "已经在该房间",
            MAINUI_ENTERROOM_NOT_REGISTER_NOT_ENTER: "绑定手机号后才能进入",
            MAINUI_ENTERROOM_PLAYER_COIN_FEW: "您的钻石不足",
            MAINUI_ENTERROOM_PLAYER_COIN_MANY: "您的金币超过上限",
            MAINUI_ENTERROOM_ROOM_ID_CAN_NOT_FIND: "没有找到该房间",
            MAINUI_ENTERROOM_ROOM_TYPE_ERROR: "房间类型错误",
            MAINUI_ENTERROOM_ROOM_MAX_PEOPLE: "房间人数已满",
            MAINUI_ENTERROOM_OTHER_ERROR: "进入房间失败,code = ",
        },
        PlayerAct: {
            ACT_OK: "操作成功",
            ACT_NOT_YOUR: "操作失败,不该您操作",
            ACT_TIAO_JIAN_ERROR: "操作失败,条件不满足",
            ACT_CAN_SHU_ERROR: "操作失败,参数错误",
            ACT_STATE_ERROR: "操作失败,状态错误",
            ACT_OTHER_ERROR: "操作失败,code = ",
        },
        MainUI: {
            EXIT_GAME_INFO: "是否更换账号?",
            ENTER_ROOM_INFO: "正在进入房间...",
            BACK_TO_LOGIN_SCENE: "请重新登陆",
            GET_VERFION_JSON: "正在获取版本信息...",
            GET_VERFION_ERROR: "获取版本信息失败",
            APPSTORE_NEW_VERFION: "商店发现新版本",
            CREATE_ROOM: "正在创建房间",
            REQ_SCORE: "正在请求战绩...",
        },
        MainGame: {
            ALREADY_TALK: "语音系统正在使用,请耐心等待",
            CALCEL_SEND_TALK: "取消发送成功",
            SEND_MESSAGE_OK: "消息发送成功",
            REQUEST_ROOM_INFO: "正在请求房间信息",
            ROOM_IS_DELETE: "房间已经解散！",
            DELETE_ROOM_BY_INIT: "解散房间不扣除钻石,是否解散房间?",
            DELETE_ROOM: "是否发送申请解散房间?",
            BACK_MAINUI: "是否返回主页?",
        },
    }
};

export default DDZLanguage;