const fs = require('fs')

const express = require('express')
const app = express()

if (!fs.existsSync('./storage.json')) { fs.writeFileSync('./storage.json', '{}') }

let storage = require('./storage.json')

app.get('/login', function (req, res) {
  let { key } = req.query
  if (!key) { res.status(400).send({error: 'No key provided'}); return }

  if (storage[key]) { res.status(200).send({permissions: storage[key]}); return }

  if (!storage['ips']) { storage['ips'] = [] }
  storage['ips'].push({ usedKey: key, ip: req.connection.remoteAddress })

  fs.writeFileSync('./storage.json', JSON.stringify(storage))

  res.status(400).send({error: 'Not a valid key'})
})

app.get('/register', function (req, res) {
  let { permission, auth } = req.query
  if (!permission || !auth) { res.status(400).send({error: 'Malformed request'}); return }
  if (auth !== '08yh7q3tv49wg546uyh') { res.status(401).send({error: 'Unauthorized'}); return }

  let key = `KEY-${Math.random().toString(36).substring(7)}-${Math.random().toString(36).substring(7)}-${Math.random().toString(36).substring(7)}-${Math.random().toString(36).substring(7)}${Math.random().toString(36).substring(7)}`

  storage[key] = permission
  fs.writeFileSync('./storage.json', JSON.stringify(storage))

  res.status(200).send({key, permission, createdAt: Date.now()})
})

app.get('/list', function (req, res) {
  let { auth } = req.query
  if (!auth) { res.status(400).send({error: 'Malformed request'}); return }
  if (auth !== '08yh7q3tv49wg546uyh') { res.status(401).send({error: 'Unauthorized'}); return }

  let keys = {}

  storage['ips'].forEach(ip => {
    if (keys[ip.usedKey] && keys[ip.usedKey].indexOf(ip.ip)) { keys[ip.usedKey].push(ip.ip); return }
    keys[ip.usedKey] = [ip.ip]
  })

  res.status(200).send({keys})
})
