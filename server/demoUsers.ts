import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User';

async function seedDemoUsers() {
  try {
    // 1. Connect to Mongo
    await mongoose.connect('mongodb+srv://tbhangale9:fikJx8lCxmfXIzXt@devai.2jrgv4y.mongodb.net/?retryWrites=true&w=majority&appName=devai', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);

    const users = [
      {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "password123",
        role: "citizen",
        location: { city: "Pune" },
      },
      {
        name: "Sarah Admin",
        email: "sarah.admin@example.com",
        password: "password123",
        role: "family_admin",
        location: { city: "Mumbai" },
      },
      {
        name: "NGO Admin",
        email: "ngo.admin@example.com",
        password: "password123",
        role: "ngo_admin",
        location: { city: "Delhi" },
      },
    ];

    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (exists) {
        console.log(`User already exists: ${u.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(u.password, 10);

      await User.create({
        ...u,
        password: hashedPassword,
      });

      console.log(`Created user: ${u.email}`);
    }

    console.log("✅ Demo users seeded successfully!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

seedDemoUsers();
