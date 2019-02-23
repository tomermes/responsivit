import React from 'react'
import './mainframe.css'
import { FaHandPointLeft } from 'react-icons/fa'

const minScreenSize = 320
const handAppearThreshold = 50

export interface IMainFrameProps {
    url: string
}

export interface IMainFrameState {
    screenSize: number,
    currLeft: number,
    iframeStyle: {left: string, width: string, pointerEvents: any},
    resizerStyle: {left: string},
    url: string
}

const resizerOffset = 1

export default class MainFrame extends React.Component<IMainFrameProps, IMainFrameState > {
    private isResizing = false
    private inputRef: React.RefObject<HTMLInputElement>

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
            url: this.props.url
        }
        this._startResizing = this._startResizing.bind(this)
        this.resize = this.resize.bind(this)
        this.releaseHandler = this.releaseHandler.bind(this)
        this.handleKey = this.handleKey.bind(this)
        this.inputRef = React.createRef()
        this.resetResizing = this.resetResizing.bind(this)
    }

    public reloadUrl() {
        const iframe = document.getElementsByTagName('iframe')[0] as HTMLIFrameElement;
        if (iframe !== null) {
            if (iframe.contentDocument !== null) {
                iframe.contentDocument.body.innerHTML = `
                    <iframe src="${this.state.url}"
                    frameborder="0"
                    style="width:100%;
                    height: 20000px"
                    scrolling="no"
                    />
                `
                iframe.contentDocument.body.style.margin = '0px'
            }
        }
    }

    public componentDidMount(){
        this.reloadUrl()
    }

    public async handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            if (this.inputRef.current !== null) {
                await this.setState({
                    url: this.inputRef.current.value
                })
                this.reloadUrl()
            }
        }
    }

    public render() {
        const handShouldAppear = (this.state.currLeft > handAppearThreshold)
        return (
            <div className="mainframe" onMouseMove={this.resize} onMouseUp={this.releaseHandler}>
                <input ref={this.inputRef} defaultValue={this.props.url} onKeyPress={this.handleKey} />
                <iframe src="about:blank" frameBorder={0} style={this.state.iframeStyle} />
                <div className="drag-resizer" onMouseDown={this._startResizing} style={this.state.resizerStyle}>
                    <div className="line" />
                    <div className="line" />
                </div>
                {handShouldAppear ? <FaHandPointLeft className="return-left" onClick={this.resetResizing}/> : null}
            </div>
        )
    }

    public async setScreenSize(newScreenSize: number){
        const currLeft = (window.innerWidth - newScreenSize) / 2
        await this.setState({
            screenSize: newScreenSize,
            currLeft,
            iframeStyle: {
                left: `${currLeft}px`,
                width: `${newScreenSize}px`,
                pointerEvents: 'none',
            },
            resizerStyle: {
                left: `${currLeft + resizerOffset}px`
            }
        })
    }

    public async resetResizing(){
        this.setScreenSize(window.innerWidth)
    }

    public async resize(event: React.MouseEvent) {
        if (this.isResizing) {
            const newScreenSize = this.state.screenSize - event.movementX * 2
            if (newScreenSize >= minScreenSize && newScreenSize < window.innerWidth){
                this.setScreenSize(newScreenSize)
            }
        }
    }

    public releaseHandler() {
        if (this.isResizing){
            this._stopResizing()
        }
    }

    public _startResizing() {
        this.isResizing = true
    }

    private _stopResizing(){
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
