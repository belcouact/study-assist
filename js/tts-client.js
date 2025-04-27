/**
 * Text-to-Speech Client Library
 * This utility provides an easy way to convert text to speech using the MiniMax TTS API endpoint.
 */

class TTSClient {
  /**
   * Initialize the TTS client
   * @param {string} apiEndpoint - The API endpoint URL (default: '/api/tts')
   */
  constructor(apiEndpoint = '/api/tts') {
    this.apiEndpoint = apiEndpoint;
    this.audioContext = null;
    this.audioBuffer = null;
    this.audioSource = null;
    this.isPlaying = false;
    this.audioElement = null;
    
    // Check browser compatibility
    this.checkBrowserCompatibility();
  }
  
  /**
   * Check browser compatibility for audio playback
   */
  checkBrowserCompatibility() {
    // Check if Audio API is supported
    if (typeof Audio === 'undefined') {
      console.warn('Audio API is not supported in this browser');
    }
    
    // Check if Blob API is supported
    if (typeof Blob === 'undefined') {
      console.warn('Blob API is not supported in this browser');
    }
    
    // Check if URL.createObjectURL is supported
    if (typeof URL === 'undefined' || typeof URL.createObjectURL === 'undefined') {
      console.warn('URL.createObjectURL is not supported in this browser');
    }
  }

  /**
   * Convert text to speech and return an audio blob
   * @param {string} text - The text to convert to speech
   * @param {Object} options - Additional options for the TTS API
   * @returns {Promise<Blob>} - A promise that resolves to an audio blob
   */
  async textToSpeech(text, options = {}) {
    try {
      if (!text || typeof text !== 'string' || text.trim() === '') {
        throw new Error('Text cannot be empty');
      }

      // Prepare request body
      const requestBody = {
        text: text,
        ...options
      };

      // Make API request
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      // Handle API errors
      if (!response.ok) {
        let errorInfo = 'Unknown error';
        try {
          const errorData = await response.json();
          errorInfo = errorData.error || response.statusText;
        } catch (e) {
          errorInfo = await response.text();
        }
        throw new Error(`TTS API error: ${errorInfo}`);
      }

      // Get response
      const contentType = response.headers.get('Content-Type') || 'audio/mpeg';
      
      // Get response as blob with proper MIME type
      const blob = await response.blob();
      
      // Create a new blob with explicit MIME type to ensure browser compatibility
      return new Blob([blob], { type: 'audio/mpeg' });
    } catch (error) {
      console.error('TTS error:', error);
      throw error;
    }
  }

  /**
   * Play text as speech
   * @param {string} text - The text to speak
   * @param {Object} options - Additional options for the TTS API
   * @returns {Promise<HTMLAudioElement>} - A promise that resolves to the audio element
   */
  async speak(text, options = {}) {
    try {
      // Get audio blob
      const audioBlob = await this.textToSpeech(text, options);
      
      // Log blob size for debugging
      console.log(`Audio blob size: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
      
      if (audioBlob.size === 0) {
        throw new Error("Received empty audio data from server");
      }
      
      // Create audio URL with explicit MIME type
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create or reuse audio element
      if (!this.audioElement) {
        this.audioElement = new Audio();
      } else {
        this.stop();
      }
      
      // Set up audio element
      this.audioElement.src = audioUrl;
      this.audioElement.type = 'audio/mpeg';
      
      // Create a promise to handle audio loading and playback
      return new Promise((resolve, reject) => {
        // Handle successful loading
        this.audioElement.oncanplaythrough = async () => {
          try {
            // Play audio
            this.isPlaying = true;
            await this.audioElement.play();
            resolve(this.audioElement);
          } catch (error) {
            this.isPlaying = false;
            URL.revokeObjectURL(audioUrl);
            console.error('Audio play error:', error);
            reject(new Error(`Failed to play audio: ${error.message || 'Unknown error'}`));
          }
        };
        
        // Handle loading errors
        this.audioElement.onerror = (event) => {
          const error = event.target.error || new Error('Unknown audio error');
          let errorMessage = 'Unknown audio error';
          
          // Get detailed error information
          if (error.code) {
            switch(error.code) {
              case MediaError.MEDIA_ERR_ABORTED:
                errorMessage = 'You aborted the audio playback';
                break;
              case MediaError.MEDIA_ERR_NETWORK:
                errorMessage = 'A network error caused the audio download to fail';
                break;
              case MediaError.MEDIA_ERR_DECODE:
                errorMessage = 'The audio playback was aborted due to a corruption problem or because the format is not supported';
                break;
              case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                errorMessage = 'The audio format is not supported by your browser';
                break;
              default:
                errorMessage = `Error code ${error.code}`;
            }
          }
          
          console.error('Audio error:', errorMessage, error);
          URL.revokeObjectURL(audioUrl);
          this.isPlaying = false;
          reject(new Error(`Audio error: ${errorMessage}`));
        };
        
        // Handle audio ended gracefully
        this.audioElement.onended = () => {
          this.isPlaying = false;
          URL.revokeObjectURL(audioUrl);
        };
        
        // Set timeout for loading
        const timeoutId = setTimeout(() => {
          if (!this.isPlaying) {
            URL.revokeObjectURL(audioUrl);
            reject(new Error('Audio failed to load within timeout period'));
          }
        }, 10000); // 10 second timeout
        
        // Clear timeout if loaded
        this.audioElement.onloadeddata = () => {
          clearTimeout(timeoutId);
        };
      });
    } catch (error) {
      console.error('TTS speak error:', error);
      throw error;
    }
  }

  /**
   * Stop currently playing audio
   */
  stop() {
    if (this.audioElement && this.isPlaying) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.isPlaying = false;
    }
  }

  /**
   * Download TTS audio as a file
   * @param {string} text - The text to convert
   * @param {string} filename - The filename (default: 'tts-audio.mp3')
   * @param {Object} options - Additional options for the TTS API
   * @returns {Promise<void>}
   */
  async download(text, filename = 'tts-audio.mp3', options = {}) {
    try {
      // Get audio blob
      const audioBlob = await this.textToSpeech(text, options);
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(audioBlob);
      downloadLink.download = filename;
      
      // Trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(downloadLink.href);
      }, 100);
    } catch (error) {
      console.error('TTS download error:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const ttsClient = new TTSClient();

// Make the client available globally
window.ttsClient = ttsClient;

// Also make the TTSClient class available globally
window.TTSClient = TTSClient; 