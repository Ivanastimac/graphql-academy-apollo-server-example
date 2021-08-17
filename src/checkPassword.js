// TODO

const bcrypt = require("bcrypt-nodejs");

const checkPassword = async (username, password, users) => {

    let result = false;

    users.forEach(user => {
        if (user.username === username) {
           /* const hash = bcrypt.hashSync(password);
            console.log(hash);
            console.log(user.password)
            if (bcrypt.compareSync(user.password, hash)) {
                result = true;
            } else {
                result = false;
            }*/

            if (user.password === password) {
                result = true;
            } else {
                result = false;
            }
        }
    });

    return result;
};

module.exports = checkPassword;
 