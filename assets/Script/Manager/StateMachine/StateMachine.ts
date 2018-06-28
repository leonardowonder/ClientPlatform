import * as _ from 'lodash';

export class Transition {
    public eventName: string = '';
    public froms: string[] = [''];
    public to: string = '';

    constructor(event: string, froms: string[], to: string) {
        this.eventName = event;
        this.froms = froms;
        this.to = to;
    }
}

export class Method {
    public methodName: string = '';
    public func: Function = null;

    constructor(name: string, func: Function) {
        this.methodName = name;
        this.func = func;
    }
}

let ConfigureLifecycle = {
    onBefore: 'onBefore_eventName_From_state_',
    onLeave: 'onLeave_state_In_eventName_',
    on: 'on_eventName_From_state_',
    onEnter: 'onEnter_state_In_eventName_',
    onAfter: 'onAfter_eventName_From_state_'
}

let parseFuncName = function (configName: string, state: string, eventName: string) {
    let str = configName;

    let stateReg = new RegExp('_state_');
    str = str.replace(stateReg, state);

    let eventReg = new RegExp('_eventName_');
    str = str.replace(eventReg, eventName);

    return str;
}

class StateMachine {

    private m_curState: string = null;
    private m_preState: string = null;
    private m_targeState: string = null;

    private m_allTrasitionList: Transition[] = [];
    private m_allMethodMap = {};
    private m_allStates: string[] = [];

    //init
    constructor(init: string, transitions: Transition[] = [], methods: Method[] = []) {
        this.m_curState = init;
        this.m_allTrasitionList = transitions;

        if (transitions && transitions.length > 0) {
            transitions.forEach((transition: Transition) => {
                this.m_allStates = _.union(this.m_allStates, transition.froms, [transition.to]);
            });
        }

        if (methods && methods.length > 0) {
            methods.forEach((method: Method) => {
                this.m_allMethodMap[method.methodName] = method.func;
            });
        }
    }

    //interface
    getPreState() {
        return this.m_preState;
    }

    getCurState() {
        return this.m_curState;
    }

    getTargetState() {
        return this.m_targeState;
    }

    getTransitions() {
        
    }

    changeState(eventName: string) {
        let targetState = this._seekTargetState(eventName);
        if (targetState == null) {
            cc.warn(`StateMachine changeState no targetState! curState = ${this.m_curState}, event = ${eventName}`);
            return;
        }

        for (let key in ConfigureLifecycle) {
            let method: Function = this._seekChangeMethod(ConfigureLifecycle[key], eventName);

            switch (ConfigureLifecycle[key]) {
                case ConfigureLifecycle.onBefore: {
                    this.m_targeState = targetState;
                    break;
                }
                case ConfigureLifecycle.onLeave: {
                    break;
                }
                case ConfigureLifecycle.on: {
                    this.m_preState = this.m_curState;
                    this.m_curState = this.m_targeState;
                    this.m_targeState = null;
                    if (!method) {
                        cc.warn(`StateMachine changeState no change method curState = ${this.m_curState}, event = ${eventName}`);
                    }
                    break;
                }
                case ConfigureLifecycle.onEnter: {
                    break;
                }
                case ConfigureLifecycle.onAfter: {
                    break;
                }
                default: {
                    cc.error('StateMachine changeState unknown lifeCyclekey = ', key);
                    break;
                }
            }

            method && method();
        }
    }

    _seekChangeMethod(cycleKey: string, eventName: string): Function {
        let state = cycleKey == ConfigureLifecycle.onAfter ? this.m_preState : this.m_curState;

        let methodKey = parseFuncName(cycleKey, state, eventName);

        let method = this.m_allMethodMap[methodKey];
        return method;
    }

    _seekTargetState(eventName: string): string {
        let ret = null;

        let targetTtransition = _.find(this.m_allTrasitionList, (transition: Transition) => {
            let ret = false;

            let fromState: string = _.find(transition.froms, (from: string) => {
                return from == this.m_curState;
            })

            if (fromState != null) {
                ret = transition.eventName == eventName;
            }

            return ret;
        })

        if (targetTtransition != null) {
            ret = targetTtransition.to;
        }

        return ret;
    }
};

export default StateMachine;