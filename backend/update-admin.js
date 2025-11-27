require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// User Schema (simplified)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean
});

const User = mongoose.model('User', userSchema);

async function updateAdmin() {
  try {
    // Find the old admin account
    const oldAdmin = await User.findOne({ email: 'admin3021@gmail.com' });
    
    if (!oldAdmin) {
      console.log('❌ Old admin account not found (admin3021@gmail.com)');
      console.log('Creating new admin account...');
      
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin123#', salt);
      
      // Create new admin
      await User.create({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      
      console.log('✅ New admin account created!');
      console.log('Email: admin@gmail.com');
      console.log('Password: Admin123#');
    } else {
      console.log('✅ Found old admin account');
      
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin123#', salt);
      
      // Update the admin account
      oldAdmin.email = 'admin@gmail.com';
      oldAdmin.password = hashedPassword;
      await oldAdmin.save();
      
      console.log('✅ Admin account updated successfully!');
      console.log('New Email: admin@gmail.com');
      console.log('New Password: Admin123#');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admin:', error);
    process.exit(1);
  }
}

updateAdmin();
