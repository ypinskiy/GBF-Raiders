# GBF-Raiders
A Raid Finder For The Game [Grand Blue Fantasy](http://game.granbluefantasy.jp/)

Hosted at [GBFRaiders.com](http://www.gbfraiders.com/)

Click here to make a new Heroku dyno with this site pre-installed! [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

![Example of Website](https://github.com/ypinskiy/GBF-Raiders/raw/master/static/assets/misc/site-example.png)

# Installing Dependencies
After cloning or downloading the source code, make sure that you have Node.js and NPM installed and setup in your PATH. All the other dependencies will be installed when the command `npm install` is run in the root directory of the site. Semantic UI is set to automatically install itself during this process. The next step would be to setup the environment variables as shown in the next section. The site's server can then be started with `node index.js` or `npm start`.

# Setting Up The Environment Variables
Setting up the environment variables is necessary for using the Twitter API.

![Twitter App Page](https://github.com/ypinskiy/GBF-Raiders/raw/master/static/assets/misc/twitter-app-page.png)

1. Go to the [Twitter app page](https://apps.twitter.com/) and create a new app. The application details don't matter too much.

![Twitter App Details Page](https://github.com/ypinskiy/GBF-Raiders/raw/master/static/assets/misc/twitter-app-create-details.png)

2. Make sure you app has read and write permissions in the permissions tab.

![Twitter App Key Create Page](https://github.com/ypinskiy/GBF-Raiders/raw/master/static/assets/misc/twitter-app-key-create.png)
![Twitter App Access Create Page](https://github.com/ypinskiy/GBF-Raiders/raw/master/static/assets/misc/twitter-app-access-token-create.png)
3. The Keys and Access Tokens tab already contains two of the four keys you need: the Consumer Key and the Consumer Secret. To create the other two, click on the "Create my access token" button. Now, the page will refresh and the other two keys will appear: the Access Token and the Access Token Secret.
4. These 4 keys will need to be setup in your environment. See below on how to do so in Heroku.

# Using The Environment Variables in Heroku
![Twitter App Access Create Page](https://github.com/ypinskiy/GBF-Raiders/raw/master/static/assets/misc/heroku-show-config.png)
1. Go to your app's settings page. There will be a "Reveal Config Vars" button.
2. Enter all 4 keys and their corresponding values: `consumer_key`, `consumer_secret`, `access_token_key`, `access_token_secret`.
3. Restart your dynos.
4. App should work now!
