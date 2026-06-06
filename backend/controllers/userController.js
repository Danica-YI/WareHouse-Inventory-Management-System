const User = require('../models/User');

//GET/api/users - list all users(admin only)
const getAllUsers = async (req,res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch(error){
        res.status(500).json({message: error.message });
    }
};

//PUT/api/users/:id/role -update a user's role(admin only)
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        //validate role value
        if (!['admin', 'staff'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role'});
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        //prevent admin from demoteing themselves (avoid locking out)
        if (user.id === req.user.id) {
            return res.status(400).json({ message: 'You cannot change your own role'});
        }

        user.role = role;
        await user.save();

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllUsers, updateUserRole };