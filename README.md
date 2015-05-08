\#gallery
========

Your personal 3d  art gallery on the web

Run the server with

    node server.js

Provide your own keys.json file at the document root:

    {
        "window.s3id" : "YOUR_AWS_ID",
        "window.s3secret" : "YOUR_AWS_SECRET",
        "window.region" : "YOUR_AWS_REGION",
        "window.bucket" : "YOUR_AWS_BUCKET",
        "window.firebaseUrl" : "YOUR_FIREBASE_DOMAIN'; //ex. https://hoopla-doopla.firebaseio.co"
    }

Don't forget to install bower components

    bower install
