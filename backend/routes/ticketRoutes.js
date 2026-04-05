const express = require('express');
const router = express.Router();
const { createEntry, scanVerify, processExit, getHistory, getDashboardStats, sendWhatsapp, getQrCode, getTicket } = require('../controllers/ticketController');
const auth = require('../utils/authMiddleware');

router.post('/entry', auth, createEntry);
router.post('/scan-verify', auth, scanVerify);
router.post('/exit', auth, processExit);
router.get('/history', auth, getHistory);
router.get('/stats', auth, getDashboardStats);
router.get('/ticket/:id', auth, getTicket);
router.post('/send-whatsapp', auth, sendWhatsapp);
router.get('/qr/:ticketId', getQrCode); // Publicly accessible for customers

module.exports = router;
