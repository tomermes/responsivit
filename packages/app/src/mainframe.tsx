import React from 'react'
import './mainframe.css'

export interface IMainFrameProps{
    url: string
}

export interface IMainFrameState{
    screenSize: number,
    iframeStyle: {left: string, width: string, pointerEvents: any},
    resizerStyle: {left: string},
}

const resizerOffset = 1

export default class MainFrame extends React.Component<IMainFrameProps, IMainFrameState > {
    private isResizing = false

    constructor(props: IMainFrameProps) {
        super(props)
        this.state = {
            screenSize: window.innerWidth,
            iframeStyle: {
                left: '0px',
                width: `${window.innerWidth}px`,
                pointerEvents: 'initial'
            },
            resizerStyle: {
                left: `${resizerOffset}px`
            }
        }
        this._startResizing = this._startResizing.bind(this)
        this.moveHandler = this.moveHandler.bind(this)
        this.releaseHandler = this.releaseHandler.bind(this)
    }

    public render() {
        return (
            <div className="mainframe" onMouseMove={this.moveHandler} onMouseUp={this.releaseHandler}>
                <input defaultValue={this.props.url} />
                <iframe src={this.props.url} frameBorder={0} style={this.state.iframeStyle}/>
                <div className="drag-resizer" onMouseDown={this._startResizing} style={this.state.resizerStyle}>
                    <div className="line" />
                    <div className="line" />
                </div>
            </div>
        )
    }

    public moveHandler(event: React.MouseEvent){
        if (this.isResizing){
            this.setState({
                screenSize: this.state.screenSize - event.movementX * 2
            })
            const currLeft = (window.innerWidth - this.state.screenSize) / 2
            this.setState({
                iframeStyle: {
                    left: `${currLeft}px`,
                    width: `${this.state.screenSize}px`,
                    pointerEvents: 'none',
                },
                resizerStyle: {
                    left: `${currLeft + resizerOffset}px`
                }
            })
        }
    }

    public releaseHandler(){
        if (this.isResizing){
            this._stopResizing()
        }
    }

    public _startResizing(){
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