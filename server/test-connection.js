import mongoose from "mongoose";
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '.env') });

console.log('Environment variables loaded:');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Present' : 'Missing');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGO_URI value:', process.env.MONGO_URI);

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is not defined');
        }
        
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected successfully: ${conn.connection.host}`);
        console.log('✅ ES Modules + MongoDB connection working!');
        process.exit(0);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        console.error('❌ Connection failed');
        process.exit(1);
    }
}

console.log('Testing ES Modules MongoDB connection...');
connectDB();
