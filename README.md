# GBF-Raiders
![Site Logo](https://github.com/ypinskiy/GBF-Raiders/raw/master/static/assets/misc/GBFRaidersWeb.png)

A Raid Finder For The Game [Granblue Fantasy](http://game.granbluefantasy.jp/)

Hosted at [GBFRaiders.com](https://www.gbfraiders.com/)

A special thanks to [u/Bloodhram](https://www.reddit.com/user/Bloodhram) for creating the icons for the site and extension!

![Example of Website](https://github.com/ypinskiy/GBF-Raiders/raw/master/static/assets/misc/site-example.png)

# Reminders
Please remember to change/remove the Google Analytics code at the bottom of `index.html` if you are cloning this repository!

# Installing Dependencies
After cloning or downloading the source code, make sure that you have Node.js and NPM installed and setup in your PATH. All the other dependencies will be installed when the command `npm install` is run in the root directory of the site. Semantic UI is set to automatically install itself during this process. The next step would be to setup the environment variables as shown in the next section. The site's server can then be started with `node index.js` or `npm start`.

# Setting Up The Environment Variables
One of the main environment variables is `sslEnabled`. Set it to false if you do not have an SSL certificate for the site and set it to true if you do.
Create a new folder in the root directory of the site called `sslcert` and place your keys in there.

Setting up the other environment variables is necessary for using the Twitter API.

![Twitter App Page](https://github.com/ypinskiy/GBF-Raiders/raw/master/static/assets/misc/twitter-app-page.png)

1. Go to the [Twitter app page](https://apps.twitter.com/) and create a new app. The application details don't matter too much.

![Twitter App Details Page](https://github.com/ypinskiy/GBF-Raiders/raw/master/static/assets/misc/twitter-app-create-details.png)

2. Make sure you app has read and write permissions in the permissions tab.

![Twitter App Key Create Page](https://github.com/ypinskiy/GBF-Raiders/raw/master/static/assets/misc/twitter-app-key-create.png)
![Twitter App Access Create Page](https://github.com/ypinskiy/GBF-Raiders/raw/master/static/assets/misc/twitter-app-access-token-create.png)

3. The Keys and Access Tokens tab already contains two of the four keys you need: the Consumer Key and the Consumer Secret. To create the other two, click on the "Create my access token" button. Now, the page will refresh and the other two keys will appear: the Access Token and the Access Token Secret.
4. These 4 keys will need to be setup in your environment. See below on how to do so in Heroku.

# Using The Environment Variables in Heroku
![Heroku Show Configs Page](https://github.com/ypinskiy/GBF-Raiders/raw/master/static/assets/misc/heroku-show-config.png)

1. Go to your app's settings page. There will be a "Reveal Config Vars" button.
2. Enter all 5 keys and their corresponding values: `consumer_key`, `consumer_secret`, `access_token_key`, `access_token_secret`, `sslEnabled`.
3. Restart your dynos.
4. App should work now!

# Adding New Raids
![Raid Structure](https://github.com/ypinskiy/GBF-Raiders/raw/master/static/assets/misc/raid-structure.png)

1. Add the raid to the `raids.json` file in the root of the project.

![Raid Image Folder](https://github.com/ypinskiy/GBF-Raiders/raw/master/static/assets/misc/raids-folder.png)

2. Add the raid cover image to the *static/assets/raids folder*. You can get this image from the [GBF wiki](https://gbf.wiki/).

# Adding New Sound Notifications
![Sounds Folder](https://github.com/ypinskiy/GBF-Raiders/raw/master/static/assets/misc/sounds-folder.png)

1. Add the sound file to the *static/assets/sounds* folder.

![Sounds Loading](https://github.com/ypinskiy/GBF-Raiders/raw/master/static/assets/misc/sound-load-example.png)

2. Load the sound file in the top of `main.js`.

![Sounds Playing](https://github.com/ypinskiy/GBF-Raiders/raw/master/static/assets/misc/sound-play-example.png)

3. Add playing the sound file in the `PlaySoundNotif` function in `main.js`.

![Sound Option In HTML](https://github.com/ypinskiy/GBF-Raiders/raw/master/static/assets/misc/sound-option-html.png)

4. Add the option in the sound choice control in `index.html`.

![Sound Option In JS](https://github.com/ypinskiy/GBF-Raiders/raw/master/static/assets/misc/sound-option-js.png)

5. Add the option in the `CreateSettingsModalFrame` function in `settings.js`.
