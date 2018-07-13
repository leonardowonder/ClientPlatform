import Singleton from '../../Utils/Singleton';

import StateMachine, { Transition, Method } from '../../Utils/StateMachine';
import GameRoomScene from '../../View/Scene/GameRoomScene';

class GameController extends Singleton {
    private m_gameRoomScene: GameRoomScene = null;

    private m_Basefsm: StateMachine = null;

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

    onGameStart() {
        this.m_Basefsm.changeState('Restart');
    }
};

export default new GameController();