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

export const Tendency_Chart_Card_Type_Max_Count = 20;

export enum EmCardTpye {
    CardType_None = 0,
    CardType_Diamond,
    CardType_club,
    CardType_Heart,
    CardType_Spade,
    CardType_Max
};

export enum EmGroupType {
    GroupType_None = 0,
    GroupType_Pair,
    GroupType_Straight,
    GroupType_Flush,
    GroupType_FlushStraight,
    GroupType_AllSame,
    GroupType_Max
};

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

export const Game_Room_Seat_Max_Count = 9;

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