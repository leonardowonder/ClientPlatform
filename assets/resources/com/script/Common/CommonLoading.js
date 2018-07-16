var ResMgrIns = require('ResManager').ResManager.instance;
var ResData = require('ResData');
var CClientApp = require('CClientApp');
var MyUtils = require('MyUtils');

cc.Class({
    extends: cc.Component,

    properties: {
        m_pProgressBar: cc.ProgressBar,
        m_loadBG: cc.Sprite,
    },

    initWithResPathList: function(gameType, loadCompleteResp) {
        this._gameType = gameType;
        this._loadCompleteResp = loadCompleteResp;
        let realUrl1 = '';
        let pathList = '';
        switch (gameType) {
            case CClientApp.eMsgPort.ID_MSG_PORT_NIU_NIU:
                break;
            case CClientApp.eMsgPort.ID_MSG_PORT_DOU_DI_ZHU:
            {
                pathList = ResData.resDDZPathList;
                realUrl1 = cc.url.raw("resources/ddz/image/loadImg.jpg");
                //DDZGameData.onMessage(event);
            }
                break;
            case CClientApp.eMsgPort.ID_MSG_PORT_GOLDEN:
            case CClientApp.eMsgPort.ID_MSG_PORT_BI_JI:
                break;
            default:
                break;
        }

        var texture1 = cc.textureCache.addImage(realUrl1);
        this.m_loadBG.spriteFrame = new cc.SpriteFrame(texture1);

        ResMgrIns.loadRes(pathList, this.loadingUpdate.bind(this));
    },

    loadingUpdate: function(percent) {
        this.m_pProgressBar.progress = percent;
        if (percent < 1) {

        } else {
            if (this._loadCompleteResp) {
                this._loadCompleteResp();
            }
        }
    },
});
