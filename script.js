const startButton = document.getElementById("start");
// const resultParagraph = document.getElementById("result");

// Check for browser support
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    
    var command = "empty";
    var value = "empty"
    var status_code = 0;

    function alexa() {
        console.log("Alexa detected! Performing an action...");
        command = "empty"
        //asr
        status_code = 1;
        recognition.stop();
    }

    function create() {
        console.log("Create New Record...");
        command = "empty"
        //asr
        status_code = 2;
        recognition.stop();
    }

    function inputValidation(string) {
        console.log("Checking field...",string);
        //asr
        status_code = 2;
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
            }
        }
        if (status_code == 2){
            console.log(`Fill each field: ${transcript}`);
            value = transcript;
            inputValidation(value);

        }
    };

    recognition.onend = () => {
        console.log('Speech recognition ended.');
        startButton.disabled = true; // Re-enable button when recognition ends
        recognition.start(); // Restart recognition 
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        startButton.disabled = false; // Re-enable button on error
    };

    startButton.onclick = () => {
        recognition.start(); // Start the recognition process
    };
} else {
    alert("Sorry, your browser does not support the Web Speech API.");
}
