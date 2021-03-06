module.exports = {
    "env": {
        "node": true,
        "es6": true,
        "mocha": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "db": false
    },
    "rules": {
        "space-in-parens": ["error", "always", { "exceptions": ["{}"] }],
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
/*        "quotes": [
            "error",
            "double"
        ],*/
        "semi": [
            "error",
            "always"
        ]
    }
};
