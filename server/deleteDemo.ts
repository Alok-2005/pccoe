// deleteDemoUsers.ts
import mongoose from 'mongoose';
import User from './models/User';

const MONGO_URI ='mongodb+srv://tbhangale9:fikJx8lCxmfXIzXt@devai.2jrgv4y.mongodb.net/?retryWrites=true&w=majority&appName=devai'

async function deleteDemo() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const emails = [
    "john.doe@example.com",
    "sarah.admin@example.com",
    "ngo.admin@example.com",
   
  ];

  const result = await User.deleteMany({ email: { $in: emails } });

  console.log(`Deleted ${result.deletedCount} demo users.`);
  mongoose.disconnect();
}

deleteDemo();
