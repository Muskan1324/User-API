const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({          //schema iis kind of blue print
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
})

const User = mongoose.model("User", UserSchema);
module.exports = User;