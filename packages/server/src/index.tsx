/* tslint:disable:no-console */

import express from 'express'
import compression from 'compression'

import {launch} from 'puppeteer'

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

enum ProblemType{
  Error,
  Warning
}

interface IResponsiveProblem{
  text: string,
  pType: ProblemType
}

export interface IAnalyzedData {
  errors: IResponsiveProblem[],
  warnings: IResponsiveProblem[],
}

app.get('/analyze', async (_req, res) => {
  const browser = await launch()

  const page = await browser.newPage()
  await page.goto('https://www.wix.com/about/contact-us')

  const body = await page.$('body')

  let totalResponse = ''
  const sizes = [1920, 1400, 1000]
  for (const size of sizes){
    await page.setViewport({width: size, height: 980})
    totalResponse += await page.evaluate((evalBody, evalSize) => {
        const errors = []
        const getBoundingClientRect = (element: any) => {
          const {top, right, bottom, left, width, height, x, y} = element.getBoundingClientRect();
          return {top, right, bottom, left, width, height, x, y}
        }
        errors.push(`size=${evalSize}: ${JSON.stringify(getBoundingClientRect(evalBody.querySelectorAll('h1')[0]))}\n`)
        return JSON.stringify({errors})
    }, body, size)
  }

  if (body != null) {
    await body.dispose()
  }
  res.send(totalResponse)

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
