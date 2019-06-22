exports.numberFact = function (arg, message, api, axios) {
  var url = "http://numbersapi.com/" + arg;
  axios.get(url).then(function(response) {
    api.sendMessage(response.data, message.threadID);
    console.log("SENT: " + response.data);
    console.log("Sent Number Fact!");
  }).catch(function(error) {
    console.log(error);
  });
}

exports.chuckFact = function (message, api, axios) {
  var url = "https://api.chucknorris.io/jokes/random";
  axios.get(url).then(function(response) {
    api.sendMessage(response.data.value, message.threadID);
    console.log("SENT: " + response.data.value);
    console.log("Sent Chuck Norris Joke!");
  }).catch(function(error) {
    console.log(error);
  });
}

exports.memeImage = function (message, api, axios, randomPuppy) {
  randomPuppy("dankmemes").then(url => {
        console.log(url);
        msg = {url: url}
        api.sendMessage(msg, message.threadID);
    })
}

exports.compliment = function(arg, message, api, compliments) {
  var random = Math.floor(Math.random() * compliments.length);
  var compliment = compliments[random].replace(/<name>/gi, Object.values(arg)[0]);
  var msg = {body: compliment, mentions: [{tag: Object.values(arg)[0], id: Object.keys(arg)[0]}]};
  api.sendMessage(msg, message.threadID);
}

exports.getDateTime = function () {
  var today = new Date();
  var date = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + ":" + today.getMilliseconds();
  return date + '-' + time;
}

exports.getEmojis = function (fs) {
  var content = fs.readFileSync('emoji-data-no-emojis.txt', 'utf8');
  return content.split("\n");
}

exports.getCompliments = function(fs) {
  var content = fs.readFileSync('compliments.txt', 'utf8');
  return content.split("\n");
}

exports.checkEmoji = function (text, emojis) {
  var emoji_count = 0;
  for (var i = 0; i < text.length; i++) {
    if (emojis.indexOf(text.codePointAt(i).toString(16).toUpperCase()) > -1) {
      emoji_count = emoji_count + 1;
    }
  }
  return emoji_count;
}

exports.getUsername = function (api, userid, chatid, info) {
  for (var i = 0; i < info.length; i++) {
    if (info[i].threadID == chatid) {
      for (var j = 0; j < info[i].participants.length; j++) {
        if (info[i].participants[j].userID == userid) {
          return info[i].participants[j].name;;
        }
      }
    }
  }
}

exports.storeData = function (event, emojis, fs, api, fns) {
  api.getThreadList(20, null, ['INBOX'], (err, info) => {
    var time = event.timestamp;
    switch (event.type) {
      case "message":
        var emoji_count = fns.checkEmoji(event.body, emojis);
        var chatID = event.threadID, messageID = event.messageID, senderID = event.senderID, text = event.body, numAttachments = event.attachments.length,
          attachmentTypes = [], taggedPeople = event.mentions, group = event.isGroup;
        for (var i = 0; i < numAttachments; i++) {
          if (event.attachments[i].type == "sticker") {
            numAttachments = numAttachments - 1;
            emoji_count = emoji_count + 1;
          } else {
            attachmentTypes.push(event.attachments[i].type);
          }
        }
        var senderUsername = fns.getUsername(api, senderID, chatID, info);
        text = text.replace(/"/gi, '').replace(/\r?\n|\r/g, '');
        var data = messageID + "," + senderID + "," + senderUsername + ",\"" + text + "\"," + emoji_count.toString(10) + "," + numAttachments.toString(10) + "," + JSON.stringify(attachmentTypes).replace(/"/gi, '') + "," + JSON.stringify(taggedPeople).replace(/"/gi, '') + "," + group.toString() + "," + time + "\n";
        fs.appendFile(__dirname + "/data/" + chatID + " - Messages.txt", data, function(err) {
          if (err) throw err;
        });
        break;
      case "message_reaction":
        var chatID = event.threadID, messageID = event.messageID, receiverID = event.senderID, senderID = event.userID, reaction = event.reaction;
        var senderUsername = fns.getUsername(api, senderID, chatID, info);
        var receiverUsername = fns.getUsername(api, receiverID, chatID, info);
        var data = messageID + "," + receiverID + "," + receiverUsername + "," + senderID + "," + senderUsername + "," + reaction + "," + time + "\n";
        fs.appendFile(__dirname + "/data/" + chatID + " - Reactions.txt", data, function(err) {
          if (err) throw err;
        });
        break;
    }
  });
}

exports.storeReacts = function (api, fns, fs, chatID, messageID, receiverID, senderID, reaction, time) {
  api.getThreadList(20, null, ['INBOX'], (err, info) => {
    var senderUsername = fns.getUsername(api, senderID, chatID, info);
    var receiverUsername = fns.getUsername(api, receiverID, chatID, info);
    var data = messageID + "," + receiverID + "," + receiverUsername + "," + senderID + "," + senderUsername + "," + reaction + "," + time + "\n";
    fs.appendFile(__dirname + "/data/" + chatID + " - Reactions.txt", data, function(err) {
      if (err) throw err;
    });
  });
}

exports.getPastMessages = function (api, threadID, emojis, fns, fs, timestamp) {
  api.getThreadHistory(threadID, 200, timestamp, (err, history) => {
    if(err) return console.error(err);
    if(timestamp != undefined) history.pop();

    if (history.length == 0) {
      console.log("DONE");
      return;
    }

    console.log("Doing.. " + history.length.toString(10));
    for (var i = 0; i < history.length; i++) {
      if (history[i].senderID != 100037995232874 && history[i].type == "message") {
        fns.storeData(history[i], emojis, fs, api, fns);

        if (history[i].messageReactions.length > 0) {
          for (var j = 0; j < history[i].messageReactions.length; j++) {
            var chatID = threadID, messageID = history[i].messageID;
            var receiverID = history[i].senderID, senderID = history[i].messageReactions[j].userID;
            var reaction = history[i].messageReactions[j].reaction, time = history[i].timestamp;
            fns.storeReacts(api, fns, fs, chatID, messageID, receiverID, senderID, reaction, time)
          }
        }
      }
    }

    timestamp = history[0].timestamp;

    var waitTill = new Date(new Date().getTime() + 1 * 1500);
    while(waitTill > new Date()){}

    fns.getPastMessages(api, threadID, emojis, fns, fs, timestamp);
  });
}
