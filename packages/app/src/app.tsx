import React from 'react'
import PreLoad from './preload'

export enum AppState{
    PreLoad,
    SiteLoaded
}

export interface IState {
    currAppState: AppState
}

export class App extends React.Component<{}, IState > {
    constructor(props: {}) {
        super(props)
        this.state = {currAppState: AppState.PreLoad}
    }

    public render() {
        if (this.state.currAppState === AppState.PreLoad){
            return <PreLoad />
        } else { // if (this.state.currAppState === AppState.SiteLoaded){
            return <main>Main App</main>
        }
    }
}
