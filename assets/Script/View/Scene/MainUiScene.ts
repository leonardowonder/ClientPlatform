const { ccclass } = cc._decorator;

import MainUiSceneLogic from '../../Logic/MainUiSceneLogic';

@ccclass
export default class MainUIScene extends cc.Component {

    onDestroy() {
    }

    onLoad() {

    }

    onDDZClick() {
        MainUiSceneLogic.getInstance().requestEnterDDZRoom();
    }

    onRedBlackClick() {
        MainUiSceneLogic.getInstance().requestEnterRBRoom();
    }
}
