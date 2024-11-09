import { v4 as uuidv4 } from "uuid";

console.log(uuidv4());

const uploadArea = document.getElementById("uploadArea");
const fileInput = document.getElementById("fileInput");
const fileNameDisplay = document.getElementById("fileName");
const csvKeyNameDisplay = document.getElementById("csvKeyName");
const startButton = document.getElementById("start");
const downloadButton = document.getElementById("downloadButton");

var csvcontent = "";
var client_info = {};

startButton.disabled = true;
downloadButton.disabled = true;

// Click event to open file dialog
uploadArea.addEventListener("click", () => fileInput.click());

// Drag events
uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.classList.add("dragging");
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("dragging");
});

// Drop event
uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("dragging");
  const files = e.dataTransfer.files;
  handleFiles(files);
});

// File input change event for browsers without drag-and-drop
fileInput.addEventListener("change", (e) => {
  const files = e.target.files;
  handleFiles(files);
});

function handleFiles(files) {
    for (const file of files) {
        if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        fileNameDisplay.textContent = `Uploaded File: ${file.name}`;
        startButton.disabled = false;
        downloadButton.disabled = false;
        readCSV(file);
        } else {
        fileNameDisplay.textContent = "Please upload a valid CSV file.";
        console.log("Not a CSV file:", file.name);
        }
    }
}

function createClientInfo(headers) {
    const client_info = {};

    headers.forEach(header => {
        client_info[header] = "empty"; // Initialize each header item with a default value, e.g., "empty"
    });

    return client_info;
}

function readCSV(file) {
    const reader = new FileReader();

    reader.onload = function (e) {
        const content = e.target.result;
        const rows = content.split("\n"); // Split file content into rows
        const header = rows[0].split(",").filter(col => col.trim() !== ""); // Remove any trailing empty values

        console.log("CSV Header:", header);
        console.log("Number of Columns:", header.length);
        client_info = createClientInfo(header);
        csvcontent = content;
    };

    reader.readAsText(file);
}
  
function appendRow(newRow){
    // New row data to append
    const newRowString = newRow.join(",") + "\n"; // Convert new row array to CSV format string
    
    if (csvcontent !== ""){
        csvcontent += newRowString; // Append new row to existing content

        console.log("Updated CSV Content:");
        console.log(csvcontent);
    }
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
    downloadCSV(csvcontent, "data.csv");
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

        speakText("Select mode from create, edit or delete.", () => {
            isEnd = false;
            recognition.start();
        });
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
        csvKeyNameDisplay.textContent = `${clientInfoText}`;


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
            csvKeyNameDisplay.textContent = "Select a command: CREATE, EDIT, or DELETE.";
        }
        startButton.disabled = true; // Re-enable button after recognition
        recognition.stop();
        if (status_code == 1){
            console.log(`Command: ${transcript}`);
            if (transcript.toLowerCase().includes("create")){
                create();
                return;
            }
        }
        if (status_code == 2){
            console.log(`Fill each field: ${transcript}`);
            inputValidation(transcript);
            // console.log(client_info);
            const clientInfoText = Object.entries(client_info)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(", ");
            csvKeyNameDisplay.textContent = `${clientInfoText}`;
            return;
        }
    };

    recognition.onend = () => {
        console.log('Speech recognition ended.');
        startButton.disabled = true; // Re-enable button when recognition ends
        if(isEnd === false){
            recognition.start(); // Restart recognition 
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
