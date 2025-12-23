import arcjet, {tokenBucket, shield, detectBot} from "@arcjet/node";


import "dotenv/config"

//initial archjet


export const aj = arcjet({
    key: process.env.ARCJET_KEY,
    //we would like keep the track of rqsts by ip addresses
    characteristics: ["ip.src"],
    rules:[
        //sheild products you app from attacks e.g SQL injections, XSS
        shield({mode: "LIVE"}),
        detectBot({
            mode: "LIVE",
            //block all the bot except search engines
            allow:[
                "CATEGORY:SEARCH_ENGINE"
            ]
        }),
        //rate Limiting
        tokenBucket({
            mode: "LIVE",
            refillRate: 5,  // after 10s we gonna have 5 refills
            interval: 10, //seconds
            capacity: 10, //initially we have 10 token
        })
    ]
})