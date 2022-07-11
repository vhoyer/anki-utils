import axios from 'axios'
import cheerio from 'cheerio'
import path from 'path'
import fs from 'fs'

const hochanhKanjiUrl = kanji => encodeURI(`https://hochanh.github.io/rtk/${kanji}/index.html`)

const lastNext = 'https://hochanh.github.io/rtk/index.html'
const fisrtChar = '一'

const [
  startAtChar = fisrtChar,
  output = 'output.csv'
] = process.argv.slice(2);

const selector = {
  character: 'body > div.main > h1:nth-child(1)',
  keyword: 'body > div.main > h2:nth-child(4) > code',
  number: 'body > div.main > h2:nth-child(4) > code',
}

const kanjiCardCsvLine = (values) => {
  const s = key => values[key] || ''

  return [
    s('character'),
    s('keyword'),
    s('number'),
    'RTK\n',
  ].join('\t')
}

const KanjiCard = function($) {
  const values = {
    character: $(selector.character).text().trim(),
    keyword: $(selector.keyword).text().trim(),
    number: $(selector.number).attr('title').replace(/.*V6:\s/, '').trim(),
  }

  return {
    values,
    toString: () => kanjiCardCsvLine(values),
  }
}

function go(currentUrl) {
  const start = performance.now()
  console.log(currentUrl)

  return axios.get(currentUrl).then((response) => {
    const $ = cheerio.load(response.data);

    const kanji = new KanjiCard($)
    const nextUrl = encodeURI(
      path
        .join(currentUrl, '..', $('a:contains("→")').attr('href'))
        .replace('https:/', 'https://')
    )

    fs.appendFileSync(output, kanji.toString())

    console.log(`finished in: ${performance.now() - start}ms`)
    console.log(kanji.toString())

    return nextUrl
  })
}

fs.writeFileSync(output, '', console.error)

async function run() {
  let nextUrl = hochanhKanjiUrl(startAtChar)

  while(nextUrl !== lastNext) {
    nextUrl = await go(nextUrl)
  }
}

run()
