import React from 'react'
import PreLoad from './preload'
import MainFrame from './mainframe'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import './app.css'

export enum AppState{
    PreLoad,
    SiteLoaded
}

export interface IAppState {
    currAppState: AppState
}

export class App extends React.Component<{}, IAppState > {
    constructor(props: {}) {
        super(props)
        this.state = {currAppState: AppState.PreLoad}
    }

    public MoveToMain(){
        this.setState({
            currAppState: AppState.SiteLoaded
        })
    }

    public render() {
        return (
            <ReactCSSTransitionGroup
                component="div"
                transitionName="fade"
                transitionEnter={true}
                transitionLeave={true}
                transitionEnterTimeout={500}
                transitionLeaveTimeout={500}
            >
                <div key={this.state.currAppState}>
                    {this.state.currAppState === AppState.PreLoad ? <PreLoad app={this}/> : <MainFrame />}
                </div>
            </ReactCSSTransitionGroup>
        )
    }
}
