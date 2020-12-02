import parse from 'csv-parse/lib/sync.js'
import stringify from 'csv-stringify/lib/sync.js'
import fs from 'fs'

const stats = {
  nonEquivalent: 0,
  nonEquivalentN: {
    N1: 0,
    N2: 0,
    N3: 0,
    N4: 0,
    N5: 0,
  },
}

const gradesFile = fs.readFileSync('./assets/Grades/grade_all.csv')
const gradesDict = Object.fromEntries(
  parse(gradesFile, {
    delimiter: '|',
    columns: ['kanji', 'reading', 'meanings', 'tags'],
  })
  .map(i => [i.kanji, i])
)

const jlptFile = fs.readFileSync('./assets/JLPT_Kanji/jlpt_all.csv')
const jlptList = parse(jlptFile, {
  delimiter: '|',
  columns: ['kanji', 'reading', 'meanings', 'tags'],
})

const jlptOutput = jlptList.map(item => {
  const gradeEquivalent = gradesDict[item.kanji]

  if (!gradeEquivalent) {
    ++stats.nonEquivalent
    ++stats.nonEquivalentN[item.tags]

    console.warn(`[warn] No grade equivalent for ${item.kanji}`)

    return item
  }

  item.tags += ` ${gradeEquivalent.tags}`

  return item
})

fs.writeFileSync('./output.csv', stringify(jlptOutput, {
  delimiter: '|',
}))

console.log()
console.log('Report:')
console.log('Number of missing equivalent: ', stats.nonEquivalent)
console.log('Number of missing equivalent by level: ', stats.nonEquivalentN)
