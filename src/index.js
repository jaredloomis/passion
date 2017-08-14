const cli = require("./cli")

/*
lib.setEntry("wasabi", {
    siteName: "google.com",
    username: "asdf",
    password: "1234"
})
.then(() => lib.getEntry("wasabi", "google.com"))
.then(entry => {
    console.log(JSON.stringify(entry))
})
.catch(err => console.log("ERROR" + JSON.stringify(err)))
*/

cli().then(console.log).catch(console.log)
