heroku config:set $(sed -e 's/export//g' env | sed -e 's/"//g' | tr '\n' ' ')