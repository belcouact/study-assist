import { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/TextToImage.module.css';

export default function TextToImageDemo() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageData, setImageData] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setImageData('');
    
    try {
      const response = await fetch('/api/ark-image-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          modelVersion: "general_v2.0_L",
          reqKey: "high_aes_general_v20_L"
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate image');
      }
      
      if (data.data && data.data.binary_data_base64 && data.data.binary_data_base64.length > 0) {
        setImageData(data.data.binary_data_base64[0]);
      } else {
        throw new Error('No image data received');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('Error generating image:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Text to Image Demo</title>
        <meta name="description" content="Convert text to image using 豆包 API" />
      </Head>
      
      <main className={styles.main}>
        <h1 className={styles.title}>Text to Image</h1>
        <p className={styles.description}>Convert your text prompt to an image using 豆包 API</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your image prompt here..."
            className={styles.textarea}
            rows={4}
          />
          
          <button 
            type="submit" 
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Image'}
          </button>
        </form>
        
        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}
        
        {imageData && (
          <div className={styles.imageContainer}>
            <h2>Generated Image</h2>
            <img 
              src={`data:image/png;base64,${imageData}`} 
              alt="Generated from text prompt" 
              className={styles.image}
            />
          </div>
        )}
      </main>
    </div>
  );
} 