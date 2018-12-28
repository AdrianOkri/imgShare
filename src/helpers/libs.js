const helpers = {};

helpers.randomNumer = () => {
    const possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let _randomNumber = 0;
    for(let i = 0; i < 6; i++) {
        _randomNumber += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return _randomNumber;
};

module.exports = helpers;