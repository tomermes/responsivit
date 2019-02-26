import React from 'react'
import './mainframe.css'
import ProblemReporter, { Iproblem } from './problem-reporter'
import axios from 'axios'


import {
    FaHandPointLeft,
    FaDesktop,
    FaTabletAlt,
    FaMobileAlt,
    FaExclamationCircle,
    FaExclamationTriangle
} from 'react-icons/fa'

//'http://localhost:3000/analyze/?url='
const prefixAxiosUrl = 'https://reponsivit-server.herokuapp.com/?url='

const minScreenSize = 320
const handAppearThreshold = 50

const desktopSize = 1920
const desktopMinSize = 1200

const tabletSize = 980
const tabletMinSize = 640

const mobileSize = 475

export interface IMainFrameProps {
    url: string
}

export function pxStringToFloat(pxString: string) {
    if (pxString == null) {
        return null;
    }
    if (!isNaN(parseFloat(pxString))) {
        return parseFloat(pxString);
    } else if (pxString != null && pxString.indexOf('px') !== -1) {
        return parseFloat(pxString.split('px')[0])
    } else {
        return null;
    }
}

export interface IMainFrameState {
    screenSize: number,
    currLeft: number,
    iframeStyle: { left: string, width: string, pointerEvents: any },
    problemTextStyle?: { left: string, width: string, top: string, color: string },
    problemText?: string,
    resizerStyle: { left: string },
    url: string,
    isEditingSizeInput: boolean,
    errorsMenuOpen: boolean,
    warningsMenuOpen: boolean,
    errors: Iproblem[]
}

const resizerOffset = 1

export default class MainFrame extends React.Component<IMainFrameProps, IMainFrameState> {
    private isResizing = false
    private urlInputRef: React.RefObject<HTMLInputElement>
    private sizeInputRef: React.RefObject<HTMLInputElement>
    private reporterRef: React.RefObject<ProblemReporter>

    constructor(props: IMainFrameProps) {
        super(props)
        this.state = {
            screenSize: window.innerWidth,
            currLeft: 0,
            iframeStyle: {
                left: '0px',
                width: `${window.innerWidth}px`,
                pointerEvents: 'initial'
            },
            resizerStyle: {
                left: `${resizerOffset}px`
            },
            url: this.props.url,
            isEditingSizeInput: false,
            errorsMenuOpen: false,
            warningsMenuOpen: false,
            errors: []
        }
        this._startResizing = this._startResizing.bind(this)
        this.dragResize = this.dragResize.bind(this)
        this.releaseHandler = this.releaseHandler.bind(this)
        this.handleKeyUrl = this.handleKeyUrl.bind(this)
        this.resetResizing = this.resetResizing.bind(this)
        this.onInputFocus = this.onInputFocus.bind(this)
        this.onInputBlur = this.onInputBlur.bind(this)
        this.changeScreenSizeByInput = this.changeScreenSizeByInput.bind(this)

        this._showErrorsList = this._showErrorsList.bind(this)
        this._hideErrorsList = this._hideErrorsList.bind(this)

        this.urlInputRef = React.createRef()
        this.sizeInputRef = React.createRef()
        this.reporterRef = React.createRef()
    }

    public reloadUrl() {
        const iframe = document.getElementsByTagName('iframe')[0] as HTMLIFrameElement
        if (iframe !== null) {
            if (iframe.contentDocument !== null) {
                iframe.contentDocument.body.innerHTML = `
                    <iframe src="${this.state.url}"
                    frameborder="0"
                    style="width:100%;
                    height: 10000px"
                    scrolling="no"
                    />
                `
                iframe.contentDocument.body.style.margin = '0px'
            }
        }
    }

    public async componentDidMount() {
        this.reloadUrl()
        if (this.sizeInputRef.current !== null) {
            this.sizeInputRef.current.value = window.innerWidth.toString()
        }
        const script = document.createElement('script')

        script.src = 'https://buttons.github.io/buttons.js'
        script.async = true
        script.defer = true

        document.body.appendChild(script)


        await this.setState({
            errors : (await axios.get(`${prefixAxiosUrl}${encodeURI(this.state.url)}`)).data
        })

        this.state.errors.map(error => {error.isNew = true})

        const iframe = document.getElementsByTagName('iframe')[0] as HTMLIFrameElement
        if (iframe.contentDocument === null){ return}
        iframe.contentDocument.addEventListener('scroll', async () => {
            await this._hideProblem()
        }, false)
    }

    public async showProblem(currProblem: Iproblem) {
        currProblem.isNew = false
        await this._hideErrorsList()
        await this.setScreenSize(currProblem.screenSize, false)
        if (this.reporterRef.current != null) {
            await this.reporterRef.current.scrollToProblem(currProblem)
            setTimeout(() => {
                if (this.reporterRef.current != null){
                    this.reporterRef.current.showCircle(currProblem)
                }
            }, 0)
        }
    }

    public async handleKeyUrl(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            if (this.urlInputRef.current !== null) {
                await this.setState({
                    url: this.urlInputRef.current.value
                })
                this.reloadUrl()
            }
        }
    }

    public async setScreenSize(newScreenSize: number, disablePointerEvents: boolean) {
        if (this.reporterRef.current !== null) {
            await this.reporterRef.current.hideCircle()
            await this.reporterRef.current.hideProblemText()
        }

        if (isNaN(newScreenSize)) {
            return
        }
        const isInputActiveElement = document.activeElement !== null && document.activeElement.tagName === 'INPUT'
        if (newScreenSize < minScreenSize) {
            if (!isInputActiveElement) {
                newScreenSize = minScreenSize
            } else {
                return
            }
        }
        if (newScreenSize > window.innerWidth) {
            if (!isInputActiveElement) {
                newScreenSize = window.innerWidth
            } else {
                return
            }
        }
        const currLeft = (window.innerWidth - newScreenSize) / 2
        await this.setState({
            screenSize: newScreenSize,
            currLeft,
            iframeStyle: {
                left: `${currLeft}px`,
                width: `${newScreenSize}px`,
                pointerEvents: (disablePointerEvents ? 'none' : 'initial'),
            },
            resizerStyle: {
                left: `${currLeft + resizerOffset}px`
            }
        })
        if (this.sizeInputRef.current !== null) {
            this.sizeInputRef.current.value = newScreenSize.toString()
        }
    }

    public async resetResizing() {
        this.setScreenSize(window.innerWidth, false)
    }

    public async resize(event: React.MouseEvent, disablePointerEvents: boolean = false) {
        const newScreenSize = this.state.screenSize - event.movementX * 2
        this.setScreenSize(newScreenSize, disablePointerEvents)
    }

    public async dragResize(event: React.MouseEvent) {
        if (this.isResizing) {
            this.resize(event, true)
        }
    }

    public releaseHandler() {
        if (this.isResizing) {
            this._stopResizing()
        }
    }

    public onInputFocus() {
        this.setState({
            isEditingSizeInput: true
        })
    }

    public onInputBlur() {
        this.setState({
            isEditingSizeInput: false
        })
    }

    public changeScreenSizeByInput() {
        if (this.sizeInputRef.current !== null) {
            this.setScreenSize(parseInt(this.sizeInputRef.current.value, 10), false)
        }
    }

    public render() {
        const handShouldAppear = (this.state.currLeft > handAppearThreshold)
        const screenSizeInput = (
            <input
                ref={this.sizeInputRef}
                onFocus={this.onInputFocus}
                onBlur={this.onInputBlur}
                onChange={this.changeScreenSizeByInput}
                size={4}
                maxLength={4}
                className="screen-size"
            />
        )

        const setDesktopSize = () => this.setScreenSize(Math.min(window.innerWidth, desktopSize), false)
        const setTabletSize = () => this.setScreenSize(tabletSize, false)
        const setMobileSize = () => this.setScreenSize(mobileSize, false)

        const isBetween = (num: number, min: number, max: number) => num >= min && num <= max
        const isTablet = isBetween(this.state.screenSize, tabletMinSize, desktopMinSize - 1)


        const dataMapFunc = (problem: Iproblem) => {
            const isProblemTablet = isBetween(problem.screenSize, tabletMinSize, desktopMinSize - 1)
            const screenIcon = (
                <div>
                    <div className={problem.screenSize > desktopMinSize ? '' : 'hide'}>
                        <FaDesktop
                            style={{ fontSize: '30px' }}
                        />
                    </div>
                    <div className={isProblemTablet ? '' : 'hide'}>
                        <FaTabletAlt
                            style={{ fontSize: '30px' }}
                        />
                    </div>
                    <div className={problem.screenSize < tabletMinSize ? '' : 'hide'}>
                        <FaMobileAlt
                            style={{ fontSize: '30px' }}
                        />
                    </div>
                </div>
            )
            const problemClick = () => {this.showProblem(problem)}
            return (
                <div className={`problem-li ${problem.isNew ? 'new' : ''}`} onClick={problemClick}>
                    <div className="screen-type">
                        {screenIcon}
                        {problem.screenSize}
                    </div>
                    <span className="problem-li-desc">{problem.problemText}</span>
                </div>
            )
        }

        const errorsList = (
            <div className="problems-list">
                {this.state.errors.map(dataMapFunc)}
            </div>
        )

        return (
            <div className="mainframe" onMouseMove={this.dragResize} onMouseUp={this.releaseHandler}>
                <header>
                    <input
                        className="url-input"
                        ref={this.urlInputRef}
                        defaultValue={this.props.url}
                        onKeyPress={this.handleKeyUrl}
                    />
                    <div className="mid-panel">
                        {screenSizeInput}
                        <div className="common-screens">
                            <div className={this.state.screenSize > desktopMinSize ? 'selected' : ''}>
                                <FaDesktop
                                    className="screen-button"
                                    onClick={setDesktopSize}
                                    style={{ fontSize: '30px' }}
                                />
                            </div>
                            <div className={isTablet ? 'selected' : ''}>
                                <FaTabletAlt
                                    className="screen-button"
                                    onClick={setTabletSize}
                                />
                            </div>
                            <div className={this.state.screenSize < tabletMinSize ? 'selected' : ''}>
                                <FaMobileAlt
                                    className="screen-button"
                                    onClick={setMobileSize}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="right-panel">
                        <div className="problems">
                            <div
                                className="errors"
                                onMouseEnter={this._showErrorsList}
                                onMouseLeave={this._hideErrorsList}
                            >
                                <span>{this.state.errors.length}</span>
                                <FaExclamationTriangle
                                    className="error-icon"
                                />
                                {this.state.errorsMenuOpen ? errorsList : null}
                            </div>
                            <div className="warnings">
                                <span>-</span>
                                <FaExclamationCircle
                                    className="warning-icon"
                                />
                                {this.state.warningsMenuOpen ? errorsList : null}
                            </div>
                        </div>
                        <a
                            className="github-button"
                            href="https://github.com/tomermes/responsivit"
                            data-icon="octicon-star"
                            data-size="large"
                            data-show-count="false"
                            aria-label="Star tomermes/responsivit on GitHub"
                            style={{ float: 'right', display: 'none' }}
                        >
                            Star
                        </a>
                    </div>
                </header>
                <iframe src="about:blank" frameBorder={0} style={this.state.iframeStyle} />
                <div className="drag-resizer" onMouseDown={this._startResizing} style={this.state.resizerStyle}>
                    <div className="line" />
                    <div className="line" />
                </div>
                <ProblemReporter
                    ref={this.reporterRef}
                    iframeStyle={this.state.iframeStyle}
                />
                {handShouldAppear ? <FaHandPointLeft className="return-left" onClick={this.resetResizing} /> : null}
            </div>
        )
    }

    private _startResizing() {
        this.isResizing = true
    }

    private _stopResizing() {
        this.isResizing = false
        this.setState({
            iframeStyle: {
                left: this.state.iframeStyle.left,
                width: this.state.iframeStyle.width,
                pointerEvents: 'initial',
            }
        })
    }

    private async _showErrorsList() {
        await this._hideProblem()
        this.setState({
            errorsMenuOpen: true
        })
    }

    private async _hideProblem(){
        if (this.reporterRef.current !== null) {
            await this.reporterRef.current.hideCircle()
            await this.reporterRef.current.hideProblemText()
        }
    }

    private _hideErrorsList() {
        this.setState({
            errorsMenuOpen: false
        })
    }
}
