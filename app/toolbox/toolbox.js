'use strict';

module.exports = {
    toTitleCase: s => {
        return s.replace(/\w\S*/g, str => str.charAt(0).toUpperCase() + str.substr(1).toLowerCase());
    }
};