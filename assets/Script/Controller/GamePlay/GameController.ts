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
        this.m_Basefsm = null;
        this.m_gameRoomScene = null;
    }

    setScene(scene: GameRoomScene) {
        this.clearAll();
        this.m_gameRoomScene = scene;

        this.m_Basefsm = new StateMachine(
            'GameStateStart',
            [
                new Transition('Bet', ['GameStateStart'], 'GameStateBet'),
                new Transition('Account', ['GameStateBet'], 'GameStateAccount'),
                new Transition('Restart', ['GameStateStart', 'GameStateBet' ,'GameStateAccount'], 'GameStateStart')
            ],
            [
                new Method('onBetFromGameStateStart', function () { cc.log('onBetFromGameStateStart'); }),
                new Method('onAccountFromGameStateBet', function () { cc.log('onAccountFromGameStateBet'); }),
                new Method('onRestartFromGameStateAccount', function () { cc.log('onRestartFromGameStateAccount'); }),
                new Method('onRestartFromGameStateBet', function () { cc.log('onRestartFromGameStateBet'); }),
                new Method('onRestartFromGameGameStateStart', function () { cc.log('onRestartFromGameGameStateStart'); })
            ]
        );
    }

    //state machine
    onGameStart() {
        this.m_Basefsm.changeState('Restart');
    }

    onGameStartBet() {
        this.m_Basefsm.changeState('Bet');
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