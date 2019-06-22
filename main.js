const fs = require("fs"), login = require("facebook-chat-api"), axios = require("axios"), fns = require("./functions.js"), randomPuppy = require('random-puppy');
const credentials = {appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))};

login(credentials, (err, api) => {
    if(err) return console.error(err);
    api.setOptions({listenEvents: true});
    var emojis = fns.getEmojis(fs);
    var compliments = fns.getCompliments(fs);
    api.listen((err, event) => {
      fns.storeData(event, emojis, fs, api, fns);
      switch (event.type) {
        case "message":
          if (event.body.startsWith('/')) {
            var args = event.body.split(" ");
            switch (args[0].slice(1)) {
              case "help":
                api.sendMessage('Help list: \n- "/number <number>" returns a random fact aout the number. \n- "/chuck" returns a random Chuck Norris joke. \n- "/meme\" returns a random meme. \n- "/compliment <tag user>" - returns a compliment for the tagged user. \n- "/leaderboard <messages|reactions>" returns the leaderboard for either argument.', event.threadID);
                break;
              case "number":
                if (args.length == 2 && !(isNaN(args[1]))) {
                  fns.numberFact(args[1], event, api, axios);
                } else {
                  api.sendMessage("Hmm, incorrect usage. '/number <number>'", event.threadID);
                }
                break;
              case "chuck":
                fns.chuckFact(event, api, axios);
                break;
              case "meme":
                fns.memeImage(event, api, axios, randomPuppy);
                break;
              case "compliment":
                var counter = 0, id;
                for (a in event.mentions) {
                  counter = counter + 1;
                }
                if (counter == 1) {
                  fns.compliment(event.mentions, event, api, compliments);
                } else {
                  api.sendMessage("Hmm, incorrect usage. '/compliment <tag user>'", event.threadID);
                }
                break;
              case "leaderboard":
                if (args.length == 2 && (args[1] == "messages" || args[1] == "reactions")) {
                  var spawn = require("child_process").spawn;
                  var process = spawn('python', ["./data.py", args[1], event.threadID]);
                  console.log(event.threadID)
                  process.stdout.on('data', function(data) {
                    output = data.toString().replace(/\(\)/gi, "")
                    api.sendMessage(output, event.threadID);
                  });
                }
            }
          }
          break;
        case "event":
          console.log(event);
          break;
      }
    });
});
