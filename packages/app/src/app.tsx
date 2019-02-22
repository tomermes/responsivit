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
    currAppState: AppState,
    url: string
}

export class App extends React.Component<{}, IAppState > {
    constructor(props: {}) {
        super(props)
        this.state = {currAppState: AppState.PreLoad, url: ''}
    }

    public MoveToMain(inputText: string){
        if (!/^https?:\/\//i.test(inputText)) {
            inputText = 'http://' + inputText;
        }
        this.setState({
            currAppState: AppState.SiteLoaded,
            url: inputText
        })
    }

    public render() {
        const isPreload = this.state.currAppState === AppState.PreLoad
        return (
            <ReactCSSTransitionGroup
                component="div"
                transitionName="fade"
                transitionEnter={true}
                transitionLeave={true}
                transitionEnterTimeout={500}
                transitionLeaveTimeout={500}
            >
                <div className="app" key={this.state.currAppState}>
                    {isPreload ? <PreLoad app={this}/> : <MainFrame url={this.state.url} />}
                </div>
            </ReactCSSTransitionGroup>
        )
    }
}
