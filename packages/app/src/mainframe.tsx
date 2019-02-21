import React from 'react'
import './mainframe.css'

export default class MainFrame extends React.Component<{}, {} > {
    constructor(props: {}) {
        super(props)
        this.state = {}
    }

    public render() {
        // <iframe src="http://www.wix.com/" />
        return (
            <div className="mainframe">
                <h1>Hello world</h1>
            </div>
        )
    }
}