require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const users = await User.find({}).select('email fullName role');
  console.log('Users found:', users.length);
  users.forEach(u => console.log('- Email:', u.email, '| Name:', u.fullName, '| Role:', u.role));
  
  const testUser = await User.findOne({ email: 'candidate@example.com' }).select('+password');
  if (testUser) {
    console.log('\nTest user found:', testUser.email);
    console.log('Password field exists:', !!testUser.password);
    console.log('Password length:', testUser.password?.length);
  }
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
