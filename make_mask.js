const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function makeMask() {
    try {
        const imagePath = './assets/logo.png';
        const outputPath = './assets/push/notification_icon.png';
        
        // Ensure directory exists
        if (!fs.existsSync('./assets/push')) {
            fs.mkdirSync('./assets/push', { recursive: true });
        }

        const image = await loadImage(imagePath);
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(image, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Loop through all pixels
        for (let i = 0; i < data.length; i += 4) {
            // Check if pixel has opacity (alpha > 0)
            if (data[i + 3] > 0) {
                // If the pixel is completely black, leave it transparent or make it white?
                // For android notification icon we just need simple white shape on transparent bg
                data[i] = 255;       // red
                data[i + 1] = 255;   // green
                data[i + 2] = 255;   // blue
                // Alpha remains whatever it was to preserve anti-aliased smooth edges
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(outputPath, buffer);
        console.log('Successfully created notification mask icon!');
    } catch(err) {
        console.error(err);
    }
}

makeMask();
