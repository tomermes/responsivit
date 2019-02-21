import React from 'react'
import './preload.css'
import $ from 'jquery'

export default class PreLoad extends React.Component<any, {}> {
    constructor(props: any) {
        super(props)
        this.state = {}
        this.moveToMain = this.moveToMain.bind(this);
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
                    <input placeholder="url to take for a ride..." />
                    <a onClick={this.moveToMain}>Go!</a>
                </div>
            </div>
        )
    }

    public moveToMain() {
        this.props.app.MoveToMain();
    }
}
