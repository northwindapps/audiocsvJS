document.getElementById('start').addEventListener('click', () => {
  // Ask for microphone access
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      source.connect(processor);
      processor.connect(audioContext.destination);

      // Process audio input
      processor.onaudioprocess = function(e) {
        const inputData = e.inputBuffer.getChannelData(0);
        console.log("Audio data:", inputData);
        
        // Resample inputData to 16 kHz if needed
        const offlineContext = new OfflineAudioContext(1, inputData.length, 16000);
        const buffer = offlineContext.createBuffer(1, inputData.length, audioContext.sampleRate);
        buffer.copyToChannel(inputData, 0, 0);

        const sourceOffline = offlineContext.createBufferSource();
        sourceOffline.buffer = buffer;
        sourceOffline.connect(offlineContext.destination);
        sourceOffline.start();

        offlineContext.startRendering().then(renderedBuffer => {
          const renderedData = renderedBuffer.getChannelData(0);
          console.log("Resampled Audio Data at 16 kHz:", renderedData);
          // Process the resampled audio here (e.g., run wake word detection)
        });
      };
    })
    .catch(error => {
      console.error('Microphone access denied or error:', error);
    });
});
