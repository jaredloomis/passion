const Promise = require("bluebird")
const path    = require("path")
const os      = require("os")

const yargs = require("yargs")
const prompt = Promise.promisifyAll(require("prompt"))

const lib  = require("./lib")

const entryFile = path.join(os.homedir(), ".config", "passion", "passion.json")

async function requestMaster() {
    const text = "Master Password"
    prompt.start()
    return (await prompt.getAsync([text]))[text]
}

module.exports = async () => {
    const argv        = yargs
        .alias("u", "username")
        .alias("p", "password")
        .alias("s", "siteName")
        .argv

    try {
        await lib.readEntries(entryFile)
    } catch(ex) {
        console.log("Couldn't read entries from file")
        console.log(ex)
    }

    const baseCommand = argv._[0]
    if(baseCommand === "add") {
        if(argv.username && argv.password && argv.siteName) {
            const masterPass = await requestMaster()
            await lib.setEntry(masterPass, argv)
            return "Successfully set entry."
        } else {
            return "Required options for 'add' command: " +
                "username, password, siteName"
        }
    } else if(baseCommand === "get") {
        const site = argv._[1]
        if(site) {
            const masterPass = await requestMaster()
            return JSON.stringify(await lib.getEntry(masterPass, site), null, 2)
        } else {
            return "'get' command takes one argument: siteName"
        }
    } else {
        return "Didn't recognize command"
    }

    await lib.saveEntries(entryFile)
}
