import { v4 as uuidv4 } from "uuid";

console.log(uuidv4());

// const uploadArea = document.getElementById("uploadArea");
// const fileInput = document.getElementById("fileInput");
// const fileNameDisplay = document.getElementById("fileName");
// const csvKeyNameDisplay = document.getElementById("csvKeyName");
const cellindexDisplay = document.getElementById("cellindex");
const transcriptionDisplay = document.getElementById("transcription");
const startButton = document.getElementById("start");
const downloadButton = document.getElementById("downloadButton");

var client_info = {};
var row_num = 0;
var col_num = 1;
var nato_code = ["alpha","bravo","charlie","delta"]
var last_transcript = ""
var source_array = Array.from({ length: 33 }, () => Array(nato_code.length).fill(""));

startButton.disabled = false;
downloadButton.disabled = false;

function createClientInfo(headers) {
    const client_info = {};

    headers.forEach(header => {
        client_info[header] = "empty"; // Initialize each header item with a default value, e.g., "empty"
    });

    return client_info;
}

// function readCSV(file) {
//     const reader = new FileReader();

//     reader.onload = function (e) {
//         const content = e.target.result;
//         const rows = content.split("\n"); // Split file content into rows
//         const header = rows[0].split(",").filter(col => col.trim() !== ""); // Remove any trailing empty values

//         console.log("CSV Header:", header);
//         console.log("Number of Columns:", header.length);
//         client_info = createClientInfo(header);
//         csvcontent = content;
//     };

//     reader.readAsText(file);
// }
  
function updateCSVString(){
   // Optionally include the header row
    var header = nato_code.join(",");

    // Convert each row to a CSV line
    var rows = source_array.map(row => row.join(","));

    // Combine header + rows
    return [header, ...rows].join("\n");
}

// Function to trigger the CSV download
function downloadCSV(content, filename = "file.csv") {
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
  
// Event listener for the download button
downloadButton.addEventListener("click", function () {
    let content = updateCSVString()
    downloadCSV(content, "data.csv");
});


// const resultParagraph = document.getElementById("result");

// Initialize the voice once
let englishVoice;
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        englishVoice = voices.find(voice => voice.lang === 'en-US' || voice.lang === 'en-GB');
    };
} else {
    console.log("Text-to-Speech is not supported in this browser.");
}

// Helper function to speak with TTS
function speakText(text, callback) {
    if ('speechSynthesis' in window && englishVoice) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = englishVoice;
        
        // Callback after speech has finished
        utterance.onend = () => {
            if (callback) callback();
        };
        
        window.speechSynthesis.speak(utterance);
    } else {
        console.log("Text-to-Speech is not supported in this browser.");
    }
}

// Check for browser support
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    var status_code = 0;
    var isEnd = false;
    

    // Alexa function
    function alexa() {
        console.log("Alexa detected! Performing an action...");
        
        // Stop recognition and perform TTS
        status_code = 1;
        recognition.stop();
        isEnd = true;
        cellindexDisplay.textContent = "cell: " + String(colconvert(col_num)) +  String(row_num+1);

        speakText("Initiate Listening Mode. Say something,then say Okay to enter.", () => {
            isEnd = false;
            recognition.start();
        });
    }

    function colconvert(col_num){
        let ary = ['','A','B','C','D']
        let idx = parseInt(col_num);
        if (idx > ary.length-1){
            ary = 1;
        }
        if (idx == 0){
            ary = 1;
        }
        return  ary[idx];
    }

    // Create function
    function create() {
        console.log("Create New Record...");
        
        //Init client_info
        client_info = createClientInfo(Object.keys(client_info));

        // Stop recognition and perform TTS
        status_code = 2;
        recognition.stop();
        isEnd = true;

        speakText("You selected create. Now fill in each key value.", () => {
            isEnd = false;
            recognition.start();
        });

        const clientInfoText = Object.entries(client_info)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(", ");
        // csvKeyNameDisplay.textContent = `${clientInfoText}`;


    }

    function inputValidation(string) {
        if (string.length > 0) {
            // Search for the first empty value in client_info
            for (const [key, value] of Object.entries(client_info)) {
                if (value === "empty") {
                    client_info[key] = string; // Set the first empty property to `string`
                    break; // Stop after filling the first empty property
                }
            }
    
            // Check if there are no "empty" values left in client_info
            if (!Object.values(client_info).includes("empty")) {
                recognition.stop();
                isEnd = true;
                // Map key-value pairs to a formatted string
                const clientInfoText = Object.entries(client_info)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(", ");

                speakText(`New record created. ${clientInfoText}`, () => {
                    isEnd = false;
                    recognition.start();
                    //next input
                    status_code = 1
                });

                appendRow(Object.values(client_info));
            }
        }
    }

    function inputValue(value) {
        const myTable = document.querySelector('table'); // Assuming it's the only table or you select it more specifically

        if (myTable && myTable.tBodies[0] && myTable.tBodies[0].rows[row_num].cells[col_num]) {
            // myTable.tBodies[0] is the first <tbody>
            // .rows[0] is the first <tr> within that <tbody> (row "1")
            // .cells[1] is the second cell in that row.
            // Why cells[1]? Because cells[0] is the <th> with "1" (the row header).
            const cell = myTable.tBodies[0].rows[row_num].cells[col_num];

            if (cell) {
                cell.textContent = value;
            }
        }else{
            row_num = 0;
            col_num = 1;
        }
    };
    
    function replaceWordNumber(transcript) {
        return transcript.toLowerCase().replace('one', '1').replace('two', '2').replace('three', '3').replace('four', '4').replace('five', '5').replace('six', '6').replace('seven', '7').replace('eight', '8').replace('nine', '9').replace('zero', '10');
    }

    recognition.lang = 'en-US';
    recognition.continuous = false; // Set to true for continuous recognition
    // recognition.interimResults = false; // Set to true for interim results

    recognition.onstart = () => {
        console.log('Speech recognition started. Speak now.');
        startButton.disabled = true; // Disable button while recognizing
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        // resultParagraph.textContent = `You said: ${transcript}`;
        console.log(`Recognized: ${transcript}`);
        if (transcript.toLowerCase().includes("alexa")) {
            console.log("alexa");
            alexa();
            // csvKeyNameDisplay.textContent = "Select a command: CREATE, EDIT, or DELETE.";
        }
        startButton.disabled = true; // Re-enable button after recognition
        recognition.stop();
        if (status_code == 1){
            console.log(`Command: ${transcript}`);
            cellindexDisplay.textContent = "cell: " + String(colconvert(col_num)) +  String(row_num+1);
                
            if (transcript.toLowerCase().startsWith("create")){
                create();
                return;
            }

            if (transcript.toLowerCase().startsWith("revert")){
                inputValue(last_transcript);
                return;
            }

            if (transcript.toLowerCase().startsWith("okay")){
                col_num += 1;
                if (col_num > nato_code.length-1){
                    col_num = 1;
                }
                cellindexDisplay.textContent = "cell: " + String(colconvert(col_num)) +  String(row_num+1);
                return;
            }

            if (transcript.toLowerCase().startsWith("ok")){
                col_num += 1;
                if (col_num > nato_code.length-1){
                    col_num = 1;
                }
                cellindexDisplay.textContent = "cell: " + String(colconvert(col_num)) +  String(row_num+1);
                return;
            }

            if (transcript.toLowerCase().startsWith("alexa")){
                transcriptionDisplay.textContent = 'Initiate Listening Mode. Say something,then say Okay to enter.';
                return;
            }

            if (transcript.toLowerCase().startsWith("next") && transcript.toLowerCase().includes("role")){
                row_num += 1;
                col_num = 1;
                cellindexDisplay.textContent = "cell: " + String(colconvert(col_num)) +  String(row_num+1);
                return;
            }

            if (transcript.toLowerCase().startsWith("next") && transcript.toLowerCase().includes("column")){
                col_num = 1;
                cellindexDisplay.textContent = "cell: " + String(colconvert(col_num)) +  String(row_num+1);
                return;
            }

            if (transcript.toLowerCase().startsWith("previous") && transcript.toLowerCase().includes("role")){
                row_num -= 1;
                cellindexDisplay.textContent = "cell: " + String(colconvert(col_num)) +  String(row_num+1);
                return;
            }

            if (transcript.toLowerCase().startsWith("previous") && transcript.toLowerCase().includes("column")){
                col_num -= 1;
                cellindexDisplay.textContent = "cell: " + String(colconvert(col_num)) +  String(row_num+1);
                return;
            }

            if (transcript.toLowerCase().startsWith("quit")){
                status_code = 0;
                recognition.stop();
                isEnd = false;
                transcriptionDisplay.textContent = 'Say Alexa, to start';
                startButton.disabled = false;
                return;
            }
       
            for (let i = 0; i < nato_code.length; i++) {
                var isCellAddress = false;
                if (transcript.toLowerCase().includes(nato_code[i].toLowerCase())) {
                    isCellAddress = true;
                    let ary_idx = i + 1;
                    col_num = ary_idx;
                    var isInt = transcript.toLowerCase().replace(nato_code[i].toLowerCase(), '').replace(/\s/g, '');
                    isInt = replaceWordNumber(isInt);
                    let parsedInt = parseInt(isInt);
                    if (!isNaN(parsedInt)) {
                        console.log(parsedInt);
                        row_num = parsedInt - 1;
                    }

                    cellindexDisplay.textContent = "cell: " + String(colconvert(col_num)) +  String(row_num + 1);
                    return;
                }
            }
              
            //update table
            inputValue(`${transcript}`);
            //update data source
            console.log(col_num + "," + row_num);
            source_array[row_num][col_num-1] =  `${transcript}`;
            transcriptionDisplay.textContent = `${transcript}`;
            last_transcript = `${transcript}`;

            
        }
        if (status_code == 2){
            console.log(`Fill each field: ${transcript}`);
            inputValidation(transcript);
            // console.log(client_info);
            const clientInfoText = Object.entries(client_info)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(", ");
            // csvKeyNameDisplay.textContent = `${clientInfoText}`;
            return;
        }
    };

    recognition.onend = () => {
        console.log('Speech recognition ended.');
        startButton.disabled = true; // Re-enable button when recognition ends
        if(isEnd === false){
            recognition.start(); // Restart recognition 
        }
        //it's running on phone or table
        console.log("tablet?:" + englishVoice);
        if(!englishVoice){
            isEnd = false;
            recognition.start();
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        startButton.disabled = false; // Re-enable button on error
    };

    startButton.onclick = () => {
        //welcome
        speakText("Welcome, say Alexa to start.", () => {
        });
        recognition.start(); // Start the recognition process
    };


} else {
    alert("Sorry, your browser does not support the Web Speech API.");
}
