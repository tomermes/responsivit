import React from 'react'
import PreLoad from './preload'
import MainFrame from './mainframe'

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
        if (this.state.currAppState === AppState.PreLoad){
            return <PreLoad app={this}/>
        } else { // if (this.state.currAppState === AppState.SiteLoaded){
            return <MainFrame />
        }
    }
}
