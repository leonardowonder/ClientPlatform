export enum EmRecordType {
    Type_None = 0,
    Type_Red,
    Type_Black,
    Type_Max
};

export const Max_Record_Count = 70;

export enum EmViceRoadType {
    Type_None = 0,
    Type_Road1,
    Type_Road2,
    Type_Road3,
    Type_Max
};

export enum EmDeciderType {
    Type_None = 0,
    Type_Red,
    Type_Black,
    Type_Max
};

export enum EmCardTpye {
    CardType_None = 0,
    CardType_Diamond,
    CardType_Club,
    CardType_Heart,
    CardType_Spade,
    CardType_Max
};

export enum eCardType {
    eCard_None,
    eCard_Diamond = eCard_None, // fangkuai
    eCard_Club, // cao hua
    eCard_Heart, // hong tao
    eCard_Sword, // hei tao 
    eCard_NoJoker,
    eCard_Joker = eCard_NoJoker, // xiao wang
    eCard_BigJoker, // da wang
    eCard_Max,
};

export let Normal_Type_Max_Value: number = 7;

export enum EmGroupType {
    GroupType_None = 0,
    GroupType_Pair,
    GroupType_Straight,
    GroupType_Flush,
    GroupType_FlushStraight,
    GroupType_AllSame,
    GroupType_Max
};

export class GroupTypeInfo {
    type: EmGroupType = EmGroupType.GroupType_None;
    value: number = 0;

    constructor(type: EmGroupType, value: number) {
        this.type = type;
        this.value = value;
    }
}

export enum EmCaptainType {
    Type_None = 0,
    Type_Red,
    Type_Black,
    Type_Max
}

export enum EmCampType {
    Type_None = 0,
    Type_Red,
    Type_Black,
    Type_Max
}

export const Game_Room_Players_Max_Count = 9;
export const Game_Room_Seat_Max_Count = 8;

export const Game_Room_Max_Coin_Idx = 3;
export const Game_Room_Max_Win_Rate_Idx = 4;

export enum EmBetAreaType {
    Type_None = 0,
    Type_Red,
    Type_Black,
    Type_Special,
    Type_Max
}

export enum EmChipType {
    Type_None = 0,
    Type_Ten,
    Type_Hundred,
    Type_Thousand,
    Type_TenTh,
    Type_Max
}

//server

export enum eBetPool {
    eBet_Red,
    eBet_Black,
    eBet_Other,
    eBet_Max,
};

export enum GoldenType {
    Golden_None,
    Golden_Single,//单张
    Golden_Double,//对子
    Golden_Straight,//顺子
    Golden_Flush,//同花
    Golden_StraightFlush,//同花顺
    Golden_ThreeCards,//豹子
    Golden_Max,
};

export enum eRoomState {
    // new state 
    eRoomState_StartGame = 1,
    eRoomState_GameEnd = 26,
};

export class CardsInfo {
    cards: number[] = [];
    T: GoldenType = GoldenType.Golden_None;
    V: number = 0;
}

export class WinInfo {
    idx: number = 0;
    offset: number = 0;

    constructor(info) {
        this.idx = info.idx;
        this.offset = info.offset;
    }
}

export class ResultInfo {
    bankerLose: number = 0;
    bestBetOffset: number = 0;
    richestOffset: number = 0;

    black: CardsInfo = null;
    red: CardsInfo = null;
    isRedWin: number = 0;
    result: WinInfo[] = [];
}