import React from 'react'
import './preload.css'
import $ from 'jquery'

import {App} from './app'

export default class PreLoad extends React.Component<{app: App}, {}> {
    private inputRef: React.RefObject<HTMLInputElement>

    constructor(props: {app: App}) {
        super(props)
        this.state = {}
        this.moveToMain = this.moveToMain.bind(this);
        this.inputRef = React.createRef()
    }

    public componentDidMount() {
        $('.container input').focus();
    }

    public render() {
        return (
            <div className="preload">
                <div className="background" />
                <div className="logo">
                    <span>Responsiv</span>
                    <span>it</span>
                </div>
                <div className="container">
                    <input ref={this.inputRef} placeholder="url to take for a ride..." />
                    <a onClick={this.moveToMain}>Go!</a>
                </div>
            </div>
        )
    }

    public moveToMain() {
        if (this.inputRef.current !== null){
            this.props.app.MoveToMain(this.inputRef.current.value)
        }
    }
}
