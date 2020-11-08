import axios from 'axios'
import cheerio from 'cheerio'
import path from 'path'
import fs from 'fs'

const hochanhKanjiUrl = kanji => encodeURI(`https://hochanh.github.io/rtk/${kanji}/index.html`)

const lastNext = hochanhKanjiUrl('')
const fisrtChar = '一'

const [
  startAtChar = fisrtChar,
  output = 'output.csv'
] = process.argv.slice(2);

const selector = {
  character: 'body > div.main > h1:nth-child(1)',
  keyword: 'body > div.main > h2:nth-child(4) > code',
  number: 'body > div.main > h2:nth-child(4) > code',
  story: 'body > div.main > h2:contains("Heisig story:")',
  primitives: 'body > div.main > h2:contains("Primitive:")',
}

const kanjiCardCsvLine = (values) => {
  const s = key => values[key] || ''

  return `${s('character')}	${s('keyword')}	${s('number')}	${s('definition')}	${s('exampleWord')}	${s('story')}	${s('primitives')}	RTK\n`
}

const KanjiCard = function($) {
  const values = {
    character: $(selector.character).text().trim(),
    keyword: $(selector.keyword).text().trim(),
    number: $(selector.number).attr('title').replace(/.*V6:\s/, '').trim(),
    story: $(selector.story).nextUntil('h2').text(),
    primitives: $(selector.primitives).nextUntil('h2').text(),
  }

  return {
    values,
    toString: () => kanjiCardCsvLine(values),
  }
}

function go(currentUrl) {
  return axios.get(currentUrl).then((response) => {
    const $ = cheerio.load(response.data);

    const kanji = new KanjiCard($)
    const nextUrl = encodeURI(
      path
        .join(currentUrl, '..', $('a:contains("→")').attr('href'))
        .replace('https:/', 'https://')
    )

    fs.appendFileSync(output, kanji.toString())

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
