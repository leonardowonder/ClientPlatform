var ResType = require('ResManager').ResType;

var resDDZPathList = [
    {type: ResType.ResType_Prefab, path: "NewDDZ/prefab/PokerCardNode", name: "PokerCardNode"},
    {type: ResType.ResType_Prefab, path: "NewDDZ/prefab/SelectedCardTypeCell", name: "SelectedCardTypeCell"},
    {type: ResType.ResType_Prefab, path: "NewDDZ/prefab/SelectedCardTypePanel", name: "SelectedCardTypePanel"},
    {type: ResType.ResType_SpriteAtlas, path: "NewDDZ/image/large_pai", name: "large_pai"},
    {type: ResType.ResType_SpriteAtlas, path: "NewDDZ/image/CaoZuo", name: "CaoZuo"},
];

module.exports = {
    resDDZPathList,
}
