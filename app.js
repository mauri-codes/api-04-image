var express = require("express");
var mongoose = require("mongoose");
var request = require("request");

var app = express();
//mongoose.connect("");
mongoose.connect("localhost:27017/imageLayer" || process.env.MONGOLAB);

app.set("port", process.env.PORT || 3000);

var registerSchema = mongoose.Schema({
    what: {type: String, required:true},
    when: {type: Date, default: Date.now}
});

var registerData = mongoose.model("registerData", registerSchema);

app.get("/", function (req, response) {
    response.send("Send a request in the form  https://api-04-image.herokuapp.com/cats%20and%20lions" +
        " or  https://api-04-image.herokuapp.com/imagesearch");
});

app.get("/imagesearch", function (request, response) {
    // registerData.find({},{"_id": 0, "__v": 0}, function (err, data) {
    //     if(err) return console.log(err);
    //     response.json(data);
    // });
    registerData.find({},{"_id": 0, "__v": 0})
        .sort({"when": "desc"})
        .limit(10)
        .exec(function (err, model) {
        if(err) return console.log(err);
        response.json(model);
    });
});

app.get("/:url", function (req, response) {
    var theURL = req.params.url;
    console.log(theURL);
    var item = {
        what: theURL
    };
    var data = new registerData(item);
    data.save();
    getJson(theURL, req, response);
});

app.listen(app.get("port"), function () {
    console.log("Express app started on port: " + app.get("port"));
});

function getJson(theURL, req, res) {
    var newURL = theURL.split(" ").join("%20");
    request({
        method: "GET",
        json: true,
        uri: "https://www.googleapis.com/customsearch/v1?" +
        "key=AIzaSyBcK-FE1LLq0EWlEGH9MXcpZZGorMJvBns&" +
        "cx=001306122588374178248:hz_ino3ddnk&" +
        "q=" + newURL +
        "&enableImageSearch=true&" +
        "disableWebSearch=true"
    }, function(error, response, body){
        if(error) console.log(error);
        else {
            var t = [];
            body.items.forEach(function (element, index, array) {
                if(element.pagemap)
                if(element.pagemap.cse_thumbnail){
                    if(element.pagemap.cse_thumbnail[0].src){
                        t.push({"url": element.pagemap.cse_image[0].src,
                            "snippet": element.title,
                            "thumbnail": element.pagemap.cse_thumbnail[0].src,
                            "context": element.link});
                    }
                }
            });
            res.json(t);
        }
    });
}

// function getJson(req, res) {
//     console.log("starting");
//     request({
//         headers: {
//             "Ocp-Apim-Subscription-Key": "ca2e2805cd3e41238e4498130a619d0c"
//         },
//         method: "GET",
//         json: true,
//         hostname: "api.cognitive.microsoft.com",
//         uri: "https://api.cognitive.microsoft.com/bing/v5.0/images/search?q=dogs&count=3&mkt=en-us&safeSearch=Moderate"
//     }, function(error, response, body){
//         if(error) console.log(error);
//         else {
//             console.log("done");
//             // res.send(body[0]);
//             res.json(body);
//         }
//     });
// }