import Singleton from '../../Utils/Singleton';

import StateMachine, { Transition, Method } from '../../Utils/StateMachine';
import GameRoomScene from '../../View/Scene/GameRoomScene';

import { EmChipType } from '../../Define/GamePlayDefine';

class GameController extends Singleton {
    private m_gameRoomScene: GameRoomScene = null;

    private m_Basefsm: StateMachine = null;

    getBaseFsm(): StateMachine {
        return this.m_Basefsm;
    }

    clearAll() {
        this.m_gameRoomScene = null;
        this.m_Basefsm = null;
        this.m_gameRoomScene = null;
    }

    setCurView(scene: GameRoomScene) {
        this.clearAll();
        this.m_gameRoomScene = scene;

        this.m_Basefsm = new StateMachine(
            'GameStateStart',
            [
                new Transition('Account', ['GameStateStart'], 'GameStateAccount'),
                new Transition('Restart', ['GameStateAccount'], 'GameStateStart')
            ],
            [
                new Method('onAccountFromGameStateStart', function () { cc.log('onAccountFromGameStateStart'); }),
                new Method('onRestartFromGameStateAccount', function () { cc.log('onRestartFromGameStateAccount'); })
            ]
        );
    }

    unsetCurView() {
        this.clearAll();
    }

    //state machine
    onGameStart() {
        this.m_Basefsm.changeState('Restart');
    }

    onGameStopBet() {
        this.m_Basefsm.changeState('Account');
    }

    //scene
    distributeCards() {
        this.m_gameRoomScene.distributeCards();
    }

    getCurChipType(): EmChipType {
        return this.m_gameRoomScene.getCurChipType();
    }

    getPlayerHeadWorldPos(clientIdx: number): cc.Vec2 {
        return this.m_gameRoomScene.getPlayerHeadWorldPos(clientIdx);
    }
};

export default new GameController();