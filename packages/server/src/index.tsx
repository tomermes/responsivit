/* tslint:disable:no-console */

import express from 'express'
import compression from 'compression'

import { launch } from 'puppeteer'

const app = express()
const port = 3000

app.use(compression())

app.get('/server', (_req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="Description" content="Monorepo example server-side renderer app">
    <title>Monorepo Example</title>
</head>
<body>
    <div id="SITE_MAIN" data-ssr>
      hello
    </div>
    <script type="text/javascript" src="main.js"></script>
</body>
</html>
`.trim())
  res.end()
})

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
  innerText?: string
}

app.get('/analyze', async (_req, res) => {
  const browser = await launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })

  const page = await browser.newPage()
  await page.goto(decodeURIComponent(_req.query.url))

  const body = await page.$('body')

  let errors: Iproblem[] = []
  const sizes = [1920, 1400, 1000]
  for (const screenSize of sizes) {
    await page.setViewport({ width: screenSize, height: 980 })
    errors = errors.concat(await page.evaluate((evalBody, evalSize) => {

      const currErrors: Iproblem[] = []
      // error 1, find texts and headlines which are overflowing to right or to left
      const textsAndHeadlines = evalBody.querySelectorAll('h1, h2, h3, h4, h5, h6, p')
      Array.from(textsAndHeadlines).map((text: any)  => {
        const textRect = text.getBoundingClientRect()
        const textSize = textRect.width * textRect.height

        const isRightOverflow = textSize > 0 && textRect.right > window.innerWidth && textRect.left < window.innerWidth
        const isLeftOverflow = textSize > 0 && textRect.left < 0 && textRect.right > 0
        if (isRightOverflow || isLeftOverflow) {
          currErrors.push({
            screenSize: evalSize,
            left: textRect.left,
            top: textRect.top,
            right: textRect.right,
            bottom: textRect.bottom,
            innerText: text.innerText
          })
        }
      })
      return currErrors
    }, body, screenSize))
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
