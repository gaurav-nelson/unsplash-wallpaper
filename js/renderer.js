const fs = require("fs");
const { spawn } = require("child_process");

window.onload = function () {
  if (typeof Storage !== "undefined") {
    if (!localStorage.fetchURL) {
      localStorage.setItem(
        "fetchUrl",
        "https://source.unsplash.com/1920x1080/?wallpaper"
      );
    }

    if (!localStorage.customTerms) {
      localStorage.setItem("customTerms", "");
    } else {
      document.getElementById("terms").value = localStorage.customTerms;
    }

    if (!localStorage.lastImage) {
      localStorage.setItem("lastImage", "");
    }
  } else {
    // No Web Storage support..
    console.log("Storage unavailable");
    document.getElementById("settings").style.display = "none";
  }
};

var fetchURL = localStorage.getItem("fetchUrl");
var customTerms = localStorage.getItem("customTerms");
var lastImage = localStorage.getItem("lastImage");

function toDataURL(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    var reader = new FileReader();
    reader.onloadend = function () {
      callback(reader.result);
    };
    reader.readAsDataURL(xhr.response);
  };
  xhr.open("GET", url);
  xhr.responseType = "blob";
  xhr.send();
}

var base64image = "";

toDataURL(fetchURL + "," + customTerms, function (dataUrl) {
  base64image = dataUrl;
  if (base64image === lastImage) {
    location.reload();
  } else {
    localStorage.setItem("lastImage", base64image);
    var img = "url('" + base64image + "')";
    document.getElementById("wallpaper").style.backgroundImage = img;
  }
});

function setWallpaper() {
  var data = base64image.replace(/^data:image\/\w+;base64,/, "");
  var buf = new Buffer.from(data, "base64");
  fs.writeFile("wallpaper.jpeg", buf, function (err, result) {
    if (err) {
      console.log("error", err);
    } else {
      const filePath = "file://" + process.cwd() + "/wallpaper.jpeg";
      const setwall = spawn("gsettings", [
        "set",
        "org.gnome.desktop.background",
        "picture-uri",
        filePath,
      ]);

      setwall.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
      });

      setwall.stderr.on("data", (data) => {
        console.log(`stderr: ${data}`);
      });

      setwall.on("close", (code) => {
        console.log(`child process exited with code ${code}`);
      });
    }
  });
}

function configureWallpaper() {
  customTerms = document.getElementById("terms").value.replace(/\s/g, "");
  localStorage.setItem("customTerms", customTerms);
  location.reload();
}