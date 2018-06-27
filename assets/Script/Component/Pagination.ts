const { ccclass, property } = cc._decorator;

import clientDefine, { clientEventDefine } from '../clientDefine';

@ccclass
export default class Pagination extends cc.Component {

    @property(cc.Button)
    m_headPageBtn: cc.Button = null;
    @property(cc.Button)
    m_prePageBtn: cc.Button = null;
    @property(cc.Button)
    m_nextPageBtn: cc.Button = null;
    @property(cc.Button)
    m_lastPageBtn: cc.Button = null;

    @property(cc.Label)
    m_paginationLabel: cc.Label = null;

    _curPage: number = 0;
    _totalPages: number = 0;

    onLoad() {
        this._init();
    }

    setCurPage(idx) {
        this._curPage = idx;
        this._refreshView();
    }
    getCurPage() { return this._curPage; }

    setTotalPages(num) {
        this._totalPages = num;
        this._refreshView();
    }
    getTotalPages() { return this._totalPages; }

    onHeadPageClick() {
        this._curPage = 0;

        this._dispatchEvent();
        this._refreshView();
    }

    onPrePageClick() {
        this._curPage -= 1;

        this._dispatchEvent();
        this._refreshView();
    }

    onNextPageClick() {
        this._curPage += 1;

        this._dispatchEvent();
        this._refreshView();
    }

    onLastPageBtnClick() {
        this._curPage = this._totalPages - 1;

        this._dispatchEvent();
        this._refreshView();
    }

    _init() {
        this._curPage = 0;
        this._totalPages = 0;
    }

    _dispatchEvent() {
        let event = new cc.Event.EventCustom(clientEventDefine.CUSTOM_EVENT_PAGINATION_BUTTON_CLICKED, true);
        cc.systemEvent.dispatchEvent(event);
    }

    _refreshView() {
        this._updateButtonEnable();
        this._updatePagination();
    }

    _updateButtonEnable() {
        this.m_headPageBtn.interactable = this._curPage != 0;
        this.m_prePageBtn.interactable = this._curPage != 0;

        this.m_nextPageBtn.interactable = this._curPage != this._totalPages - 1;
        this.m_lastPageBtn.interactable = this._curPage != this._totalPages - 1;
    }

    _updatePagination() {
        this.m_paginationLabel.string = (this._curPage + 1).toString() + '/' + this._totalPages.toString();
    }
}
