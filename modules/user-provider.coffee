Phantom = require("phantom")
jsdom = require("jsdom")
Redis = require("redis").createClient()

ACCOUNTS_URL = "http://worldofwarplanes.ru/community/accounts/"
JQUERY_URL = "http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"

###
Return short user info.

@param {String} username
@param {Function} cb
@api private
###
exports.getShortInfo = (username, cb) ->
  _getUserInfo username, "short", (err, data) ->
    if err
      cb err, null
    else
      if data
        cb null, data
      else
        _grabShortUserInfo username, (err_, data_) ->
          if err_
            cb err_, null
          else
            i = 0

            while i < data_.length
              _saveUserInfo data_[i].name, "short", JSON.stringify(data_[i])
              i++
            cb null, data_

###
Return full user info.

@param {String} username
@param {Function} cb
@api private
###
exports.getFullInfo = (username, cb) ->
  _getUserInfo username, "full", (err, data) ->
    if err
      cb err, null
    else
      if data
        cb null, data
      else
        _grabFullUserInfo username, (err_, data_) ->
          if err_
            cb err_, null
          else
            _saveUserInfo username, "full", JSON.stringify(data_)
            cb null, data_

###
Get user info from DB.

@param {String} username
@param {String} type
###
_getUserInfo = (username, type, cb) ->
  Redis.hmget username, type, (err, data) ->
    if err
      cb err, null
    else
      cb null, JSON.parse(data[0])


###
Save user info into DB.

@param {String} username
@param {String} type
@param {String} info
###
_saveUserInfo = (username, type, info) ->
  Redis.hmset username, type, info, (err, data) ->
    console.log err  if err


###
Grag user's short info from site.

@param {String} username
###
_grabShortUserInfo = (username, cb) ->
  Phantom.create (phantom) ->
    phantom.createPage (page) ->
      page.open ACCOUNTS_URL, (status) ->
        if status is "fail"
          cb status
        else
          page.includeJs JQUERY_URL, ->
            page.evaluate ((username) ->
              url = "search?search=" + username + ""
              $.ajax
                async: false
                url: url

            ), ((res) ->
              data = JSON.parse(res.responseText).request_data.items
              if data.length isnt 0
                i = 0

                while i < data.length
                  data[i].account_url = "http://worldofwarplanes.ru" + data[i].account_url
                  i++
                cb null, data
                phantom.exit()
              else
                cb "error", res.status
                phantom.exit()
            ), username

###
Grab user's full info from site.

@param {String} username
###
_grabFullUserInfo = (username, cb) ->
  _grabShortUserInfo username, (err, data) ->
    if err
      cb err, null
    else
      jsdom.env ACCOUNTS_URL + data[0].id + "-" + username + "/", [JQUERY_URL], (err, window) ->
        getValue = (context, count) ->
          value = $(context[count]).text().replace(/\s+/g, "")
          value
        setValue = (table, names, type, which, callback) ->
          tableName = undefined
          counter = names.length
          if which is "prev"
            tableName = table.prev()
          else tableName = table.next()  if which is "next"
          i = 0

          while i < names.length
            user_data[type][names[i]] =
              name: $(tableName[i]).text()
              value: getValue(table, i)

            counter = counter - 1
            callback user_data  if counter is 0
            i++
        cb err, null  if err
        $ = window.$
        user_data =
          summary: {}
          battle_stats: {}
          planes_types: {}
          nations: {}

        table1 = $(".b-result").first().find(".td-value")
        table2 = $(".b-result").first().next().find(".td-value")
        table1_names = ["played", "won", "draw", "defeat", "survived", "average_exp", "max_exp"]
        table2_names = ["players_killed", "objects_destroyed", "helped_kill", "average_killed", "average_destroyed", "average_helped", "max_killed", "max_destroyed", "max_help"]
        diagTable1 = $(".t-table-dotted__diagram").first().find(".t-diagram_info")
        diagTable2 = $($(".t-table-dotted__diagram")[1]).find(".t-diagram_info")
        diagTable1_names = ["light_fighter", "heavy_fighter", "ground_attack", "navy_fighter"]
        diagTable2_names = ["ussr", "germany", "usa", "japan"]
        tables = [[table1, table1_names, "summary", "prev"], [table2, table2_names, "battle_stats", "prev"], [diagTable1, diagTable1_names, "planes_types", "next"], [diagTable2, diagTable2_names, "nations", "next"]]
        counter = tables.length
        i = 0

        while i < tables.length
          tablesSet = tables[i]
          setValue tablesSet[0], tablesSet[1], tablesSet[2], tablesSet[3], (data) ->
            counter = counter - 1
            cb null, data  if counter is 0

          i++
