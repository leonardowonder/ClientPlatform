
export enum DDZ_Type {
    DDZ_Single = 0,
    DDZ_Pair,
    DDZ_3Pices,
    DDZ_3Follow1,//
    DDZ_SingleSequence,
    DDZ_PairSequence,
    DDZ_3PicesSeqence,
    DDZ_AircraftWithWings,//
    DDZ_4Follow2,//
    DDZ_Common,
    DDZ_Bomb,
    DDZ_Rokect,
    DDZ_Max,
}

export enum DDZCardType {
    Type_None = 0,
    Type_Single,//单张
    Type_DuiZi,//对子
    Type_SanZhang_0,//三不带
    Type_SanZhang_1,//三带一
    Type_SanZhang_2,//三带一对
    Type_ShunZi,//顺子
    Type_LianDui,//连对
    Type_FeiJi_0,//飞机不带
    Type_FeiJi_1,//飞机带2单张
    Type_FeiJi_2,//飞机带2对
    Type_ZhaDan_2,//四带两对
    Type_ZhaDan_1,//四带两张单
    Type_ZhaDan_0,//炸弹
    Type_JokerZhaDan,//炸弹
    Type_Max = 100,
}

export let EPokerType = {
    ePoker_None: 0,
    ePoker_Diamond: 0, // fangkuai
    ePoker_Club: 1, // cao hua
    ePoker_Heart: 2,  // hong tao
    ePoker_Sword: 3, // hei tao 
    ePoker_NoJoker: 4,
    ePoker_Joker: 4,
    ePoker_Max: 5,
}

export let SortType = cc.Enum({
    ST_NORMAL: 0,
    ST_COUNT: 1,
});

export let TagAnalyseResult = function() {
	this.cbBlockCount = {};//扑克数目 [4] map<typeCount, count>
    for (let i = 0; i < 4; i++) {
        this.cbBlockCount[i] = 0;
    }
	//cbCardData[4][MAX_COUNT];			//扑克数据
    this.cbCardData = {};
    for (let i = 0; i < 4; i++) {
        this.cbCardData[i] = {};
    }
};

//0:隐藏,1:准备,2:1分,3:2分,4:3分,5:不叫,6:不抢,7:明牌,8:不出,9:加倍
export enum EmDDZPlayerState {
    State_None = 0,
    State_Ready,
    State_Score1,
    State_Score2,
    State_Score3,
    State_NoCall,
    State_NoRob,
    State_ShowCards,
    State_NoDiscard,
    State_Add,
    State_Max
}

export let DDZ_WaitRobBankerTime = 15;
export let DDZ_WaitPlayerActTime = 15;

//出牌结果
// struct tagOutCardResult
// {
// 	BYTE							cbCardCount;						//扑克数目
// 	BYTE							cbResultCard[MAX_COUNT];			//结果扑克
// };

//搜索结果
export let TagSearchCardResult = function() {
	this.cbSearchCount = 0;						//结果数目
    this.cbCardCount = new Array(20);           //扑克数目（每一组结果的牌数量）cbCardCount[MAX_COUNT]
    this.cbResultCard = new Array(20);          //cbResultCard[MAX_COUNT][MAX_COUNT];	//结果扑克（每一组牌的数据）
    for (let i = 0; i < 20; i++) {
        this.cbResultCard[i] = new Array(20);
        for (let j = 0; j < 20; j++) {
            this.cbResultCard[i][j] = 0;
        }
    }	
    this.centerCardArray = new Array(20);
    this.wingsCardArray = new Array(20);			
};

//带牌结果
export let TagSearchWithCardResult = function() {
    this.cbSearchCount = 0;
    this.centerCardCount = new Array();
    this.centerCardData = new Array();
    this.withCardCount = new Array();//[]
    this.withCardData = new Array();
};

export let TagPlaneSearchResult = function() {
    this.cbSearchCount = 0;						//结果数目
    this.cbCardCount = new Array(20);           //扑克数目（每一组结果的牌数量）cbCardCount[MAX_COUNT]
    this.cbResultCard = new Array(20);          //cbResultCard[MAX_COUNT][MAX_COUNT];	//结果扑克（每一组牌的数据）
    this.cbCenterCards = new Array(20);         //centerCards array
    this.cbWingCards = new Array(20);           //wingCards
};

export let TagDistributing = function() {
    this.cbCardCount = 0;
	this.cbDistributing = new Array(20);//[19][6];
    for (let i = 0; i < 20; i++) {
        this.cbDistributing[i] = new Array(6);
        for (let j = 0; j < 6; j++) {
            this.cbDistributing[i][j] = 0;
        }
    }
};