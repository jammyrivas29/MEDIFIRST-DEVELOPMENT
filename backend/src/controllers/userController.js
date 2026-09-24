const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, phoneNumber: user.phoneNumber, profileImage: user.profileImage, role: user.role, medicalProfile: user.medicalProfile, emergencyContacts: user.emergencyContacts } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { firstName, lastName, phoneNumber }, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated successfully', user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, phoneNumber: user.phoneNumber } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateMedicalProfile = async (req, res) => {
  try {
    const { bloodType, allergies, medicalConditions, medications, weight, height } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { medicalProfile: { bloodType, allergies: allergies || [], medicalConditions: medicalConditions || [], medications: medications || [], weight, height } }, { new: true });
    res.json({ success: true, message: 'Medical profile updated successfully', medicalProfile: user.medicalProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All password fields are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirmation do not match.' });
    }
    const user = await User.findById(req.userId).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }
    user.password = newPassword; // pre('save') hook hashes it
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getEmergencyContacts = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ success: true, contacts: user.emergencyContacts || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addEmergencyContact = async (req, res) => {
  try {
    const { name, relationship, phoneNumber, email } = req.body;
    const user = await User.findById(req.userId);
    user.emergencyContacts.push({ name, relationship, phoneNumber, email });
    await user.save();
    res.status(201).json({ success: true, message: 'Emergency contact added successfully', contacts: user.emergencyContacts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteEmergencyContact = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.emergencyContacts = user.emergencyContacts.filter(c => c._id.toString() !== req.params.contactId);
    await user.save();
    res.json({ success: true, message: 'Contact deleted successfully', contacts: user.emergencyContacts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
