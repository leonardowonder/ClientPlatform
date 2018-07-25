const { ccclass, property } = cc._decorator;

import SceneManager, { EmSceneID } from '../../Manager/CommonManager/SceneManager';
import MainUiSceneLogic from '../../Logic/MainUiSceneLogic';

@ccclass
export default class MainUIScene extends cc.Component {

    onDestroy() {
    }

    onLoad() {

    }

    onDDZClick() {
        // SceneManager.getInstance().changeScene(EmSceneID.SceneID_DDZScene);
        MainUiSceneLogic.getInstance().requestEnterDDZRoom();
    }

    onRedBlackClick() {
        // SceneManager.getInstance().changeScene(EmSceneID.SceneID_GameRoomScene);
        MainUiSceneLogic.getInstance().requestEnterRBRoom();
    }
}
