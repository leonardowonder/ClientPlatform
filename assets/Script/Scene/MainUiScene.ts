const { ccclass, property } = cc._decorator;
// import { MyUtils, QuitGameType } from '../MyUtils'
// import PlayerData from '../PlayerData'
// import { MainUiScenePage } from '../clientDefine'
// import AudioManager from '../AudioManager'
// import AudioType from '../AudioType'
// import PrefabManager, { ePrefabEnum } from '../Manager/PrefabManager';
// import ToggleChangeColor from '../Component/ToggleChangeColor';
// import MainSceneLogic from '../Logic/MainSceneLogic';
// import MainClubLogic from '../Logic/MainClubLogic';
// var StateMachine = require('javascript-state-machine');
import StateMachine, { Transition, Method } from '../Manager/StateMachine/StateMachine';

@ccclass
export default class MainUIScene extends cc.Component {

    // @property(cc.Toggle)
    // m_toggles: cc.Toggle[] = [];

    // @property(ToggleChangeColor)
    // private m_toggleChangeComp: ToggleChangeColor = null;

    // @property(cc.Node)
    // m_contentNode: cc.Node = null;

    // @property(cc.Node)
    // private m_pClubNull: cc.Node = null;

    // /*-----------------------*/
    // private m_pageIdx: number = MainUiScenePage.Page_Rooms;

    // private m_pageEnumList: number[] = [ePrefabEnum.MainRooms, ePrefabEnum.MainClub, ePrefabEnum.MainCreate, ePrefabEnum.MainRecord, ePrefabEnum.MainMe];

    onDestroy() {

        // MainSceneLogic.getInstance().unsetCurView();
    }

    onLoad() {
        // var fsm = new StateMachine({
        //     init: 'solid',
        //     transitions: [
        //         { name: 'Melt', from: 'solid', to: 'liquid' },
        //         { name: 'freeze', from: 'liquid', to: 'solid' },
        //         { name: 'vaporize', from: 'liquid', to: 'gas' },
        //         { name: 'condense', from: 'gas', to: 'liquid' }
        //     ],
        //     methods: {
        //         onBeforeMelt: function () { console.log('onBeforeMelt') },
        //         onMelt: function () { console.log('I melted') },
        //         onAfterMelt: function () { console.log('onAfterMelt') },
        //         onFreeze: function () { console.log('I froze') },
        //         onLeaveSolid: function () { console.log('onLeaveSolid') },
        //         onEnterLiquid: function () { console.log('onEnterLiquid') },
        //         onVaporize: function () { console.log('I vaporized') },
        //         onCondense: function () { console.log('I condensed') }
        //     }
        // });

        let fsm = new StateMachine(
            'Solid',
            [
                new Transition('Melt', ['Solid'], 'Liquid'),
                new Transition('Freeze', ['Liquid'], 'Solid'),
                new Transition('Vaporize', ['Liquid'], 'Gas'),
                new Transition('Condense', ['Gas'], 'Liquid')
            ],
            [
                new Method('onBeforeMeltFromSolid', function () { console.log('onBeforeMeltFromSolid') }),
                new Method('onLeaveSolidInMelt', function () { console.log('onLeaveSolidInMelt') }),
                new Method('onMeltFromSolid', function () { console.log('onMeltFromSolid') }),
                new Method('onEnterLiquidInMelt', function () { console.log('onEnterLiquidInMelt') }),
                new Method('onAfterMeltFromSolid', function () { console.log('onAfterMeltFromSolid') }),
                new Method('onFreezeFromLiquid', function () { console.log('onFreezeFromLiquid') }),
                new Method('onVaporizeFromLiquid', function () { console.log('onVaporizeFromLiquid') }),
                new Method('onCondenseFromGas', function () { console.log('onCondenseFromGas') })
            ]
        );

        fsm.changeState('Freeze');
    }

    start() {
        // this.reqRoomList();
    }

    onToggleClick(target: cc.Toggle, customEvent: string) {
        // AudioManager.prototype.getInstance().playerEffect(AudioType.audio_TouchButton);
        // let pageIdx = parseInt(customEvent);

        // this.m_toggleChangeComp.updateColor();

        // this._updatePageTypeIdx(pageIdx);

        // this.refreshContent();
    }

    reqRoomList() {
        // MainSceneLogic.getInstance().reqRoomList();
    }

    init() {
        // MainSceneLogic.getInstance().checkJianQieBan();
        // MainSceneLogic.getInstance().refreshMoney();
        // MainClubLogic.getInstance().requestPlayerClubInfo();

        // if (PlayerData.prototype.getInstance().getQuitGameType() == QuitGameType.QuitGameType_MANUAL) {
        //     this.m_pageIdx = MainUiScenePage.Page_Clubs;
        // } else if (PlayerData.prototype.getInstance().getQuitGameType() == QuitGameType.QuitGameType_ROOMEND) {
        //     this.m_pageIdx = MainUiScenePage.Page_Record;
        // }

        // PlayerData.prototype.getInstance().setQuitGameType(QuitGameType.QuitGameType_NONE);
        // //获取定位
        // if (!MyUtils.prototype.getInstance().isCheck()) {
        //     MyUtils.prototype.getInstance().startUpdatingLocation();
        // }

        // this._recheckToggles();
    }

    refreshContent() {
        // // to do by wd newbie guide
        // if (this.m_pageIdx == MainUiScenePage.Page_Clubs) {
        //     this.m_pClubNull.active = false;
        // } else if (this.m_pageIdx == MainUiScenePage.Page_Me) {
        //     MainSceneLogic.getInstance().refreshMoney();
        // }

        // this.m_pageEnumList.forEach((prefabKey) => {
        //     if (prefabKey != this.m_pageEnumList[this.m_pageIdx]) {
        //         PrefabManager.getInstance().hidePrefab(prefabKey, this.m_contentNode);
        //     }
        // })

        // PrefabManager.getInstance().showPrefab(this.m_pageEnumList[this.m_pageIdx], [], this.m_contentNode);
    }

    _recheckToggles() {
        // this.m_toggles.forEach((toggle, idx) => {
        //     if (idx == this.m_pageIdx) {
        //         if (toggle.isChecked) {
        //             this.refreshContent();
        //         }
        //         else {
        //             toggle.check();
        //         }
        //     }
        // })
    }

    _updatePageTypeIdx(typeIdx: number) {
        // this.m_pageIdx = typeIdx;
    }
}
