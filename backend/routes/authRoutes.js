const express = require('express');
const router = express.Router();

const login = require('../apis/auth/login');
const logout = require('../apis/auth/logout');
const register = require('../apis/auth/register');
const verify = require('../apis/auth/verify');
const resendVerification = require('../apis/auth/resendVerification');
const resetPassword = require('../apis/auth/resetPassword');

router.post('/login', login);
router.post('/logout', logout);
router.post('/register', register);
router.post('/verify', verify);
router.post('/resend-verification', resendVerification);
router.post('/reset-password', resetPassword);

module.exports = router;