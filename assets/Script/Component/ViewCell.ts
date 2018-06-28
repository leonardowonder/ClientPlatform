const {
    ccclass
} = cc._decorator;

import TableView from './TableView'

@ccclass
export default class ViewCell extends cc.Component {

    tableView: TableView = null;

    _isCellInit_: boolean = false;
    _longClicked_: boolean = false;

    _cellAddTouch_() {
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            if (this.node.active === true && this.node.opacity !== 0) {
                if (!this._longClicked_) {
                    this._longClicked_ = true;
                    this.scheduleOnce(this._longClicked, 1.5);
                }
            }
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function () {
            if (this._longClicked_) {
                this._longClicked_ = false;
                this.unschedule(this._longClicked);
            }
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_END, function () {
            this.clicked();
            if (this._longClicked_) {
                this._longClicked_ = false;
                this.unschedule(this._longClicked);
            }
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function () {
            if (this._longClicked_) {
                this._longClicked_ = false;
                this.unschedule(this._longClicked);
            }
        }, this);
    }
    _cellInit_(tableView) {
        this.tableView = tableView;
        if (!this._isCellInit_) {
            this._cellAddTouch_();
            this._isCellInit_ = true;
        }
    }
    _longClicked() {
        this._longClicked_ = false;
        this.node.emit(cc.Node.EventType.TOUCH_CANCEL);
        this.longClicked();
    }
    //可以重写的方法

    //需要重写的方法
    longClicked() {

    }
    //被点击时相应的方法
    clicked() {

    }

    //加载需要初始化数据时调用
    init(index, data, reload, group) {

    }
}
