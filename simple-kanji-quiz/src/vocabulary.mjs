import parse from 'csv-parse/lib/sync.js';
import stringify from 'csv-stringify/lib/sync.js';
import fs from 'fs'

function doIt(input, output) {
  console.log('Loading frequency database...')

  const freqFile = fs.readFileSync('./assets/_wordFreq.csv');

  const freqList = parse(freqFile, {
    delimiter: '\t',
    columns: true,
    cast: true,
    escape: false,
  })

  console.log('Done loading frequency data.')
  console.log()
  console.log('Loading vocabulary data...')

  const vocabFile = fs.readFileSync(input);

  const vocabList = parse(vocabFile, {
    delimiter: '|',
    columns: ['word', 'reading', 'translation', 'tags'],
  })

  console.log('Done loading vocabulary data.')
  console.log()
  console.log('Begin sorting...')

  const freqDict = freqList.reduce((dict, { Word, ...entry }) => {
    dict[Word] = entry;
    return dict
  }, {})

  const words404 = new Set()

  const findTwitterFreq = (word) => {
    const freqEntry = freqDict[word]

    if (freqEntry === undefined) {
      if (!words404.has(word)) {
        console.error(`[error]: "${word}" not found on frequency list!`)
        words404.add(word)
      }

      return 0
    }

    return freqEntry.TwitterFreq
      || freqEntry.TwitterFreqPm
      || freqEntry.TwitterCD
      || freqEntry.TwitterCDPc
      || freqEntry.BlogFreq
      || freqEntry.BlogFreqPm
      || freqEntry.BlogCD
      || freqEntry.BlogCDPc
      || freqEntry.NewsFreq
      || freqEntry.NewsFreqPm
      || freqEntry.NewsCD
      || freqEntry.NewsCDPc
  }

  console.log(findTwitterFreq('し'))

  const sortedVocab = [...vocabList].sort((a, b) => {
    return findTwitterFreq(b.word) - findTwitterFreq(a.word)
  })

  console.log(`Done sorting, file saved on "${output}"`)
  console.log()
  console.log('Saving file...')

  const stringified = stringify(sortedVocab, {
    delimiter: '|',
  })

  fs.writeFileSync(output, stringified)

  console.log(`Done, file saved on "${output}"`)
  console.log()
  console.log('This is the list of the not found words', words404.size)
}

[
  ['./assets/jlpt_5_v.csv', './assets/jlpt_5_v_sortby_freq.csv'],
  ['./assets/jlpt_4_v.csv', './assets/jlpt_4_v_sortby_freq.csv'],
  ['./assets/jlpt_3_v.csv', './assets/jlpt_3_v_sortby_freq.csv'],
  ['./assets/jlpt_2_v.csv', './assets/jlpt_2_v_sortby_freq.csv'],
  ['./assets/jlpt_1_v.csv', './assets/jlpt_1_v_sortby_freq.csv'],
].forEach(([input, output]) => doIt(input, output))
