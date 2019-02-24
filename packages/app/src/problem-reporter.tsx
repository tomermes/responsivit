import React from 'react'
import './mainframe.css'

const circleFactor = 1.3
const headerOffset = 50
const textMinLeftOffset = 10


export interface Iproblem {
    screenSize: number,
    left: number,
    top: number,
    right: number,
    bottom: number,
    innerText?: string
}

export interface IProblemReporterProps {
    ref: React.RefObject<ProblemReporter>,
    iframeStyle: { left: string, width: string, pointerEvents: any },
}

export function pxStringToFloat(pxString: string) {
    if (pxString == null) {
        return null;
    }
    if (!isNaN(parseFloat(pxString))) {
        return parseFloat(pxString);
    } else if (pxString != null && pxString.indexOf('px') !== -1) {
        return parseFloat(pxString.split('px')[0])
    } else {
        return null;
    }
}

export interface IProblemReporterState {
    circleStyle: { left: string, width: string, top: string, height: string },
    problemTextStyle?: { left: string, width: string, top: string, color: string },
    problemText?: string,
}

export default class ProblemReporter extends React.Component<IProblemReporterProps, IProblemReporterState> {

    constructor(props: IProblemReporterProps) {
        super(props)
        this.state = {
            circleStyle: {
                left: '0px',
                width: '0px',
                top: '0px',
                height: '0px',
            },
        }
    }

    public scrollToProblem(currProblem: Iproblem) {
        const iframe = document.getElementsByTagName('iframe')[0] as HTMLIFrameElement
        if (iframe.contentWindow !== null) {
            iframe.contentWindow.scrollTo(0, currProblem.top - (iframe.contentWindow.innerHeight / 2))
        }
    }

    public async showProblemText(currProblem: Iproblem, shouldTextBeOnLeft: boolean) {
        const textTop = currProblem.top + ((currProblem.bottom - currProblem.top) / 2)
        const iframeLeft = pxStringToFloat(this.props.iframeStyle.left)
        if (iframeLeft === null) { return }
        const iframeWidth = pxStringToFloat(this.props.iframeStyle.width)
        if (iframeWidth === null) { return }
        const textLeft = (shouldTextBeOnLeft ? textMinLeftOffset : iframeLeft + iframeWidth + textMinLeftOffset)
        let textWidth
        if (shouldTextBeOnLeft) {
            textWidth = iframeLeft - 2 * textMinLeftOffset
        } else {
            textWidth = window.innerWidth - textLeft - textMinLeftOffset
        }

        const color = 'red' // TODO - adjust
        const problemText = 'You have a problem here'

        this.setState({
            problemTextStyle: {
                left: `${textLeft}px`,
                width: `${textWidth}px`,
                top: `${textTop}px`,
                color
            },
            problemText
        })
    }

    public async showCircle(currProblem: Iproblem) {
        let circleLeft = currProblem.left
        const iframeLeft = pxStringToFloat(this.props.iframeStyle.left)
        if (iframeLeft === null) { return }
        circleLeft += iframeLeft

        let circleWidth = (currProblem.right - currProblem.left)
        circleLeft -= circleWidth * ((circleFactor - 1) / 2)
        circleWidth *= circleFactor

        let circleTop = currProblem.top
        let circleHeight = (currProblem.bottom - currProblem.top)
        circleTop -= circleHeight * ((circleFactor - 1) / 2)
        circleTop += headerOffset
        circleHeight *= circleFactor

        await this.setState({
            circleStyle: {
                left: `${circleLeft}px`,
                width: `${circleWidth}px`,
                top: `${circleTop}px`,
                height: `${circleHeight}px`,
            }
        })

        const shouldTextBeOnLeft = (circleLeft < iframeLeft ? true : false)
        this.showProblemText(currProblem, shouldTextBeOnLeft)
    }

    public render() {
        return (
            <div>
                <div className="circle" style={this.state.circleStyle} />
                <p className="problem-text" style={this.state.problemTextStyle}>{this.state.problemText}</p>
            </div>
        )
    }
}
