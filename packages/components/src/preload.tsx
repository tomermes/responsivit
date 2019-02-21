import React from 'react'

export default class PreLoad extends React.Component<{}, {} > {
    constructor(props: {}) {
        super(props)
        this.state = {}
    }

    public render() {
        return (
            <div>
                <input placeholder="url to take for a ride..."></input>
                <button>Go!</button>
            </div>
        )
    }
}