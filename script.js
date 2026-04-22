const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function decodeSecretMessage(url) {
  /**
   * This function fetches a published Google Doc containing Unicode characters and their coordinates,
   * parses the data to extract x, y coordinates and characters, constructs a 2D grid, and prints it.
   * The function reads through the HTML content of the published doc, extracts all text organized in triplets
   * (x-coordinate, character, y-coordinate), creates a map mapping coordinates to characters, determines
   * the grid dimensions, and prints the result with non-specified positions filled with spaces.
   */

  try {
    // Fetch the published Google Doc
    const response = await fetch(url);
    const html = await response.text();
    
    // Parse HTML with cheerio
    const $ = cheerio.load(html);
    
    // Find the contents div and extract all text
    const contentDiv = $('#contents');
    if (contentDiv.length === 0) {
      console.log('Error: Could not find content div');
      return;
    }
    
    // Get all text and split by whitespace/newlines
    const text = contentDiv.text();
    const lines = text
      .trim()
      .split(/\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    // Parse the data - expecting triplets of (x, character, y)
    const gridData = new Map();
    let maxX = 0;
    let maxY = 0;
    
    let i = 0;
    while (i < lines.length - 2) {
      try {
        const line1 = lines[i];
        const line2 = lines[i + 1];
        const line3 = lines[i + 2];
        
        const x = parseInt(line1, 10);
        const char = line2;
        const y = parseInt(line3, 10);
        
        // Check if parsing was successful
        if (!isNaN(x) && !isNaN(y) && char) {
          const key = `${x},${y}`;
          gridData.set(key, char);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
          i += 3;
        } else {
          i += 1;
        }
      } catch (err) {
        i += 1;
      }
    }
    
    // Build and print the grid
    for (let y = 0; y <= maxY; y++) {
      let row = '';
      for (let x = 0; x <= maxX; x++) {
        const key = `${x},${y}`;
        row += gridData.has(key) ? gridData.get(key) : ' ';
      }
      console.log(row);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run with the provided URL
decodeSecretMessage('https://docs.google.com/document/d/e/2PACX-1vQiVT_Jj04V35C-YRzvoqyEYYzdXHcRyMUZCVQRYCu6gQJX7hbNhJ5eFCMuoX47cAsDW2ZBYppUQITr/pub');