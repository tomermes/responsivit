import React from 'react'
import './mainframe.css'
import {
    FaHandPointLeft,
    FaDesktop,
    FaTabletAlt,
    FaMobileAlt,
    FaExclamationCircle,
    FaExclamationTriangle
} from 'react-icons/fa'

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

export interface IMainFrameState {
    screenSize: number,
    currLeft: number,
    iframeStyle: { left: string, width: string, pointerEvents: any },
    resizerStyle: { left: string },
    url: string,
    isEditingSizeInput: boolean
}

const resizerOffset = 1

export default class MainFrame extends React.Component<IMainFrameProps, IMainFrameState> {
    private isResizing = false
    private urlInputRef: React.RefObject<HTMLInputElement>
    private sizeInputRef: React.RefObject<HTMLInputElement>

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
            isEditingSizeInput: false
        }
        this._startResizing = this._startResizing.bind(this)
        this.dragResize = this.dragResize.bind(this)
        this.releaseHandler = this.releaseHandler.bind(this)
        this.handleKeyUrl = this.handleKeyUrl.bind(this)
        this.resetResizing = this.resetResizing.bind(this)
        this.onInputFocus = this.onInputFocus.bind(this)
        this.onInputBlur = this.onInputBlur.bind(this)
        this.changeScreenSizeByInput = this.changeScreenSizeByInput.bind(this)

        this.urlInputRef = React.createRef()
        this.sizeInputRef = React.createRef()
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

    public componentDidMount() {
        this.reloadUrl()
        if (this.sizeInputRef.current !== null) {
            this.sizeInputRef.current.value = window.innerWidth.toString()
        }
        const script = document.createElement('script')

        script.src = 'https://buttons.github.io/buttons.js'
        script.async = true
        script.defer = true

        document.body.appendChild(script)
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
        if (isNaN(newScreenSize)) {
            return
        }
        const isInputActiveElement = document.activeElement !== null && document.activeElement.tagName === 'INPUT'
        if (newScreenSize < minScreenSize) {
            if (!isInputActiveElement){
                newScreenSize = minScreenSize
            } else {
                return
            }
        }
        if (newScreenSize > window.innerWidth) {
            if (!isInputActiveElement){
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
                            <span>0</span>
                            <FaExclamationTriangle
                                className="error-icon"
                            />
                            <span>0</span>
                            <FaExclamationCircle
                                className="warning-icon"
                            />
                        </div>
                        <a
                            className="github-button"
                            href="https://github.com/tomermes/responsivit"
                            data-icon="octicon-star"
                            data-size="large"
                            data-show-count="false"
                            aria-label="Star tomermes/responsivit on GitHub"
                            style={{float: 'right', display: 'none'}}
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
}
