const { ccclass, property } = cc._decorator;

import ResManager from '../../../NewDDZ/script/Module/Custom/ResManager';
import resDDZPathList from '../../../NewDDZ/script/ResData';
import { eMsgPort } from '../../../../Script/Define/MessageIdentifer';

var ResMgrIns = ResManager.getInstance();

@ccclass
export default class CommonLoading extends cc.Component {
    @property(cc.ProgressBar)
    m_pProgressBar: cc.ProgressBar = null;
    @property(cc.Sprite)
    m_loadBG: cc.Sprite = null;

    _gameType = null;
    _loadCompleteResp = null;
    
    initWithResPathList(gameType, loadCompleteResp) {
        this._gameType = gameType;
        this._loadCompleteResp = loadCompleteResp;
        let realUrl1 = '';
        let pathList = [];
        switch (gameType) {
            case eMsgPort.ID_MSG_PORT_NIU_NIU:
                break;
            case eMsgPort.ID_MSG_PORT_DOU_DI_ZHU:
            {
                pathList = resDDZPathList;
                realUrl1 = cc.url.raw("resources/ddz/image/loadImg.jpg");
            }
                break;
            case eMsgPort.ID_MSG_PORT_GOLDEN:
            case eMsgPort.ID_MSG_PORT_BI_JI:
                break;
            default:
                break;
        }

        var texture1 = cc.textureCache.addImage(realUrl1, null, null);
        this.m_loadBG.spriteFrame = new cc.SpriteFrame(texture1);

        ResMgrIns.loadRes(pathList, this.loadingUpdate.bind(this));
    }

    loadingUpdate(percent) {
        this.m_pProgressBar.progress = percent;
        if (percent < 1) {

        } else {
            if (this._loadCompleteResp) {
                this._loadCompleteResp();
            }
        }
    }
};
