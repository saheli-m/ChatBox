const mongoose = require("mongoose");
const Chat = require("./models/chat.js");

main()
    .then((res) => (console.log("Connection successful!")))
    .catch((err) => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/fakeWhatsapp');
}

let allChats = [
    {
    from: "Bablu",
    to: "Bilu",
    msg: "Let's go to Ramrajatala!",
    created_on: new Date()
    },
    {
    from: "Vombol",
    to: "Ponchu",
    msg: "Let's go to eat some luchi with kosha mangso!",
    created_on: new Date()
    },
    {
    from: "Bachchu",
    to: "Bichchhu",
    msg: "Let's go to meet the others!",
    created_on: new Date()
    },
];

Chat.insertMany(allChats);