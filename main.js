const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2), {})

class File {
  constructor () {
    function getUniqueStr (myRandomRange) {
      // マイクロ秒単位で乱数を変化
      let randomRange = 1000
      if (myRandomRange) randomRange = myRandomRange
      return new Date().getTime().toString(16) + Math.floor(randomRange * Math.random()).toString(16)
    }
    this.fileName = getUniqueStr()
  }

  writeFile = function (fileName) {
    const lines = []
    const reader = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })
    reader.on('line', function (line) {
      lines.push(line)
    })
    reader.on('close', function () {
      const memo = lines.join('\n')
      const jsonText = JSON.stringify({ Memo: memo })
      fs.writeFileSync(`./data/${fileName}.json`, jsonText)
    })
  }
}

class Files {
  constructor () {
    function oneLines () {
      const oneLines = []
      const files = fs.readdirSync('data/')

      for (const file of files) {
        const jsonObject = JSON.parse(fs.readFileSync(`./data/${file}`, 'utf8'))
        const oneLine = jsonObject.Memo.split('\n')[0]
        oneLines.push(oneLine)
      }
      return oneLines
    }
    this.oneLines = oneLines()
  }

  // 対話式にファイルを選ばせる
  async selectFiles (oneLinesfiles, message) {
    let result = 0
    // promptメソッドを通すと、choicesに入る配列filesが壊れるのでコピーしておく。
    const oneLinesFilesCopy = oneLinesfiles.slice()

    const Enquirer = require('enquirer')
    const question = {
      type: 'select',
      name: 'line',
      message: message,
      choices: oneLinesfiles
    }
    const answer = await Enquirer.prompt(question)
    const files = fs.readdirSync('data/')
    result = oneLinesFilesCopy.findIndex(item => item === answer.line)
    const selectedMemo = `./data/${files[result]}`
    return selectedMemo
  }
}

const files = new Files()
if (argv.l) {
  const memos = files.oneLines
  memos.forEach(element => console.log(element))
} else if (argv.r) {
  files.selectFiles(files.oneLines, 'Choose a note you want to see:')
    .then((data) => {
      const jsonObject2 = JSON.parse(fs.readFileSync(data, 'utf8'))
      console.log(jsonObject2.Memo)
    })
} else if (argv.d) {
  files.selectFiles(files.oneLines, 'Choose a note you want to delete:')
    .then((data) => {
      return fs.unlink(data, function (err) {
        if (err) {
          throw (err)
        }
      })
    })
} else if (Object.keys(argv).length === 1) {
  const file = new File()
  file.writeFile(file.fileName)
}
