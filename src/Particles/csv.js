import PQueue from '../../node_modules/p-queue/dist/index'

const isNumber = /^[0-9-.]+$/

const parseString = (str) => {
  let p = (s) => {
    if (s === '') return null
    if (s === 'true') return true
    if (s === 'false') return false
    if (isNumber.test(s)) return parseFloat(s)
    return s
  }
  if (str[0] === '[') {
    return str.slice(1, -1).split(' ').map(p)
  } else {
    return p(str)
  }
}

const serialiseString = (value) => {
  let s = (s) => {
    if (s == null) return ''
    if (typeof s === 'number') return s.toFixed(20)
    return s.toString()
  }
  if (value instanceof Array) {
    return '[' + value.map(s).join(' ') + ']'
  } else {
    return s(value)
  }
}

const set = (o, path, v) => {
  let r = o
  path = path.split('.')
  while (path.length) {
    let k = path.shift()
    if (!path.length) {
      o[k] = v
    } else {
      if (!o[k]) {
        o[k] = isNumber.test(path[0]) ? [] : {}
      }
      o = o[k]
    }
  }
  return r
}

const get = (v, path) => {
  path = path.split('.')
  for (let k of path) v = v?.[k]
  if (v == null) v = null
  return v
}

const serialise = (data, columns) => {
  let csv = ''
  csv += columns.join(',') + '\n'
  csv += data
    .map((value) => {
      return columns.map((k) => serialiseString(get(value, k))).join(',')
    })
    .join('\n')
  return csv
}

const parse = (csv) => {
  let lines = csv instanceof Array ? csv.slice() : csv.split('\n')
  let columns = lines.shift().split(',')
  return lines
    .filter((line) => line)
    .map((line) => {
      let data = {}
      line = line.split(',')
      for (let i in columns) {
        let k = columns[i]
        let v = parseString(line[i])
        set(data, k, v)
      }
      return data
    })
}

let upload = (options = {}) => {
  let {multiple = false} = options
  let queue = new PQueue({concurreny: 32})
  return new Promise((resolve, reject) => {
    let el = document.createElement('input')
    el.type = 'file'
    el.multiple = multiple
    el.addEventListener('change', () => {
      Promise.all(
        Array.from(el.files).map((file) =>
          queue.add(() => {
            return new Promise((resolve, reject) => {
              let reader = new FileReader()
              reader.onload = () => {
                resolve({filename: file.name, data: reader.result})
              }
              reader.onabort = (e) => reject(e)
              reader.onerror = (e) => reject(e)
              reader.readAsText(file)
            })
          })
        )
      )
        .then((files) => resolve(files))
        .catch((error) => reject(error))
    })
    el.click()
  })
}

window.stitchManySpreadsheetsTogether = () => {
  // let combines = []
  upload({multiple: true}).then((files) => {
    files.forEach(({filename, data}) => {
      console.log(filename)
      console.log(data)
      // let step = filename.match(/(0-9)+/)
      // data
    })
  })
}

let download = (text, filename, filetype = 'text/csv') => {
  const blob = new Blob([text], {type: filetype})
  const link = window.document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(link.href)
}

const csv = {serialise, parse, upload, download}

export default csv
export {serialise, parse, upload, download}
