const Promise = require("bluebird")
const fs      = Promise.promisifyAll(require("fs-extra"))

const CryptoJS = require("crypto-js")
const IPFS = require("ipfs-api")
const through = require("through2")

const AES  = CryptoJS.AES
const ipfs = IPFS("localhost", 5001)

const entryMap = {}

async function setEntry(masterPass, data) {
    const ciphertext = AES.encrypt(JSON.stringify(data), masterPass).toString()
    const res = await ipfs.add([new Buffer(ciphertext)])

    if(res.length) {
        entryMap[data.siteName] = res[0]
        console.log("Added entry to IPFS")
    } else {
        throw new Error("Couldn't add entry to IPFS")
    }
}

async function getEntry(masterPass, siteName) {
    const entry = entryMap[siteName]
    if(entry) {
        const stream = await ipfs.get(entry.hash)
        const buffer = await readObjStream(stream)
        return AES.decrypt(buffer, masterPass).toString(CryptoJS.enc.Utf8)
    } else {
        return null
    }
}

async function readEntries(file) {
    let json
    try {
        json = await fs.readFileAsync(file)
    } catch(ex) {
        json = "{}"
    }
    const conf = JSON.parse(json)
    Object.assign(entryMap, conf.entryMap)
}

async function saveEntries(file) {
    const normFile = path.resolve(file, "..")
    await fs.mkdirpAsync(normFile)
    return fs.writeFileAsync(normFile, JSON.stringify({entryMap: entryMap}))
}

function readObjStream(stream) {
    return new Promise((resolve, reject) => {
        stream.pipe(through.obj((file, enc, next) => {
            return file.content.pipe(through((content, enc, cb) => {
                resolve(content.toString("utf8"))
            }))
        }))
    })
}

module.exports = {
    getEntry,    setEntry,
    readEntries, saveEntries
}
