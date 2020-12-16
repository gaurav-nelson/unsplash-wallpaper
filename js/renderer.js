const fs = require("fs");
const wallpaper = require("wallpaper");

window.onload = function () {
  if (typeof Storage !== "undefined") {
    if (!localStorage.customTerms) {
      localStorage.setItem("customTerms", "");
    } else {
      document.getElementById("terms").value = localStorage.getItem(
        "customTerms"
      );
    }

    if (!localStorage.customSize) {
      localStorage.setItem("customSize", "1920x1080");
      document.getElementById("wpsize").value = localStorage.getItem(
        "customSize"
      );
    } else {
      document.getElementById("wpsize").value = localStorage.getItem(
        "customSize"
      );
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

var customTerms = localStorage.getItem("customTerms");
var lastImage = localStorage.getItem("lastImage");
var customSize = localStorage.getItem("customSize");
var fetchURL =
  "https://source.unsplash.com/" + customSize + "/?wallpaper," + customTerms;

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

toDataURL(fetchURL, function (dataUrl) {
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
      UIkit.notification({
        message: "<span uk-icon='icon: warning'></span>" + err,
        status: "danger",
      });
    } else {
      const filePath = process.cwd() + "/wallpaper.jpeg";
      try {
        let wallpaperSet = async () => {
          await wallpaper.set(filePath);
        };
        wallpaperSet().then(
          UIkit.notification({
            message: "<span uk-icon='icon: check'></span> Done!",
            status: "success",
            timeout: 500,
          })
        );
      } catch (error) {
        UIkit.notification({
          message: "<span uk-icon='icon: warning'></span>" + error,
          status: "danger",
        });
      }
    }
  });
}

function configureWallpaper() {
  customSize = document.getElementById("wpsize").value;
  localStorage.setItem("customSize", customSize);
  customTerms = document.getElementById("terms").value.replace(/\s/g, "");
  localStorage.setItem("customTerms", customTerms);
  location.reload();
}
