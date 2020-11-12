import parse from 'csv-parse/lib/sync.js';
import fs from 'fs'

console.log('Reading frequency database...')

const freqFile = fs.readFileSync('./assets/_wordFreq.csv');

const freqList = parse(freqFile, {
  delimiter: '\t',
  columns: true,
  cast: true,
  escape: false,
})

console.log(freqList[0])

console.log('Done')
