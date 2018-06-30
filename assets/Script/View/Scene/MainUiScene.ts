const { ccclass, property } = cc._decorator;

import * as async from 'async';

import StateMachine, { Transition, Method } from '../../Utils/StateMachine';
import PrefabManager, { EmPrefabEnum } from '../../Manager/CommonManager/PrefabManager';

@ccclass
export default class MainUIScene extends cc.Component {

    @property(cc.Node)
    m_node: cc.Node = null;

    onDestroy() {
    }

    onLoad() {
        // let args: any[] = [];
        // let foo = function(...params) {
        //     cc.log('wd deug', arguments, params);
        // }
        // foo(...args);

        // let fsm = new StateMachine(
        //     'Solid',
        //     [
        //         new Transition('Melt', ['Solid'], 'Liquid'),
        //         new Transition('Freeze', ['Liquid'], 'Solid'),
        //         new Transition('Vaporize', ['Liquid'], 'Gas'),
        //         new Transition('Condense', ['Gas'], 'Liquid')
        //     ],
        //     [
        //         new Method('onBeforeMeltFromSolid', function () { console.log('onBeforeMeltFromSolid') }),
        //         new Method('onLeaveSolidInMelt', function () { console.log('onLeaveSolidInMelt') }),
        //         new Method('onMeltFromSolid', this.onMeltFromSolid.bind(this, 1, 2, 'asdf')),
        //         new Method('onEnterLiquidInMelt', function () { console.log('onEnterLiquidInMelt') }),
        //         new Method('onAfterMeltFromSolid', function () { console.log('onAfterMeltFromSolid') }),
        //         new Method('onFreezeFromLiquid', function () { console.log('onFreezeFromLiquid') }),
        //         new Method('onVaporizeFromLiquid', function () { console.log('onVaporizeFromLiquid') }),
        //         new Method('onCondenseFromGas', function () { console.log('onCondenseFromGas') })
        //     ]
        // );

        // fsm.changeState('Melt');
    }

    // onMeltFromSolid() {
    //     console.log('onMeltFromSolid', arguments);
    // }
}
