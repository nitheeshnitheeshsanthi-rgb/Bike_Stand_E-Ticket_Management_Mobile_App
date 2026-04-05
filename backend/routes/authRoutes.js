const express = require('express');
const router = express.Router();
const { 
  login, 
  signup, 
  updateProfile, 
  checkUsername,
  forgotPassword,
  verifyOTP,
  resetPassword
} = require('../controllers/authController');
const auth = require('../utils/authMiddleware');

router.post('/login', login);
router.post('/signup', signup);
router.put('/update-profile', auth, updateProfile);
router.get('/check-username/:username', checkUsername);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
