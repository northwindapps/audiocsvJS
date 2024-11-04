const startPorcupine = async () => {
  console.log("Let's get started.");
  
  const worker = await PorcupineWorkerFactory.create(
    ['Hey Google', 'Alexa'],  // Wake words
    () => console.log('Wake word detected!')
  );

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(audioContext.destination);

    const audioProcessor = audioContext.createScriptProcessor(4096, 1, 1);
    audioProcessor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      worker.postMessage({ command: 'process', input: input });
    };

    source.connect(audioProcessor);
  } catch (error) {
    console.error("Error accessing microphone:", error);
  }
};

document.getElementById('start').onclick = startPorcupine;
