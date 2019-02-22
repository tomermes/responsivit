import React from 'react'
import './mainframe.css'

export interface IMainFrameProps{
    url: string
}

export default class MainFrame extends React.Component<IMainFrameProps, {} > {
    constructor(props: IMainFrameProps) {
        super(props)
        this.state = {}
    }

    public render() {
        // <iframe src="http://www.wix.com/" />
        return (
            <div className="mainframe">
                <input defaultValue={this.props.url} />
                <iframe src={this.props.url} frameBorder={0} />
            </div>
        )
    }
}