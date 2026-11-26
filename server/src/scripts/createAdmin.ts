import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../config/db';
import User from '../models/User';
import mongoose from 'mongoose';

async function main() {
  const [, , name, email, password] = process.argv;
  if (!name || !email || !password) {
    console.error('Usage: npm run create-admin -- "<name>" <email> <password>');
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = 'admin';
    await existing.save();
    console.log(`Existing user ${email} promoted to admin`);
  } else {
    await User.create({ name, email, password, role: 'admin' });
    console.log(`Admin user ${email} created`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
