const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sendEmail = require('../utils/email');

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    let query = { email };
    if (role) query.role = role;
    
    let user = await User.findOne(query);

    console.log('Login attempt:', email);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name,
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const signup = async (req, res) => {
  try {
    const { name, email, password, role, username, phone } = req.body;
    const userRole = role || 'rider';
    console.log('Signup attempt:', email, userRole, username);

    const existingUser = await User.findOne({ email, role: userRole });
    if (existingUser) {
      return res.status(400).json({ message: `Email already registered as ${userRole}` });
    }

    const user = new User({ 
      name, 
      username,
      email, 
      password, 
      role: userRole,
      phone
    });

    await user.save();
    console.log('User created:', email);

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name,
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (err) {
    console.error('Signup Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, username, phone } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (username && username !== user.username) {
      const exists = await User.findOne({ username });
      if (exists) return res.status(400).json({ message: 'Username already taken' });
      user.username = username;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();
    console.log('Profile updated for user:', userId);
    res.json({ success: true, user });
  } catch (err) {
    console.error('Update Profile Error:', err);
    let message = err.message;
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      message = `${field.charAt(0).toUpperCase() + field.slice(1)} already registered`;
    }
    res.status(400).json({ message });
  }
};

const checkUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase() });
    res.json({ available: !user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return generic success message for security
    if (!user) {
      return res.status(200).json({ success: true, message: 'If a user with this email exists, an OTP has been sent.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    
    user.otp = otpHash;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const message = `Your password reset OTP is ${otp}. It will expire in 10 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
        <h2>Password Reset Requested</h2>
        <p>Your OTP for password reset is: <strong style="font-size: 24px;">${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Reset Your Password - Bike Stand',
        message,
        html
      });
      res.json({ success: true, message: 'OTP sent to your email' });
    } catch (err) {
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
      return res.status(500).json({ message: 'Error sending email' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ 
      email,
      otpExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'OTP expired or invalid email' });

    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) return res.status(400).json({ message: 'Invalid OTP' });

    // Generate short-lived reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    
    user.resetToken = resetTokenHash;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ success: true, resetToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    
    const user = await User.findOne({ 
      email,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Reset token expired or invalid user' });

    const isMatch = await bcrypt.compare(resetToken, user.resetToken);
    if (!isMatch) return res.status(400).json({ message: 'Invalid reset token' });

    // Set new password (pre-save hook will hash it)
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    
    await user.save();
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { 
  login, 
  signup, 
  updateProfile, 
  checkUsername,
  forgotPassword,
  verifyOTP,
  resetPassword
};
