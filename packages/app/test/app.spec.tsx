import React from 'react'
import { App } from '@responsivit/app'
import { renderToString } from 'react-dom/server'
import { expect } from 'chai'

describe('<App />', () => {
    it('renders without throwing on the server', () => {
        expect(() => renderToString(<App text="" />)).to.not.throw()
    })

    it('renders provided text', () => {
        expect(renderToString(<App text="It works" />)).to.contain('It works')
    })

})
