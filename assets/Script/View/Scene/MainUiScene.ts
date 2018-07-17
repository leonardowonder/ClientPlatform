const { ccclass, property } = cc._decorator;

import SceneManager, { EmSceneID } from '../../Manager/CommonManager/SceneManager';
import MainUiSceneLogic from '../../Logic/MainUiSceneLogic';

@ccclass
export default class MainUIScene extends cc.Component {

    @property(cc.EditBox)
    m_roomId: cc.EditBox = null;

    onDestroy() {
    }

    onLoad() {

    }

    onEnterClick() {
        let roomId = this.m_roomId.string;
        MainUiSceneLogic.getInstance().requestEnterRoom(parseInt(roomId));
    }

    onDDZClick() {
        // SceneManager.getInstance().changeScene(EmSceneID.SceneID_DDZScene);
        MainUiSceneLogic.getInstance().requestCreateDDZRoom();
    }

    onRedBlackClick() {
        SceneManager.getInstance().changeScene(EmSceneID.SceneID_GameRoomScene);
    }
}
