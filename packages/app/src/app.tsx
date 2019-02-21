import React from 'react'
import { Main } from '@sample-monorepo/components'

export interface IAppProps {
    text: string
}

export const App: React.FunctionComponent<IAppProps> = ({text}) => <Main text={text} />
