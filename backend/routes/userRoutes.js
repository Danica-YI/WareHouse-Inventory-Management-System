const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// only admins can view all users and change roles
router.get('/', protect, adminOnly, getAllUsers);
router.put('/:id/role', protect, adminOnly, updateUserRole);

module.exports = router;