import { v4 as uuidv4 } from "uuid";

console.log(uuidv4());

const startButton = document.getElementById("start");
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
    var client_info = {
        name: "empty",
        age: "empty",
        sex: "empty",
        height: "empty",
        weight: "empty"
    };

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
        
        // Stop recognition and perform TTS
        status_code = 2;
        recognition.stop();
        isEnd = true;

        speakText("You selected create. Now fill in each key value.", () => {
            isEnd = false;
            recognition.start();
        });
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
            console.log(client_info);
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
