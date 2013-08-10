'use strict';

# Require some modules
Cluster = require 'cluster2'
Express = require 'express'
UserProvider = require './modules/user-provider'
Settings = require './settings'


# Our fancy app
App = Express()

App.use Express.bodyParser()
App.use Express.cookieParser(Settings.cookie_secret_key)

# ...and routes
App.get '/user-info', (req, res) ->
  req_type = req.query.type
  username = req.query.username

  if req_type == 'short'
    UserProvider.getShortInfo username, (err, data) ->
      res.send data
  else
    UserProvider.getFullInfo username, (err, data) ->
      res.send data

# Run al of this stuff in a cluster
Cl = new Cluster
  host: Settings.address,
  port: Settings.port

Cl.listen (cb) ->
  cb App

