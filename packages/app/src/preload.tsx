import React from 'react'
// import Background from '../assets/images/background.png'

export default class PreLoad extends React.Component<{}, {} > {
    constructor(props: {}) {
        super(props)
        this.state = {}
    }

    public render() {
        return (
            <div>
                <input placeholder="url to take for a ride..." />
                <button>Go!</button>
            </div>
        )
    }
}