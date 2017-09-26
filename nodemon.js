{
  "restartable": "rs",
  "ignore": [
    ".git",
    "node_modules/**/node_modules"
  ],
  "verbose": true,
  "execMap": {
    "js": "node --harmony"
  },
  "watch": [
    "app.js", 
    "controllers/",
	"routes/",
    "views/"
  ],
  "ext": "js json"
}
