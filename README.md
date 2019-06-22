# Messenger Bot

First NodeJS application, allows the user to run a bot Facebook Messenger account which will listen for commands and record messages in the chats the bot is included in. <br />

### Commands
* /help - posts the available commands to the chat.
* /number <number> - posts a random fact about the number to the chat.
* /chuck - posts a random Chuck Norris joke to the chat.
* /meme - posts a random meme from /r/dankmemes to the chat via an imgur link.
* /compliment <tag user> - sends a random compliment to the chat complimenting the tagged user.
* /leaderboard <messages|reactions> - posts a leaderboard depending on the given argument to the chat.

Built using the (unofficial) [Facebook Chat API](https://github.com/Schmavery/facebook-chat-api/) <br />
/number command uses [Numbers API](http://numbersapi.com/#42) <br />
/chuck command uses [Chuck Norris API](https://api.chucknorris.io/) <br />
/meme command uses [Random Puppy](https://github.com/dylang/random-puppy) and [/r/dankmemes](https://www.reddit.com/r/dankmemes) <br />
