/* tslint:disable:no-console */

import express from 'express'
import compression from 'compression'
import cors from 'cors'

import { launch } from 'puppeteer'

const app = express()
const port = 3000

app.use(compression())
app.use(cors())

enum ProblemType {
  Error,
  Warning
}

interface IResponsiveProblem {
  text: string,
  pType: ProblemType
}

export interface IAnalyzedData {
  errors: IResponsiveProblem[],
  warnings: IResponsiveProblem[],
}

export interface Iproblem {
  screenSize: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
  problemText: string
}

app.get('/analyze', async (_req, res) => {
  const browser = await launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })

  const page = await browser.newPage()
  await page.goto(decodeURIComponent(_req.query.url))

  const body = await page.$('body')

  let errors: Iproblem[] = []
  const sizes = [1920, 1400, 1000, 780]
  for (const screenSize of sizes) {
    await page.setViewport({ width: screenSize, height: 980 })
    errors = errors.concat(await page.evaluate(evalBody => {

      const currErrors: Iproblem[] = []
      // error 1, find texts and headlines which are overflowing to right or to left
      const textsAndHeadlines = evalBody.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span')
      Array.from(textsAndHeadlines).map((text: any) => {
        if (text.children.length > 0 || text.innerText.length === 0) {
          return
        }

        if (text.tagName !== 'SPAN') {
          text.outerHTML = text.outerHTML.replace(text.innerText, `<span>${text.innerText}</span>`)
        }
        const textRect = text.getBoundingClientRect()
        const textSize = textRect.width * textRect.height

        const isRightOverflow = textSize > 0 && textRect.right > window.innerWidth && textRect.left < window.innerWidth
        const isLeftOverflow = textSize > 0 && textRect.left < 0 && textRect.right > 0

        const problemText = `Text '${text.innerText}' is overflowing the screen`
        if (isRightOverflow || isLeftOverflow) {
          currErrors.push({
            screenSize: window.innerWidth,
            left: textRect.left,
            top: textRect.top,
            right: textRect.right,
            bottom: textRect.bottom,
            problemText
          })
        }
      })
      return currErrors
    }, body))
  }

  if (body != null) {
    await body.dispose()
  }
  res.send(JSON.stringify(errors))

  await browser.close()

  res.end()
})

app.listen(port, (err: Error) => {
  if (err) {
    console.log(err)
  }

  console.log(`Listening on:`)
  console.log(`  http://localhost:${port}/ - client only rendering`)
  console.log(`  http://localhost:${port}/server - ssr with hydration`)
})
