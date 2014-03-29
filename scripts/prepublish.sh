cat $@ | node ./node_modules/dox-basic/bin/dox-basic -m -t "[![Build Status](https://travis-ci.org/x-component/$npm_package_name.png?v$npm_package_version)](https://travis-ci.org/x-component/$npm_package_name)" > README.md
node ./node_modules/projectz/bin/projectz compile
