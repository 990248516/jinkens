var bucketName = "b2indexphotos";
var bucketRegion = "us-east-1";
// var apigClientFactory = require('aws-api-gateway-client').default;

// function to do the search and return the images, display the images in front end
function searchPhoto() {
    var apigClient = apigClientFactory.newClient();
    var params = {
        'q': document.getElementById("searchContent").value,
    };

    apigClient.searchGet(params, {}, {}).then(function (result) {
        response = result.data
        console.log(response)
        if (response.length == 0) {
            document.getElementById("imageContent").innerHTML = "No Images Found";
            document.getElementById("imageContent").style.display = "block";
        }

        for (let i = 0; i < response.length; i++) {
            var img_url = response[i];
            var img = document.createElement('img');
            img.src = img_url;
            img.width = 200;
            document.getElementById("photo-container").appendChild(img);
        }
    }).catch(function (result) {
        console.log(result);
    });
}

//function to upload photo
function uploadPhoto() {
    var file = document.getElementById('photoInput').files[0];
    console.log("file is", file)
    // var photoKey = files[0].name
    var label =[]
    var lis = document.getElementById('labelInput').querySelectorAll('span')
    for(var i=0;i<lis.length;i++) {
        label.push(lis[i].innerHTML)
    }

    var params = {
        folder:'cloudross-dev',
        item: file.name,
        'Content-Type': file.type,
        'x-amz-meta-customLabels': label
        
    }

    var additionalParams = {
        headers: {
            'Content-Type': file.type,
            'x-amz-meta-customLabels': label
            
        }
    }

    // var apigClient = apigClientFactory.newClient();
    // apigClient.folderItemPut(params, file, additionalParams)
    //     .then(function (result) {
    //         alert("Image uploaded: " + file.name);
    //     })
    //     .catch(function (error) {
    //         console.log(error)
    //     });

    url = 'https://2yp7qf3hf1.execute-api.ap-southeast-1.amazonaws.com/prod/cloudross-dev/'+ file.name
    axios.put(url, file, additionalParams).then(response => {
        alert("Image uploaded: " + file.name);
    });
}

//speech recognition
function speechRecognition() {
    var searchInput = document.getElementById('searchContent')
    var voiceButton = document.getElementById('voiceBtn')
    voiceButton.style.cssText = 'color: red';
    // create speech recognition object
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    var recognition = new SpeechRecognition();

    // start recognition
    recognition.start();

    recognition.onspeechend = function () {
        recognition.stop();
    }

    //handle the return result
    recognition.onresult = function (event) {
        var transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        voiceButton.style.cssText = 'color: #6b6b6b';
    };

    recognition.onerror = function(event) {
        alert('Could not process input. Please try again.')
        console.log(event);
    }

}

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            let encoded = reader.result.replace(/^data:(.*;base64,)?/, '');
            if ((encoded.length % 4) > 0) {
                encoded += '='.repeat(4 - (encoded.length % 4));
            }
            resolve(encoded);
        };
        reader.onerror = error => reject(error);
    });
}

//add custom labels
var txt = document.getElementById("txt");
var list = document.getElementById("labelInput");
var items = [];

txt.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        let val = txt.value;
        if (val !== '') {
            if (items.indexOf(val) >= 0) {
                alert('Label name is a duplicate. Please enter another label.');
            } else {
                items.push(val);
                renderLabelList();
                txt.value = '';
                txt.focus();
            }
        } else {
            alert('Please type a label name.');
        }
    }
});

function renderLabelList() {
    list.innerHTML = '';
    items.map((item, index) => {
        list.innerHTML += `<li><span>${item}</span><a href="javascript: remove(${index})">X</a></li>`;
    });
}

function remove(i) {
    items = items.filter(item => items.indexOf(item) != i);
    renderLabelList();
}

window.onload = function() {
    renderLabelList();
    txt.focus();
}

