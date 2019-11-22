const TelegramBot = require('node-telegram-bot-api');
const Commands = require('../model/commands');
const Users = require('../model/users');
const usersDebts = require('../model/debts');
const mongoose = require('mongoose');
const mongo = require('../database/mongo')

//Init bot 

process.env["NTBA_FIX_319"] = 1
const token = '1064689156:AAGB_v7wMSYx-UTtVrHo_lMDl1r7e0nMa1w';
const ipAdress = '209.90.63.108';
const port = '80';
module.exports.bot = new TelegramBot(token, {
  polling: true,
  request: {
    proxy: `http://${ipAdress}:${port}`
    }
});

function commandExecution (msg) {
  const chatId = msg.chat.id;
  mongo.getCollection('commands').then(commands => {
    if (!commands) return
    command = commands.find(command => command.command_name == msg.text);
    if (!command) return;
    if (command.command_name == '/help') return sendHelpMessage(chatId, msg, command.description);
    if (command.command_name == '/getuserslist') return getUserList(chatId);
    })
};

//help - send help messages

function sendHelpMessage(chatId, msg, description) {
  helpMessage = `${msg.from.first_name} ${msg.from.last_name}. ${description}`;
  module.exports.bot.sendMessage(chatId, helpMessage);
}

//User - add, get and delete users

function addNewUser(msg, match) {
  let user = new Users({
    _id : new mongoose.Types.ObjectId,
    firstName : match[1],
    lastName : match[2]
  });
  mongo.addItemInCollection(user);
  module.exports.bot.sendMessage(msg.chat.id, `${msg.from.first_name} ${msg.from.last_name} , user ${user.firstName} ${user.lastName} was added.`);

}

function getUserList(chatId) {
  mongo.getCollection('users').then(users => {
    let userListMessage;
    if (users.length == 0) {
        userListMessage = 'No user has been added at the moment';
        module.exports.bot.sendMessage(chatId, userListMessage);
        return;
    }
    userListMessage = 'Users list : \n';
    users.forEach(user => {
        userListMessage += `${user.firstName} ${user.lastName} \n`;
    })
    module.exports.bot.sendMessage(chatId, userListMessage);
  });
}

function deleteUser(collectionName, match, msg) {
    mongo.deleteItemFromCollection(collectionName, match);
    module.exports.bot.sendMessage(msg.chat.id, `${msg.from.first_name} ${msg.from.last_name} , user ${user.firstName} ${user.lastName} was deleted.`);
}

//Debts - add, delete, get, update debts

function addDebts(msg, match) {
    let currentUser = {
        firstName : match[1] ,
        lastName : match[2],
        debts : match[3]
      };
    mongo.getCollection('users').then(users => {
        usersConfig = [];
        users.forEach(user => {
            if (user.firstName == currentUser.firstName && user.lastName == currentUser.lastName) return;
            usersConfig.push([{ text: `${user.firstName} ${user.lastName}`, callback_data: `${currentUser.firstName} ${currentUser.lastName} ${currentUser.debts} ${user.firstName} ${user.lastName}`}]);
        })
        options = {
            reply_markup: JSON.stringify({
                inline_keyboard: usersConfig
            })
        }
        module.exports.bot.sendMessage(msg.chat.id, `Who does ${currentUser.firstName} ${currentUser.lastName} owe money to ?`, options).then(() => {
            module.exports.bot.sendMessage(msg.chat.id, `${msg.from.first_name} ${msg.from.last_name} debts for ${currentUser.firstName} ${currentUser.lastName} was added.`);
        }).catch(() => {
            module.exports.bot.sendMessage(msg.chat.id, `Error!!!.${msg.from.first_name} ${msg.from.last_name} debts for ${currentUser.firstName} ${currentUser.lastName} wasn't added.`);
        });;
    })
}

function getDebts(collectionName, msg, match) {
    const params = {
        debtorFirstName : match[1],
        debtorLastName : match[2]
    }
    let debtsMessage = `${match[1]}'s debts \n`;
    mongo.getCollectionWithParams(collectionName, params).then(debts => {
        console.log(debts);
        let totalDebts = 0;
        debts.forEach(debt => {
            debtsMessage += `${debt.debtorFirstName} owes ${debt.lenderFirstName} ${debt.lenderFirstName} ${debt.debts} \n`
            totalDebts += debt.debts;
        });
        debtsMessage += `Total debts : ${totalDebts}`;
        module.exports.bot.sendMessage(msg.chat.id, debtsMessage);
    })
}

//Commands handler

//User
module.exports.bot.onText(/adduser (.+) (.+)/,(msg, match) => {
    addNewUser(msg, match);
});

module.exports.bot.onText(/deleteuser (.+) (.+)/,(msg, match) => {
    deleteUser('users', match, msg);
});

//Debts
module.exports.bot.onText(/adddebts (.+) (.+) (.+)/,(msg, match) => {
    addDebts(msg,match)
});

module.exports.bot.onText(/checkdebts (.+) (.+)/,(msg, match) => {
    getDebts('usersdebts',msg, match)
});

module.exports.bot.on('callback_query', callbackQuery => {
    array_data = callbackQuery.data.split(/\s/);
    debts = new usersDebts({
        _id : new mongoose.Types.ObjectId,
        debtorFirstName : array_data[0],
        debtorLastName : array_data[1],
        debts : array_data[2],
        lenderFirstName : array_data[3],
        lenderLastName : array_data[4]
      });
    mongo.addItemInCollection(debts);
});

module.exports.bot.on('message', (msg) => {
  msg = commandExecution(msg);
});