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

interface IAnalyzedData {
  numTexts: number
}

app.get('/analyze', async (_req, res) => {
  const browser = await launch()

  const page = await browser.newPage()
  await page.goto('https://www.wix.com/about/contact-us')

  const bodyHandle = await page.$('body')
  const html = await page.evaluate(body => {
      const data: IAnalyzedData = {
        numTexts: 0
      }
      data.numTexts = body.querySelectorAll('p').length
      return JSON.stringify(data)
  }, bodyHandle)
  if (bodyHandle != null) {
    await bodyHandle.dispose()
  }

  res.send(html)

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
